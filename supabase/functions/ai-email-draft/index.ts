import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { purpose, recipient, context, model, savedCourses, savedLabs, documents, teacherInfo } = await req.json();
    console.log("Received email draft request:", { 
      purpose, 
      recipient, 
      model,
      coursesCount: savedCourses?.length || 0,
      labsCount: savedLabs?.length || 0,
      documentsCount: documents?.length || 0,
      hasTeacherInfo: !!teacherInfo
    });

    // Build context from user data
    let enrichedContext = context || "";
    
    if (savedCourses?.length > 0) {
      const coursesList = savedCourses.map((c: any) => `- ${c.name_course} (${c.code})`).join("\n");
      enrichedContext += `\n\nUser's saved courses:\n${coursesList}`;
    }
    
    if (savedLabs?.length > 0) {
      const labsList = savedLabs.map((l: any) => `- ${l.name}${l.slug ? ` (${l.slug})` : ''}`).join("\n");
      enrichedContext += `\n\nUser's saved labs of interest:\n${labsList}`;
    }
    
    // Build document links for inclusion in email
    let documentLinksSection = "";
    if (documents?.length > 0) {
      const docsList = documents.map((d: any) => `- ${d.name} (${d.file_type || 'document'})`).join("\n");
      enrichedContext += `\n\nUser's uploaded documents (e.g., CV, transcripts):\n${docsList}`;
      
      // Create document links for email body
      const docLinks = documents.map((d: any) => `- ${d.name}: ${d.file_url}`).join("\n");
      documentLinksSection = `\n\nAttached documents:\n${docLinks}`;
    }
    
    if (teacherInfo) {
      enrichedContext += `\n\nRecipient professor information:
- Name: ${teacherInfo.full_name || teacherInfo.name}
- Email: ${teacherInfo.email || 'Not available'}
- Research topics: ${teacherInfo.topics?.join(", ") || 'Not specified'}`;
    }
    
    const includeDocLinks = documents?.length > 0;

    const prompt = `You are helping a university student draft a professional email.

Purpose: ${purpose}
Recipient: ${recipient}
Context and Background: ${enrichedContext || "None provided"}

Generate a professional email draft with:
1. Appropriate subject line
2. Proper greeting
3. Clear, concise body that references relevant context when appropriate
4. Professional closing
${includeDocLinks ? `5. Include at the end of the email body a section titled "Attached Documents:" with the following document links:\n${documentLinksSection}\n   Format them as clickable links.` : ""}

The tone should be respectful and academic. If the user has provided their courses, labs, or documents, reference them naturally where relevant.

Format your response as JSON:
{
  "subject": "Subject line here",
  "body": "Email body here"
}`;

    // Use Lovable AI Gateway
    const selectedModel = model || "google/gemini-2.5-flash";
    console.log("Calling Lovable AI Gateway with model:", selectedModel);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");
    
    // Parse the JSON response from AI
    let draft;
    try {
      const content = data.choices[0].message.content;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      draft = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: return the raw content
      draft = {
        subject: "Email Draft",
        body: data.choices[0].message.content
      };
    }

    return new Response(JSON.stringify(draft), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-email-draft:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
