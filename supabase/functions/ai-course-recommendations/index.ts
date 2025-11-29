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
    const { userInterests, savedCourses, academicLevel } = await req.json();

    const prompt = `You are an academic advisor helping students find relevant courses.

User Profile:
- Interests: ${userInterests || "General studies"}
- Academic Level: ${academicLevel || "Undergraduate"}
- Already saved courses: ${savedCourses?.map((c: any) => c.name_course).join(", ") || "None"}

Based on this profile, suggest 5 relevant courses they might be interested in. Consider:
1. Their stated interests
2. Complementary skills to their saved courses
3. Progressive difficulty appropriate to their level
4. Interdisciplinary connections

Format your response as a JSON array with this structure:
[
  {
    "title": "Course Title",
    "reason": "Why this course is recommended",
    "skills": ["skill1", "skill2", "skill3"]
  }
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const recommendations = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
