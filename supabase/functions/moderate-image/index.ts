const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple content moderation using OpenAI's moderation API
async function moderateImage(imageUrl: string): Promise<{ safe: boolean; reason?: string }> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!openaiKey) {
    console.error("OPENAI_API_KEY not configured");
    // If no API key, allow but log warning
    return { safe: true };
  }

  try {
    // Use GPT-4 Vision to analyze the image for inappropriate content
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a content moderator. Analyze the image and determine if it's appropriate for a university campus photo gallery. The image should be rejected if it contains: nudity, violence, hate symbols, drugs, weapons, explicit content, or anything not related to university/campus settings. Respond with JSON only: {\"safe\": true/false, \"reason\": \"explanation if unsafe\"}",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "low",
                },
              },
              {
                type: "text",
                text: "Is this image appropriate for a university campus photo gallery?",
              },
            ],
          },
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      // On API error, allow the image but log
      return { safe: true };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { safe: true };
    }

    // Parse the JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          safe: Boolean(result.safe),
          reason: result.reason || undefined,
        };
      }
    } catch (parseError) {
      console.error("Failed to parse moderation response:", parseError);
    }

    return { safe: true };
  } catch (error) {
    console.error("Moderation error:", error);
    return { safe: true };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Moderating image:", imageUrl);

    const result = await moderateImage(imageUrl);

    console.log("Moderation result:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in moderate-image function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
