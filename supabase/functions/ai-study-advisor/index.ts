import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for database queries
const databaseTools = [
  {
    type: "function",
    function: {
      name: "search_courses",
      description: "INTELLIGENT search for courses. Searches across ALL columns: name_course, code, description, topics, programs, ba_ma, professor_name, software_equipment, type_exam, language, term, mandatory_optional, ects. Use 'query' for general text search across all columns, or specific parameters for targeted filtering.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "General search query - will search across name, description, topics, programs, code (e.g., 'life sciences', 'machine learning', 'robotics')" },
          professor_name: { type: "string", description: "Professor/teacher name to filter by (partial match)" },
          course_name: { type: "string", description: "Course name to search for (partial match)" },
          course_code: { type: "string", description: "Course code to search for (e.g., 'CS-101', 'MATH', partial match)" },
          university_slug: { type: "string", description: "University slug to filter by (e.g., 'epfl', 'eth-zurich')" },
          language: { type: "string", description: "Course language (English, French, German, etc.)" },
          level: { type: "string", description: "Ba for Bachelor, Ma for Master - also searches the programs column for bachelor/master keywords" },
          program: { type: "string", description: "Program name to filter by - searches the programs column (e.g., 'Life Sciences', 'Computer Science', 'Mechanical Engineering')" },
          topic: { type: "string", description: "Topic or keyword to search in course topics/description/name (e.g., 'machine learning', 'thermodynamics', 'robotics')" },
          software_equipment: { type: "string", description: "Software, programming language, or equipment required (e.g., 'C++', 'Python', 'MATLAB', 'CAD')" },
          exam_type: { type: "string", description: "Type of examination (e.g., 'oral', 'written', 'project', 'presentation')" },
          term: { type: "string", description: "Semester/term when course is offered (e.g., 'Fall', 'Spring', 'Winter', 'Summer')" },
          ects_min: { type: "number", description: "Minimum ECTS credits" },
          ects_max: { type: "number", description: "Maximum ECTS credits" },
          limit: { type: "number", description: "Maximum results to return (default 20, max 50)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_labs",
      description: "Search for research labs by university, topic, or professor. Use this when the user asks about research labs, laboratories, or research groups.",
      parameters: {
        type: "object",
        properties: {
          university_slug: { type: "string", description: "University slug (e.g., 'epfl', 'eth-zurich')" },
          topic: { type: "string", description: "Research topic to search (e.g., 'cybersecurity', 'AI', 'machine learning')" },
          professor_name: { type: "string", description: "Professor name to search" },
          faculty_area: { type: "string", description: "Faculty/department area" },
          limit: { type: "number", description: "Maximum results (default 20, max 50)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_teachers",
      description: "Search for teachers/professors by name, research topics, or university. Use this to find professor information, their expertise, or contact details.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Teacher name to search (partial match)" },
          topic: { type: "string", description: "Research topic the teacher works on" },
          university_slug: { type: "string", description: "University slug" },
          limit: { type: "number", description: "Maximum results (default 20, max 50)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_courses_by_teacher",
      description: "Get all courses taught by a specific teacher/professor. Use this when user asks 'what courses does Professor X teach?' or similar.",
      parameters: {
        type: "object",
        properties: {
          teacher_name: { type: "string", description: "Teacher name (will search for matching teachers)" }
        },
        required: ["teacher_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_labs_by_university",
      description: "Get all labs associated with a specific university, optionally filtered by topic. Use this when user asks about labs at a specific university.",
      parameters: {
        type: "object",
        properties: {
          university_slug: { type: "string", description: "University slug (e.g., 'epfl', 'eth-zurich')" },
          topic_filter: { type: "string", description: "Optional topic to filter labs" }
        },
        required: ["university_slug"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_programs_by_university",
      description: "Get all academic programs offered by a specific university.",
      parameters: {
        type: "object",
        properties: {
          university_slug: { type: "string", description: "University slug" }
        },
        required: ["university_slug"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_universities",
      description: "Search for universities by name or country.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "University name (partial match)" },
          country: { type: "string", description: "Country name" },
          limit: { type: "number", description: "Maximum results (default 20)" }
        }
      }
    }
  }
];

// Execute tool calls against the database
async function executeToolCall(supabase: any, toolName: string, args: any): Promise<any> {
  console.log(`Executing tool: ${toolName} with args:`, args);
  
  switch (toolName) {
    case "search_courses": {
      // Select ALL columns from Courses table for comprehensive access
      let query = supabase.from("Courses(C)").select("*");
      
      // SMART QUERY: searches across ALL relevant columns intelligently
      if (args.query) {
        const q = args.query;
        query = query.or(`name_course.ilike.%${q}%,description.ilike.%${q}%,topics.ilike.%${q}%,programs.ilike.%${q}%,code.ilike.%${q}%,professor_name.ilike.%${q}%,software_equipment.ilike.%${q}%,type_exam.ilike.%${q}%,language.ilike.%${q}%,term.ilike.%${q}%,mandatory_optional.ilike.%${q}%,ba_ma.ilike.%${q}%`);
      }
      
      if (args.professor_name) {
        query = query.ilike("professor_name", `%${args.professor_name}%`);
      }
      if (args.course_name) {
        query = query.ilike("name_course", `%${args.course_name}%`);
      }
      if (args.course_code) {
        query = query.ilike("code", `%${args.course_code}%`);
      }
      if (args.language) {
        query = query.ilike("language", `%${args.language}%`);
      }
      // Level filter: check both ba_ma column AND programs column for bachelor/master keywords
      if (args.level) {
        const levelLower = args.level.toLowerCase();
        if (levelLower === "ba" || levelLower === "bachelor") {
          query = query.or(`ba_ma.ilike.%Ba%,ba_ma.ilike.%bachelor%,programs.ilike.%bachelor%`);
        } else if (levelLower === "ma" || levelLower === "master") {
          query = query.or(`ba_ma.ilike.%Ma%,ba_ma.ilike.%master%,programs.ilike.%master%`);
        } else {
          query = query.ilike("ba_ma", `%${args.level}%`);
        }
      }
      // Program filter: search in the programs column
      if (args.program) {
        query = query.ilike("programs", `%${args.program}%`);
      }
      if (args.topic) {
        query = query.or(`topics.ilike.%${args.topic}%,description.ilike.%${args.topic}%,name_course.ilike.%${args.topic}%,programs.ilike.%${args.topic}%`);
      }
      if (args.software_equipment) {
        query = query.ilike("software_equipment", `%${args.software_equipment}%`);
      }
      if (args.exam_type) {
        query = query.ilike("type_exam", `%${args.exam_type}%`);
      }
      if (args.term) {
        query = query.ilike("term", `%${args.term}%`);
      }
      if (args.ects_min) {
        query = query.gte("ects", args.ects_min);
      }
      if (args.ects_max) {
        query = query.lte("ects", args.ects_max);
      }
      
      // Handle university filter via bridge table
      if (args.university_slug) {
        const { data: uniData } = await supabase
          .from("Universities(U)")
          .select("uuid")
          .eq("slug", args.university_slug)
          .single();
        
        if (uniData) {
          const { data: courseIds } = await supabase
            .from("bridge_course_uni(U-C)")
            .select("id_course")
            .eq("id_uni", uniData.uuid);
          
          if (courseIds?.length) {
            query = query.in("id_course", courseIds.map((c: any) => c.id_course));
          } else {
            return { results: [], message: "No courses found for this university" };
          }
        }
      }
      
      const limit = Math.min(args.limit || 20, 50);
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error("search_courses error:", error);
        return { error: error.message };
      }
      
      return { results: data || [], count: data?.length || 0 };
    }
    
    case "search_labs": {
      let query = supabase.from("Labs(L)").select("id_lab, name, slug, topics, description, professors, faculty_match");
      
      if (args.topic) {
        query = query.or(`topics.ilike.%${args.topic}%,description.ilike.%${args.topic}%,faculty_match.ilike.%${args.topic}%,name.ilike.%${args.topic}%`);
      }
      if (args.professor_name) {
        query = query.ilike("professors", `%${args.professor_name}%`);
      }
      if (args.faculty_area) {
        query = query.ilike("faculty_match", `%${args.faculty_area}%`);
      }
      
      // Handle university filter via bridge table
      if (args.university_slug) {
        const { data: uniData } = await supabase
          .from("Universities(U)")
          .select("uuid")
          .eq("slug", args.university_slug)
          .single();
        
        if (uniData) {
          const { data: labIds } = await supabase
            .from("bridge_ul(U-L)")
            .select("id_lab")
            .eq("id_uni", uniData.uuid);
          
          if (labIds?.length) {
            query = query.in("id_lab", labIds.map((l: any) => l.id_lab));
          } else {
            return { results: [], message: "No labs found for this university" };
          }
        }
      }
      
      const limit = Math.min(args.limit || 20, 50);
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error("search_labs error:", error);
        return { error: error.message };
      }
      
      return { results: data || [], count: data?.length || 0 };
    }
    
    case "search_teachers": {
      let query = supabase.from("Teachers(T)").select("id_teacher, full_name, email, topics, citations, \"h-index\"");
      
      if (args.name) {
        query = query.or(`full_name.ilike.%${args.name}%,name.ilike.%${args.name}%`);
      }
      if (args.topic) {
        query = query.cs("topics", [args.topic]);
      }
      
      // Handle university filter via bridge table
      if (args.university_slug) {
        const { data: uniData } = await supabase
          .from("Universities(U)")
          .select("uuid")
          .eq("slug", args.university_slug)
          .single();
        
        if (uniData) {
          const { data: teacherIds } = await supabase
            .from("bridge_ut(U-T)")
            .select("id_teacher")
            .eq("id_uni", uniData.uuid);
          
          if (teacherIds?.length) {
            query = query.in("id_teacher", teacherIds.map((t: any) => t.id_teacher));
          } else {
            return { results: [], message: "No teachers found for this university" };
          }
        }
      }
      
      const limit = Math.min(args.limit || 20, 50);
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error("search_teachers error:", error);
        return { error: error.message };
      }
      
      return { results: data || [], count: data?.length || 0 };
    }
    
    case "get_courses_by_teacher": {
      // First find matching teachers
      const { data: teachers, error: teacherError } = await supabase
        .from("Teachers(T)")
        .select("id_teacher, full_name")
        .or(`full_name.ilike.%${args.teacher_name}%,name.ilike.%${args.teacher_name}%`)
        .limit(5);
      
      if (teacherError || !teachers?.length) {
        // Fallback: search directly in courses by professor_name - select ALL columns
        const { data: courses } = await supabase
          .from("Courses(C)")
          .select("*")
          .ilike("professor_name", `%${args.teacher_name}%`)
          .limit(30);
        
        return { 
          results: courses || [], 
          count: courses?.length || 0,
          note: "Searched by professor name in courses directly"
        };
      }
      
      // Get courses via bridge table for found teachers
      const teacherIds = teachers.map((t: any) => t.id_teacher);
      const { data: bridgeData } = await supabase
        .from("bridge_tc(T-C)")
        .select("id_course")
        .in("id_teacher", teacherIds);
      
      if (!bridgeData?.length) {
        // Fallback to direct search - select ALL columns
        const { data: courses } = await supabase
          .from("Courses(C)")
          .select("*")
          .ilike("professor_name", `%${args.teacher_name}%`)
          .limit(30);
        
        return { 
          results: courses || [], 
          count: courses?.length || 0,
          teachers_found: teachers.map((t: any) => t.full_name)
        };
      }
      
      const courseIds = bridgeData.map((b: any) => b.id_course);
      // Select ALL columns for comprehensive course information
      const { data: courses, error: courseError } = await supabase
        .from("Courses(C)")
        .select("*")
        .in("id_course", courseIds);
      
      if (courseError) {
        console.error("get_courses_by_teacher error:", courseError);
        return { error: courseError.message };
      }
      
      return { 
        results: courses || [], 
        count: courses?.length || 0,
        teachers_found: teachers.map((t: any) => t.full_name)
      };
    }
    
    case "get_labs_by_university": {
      const { data: uniData } = await supabase
        .from("Universities(U)")
        .select("uuid, name")
        .eq("slug", args.university_slug)
        .single();
      
      if (!uniData) {
        return { error: `University with slug "${args.university_slug}" not found` };
      }
      
      const { data: labIds } = await supabase
        .from("bridge_ul(U-L)")
        .select("id_lab")
        .eq("id_uni", uniData.uuid);
      
      if (!labIds?.length) {
        return { results: [], message: `No labs found for ${uniData.name}` };
      }
      
      let query = supabase
        .from("Labs(L)")
        .select("id_lab, name, slug, topics, description, professors, faculty_match")
        .in("id_lab", labIds.map((l: any) => l.id_lab));
      
      if (args.topic_filter) {
        query = query.or(`topics.ilike.%${args.topic_filter}%,description.ilike.%${args.topic_filter}%,faculty_match.ilike.%${args.topic_filter}%,name.ilike.%${args.topic_filter}%`);
      }
      
      const { data: labs, error } = await query.limit(50);
      
      if (error) {
        console.error("get_labs_by_university error:", error);
        return { error: error.message };
      }
      
      return { 
        results: labs || [], 
        count: labs?.length || 0,
        university: uniData.name
      };
    }
    
    case "get_programs_by_university": {
      const { data: uniData } = await supabase
        .from("Universities(U)")
        .select("uuid, name")
        .eq("slug", args.university_slug)
        .single();
      
      if (!uniData) {
        return { error: `University with slug "${args.university_slug}" not found` };
      }
      
      const { data: programIds } = await supabase
        .from("bridge_up(U-P)")
        .select("id_program, level, duration")
        .eq("id_uni", uniData.uuid);
      
      if (!programIds?.length) {
        return { results: [], message: `No programs found for ${uniData.name}` };
      }
      
      const { data: programs, error } = await supabase
        .from("Programs(P)")
        .select("id, name, slug, description")
        .in("id", programIds.map((p: any) => p.id_program));
      
      if (error) {
        console.error("get_programs_by_university error:", error);
        return { error: error.message };
      }
      
      return { 
        results: programs || [], 
        count: programs?.length || 0,
        university: uniData.name
      };
    }
    
    case "search_universities": {
      let query = supabase.from("Universities(U)").select("uuid, name, slug, country, website");
      
      if (args.name) {
        query = query.ilike("name", `%${args.name}%`);
      }
      if (args.country) {
        query = query.ilike("country", `%${args.country}%`);
      }
      
      const limit = Math.min(args.limit || 20, 50);
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error("search_universities error:", error);
        return { error: error.message };
      }
      
      return { results: data || [], count: data?.length || 0 };
    }
    
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// Provider configuration
type AIProvider = "lovable" | "perplexity";

interface ModelConfig {
  provider: AIProvider;
  model: string;
  name: string;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Lovable AI models (Gemini/OpenAI)
  "gemini-flash": { provider: "lovable", model: "google/gemini-2.5-flash", name: "Gemini Flash" },
  "gemini-pro": { provider: "lovable", model: "google/gemini-2.5-pro", name: "Gemini Pro" },
  "gpt-5": { provider: "lovable", model: "openai/gpt-5", name: "GPT-5" },
  "gpt-5-mini": { provider: "lovable", model: "openai/gpt-5-mini", name: "GPT-5 Mini" },
  // Perplexity models
  "sonar": { provider: "perplexity", model: "sonar", name: "Perplexity Sonar" },
  "sonar-pro": { provider: "perplexity", model: "sonar-pro", name: "Perplexity Sonar Pro" },
  "sonar-reasoning": { provider: "perplexity", model: "sonar-reasoning", name: "Perplexity Reasoning" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext, stream = false, model: requestedModel = "gemini-flash" } = await req.json();
    console.log("Received request with messages:", messages?.length, "stream:", stream, "model:", requestedModel);

    const modelConfig = MODEL_CONFIGS[requestedModel] || MODEL_CONFIGS["gemini-flash"];
    const provider = modelConfig.provider;
    
    // Get appropriate API key based on provider
    let apiKey: string;
    let apiEndpoint: string;
    
    if (provider === "perplexity") {
      apiKey = Deno.env.get("PERPLEXITY_API_KEY") || "";
      apiEndpoint = "https://api.perplexity.ai/chat/completions";
      if (!apiKey) {
        console.error("PERPLEXITY_API_KEY is not configured");
        throw new Error("PERPLEXITY_API_KEY is not configured");
      }
    } else {
      apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
      apiEndpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
      if (!apiKey) {
        console.error("LOVABLE_API_KEY is not configured");
        throw new Error("LOVABLE_API_KEY is not configured");
      }
    }
    
    console.log(`Using provider: ${provider}, model: ${modelConfig.model}`);

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build user-specific context from userContext parameter
    let userSpecificContext = "";
    
    if (userContext) {
      if (userContext.savedCourses?.length) {
        userSpecificContext += `\n\n**User's Saved Courses (${userContext.savedCourses.length} total):**\n`;
        userContext.savedCourses.slice(0, 15).forEach((c: any) => {
          userSpecificContext += `- ${c.name} (${c.code || 'no code'}, ${c.ects || '?'} ECTS, ${c.level || 'N/A'})\n`;
        });
        if (userContext.savedCourses.length > 15) {
          userSpecificContext += `... and ${userContext.savedCourses.length - 15} more courses\n`;
        }
      }
      
      if (userContext.savedLabs?.length) {
        userSpecificContext += `\n\n**User's Saved Research Labs (${userContext.savedLabs.length} total):**\n`;
        userContext.savedLabs.slice(0, 10).forEach((l: any) => {
          userSpecificContext += `- ${l.name}${l.topics ? ` - Topics: ${l.topics}` : ''}\n`;
        });
      }
      
      if (userContext.savedPrograms?.length) {
        userSpecificContext += `\n\n**User's Saved Programs (${userContext.savedPrograms.length} total):**\n`;
        userContext.savedPrograms.slice(0, 10).forEach((p: any) => {
          userSpecificContext += `- ${p.name}\n`;
        });
      }
      
      if (userContext.learningAgreements?.length) {
        userSpecificContext += `\n\n**User's Learning Agreements:**\n`;
        userContext.learningAgreements.forEach((a: any) => {
          userSpecificContext += `- ${a.title || 'Untitled'} (${a.status || 'draft'}, ${a.type})\n`;
        });
      }
      
      if (userContext.emailDrafts?.length) {
        userSpecificContext += `\n\n**User's Email Drafts:**\n`;
        userContext.emailDrafts.slice(0, 5).forEach((d: any) => {
          userSpecificContext += `- To: ${d.recipient || 'unknown'} - Subject: ${d.subject || 'no subject'}\n`;
        });
      }
      
      if (userContext.documents?.length) {
        userSpecificContext += `\n\n**User's Uploaded Documents:**\n`;
        userContext.documents.forEach((d: string) => {
          userSpecificContext += `- ${d}\n`;
        });
      }
      
      if (userContext.recentConversations?.length) {
        userSpecificContext += `\n\n**User's Recent AI Conversations:**\n`;
        userContext.recentConversations.slice(0, 5).forEach((c: any) => {
          userSpecificContext += `- ${c.title}\n`;
        });
      }
      
      if (userContext.profile) {
        userSpecificContext += `\n\n**User Profile:**\n`;
        if (userContext.profile.country) userSpecificContext += `- Country: ${userContext.profile.country}\n`;
        if (userContext.profile.language) userSpecificContext += `- Preferred Language: ${userContext.profile.language}\n`;
        if (userContext.profile.universityName) userSpecificContext += `- University: ${userContext.profile.universityName}\n`;
      }
    }

    const systemPrompt = `You are hubAI, an intelligent Study Advisor for university students planning study abroad and exchange semesters. You have FULL ACCESS to query the university database to find specific information.

**Your Database Query Capabilities:**
You have tools to query the complete database with 1,420+ courses, 424+ labs, 966+ teachers, and 33+ programs across multiple universities. USE THESE TOOLS when users ask specific questions.

**FULL Course Data Access - You can retrieve ALL of these columns:**
- id_course: Unique course identifier
- name_course: Course name/title
- code: Course code (e.g., "CS-101", "MATH-201")
- description: Detailed course description (content, objectives, what students will learn)
- ects: Number of ECTS credits
- language: Course language (English, French, German, Italian, etc.)
- language_code: Language code
- ba_ma: Bachelor (Ba) or Master (Ma) level
- which_year: Which year of study
- term: Semester/term when offered (Fall, Spring, etc.)
- year: Academic year
- professor_name: Teaching professor(s)
- topics: Course topics and subjects covered
- type_exam: Type of examination (oral, written, project, etc.)
- mandatory_optional: Whether course is mandatory or optional
- programs: Associated programs
- software_equipment: Required software, programming languages, tools, and equipment (Python, MATLAB, CAD, etc.)
- material_url: Link to course materials
- media: Media resources
- stats: Course statistics

**Database Tools:**
- search_courses: INTELLIGENT search across ALL columns (name_course, description, topics, programs, code, professor_name, software_equipment, type_exam, language, term, mandatory_optional, ba_ma, ects). Use "query" for general text search, or specific parameters (level, program, language, exam_type, software, term, mandatory, ects_min, ects_max) for targeted filtering.
- search_labs: Find research labs by university, topic, professor, or faculty area
- search_teachers: Find professors by name, research topics, or university
- get_courses_by_teacher: Get ALL courses taught by a specific professor
- get_labs_by_university: Get all labs at a specific university, optionally filtered by topic
- get_programs_by_university: Get all programs offered by a university
- search_universities: Find universities by name or country

**CRITICAL - How to search intelligently:**
When users ask about courses, you MUST understand what columns to search:
- "life sciences bachelor courses" → Use search_courses with program="life sciences" AND level="Ba"
- "EPFL bachelor courses in life sciences" → Use search_courses with university_slug="epfl", program="life sciences", level="Ba"
- "computer science courses" → Use search_courses with query="computer science" OR program="Computer Science"
- "courses that use Python" → Use search_courses with software_equipment="Python"
- "machine learning courses" → Use search_courses with query="machine learning"
- "courses by Professor Smith" → Use search_courses with professor_name="Smith"
- "master level robotics courses" → Use search_courses with level="Ma", topic="robotics"

**IMPORTANT: Understanding database columns:**
- ba_ma: Contains "Ba" for Bachelor or "Ma" for Master level
- programs: Contains the program name(s) the course belongs to (e.g., "Life Sciences Engineering", "Computer Science")
- topics: Contains subject topics covered in the course
- description: Contains the full course description
- Use the "level" parameter to filter by Bachelor/Master
- Use the "program" parameter to filter by program name

**Example tool calls:**
- "Find EPFL life science bachelor courses" → search_courses(university_slug="epfl", program="life science", level="Ba")
- "What courses does Professor X teach?" → get_courses_by_teacher(teacher_name="X")
- "Find cybersecurity labs at EPFL" → get_labs_by_university(university_slug="epfl", topic_filter="cybersecurity")
- "Show me AI courses in English" → search_courses(query="AI", language="English")
- "Which courses use Python?" → search_courses(software_equipment="Python")
- "Find courses with oral exams" → search_courses(exam_type="oral")
- "What software is needed for the robotics course?" → search_courses(query="robotics")

**University slugs for reference:** epfl, eth-zurich, tu-munich, polimi, kth-royal-institute, etc.

**User-Specific Context:**
${userSpecificContext || "No user-specific data available"}

**General Guidelines:**
- ALWAYS use database query tools when users ask about specific courses, professors, labs, or universities
- When showing course information, include relevant details like description, ECTS, professor, language, exam type, required software
- Reference the user's saved courses, labs, and learning agreements when providing personalized advice
- Be encouraging and supportive
- Format responses clearly with bullet points when listing multiple items
- If a query returns no results, try a broader search or suggest alternative search terms

**CRITICAL OUTPUT FORMAT:**
When you return courses or labs from database queries, you MUST append the raw data at the END of your response using these exact HTML comment formats (the user won't see these, but the app will parse them to show interactive cards):
- For courses: <!--COURSES:[{"id_course":"...","name_course":"...","code":"...","ects":...,"ba_ma":"...","professor_name":"...","language":"...","topics":"...","description":"...","software_equipment":"...","type_exam":"..."}]-->
- For labs: <!--LABS:[{"id_lab":"...","name":"...","slug":"...","topics":"...","professors":"...","faculty_match":"..."}]-->
Include ALL fields that are available. Place these at the very end of your response after all text content.`;

    console.log("Making initial AI call with tools...");
    
    // For tool calling, always use Lovable AI (Gemini) - then switch to requested model for final response
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is required for tool calling");
    }
    
    // First AI call with tools (always uses Gemini for reliable tool calling)
    const initialResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: databaseTools,
        tool_choice: "auto",
      }),
    });

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      console.error("AI Gateway error:", initialResponse.status, errorText);
      
      if (initialResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (initialResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${initialResponse.status}`);
    }

    const initialData = await initialResponse.json();
    const assistantMessage = initialData.choices[0].message;
    
    console.log("Initial response:", JSON.stringify(assistantMessage).slice(0, 500));

    // Check if AI wants to call tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`AI requested ${assistantMessage.tool_calls.length} tool call(s)`);
      
      // Get tool names for status update
      const toolNames = assistantMessage.tool_calls.map((tc: any) => tc.function.name);
      
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${toolName}`);
        const result = await executeToolCall(supabase, toolName, toolArgs);
        console.log(`Tool result count: ${result.count || result.results?.length || 0}`);
        
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
      
      // Second AI call with tool results - use requested model/provider
      console.log(`Making second AI call with tool results using ${provider}/${modelConfig.model}...`);
      const finalResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            assistantMessage,
            ...toolResults
          ],
          stream,
        }),
      });

      if (!finalResponse.ok) {
        const errorText = await finalResponse.text();
        console.error("Final AI call error:", finalResponse.status, errorText);
        throw new Error(`AI Gateway error: ${finalResponse.status}`);
      }

      // Return streaming or non-streaming response
      if (stream) {
        console.log("Returning streaming response after tool execution");
        // Create a custom stream that prepends tool info
        const encoder = new TextEncoder();
        const toolInfoEvent = `data: ${JSON.stringify({ tools_used: toolNames })}\n\n`;
        
        const originalStream = finalResponse.body!;
        const reader = originalStream.getReader();
        
        const customStream = new ReadableStream({
          async start(controller) {
            // First, send tool info
            controller.enqueue(encoder.encode(toolInfoEvent));
            
            // Then pipe through the rest
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
            controller.close();
          }
        });
        
        return new Response(customStream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      const finalData = await finalResponse.json();
      return new Response(JSON.stringify({ 
        message: finalData.choices[0].message.content,
        tools_used: toolNames
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls - return direct response using requested model/provider
    if (stream) {
      console.log(`No tools needed, making streaming request with ${provider}/${modelConfig.model}...`);
      const streamResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      });

      if (!streamResponse.ok) {
        const errorText = await streamResponse.text();
        console.error(`Stream error from ${provider}:`, streamResponse.status, errorText);
        throw new Error(`Stream error: ${streamResponse.status}`);
      }

      return new Response(streamResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response without tool calls
    return new Response(JSON.stringify({ 
      message: assistantMessage.content 
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
