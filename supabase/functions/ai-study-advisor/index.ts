import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext, stream = false } = await req.json();
    console.log("Received request with messages:", messages?.length, "stream:", stream);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get Supabase client to fetch database context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch relevant database context for the AI
    let databaseContext = "";
    
    try {
      // Fetch universities summary
      const { data: universities, error: uniError } = await supabase
        .from("Universities(U)")
        .select("name, country, slug")
        .limit(20);
      
      if (!uniError && universities) {
        databaseContext += `\n\n**Available Universities (${universities.length} shown):**\n`;
        universities.forEach(u => {
          databaseContext += `- ${u.name} (${u.country})\n`;
        });
      }

      // Fetch programs summary
      const { data: programs, error: progError } = await supabase
        .from("Programs(P)")
        .select("name, slug")
        .limit(20);
      
      if (!progError && programs) {
        databaseContext += `\n\n**Available Programs (${programs.length} shown):**\n`;
        programs.forEach(p => {
          databaseContext += `- ${p.name}\n`;
        });
      }

      // Fetch popular courses (by name for context)
      const { data: courses, error: courseError } = await supabase
        .from("Courses(C)")
        .select("name_course, code, ects, ba_ma, professor_name")
        .limit(30);
      
      if (!courseError && courses) {
        databaseContext += `\n\n**Sample Courses Available (${courses.length} shown):**\n`;
        courses.forEach(c => {
          databaseContext += `- ${c.name_course} (${c.code || 'No code'}, ${c.ects || '?'} ECTS, ${c.ba_ma || 'N/A'})\n`;
        });
      }

      // Fetch labs summary
      const { data: labs, error: labError } = await supabase
        .from("Labs(L)")
        .select("name, topics, professors")
        .limit(15);
      
      if (!labError && labs) {
        databaseContext += `\n\n**Research Labs (${labs.length} shown):**\n`;
        labs.forEach(l => {
          databaseContext += `- ${l.name}${l.topics ? ` - Topics: ${l.topics}` : ''}\n`;
        });
      }

      // Fetch teachers summary
      const { data: teachers, error: teacherError } = await supabase
        .from("Teachers(T)")
        .select("full_name, email, topics")
        .limit(15);
      
      if (!teacherError && teachers) {
        databaseContext += `\n\n**Faculty Members (${teachers.length} shown):**\n`;
        teachers.forEach(t => {
          const topics = t.topics ? t.topics.slice(0, 3).join(", ") : "";
          databaseContext += `- ${t.full_name || t.email}${topics ? ` - Research: ${topics}` : ''}\n`;
        });
      }

      console.log("Database context fetched successfully, length:", databaseContext.length);
    } catch (dbError) {
      console.error("Error fetching database context:", dbError);
      databaseContext = "\n\n(Database context unavailable)";
    }

    const systemPrompt = `You are hubAI, an intelligent Study Advisor for university students planning study abroad and exchange semesters. You have access to a real database of universities, courses, programs, labs, and faculty.

**Your capabilities:**
- Course selection and academic planning
- Study abroad opportunities and exchange programs  
- Learning agreement guidance and ECTS credit planning
- Research opportunities and lab recommendations
- Career path advice based on their interests
- University comparisons and recommendations

**IMPORTANT: You have access to the following real data from our database:**
${databaseContext}

**User Context:**
${userContext ? JSON.stringify(userContext, null, 2) : "No additional context"}

**Guidelines:**
- Reference specific courses, universities, labs, and professors from the database when relevant
- Provide helpful, specific, and actionable advice
- Be encouraging and supportive
- Format responses clearly with bullet points when listing options
- When users ask about specific courses or programs, try to match them with what's in the database
- If you don't have specific information, acknowledge it and offer to help find alternatives`;

    console.log("Calling Lovable AI Gateway...", stream ? "(streaming)" : "(non-streaming)");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // If streaming, return the stream directly
    if (stream) {
      console.log("Returning streaming response");
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const data = await response.json();
    console.log("AI response received successfully");
    
    return new Response(JSON.stringify({ 
      message: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-study-advisor:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
