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
      description: "Search for research labs by university, topic, or professor. Returns ALL lab information including id_lab, name, slug, description, topics, professors, faculty_match, link, image. Use this when the user asks about research labs, laboratories, or research groups.",
      parameters: {
        type: "object",
        properties: {
          university_slug: { type: "string", description: "University slug (e.g., 'epfl', 'eth-zurich')" },
          topic: { type: "string", description: "Research topic to search (e.g., 'cybersecurity', 'AI', 'machine learning')" },
          professor_name: { type: "string", description: "Professor name to search" },
          faculty_area: { type: "string", description: "Faculty/department area" },
          lab_name: { type: "string", description: "Lab name to search for (partial match)" },
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
  },
  {
    type: "function",
    function: {
      name: "get_document_content",
      description: "Fetch the content of a user's uploaded document (CV, resume, transcript, etc.) from storage. Use this when the user mentions their CV, resume, or other uploaded documents and you need to extract information like their name, background, skills, or experiences. This tool uses advanced OCR to extract text from scanned PDFs.",
      parameters: {
        type: "object",
        properties: {
          document_name: { type: "string", description: "The name of the document to fetch (e.g., 'CV.pdf', 'Resume.pdf', 'Massimo Perfetti Resume.pdf')" },
          document_url: { type: "string", description: "The URL of the document if available" }
        },
        required: ["document_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_semester_plan",
      description: "Generate a custom semester plan with courses. ONLY use this AFTER you have asked the user clarifying questions and gathered their requirements. This tool searches the database for courses matching the criteria and creates a structured plan. The plan appears in the Semester Planner panel.",
      parameters: {
        type: "object",
        properties: {
          semester_type: { 
            type: "string", 
            enum: ["winter", "summer", "both"],
            description: "Which semester(s) to plan: 'winter' (Fall/Autumn), 'summer' (Spring), or 'both'" 
          },
          target_ects: { 
            type: "number", 
            description: "Target ECTS credits for the semester (e.g., 30). The tool will try to get close to this number." 
          },
          ects_flexibility: {
            type: "string",
            enum: ["exact", "approximate", "flexible"],
            description: "How strict the ECTS target is: 'exact' (within 1-2 ECTS), 'approximate' (within 5 ECTS), 'flexible' (as close as reasonable)"
          },
          topics: { 
            type: "array", 
            items: { type: "string" },
            description: "Topics/subjects the user is interested in (e.g., ['robotics', 'AI', 'machine learning'])" 
          },
          level: { 
            type: "string", 
            enum: ["Ba", "Ma", "any"],
            description: "Academic level: 'Ba' for Bachelor, 'Ma' for Master, 'any' for both" 
          },
          program: { 
            type: "string", 
            description: "Specific program to filter courses from (e.g., 'Computer Science', 'Robotics')" 
          },
          university_slug: { 
            type: "string", 
            description: "University slug to filter courses (e.g., 'epfl')" 
          },
          preferred_exam_types: { 
            type: "array", 
            items: { type: "string" },
            description: "Preferred exam types (e.g., ['project', 'oral'] to avoid written exams)" 
          },
          exclude_courses: { 
            type: "array", 
            items: { type: "string" },
            description: "Course names or codes to exclude (e.g., courses already taken)" 
          },
          specific_courses: { 
            type: "array", 
            items: { type: "string" },
            description: "Specific course names/codes to include in the plan (must-have courses)" 
          },
          max_courses: { 
            type: "number", 
            description: "Maximum number of courses to include (default: 6 per semester)" 
          },
          plan_title: { 
            type: "string", 
            description: "Custom title for the plan (e.g., 'Robotics & AI Focus')" 
          }
        },
        required: ["semester_type", "target_ects"]
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
      // Select ALL columns from Labs table for comprehensive access
      let query = supabase.from("Labs(L)").select("*");
      
      if (args.topic) {
        query = query.or(`topics.ilike.%${args.topic}%,description.ilike.%${args.topic}%,faculty_match.ilike.%${args.topic}%,name.ilike.%${args.topic}%`);
      }
      if (args.professor_name) {
        query = query.ilike("professors", `%${args.professor_name}%`);
      }
      if (args.faculty_area) {
        query = query.ilike("faculty_match", `%${args.faculty_area}%`);
      }
      if (args.lab_name) {
        query = query.ilike("name", `%${args.lab_name}%`);
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
      
      // Select ALL columns from Labs table
      let query = supabase
        .from("Labs(L)")
        .select("*")
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
    
    case "get_document_content": {
      // First, find the document in user_documents table by name
      console.log("Fetching document content for:", args.document_name);
      
      // Search for the document by name (partial match)
      const { data: docs, error: docError } = await supabase
        .from("user_documents")
        .select("*")
        .ilike("name", `%${args.document_name}%`)
        .limit(1);
      
      if (docError) {
        console.error("Error finding document:", docError);
        return { error: `Failed to find document: ${docError.message}` };
      }
      
      if (!docs || docs.length === 0) {
        // Try searching without extension
        const nameWithoutExt = args.document_name.replace(/\.[^/.]+$/, "");
        const { data: docsRetry } = await supabase
          .from("user_documents")
          .select("*")
          .ilike("name", `%${nameWithoutExt}%`)
          .limit(1);
        
        if (!docsRetry || docsRetry.length === 0) {
          return { error: `Document "${args.document_name}" not found in user's uploaded documents` };
        }
        docs.push(...docsRetry);
      }
      
      const doc = docs[0];
      console.log("Found document:", doc.name, "URL:", doc.file_url);
      
      // Try using Firecrawl for better PDF parsing (especially scanned PDFs)
      const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
      
      if (firecrawlApiKey && doc.file_url) {
        try {
          console.log("Attempting to parse document with Firecrawl...");
          const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${firecrawlApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: doc.file_url,
              formats: ["markdown"],
              onlyMainContent: false,
              waitFor: 3000,
            }),
          });
          
          if (firecrawlResponse.ok) {
            const firecrawlData = await firecrawlResponse.json();
            const markdown = firecrawlData.data?.markdown || firecrawlData.markdown || "";
            
            if (markdown && markdown.trim().length > 100) {
              console.log("Firecrawl successfully extracted content, length:", markdown.length);
              let content = markdown;
              if (content.length > 8000) {
                content = content.substring(0, 8000) + "\n\n[Content truncated]";
              }
              
              return { 
                document_name: doc.name,
                document_type: doc.file_type,
                file_size: doc.file_size,
                content: `[Document: ${doc.name}]\n\n${content}`,
                message: "Document content retrieved successfully via Firecrawl OCR"
              };
            }
          }
          console.log("Firecrawl extraction returned limited content, falling back to basic extraction");
        } catch (firecrawlError) {
          console.error("Firecrawl error, falling back to basic extraction:", firecrawlError);
        }
      }
      
      // Fallback: Extract file path and download directly
      let filePath = "";
      
      if (doc.file_url.includes("/user-documents/")) {
        const urlParts = doc.file_url.split("/user-documents/");
        filePath = urlParts[1];
      } else {
        const pathMatch = doc.file_url.match(/\/([^\/]+\/[^\/]+)$/);
        if (pathMatch) {
          filePath = pathMatch[1];
        }
      }
      
      if (!filePath) {
        console.error("Could not extract file path from URL:", doc.file_url);
        return { error: "Invalid document URL format" };
      }
      
      console.log("Downloading file from path:", filePath);
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("user-documents")
        .download(filePath);
      
      if (downloadError) {
        console.error("Error downloading document:", downloadError);
        return { error: `Failed to download document: ${downloadError.message}` };
      }
      
      let content = "";
      const fileName = doc.name.toLowerCase();
      
      if (fileName.endsWith(".pdf")) {
        try {
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const rawText = decoder.decode(bytes);
          
          const textMatches = rawText.match(/\(([^)]{2,})\)/g) || [];
          const cleanedTexts = textMatches
            .map(t => t.slice(1, -1))
            .filter(t => t.length > 3 && /[a-zA-Z]{3,}/.test(t) && !/^[\\\/\w]+$/.test(t))
            .join(" ");
          
          if (cleanedTexts.length > 100) {
            content = cleanedTexts.substring(0, 5000);
          }
          
          const nameFromFile = doc.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
          const nameParts = nameFromFile.split(/resume|cv/i);
          const extractedName = nameParts[0]?.trim() || nameFromFile;
          
          if (content.length > 100) {
            content = `[PDF Document: ${doc.name}]\n\nExtracted text content:\n${content}`;
          } else {
            content = `[PDF Document: ${doc.name}]\n\nNote: This appears to be a scanned PDF. Limited text was extracted. Based on the filename, the user's name appears to be "${extractedName}".`;
          }
          
          if (extractedName && !extractedName.toLowerCase().includes("resume") && !extractedName.toLowerCase().includes("cv")) {
            content += `\n\n**Extracted from filename:** The user's name appears to be "${extractedName}".`;
          }
        } catch (e) {
          console.error("Error extracting PDF text:", e);
          const nameFromFile = doc.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
          const nameParts = nameFromFile.split(/resume|cv/i);
          const extractedName = nameParts[0]?.trim() || nameFromFile;
          content = `[PDF Document: ${doc.name}]\n\nNote: Could not extract text from PDF. Based on the filename, the user's name appears to be "${extractedName}".`;
        }
      } else {
        try {
          content = await fileData.text();
          if (content.length > 5000) {
            content = content.substring(0, 5000) + "\n\n[Content truncated - document is very long]";
          }
        } catch (e) {
          content = `[Binary file: ${doc.name}] - Content cannot be displayed as text`;
        }
      }
      
      return { 
        document_name: doc.name,
        document_type: doc.file_type,
        file_size: doc.file_size,
        content: content,
        message: "Document content retrieved successfully"
      };
    }
    
    case "generate_semester_plan": {
      console.log("Generating semester plan with args:", args);
      
      const {
        semester_type = "winter",
        target_ects = 30,
        ects_flexibility = "approximate",
        topics = [],
        level,
        program,
        university_slug,
        preferred_exam_types = [],
        exclude_courses = [],
        specific_courses = [],
        max_courses = 6,
        plan_title
      } = args;
      
      // Determine ECTS tolerance based on flexibility
      let ectsTolerance = 5;
      if (ects_flexibility === "exact") ectsTolerance = 2;
      else if (ects_flexibility === "flexible") ectsTolerance = 10;
      
      // Helper function to search courses for a specific semester
      async function searchCoursesForSemester(semesterTerms: string[]): Promise<any[]> {
        // First, add any specific courses the user requested
        const selectedCourses: any[] = [];
        let currentEcts = 0;
        
        // Add specific/must-have courses first
        if (specific_courses.length > 0) {
          for (const courseQuery of specific_courses) {
            const { data: courses } = await supabase
              .from("Courses(C)")
              .select("id_course, name_course, code, ects, type_exam, ba_ma, professor_name, topics, term, description")
              .or(`name_course.ilike.%${courseQuery}%,code.ilike.%${courseQuery}%`)
              .limit(1);
            
            if (courses && courses.length > 0) {
              const course = courses[0];
              if (!exclude_courses.some((ec: string) => 
                course.name_course?.toLowerCase().includes(ec.toLowerCase()) ||
                course.code?.toLowerCase().includes(ec.toLowerCase())
              )) {
                selectedCourses.push(course);
                currentEcts += course.ects || 0;
              }
            }
          }
        }
        
        // Build query for topic-based courses
        let query = supabase
          .from("Courses(C)")
          .select("id_course, name_course, code, ects, type_exam, ba_ma, professor_name, topics, term, description");
        
        // Filter by topics if provided
        if (topics.length > 0) {
          const topicConditions = topics.map((t: string) => 
            `topics.ilike.%${t}%,description.ilike.%${t}%,name_course.ilike.%${t}%`
          ).join(",");
          query = query.or(topicConditions);
        }
        
        // Filter by level
        if (level && level !== "any") {
          query = query.ilike("ba_ma", `%${level}%`);
        }
        
        // Filter by program
        if (program) {
          query = query.ilike("programs", `%${program}%`);
        }
        
        // Filter by term (winter = fall/winter/autumn, summer = spring/summer)
        if (semesterTerms.length > 0) {
          const termConditions = semesterTerms.map((t: string) => `term.ilike.%${t}%`).join(",");
          query = query.or(termConditions);
        }
        
        // Get more courses than needed to allow for selection
        const { data: candidateCourses } = await query.limit(50);
        
        if (!candidateCourses) return selectedCourses;
        
        // Handle university filter
        let filteredCourses = candidateCourses;
        if (university_slug) {
          const { data: uniData } = await supabase
            .from("Universities(U)")
            .select("uuid")
            .eq("slug", university_slug)
            .single();
          
          if (uniData) {
            const { data: courseIds } = await supabase
              .from("bridge_course_uni(U-C)")
              .select("id_course")
              .eq("id_uni", uniData.uuid);
            
            if (courseIds?.length) {
              const courseIdSet = new Set(courseIds.map((c: any) => c.id_course));
              filteredCourses = candidateCourses.filter((c: any) => courseIdSet.has(c.id_course));
            }
          }
        }
        
        // Filter out excluded courses and already selected courses
        const selectedIds = new Set(selectedCourses.map(c => c.id_course));
        filteredCourses = filteredCourses.filter((c: any) => {
          if (selectedIds.has(c.id_course)) return false;
          if (exclude_courses.some((ec: string) => 
            c.name_course?.toLowerCase().includes(ec.toLowerCase()) ||
            c.code?.toLowerCase().includes(ec.toLowerCase())
          )) return false;
          return true;
        });
        
        // Score courses based on preferences
        const scoredCourses = filteredCourses.map((course: any) => {
          let score = 0;
          
          // Topic relevance (higher score for more topic matches)
          const courseTopics = (course.topics || "" + " " + course.description || "").toLowerCase();
          topics.forEach((t: string) => {
            if (courseTopics.includes(t.toLowerCase())) score += 10;
          });
          
          // Preferred exam type bonus
          if (preferred_exam_types.length > 0 && course.type_exam) {
            if (preferred_exam_types.some((e: string) => course.type_exam.toLowerCase().includes(e.toLowerCase()))) {
              score += 5;
            }
          }
          
          // Penalize courses with no ECTS info
          if (!course.ects) score -= 5;
          
          return { ...course, _score: score };
        });
        
        // Sort by score descending
        scoredCourses.sort((a: any, b: any) => b._score - a._score);
        
        // Select courses to meet target ECTS
        for (const course of scoredCourses) {
          if (selectedCourses.length >= max_courses) break;
          if (currentEcts >= target_ects + ectsTolerance) break;
          
          // Don't add if it would exceed target by too much
          const courseEcts = course.ects || 0;
          if (currentEcts + courseEcts > target_ects + ectsTolerance && currentEcts > 0) {
            // Check if we're close enough
            if (Math.abs(currentEcts - target_ects) <= ectsTolerance) break;
            continue;
          }
          
          selectedCourses.push(course);
          currentEcts += courseEcts;
        }
        
        return selectedCourses;
      }
      
      // Generate plans based on semester type
      let winterCourses: any[] = [];
      let summerCourses: any[] = [];
      
      if (semester_type === "winter" || semester_type === "both") {
        winterCourses = await searchCoursesForSemester(["fall", "winter", "autumn"]);
      }
      
      if (semester_type === "summer" || semester_type === "both") {
        summerCourses = await searchCoursesForSemester(["spring", "summer"]);
      }
      
      // Calculate totals
      const winterEcts = winterCourses.reduce((sum, c) => sum + (c.ects || 0), 0);
      const summerEcts = summerCourses.reduce((sum, c) => sum + (c.ects || 0), 0);
      const totalEcts = winterEcts + summerEcts;
      
      // Generate title
      const generatedTitle = plan_title || 
        (topics.length > 0 ? `${topics.slice(0, 2).join(" & ")} Focus` : "Custom Plan") +
        ` (${target_ects} ECTS target)`;
      
      const plan = {
        winter: winterCourses.map(c => ({
          id_course: c.id_course,
          name_course: c.name_course,
          code: c.code,
          ects: c.ects,
          type_exam: c.type_exam,
          ba_ma: c.ba_ma,
          professor_name: c.professor_name,
          topics: c.topics
        })),
        summer: summerCourses.map(c => ({
          id_course: c.id_course,
          name_course: c.name_course,
          code: c.code,
          ects: c.ects,
          type_exam: c.type_exam,
          ba_ma: c.ba_ma,
          professor_name: c.professor_name,
          topics: c.topics
        })),
        title: generatedTitle,
        total_ects: totalEcts,
        winter_ects: winterEcts,
        summer_ects: summerEcts,
        target_ects: target_ects,
        ects_flexibility: ects_flexibility
      };
      
      // Build feedback message
      let feedback = `Generated semester plan "${generatedTitle}":\n`;
      if (semester_type === "winter" || semester_type === "both") {
        feedback += `- Winter: ${winterCourses.length} courses, ${winterEcts} ECTS\n`;
      }
      if (semester_type === "summer" || semester_type === "both") {
        feedback += `- Summer: ${summerCourses.length} courses, ${summerEcts} ECTS\n`;
      }
      feedback += `\nTotal: ${totalEcts} ECTS (target was ${target_ects} ECTS, ${ects_flexibility} flexibility)`;
      
      if (Math.abs(totalEcts - target_ects) > ectsTolerance) {
        feedback += `\n\n⚠️ Note: Could not reach exact target. `;
        if (totalEcts < target_ects) {
          feedback += `The available courses matching your criteria total ${totalEcts} ECTS. You may want to broaden your topic preferences or adjust constraints.`;
        } else {
          feedback += `The minimum courses exceeded the target slightly.`;
        }
      }
      
      return {
        semester_plan: plan,
        message: feedback
      };
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
      // FULL course details with all info
      if (userContext.savedCourses?.length) {
        userSpecificContext += `\n\n**User's Saved Courses (${userContext.savedCourses.length} total) - FULL DETAILS:**\n`;
        userContext.savedCourses.slice(0, 20).forEach((c: any) => {
          userSpecificContext += `\n- **${c.name}** (${c.code || 'no code'}):\n`;
          if (c.ects) userSpecificContext += `  - ECTS: ${c.ects}\n`;
          if (c.level) userSpecificContext += `  - Level: ${c.level}\n`;
          if (c.description) userSpecificContext += `  - Description: ${c.description.slice(0, 300)}...\n`;
          if (c.topics) userSpecificContext += `  - Topics: ${c.topics}\n`;
          if (c.professor) userSpecificContext += `  - Professor: ${c.professor}\n`;
        });
        if (userContext.savedCourses.length > 20) {
          userSpecificContext += `... and ${userContext.savedCourses.length - 20} more courses\n`;
        }
      }
      
      // FULL lab details with all info
      if (userContext.savedLabs?.length) {
        userSpecificContext += `\n\n**User's Saved Research Labs (${userContext.savedLabs.length} total) - FULL DETAILS:**\n`;
        userContext.savedLabs.slice(0, 15).forEach((l: any) => {
          userSpecificContext += `\n- **${l.name}**:\n`;
          if (l.topics) userSpecificContext += `  - Topics: ${l.topics}\n`;
          if (l.description) userSpecificContext += `  - Description: ${l.description.slice(0, 300)}...\n`;
          if (l.professors) userSpecificContext += `  - Professors: ${l.professors}\n`;
          if (l.facultyMatch) userSpecificContext += `  - Faculty: ${l.facultyMatch}\n`;
          if (l.link) userSpecificContext += `  - Website: ${l.link}\n`;
        });
      }
      
      if (userContext.savedPrograms?.length) {
        userSpecificContext += `\n\n**User's Saved Programs (${userContext.savedPrograms.length} total):**\n`;
        userContext.savedPrograms.slice(0, 10).forEach((p: any) => {
          userSpecificContext += `- ${p.name}\n`;
        });
      }
      
      // FULL email draft details
      if (userContext.emailDrafts?.length) {
        userSpecificContext += `\n\n**User's Email Drafts (${userContext.emailDrafts.length} total) - FULL CONTENT:**\n`;
        userContext.emailDrafts.slice(0, 10).forEach((d: any) => {
          userSpecificContext += `\n- **Subject:** ${d.subject || 'no subject'}\n`;
          userSpecificContext += `  **To:** ${d.recipient || 'unknown'}\n`;
          if (d.body) userSpecificContext += `  **Content:** ${d.body.slice(0, 500)}${d.body.length > 500 ? '...' : ''}\n`;
        });
      }
      
      // Document details with content if available
      if (userContext.documents?.length) {
        userSpecificContext += `\n\n**User's Uploaded Documents (${userContext.documents.length} total):**\n`;
        userContext.documents.forEach((d: any) => {
          if (typeof d === 'string') {
            userSpecificContext += `- ${d}\n`;
          } else {
            userSpecificContext += `\n- **${d.name}**:\n`;
            if (d.content) userSpecificContext += `  Content: ${d.content.slice(0, 2000)}${d.content.length > 2000 ? '...' : ''}\n`;
          }
        });
      }
      
      if (userContext.recentConversations?.length) {
        userSpecificContext += `\n\n**User's Recent AI Conversations:**\n`;
        userContext.recentConversations.slice(0, 5).forEach((c: any) => {
          userSpecificContext += `- ${c.title}\n`;
        });
      }
      
      // User's semester plans - important for personalized advice
      if (userContext.semesterPlans?.length) {
        userSpecificContext += `\n\n**User's Saved Semester Plans (${userContext.semesterPlans.length} total) - FULL DETAILS:**\n`;
        userContext.semesterPlans.forEach((plan: any) => {
          const semesterLabel = plan.semester_type === 'winter' ? '❄️ Winter' : '☀️ Summer';
          userSpecificContext += `\n**"${plan.name}"** (${semesterLabel} Semester, ${plan.total_ects || 0} ECTS):\n`;
          if (plan.courses?.length) {
            plan.courses.forEach((c: any) => {
              userSpecificContext += `  - ${c.name_course}`;
              if (c.code) userSpecificContext += ` (${c.code})`;
              if (c.ects) userSpecificContext += ` - ${c.ects} ECTS`;
              if (c.type_exam) userSpecificContext += ` - ${c.type_exam}`;
              userSpecificContext += `\n`;
            });
          }
        });
        userSpecificContext += `\nWhen the user asks about their semester plans, refer to these details.\n`;
      }
      
      if (userContext.profile) {
        userSpecificContext += `\n\n**User Profile:**\n`;
        if (userContext.profile.country) userSpecificContext += `- Country: ${userContext.profile.country}\n`;
        if (userContext.profile.language) userSpecificContext += `- Preferred Language: ${userContext.profile.language}\n`;
        if (userContext.profile.universityName) userSpecificContext += `- University: ${userContext.profile.universityName}\n`;
      }
    }

    const systemPrompt = `You are hubAI, an intelligent Study Advisor for university students planning study abroad and exchange semesters. You have FULL ACCESS to query the university database to find specific information.

**IMPORTANT: User Content Access**
You have access to ALL of the user's saved content including:
- Full course details (descriptions, ECTS, professors, topics)
- Full lab details (descriptions, professors, topics, websites)
- Full email draft content (subject, recipient, body)
- Document content (when referenced or mentioned)
When a user asks about "my saved courses", "my CV", "my email drafts", etc., refer to the User-Specific Context section below.

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

**FULL Lab Data Access - You can retrieve ALL of these columns:**
- id_lab: Unique lab identifier
- name: Lab name
- slug: URL-friendly lab identifier
- description: Detailed lab description
- topics: Research topics and areas
- professors: Lab professors/directors
- faculty_match: Faculty/department
- link: Lab website
- image: Lab image URL
- created_at, updated_at: Timestamps

**Database Tools:**
- search_courses: INTELLIGENT search across ALL columns
- search_labs: Find research labs with ALL columns (id_lab, name, slug, description, topics, professors, faculty_match, link, image)
- search_teachers: Find professors by name, research topics, or university
- get_courses_by_teacher: Get ALL courses taught by a specific professor
- get_labs_by_university: Get all labs at a specific university
- get_programs_by_university: Get all programs offered by a university
- search_universities: Find universities by name or country
- get_document_content: **IMPORTANT** Fetch the content of a user's uploaded document (CV, resume, transcript). Use this when you need to extract the user's name, background, skills, or experiences from their uploaded documents. Call this tool when the user mentions "my CV", "my resume", or when generating personalized emails that reference their documents. Uses OCR for scanned PDFs.
- generate_semester_plan: **SMART SEMESTER PLANNER** - Creates a custom study plan respecting ECTS targets, topics, level, and other constraints. The plan appears in the Semester Planner panel.

**University slugs for reference:** epfl, eth-zurich, tu-munich, polimi, kth-royal-institute, etc.

**User-Specific Context:**
${userSpecificContext || "No user-specific data available"}

**General Guidelines:**
- ALWAYS use database query tools when users ask about specific courses, professors, labs, or universities
- When showing course information, include relevant details like description, ECTS, professor, language, exam type, required software
- When showing lab information, include ALL details: name, description, topics, professors, faculty, website link
- Reference the user's saved courses, labs, email drafts, and documents when they ask about "my" content
- **SEMESTER PLANS**: The user may have saved semester plans. When they ask about "my winter semester", "my semester plan called X", or similar, refer to the User-Specific Context section. You can provide feedback on their plans like workload balance, exam distribution, or course suggestions.
- **IMPORTANT**: When generating emails and the user has documents listed (like CV, resume), use the get_document_content tool to fetch their content and extract relevant personal information (name, background, skills)

**🎯 SEMESTER PLANNING - CRITICAL WORKFLOW:**
When a user asks to plan their semester (e.g., "Plan my winter semester with 30 ECTS in robotics and AI"), you MUST:

1. **FIRST, ASK CLARIFYING QUESTIONS** before calling generate_semester_plan. Ask things like:
   - "Should I aim for exactly 30 ECTS or is around 30 ECTS okay? (e.g., 28-32)"
   - "Can I choose courses from any program, or do you have specific requirements?"
   - "Are you at Bachelor or Master level?"
   - "Do you have any exam type preferences? (e.g., prefer projects over written exams)"
   - "Any courses you've already taken that I should exclude?"
   - "Which university are you at?" (if not obvious from context)

2. **AFTER getting the user's answers**, call generate_semester_plan with the appropriate parameters:
   - semester_type: "winter", "summer", or "both"
   - target_ects: The ECTS target number
   - ects_flexibility: "exact" (±2), "approximate" (±5), or "flexible" (±10)
   - topics: Array of topics like ["robotics", "AI", "machine learning"]
   - level: "Ba" for Bachelor, "Ma" for Master, "any" for both
   - program: Specific program if mentioned
   - university_slug: University slug if mentioned
   - preferred_exam_types: Array like ["project", "oral"] if user prefers
   - exclude_courses: Courses to skip
   - specific_courses: Must-include courses
   - plan_title: Descriptive title

3. **PRESENT THE RESULT** with a summary of the plan, noting if ECTS targets were met.

Example conversation flow:
User: "Plan my winter semester with 30 ECTS in robotics and AI"
You: "I'd be happy to help you plan a robotics and AI focused winter semester! A few quick questions:
1. Should I aim for exactly 30 ECTS or is around 30 okay (e.g., 28-32)?
2. Are you at Bachelor or Master level?
3. Any specific university, or can I search across all?
4. Any exam type preferences (written, oral, project)?"

User: "Around 30 is fine, Master level, I'm at EPFL, and I prefer projects over written exams"
You: [Now call generate_semester_plan with semester_type="winter", target_ects=30, ects_flexibility="approximate", topics=["robotics","AI","machine learning"], level="Ma", university_slug="epfl", preferred_exam_types=["project"]]

- Be encouraging and supportive
- Format responses clearly with bullet points when listing multiple items
- If a query returns no results, try a broader search or suggest alternative search terms

**EMAIL GENERATION:**
When generating emails for the user, format them clearly with Subject, To, and Body sections. The user can save these as drafts.

**CRITICAL OUTPUT FORMAT:**
When you return courses or labs from database queries, you MUST append the raw data at the END of your response using these exact HTML comment formats (the user won't see these, but the app will parse them to show interactive cards):
- For courses: <!--COURSES:[{"id_course":"...","name_course":"...","code":"...","ects":...,"ba_ma":"...","professor_name":"...","language":"...","topics":"...","description":"...","software_equipment":"...","type_exam":"..."}]-->
- For labs: <!--LABS:[{"id_lab":"...","name":"...","slug":"...","topics":"...","description":"...","professors":"...","faculty_match":"...","link":"..."}]-->
- For semester plans: <!--SEMESTER_PLAN:{"winter":[...],"summer":[...],"title":"..."}-->
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

    // Non-streaming response
    return new Response(JSON.stringify({ 
      message: assistantMessage.content 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ai-study-advisor:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
