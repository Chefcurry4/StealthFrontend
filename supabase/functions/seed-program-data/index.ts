import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Program name to slug mapping
const PROGRAM_SLUG_MAP: Record<string, string> = {
  "Quantum Science and Engineering": "QUANT",
  "Urban Systems": "URB-SYS",
  "Sustainable Management and Technology": "SUST",
  "Physics and Applied Physics": "PH",
  "Nuclear Engineering": "NUCLEAR",
  "Neuro-X": "Neuro-X",
  "Molecular and Biological Chemistry": "Molecular-CH",
  "Microengineering": "MICRO",
  "Mechanical Engineering": "ME",
  "Mathematics": "MA",
  "Applied Mathematics": "AMA", // Will be added via Firecrawl
};

interface Course {
  course_name: string;
  ects_credits: number;
  course_type: string;
  specialization: string | null;
}

interface CreditCategory {
  category_name: string;
  credits: number;
}

interface ProgramData {
  program_name: string;
  courses: Course[];
  suggested_minors: string[];
  credit_distribution_categories: CreditCategory[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, programData } = await req.json();

    if (action === "scrape_applied_math") {
      // Use Firecrawl to scrape the Applied Mathematics PDF
      const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (!firecrawlApiKey) {
        return new Response(
          JSON.stringify({ success: false, error: "Firecrawl API key not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const pdfUrl = "https://www.epfl.ch/education/master/wp-content/uploads/2018/08/SB_MATH_AMA_RV-1.pdf";
      
      console.log("Scraping Applied Mathematics PDF:", pdfUrl);

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: pdfUrl,
          formats: ["markdown"],
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Firecrawl API error:", data);
        return new Response(
          JSON.stringify({ success: false, error: data.error || "Failed to scrape PDF" }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse the markdown to extract course data
      const markdown = data.data?.markdown || data.markdown || "";
      console.log("Scraped content length:", markdown.length);

      // Return the scraped content for manual parsing or further processing
      return new Response(
        JSON.stringify({ 
          success: true, 
          markdown,
          message: "PDF scraped successfully. Parse the markdown to extract course data."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "seed_programs") {
      // Seed program data from the provided JSON
      const programs: ProgramData[] = programData?.epfl_programs || [];
      const results: { program: string; success: boolean; error?: string }[] = [];

      for (const program of programs) {
        const slug = PROGRAM_SLUG_MAP[program.program_name];
        if (!slug) {
          results.push({ program: program.program_name, success: false, error: "No slug mapping found" });
          continue;
        }

        try {
          // Find the program ID from Programs(P) table
          const { data: programRecord, error: findError } = await supabase
            .from("Programs(P)")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

          if (findError || !programRecord) {
            results.push({ 
              program: program.program_name, 
              success: false, 
              error: findError?.message || `Program with slug '${slug}' not found` 
            });
            continue;
          }

          const programId = programRecord.id;

          // Calculate total credits from categories
          const totalCredits = program.credit_distribution_categories.reduce(
            (sum, cat) => sum + cat.credits, 0
          );

          // Upsert program structure
          const { error: structureError } = await supabase
            .from("program_structures")
            .upsert({
              program_id: programId,
              total_credits: totalCredits,
              duration: "2 years (4 semesters)",
              website: `https://www.epfl.ch/education/master/programs/${slug.toLowerCase()}/`,
            }, { onConflict: "program_id" });

          if (structureError) {
            results.push({ program: program.program_name, success: false, error: structureError.message });
            continue;
          }

          // Delete existing related data
          await supabase.from("program_credit_components").delete().eq("program_id", programId);
          await supabase.from("program_specializations").delete().eq("program_id", programId);
          await supabase.from("program_courses").delete().eq("program_id", programId);
          await supabase.from("program_minors").delete().eq("program_id", programId);

          // Insert credit components
          const creditComponents = program.credit_distribution_categories.map((cat, idx) => ({
            program_id: programId,
            name: cat.category_name,
            credits: cat.credits,
            sort_order: idx,
            color: getColorForCategory(cat.category_name),
          }));

          if (creditComponents.length > 0) {
            await supabase.from("program_credit_components").insert(creditComponents);
          }

          // Extract unique specializations from courses
          const specializationSet = new Set<string>();
          program.courses.forEach(course => {
            if (course.specialization) {
              // Handle comma-separated specializations
              course.specialization.split(",").forEach(s => specializationSet.add(s.trim()));
            }
          });

          const specializations = Array.from(specializationSet).filter(s => 
            s && !["null", "Both specializations", "All specializations", "All orientations", "EPFL", "ETHZ"].includes(s)
          );

          const specializationColors = [
            "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"
          ];

          const specializationRecords = specializations.map((spec, idx) => ({
            program_id: programId,
            code: spec.substring(0, 20).toUpperCase().replace(/\s+/g, "_"),
            name: spec,
            color: specializationColors[idx % specializationColors.length],
            sort_order: idx,
          }));

          if (specializationRecords.length > 0) {
            await supabase.from("program_specializations").insert(specializationRecords);
          }

          // Insert courses
          const courseRecords = program.courses.map((course, idx) => ({
            program_id: programId,
            name: course.course_name,
            credits: course.ects_credits,
            category: course.course_type === "core" ? "Core Courses" : "Option Courses",
            specialization_codes: course.specialization 
              ? course.specialization.split(",").map(s => s.trim().substring(0, 20).toUpperCase().replace(/\s+/g, "_"))
              : null,
            sort_order: idx,
          }));

          if (courseRecords.length > 0) {
            await supabase.from("program_courses").insert(courseRecords);
          }

          // Insert suggested minors
          const minorRecords = program.suggested_minors.map(minor => ({
            program_id: programId,
            name: minor,
          }));

          if (minorRecords.length > 0) {
            await supabase.from("program_minors").insert(minorRecords);
          }

          results.push({ program: program.program_name, success: true });
        } catch (err) {
          results.push({ 
            program: program.program_name, 
            success: false, 
            error: err instanceof Error ? err.message : "Unknown error" 
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getColorForCategory(categoryName: string): string {
  const colorMap: Record<string, string> = {
    "Master's thesis": "#3b82f6",
    "Core courses": "#10b981",
    "Core foundations": "#10b981",
    "Options": "#f59e0b",
    "Optional courses": "#f59e0b",
    "Electives": "#f59e0b",
    "Elective courses": "#f59e0b",
    "Projects": "#8b5cf6",
    "Semester project": "#8b5cf6",
    "Semester projects": "#8b5cf6",
    "Project in social and human sciences": "#ec4899",
    "Internship": "#06b6d4",
    "Industrial internship": "#06b6d4",
    "Engineering internship": "#06b6d4",
  };

  for (const [key, color] of Object.entries(colorMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }

  return "#6b7280"; // Default gray
}
