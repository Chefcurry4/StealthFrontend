import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Program name to ID mapping (from the database)
const PROGRAM_NAME_TO_ID: Record<string, string> = {
  "APPLIED MATHEMATICS": "3d6ebdf3-45ba-479f-a5eb-1fd80232027e",
  "Applied Mathematics": "3d6ebdf3-45ba-479f-a5eb-1fd80232027e",
  "Architecture": "f48170bd-53f9-4774-81e7-7759355a3f0a",
  "Chemical Engineering": "8f7d89a8-2557-4295-9a5e-2519460736cd",
  "Chemical Engineering and Biotechnology": "635c552a-b819-4c1f-ac01-7b8841c2ac8b",
  "Chemistry": "6ab2cbd4-7b90-4e30-9d8d-382e33b9a3c8",
  "Civil Engineering": "4e746be0-7627-48f0-b1dd-7758040860a5",
  "Communication Systems": "a3857cde-b90d-4f2b-b241-a011bdfed9dc",
  "Computational Science and Engineering": "dc8fbc32-d7dd-4965-a63d-281be5bcbb20",
  "Computer Science": "87d4eef2-a6d1-4ac8-9fa5-da4d49c25db6",
  "Cybersecurity": "0b242033-d434-4f9e-a032-be60788fb5a8",
  "Data Science": "0df709e6-e544-49dc-aa76-0e1bc95ef38c",
  "Digital Humanities": "167d8fc6-82f3-459b-8009-4170bb47ebe7",
  "Electrical and Electronics Engineering": "6dd2e7ca-ad90-4a33-a396-2b551f8b5635",
  "Energy Science & Technology": "cda623cc-bf12-4fe0-bd47-370f750df33f",
  "Environmental Sciences Engineering": "bc20c2b2-632e-47a7-8c0b-693ca5655254",
  "Financial Engineering": "4e9d7b6d-6f1d-42d4-bbef-6b50326b383b",
  "Humanities and Social Sciences": "b8c1980c-7426-49a6-a847-f112d6a0edc1",
  "Life Sciences Engineering": "8fdc4640-719b-43a4-a398-cdaacc9cb6e0",
  "Management, Technology and Entrepreneurship": "603be80d-8feb-4fd9-b963-5ce79599becc",
  "Materials Science and Engineering": "85f6693c-1eda-43ca-aca8-335ba04a6918",
  "Mathematics": "c2d59f8f-6ce8-4331-ac43-63e90bfcc3fb",
  "Mechanical Engineering": "1e727282-7560-42d8-bd5d-1145e5821169",
  "Micro- and Nanotechnologies for Integrated Systems": "43cec2dd-07a1-4c6e-ab6d-b816c32fce17",
  "Microengineering": "682b59d7-b7b3-456e-9702-7cca83e6d485",
  "Molecular & Biological Chemistry": "7966388d-eca8-4de8-80bc-b955aa49e528",
  "Neuro-X": "d4a24200-fda7-4a02-b226-d211728a686d",
  "Nuclear Engineering": "1ab2ab34-c5b4-4e34-8514-b53c1614e40a",
  "Physics": "0736f75a-017e-45ed-9182-0367f49a043c",
  "Quantum Science and Engineering": "a31166dc-687e-4fdf-9789-bff3a6a582aa",
  "Robotics": "d2b049ad-d744-47b1-924f-578491b87f64",
  "Statistics": "4825c7c2-61ec-438b-8d30-cecd466e6699",
  "Sustainable Management and Technology": "8a55df8c-007b-47b4-b248-0a724bfcc610",
  "Urban Systems": "5fb9a7dd-f940-4494-b347-9e50a4cef25a",
  // Variations of program names
  "QUANTUM SCIENCE AND ENGINEERING": "a31166dc-687e-4fdf-9789-bff3a6a582aa",
  "URBAN SYSTEMS": "5fb9a7dd-f940-4494-b347-9e50a4cef25a",
  "COMPUTER SCIENCE": "87d4eef2-a6d1-4ac8-9fa5-da4d49c25db6",
  "DATA SCIENCE": "0df709e6-e544-49dc-aa76-0e1bc95ef38c",
  "CYBERSECURITY": "0b242033-d434-4f9e-a032-be60788fb5a8",
  "ROBOTICS": "d2b049ad-d744-47b1-924f-578491b87f64",
  "MECHANICAL ENGINEERING": "1e727282-7560-42d8-bd5d-1145e5821169",
  "ELECTRICAL AND ELECTRONICS ENGINEERING": "6dd2e7ca-ad90-4a33-a396-2b551f8b5635",
  "CIVIL ENGINEERING": "4e746be0-7627-48f0-b1dd-7758040860a5",
  "ARCHITECTURE": "f48170bd-53f9-4774-81e7-7759355a3f0a",
  "CHEMISTRY": "6ab2cbd4-7b90-4e30-9d8d-382e33b9a3c8",
  "PHYSICS": "0736f75a-017e-45ed-9182-0367f49a043c",
  "MATHEMATICS": "c2d59f8f-6ce8-4331-ac43-63e90bfcc3fb",
  "STATISTICS": "4825c7c2-61ec-438b-8d30-cecd466e6699",
  "LIFE SCIENCES ENGINEERING": "8fdc4640-719b-43a4-a398-cdaacc9cb6e0",
  "MATERIALS SCIENCE AND ENGINEERING": "85f6693c-1eda-43ca-aca8-335ba04a6918",
  "MICROENGINEERING": "682b59d7-b7b3-456e-9702-7cca83e6d485",
  "NEURO-X": "d4a24200-fda7-4a02-b226-d211728a686d",
  "FINANCIAL ENGINEERING": "4e9d7b6d-6f1d-42d4-bbef-6b50326b383b",
  "NUCLEAR ENGINEERING": "1ab2ab34-c5b4-4e34-8514-b53c1614e40a",
  "COMMUNICATION SYSTEMS": "a3857cde-b90d-4f2b-b241-a011bdfed9dc",
  "COMPUTATIONAL SCIENCE AND ENGINEERING": "dc8fbc32-d7dd-4965-a63d-281be5bcbb20",
  "DIGITAL HUMANITIES": "167d8fc6-82f3-459b-8009-4170bb47ebe7",
  "ENVIRONMENTAL SCIENCES ENGINEERING": "bc20c2b2-632e-47a7-8c0b-693ca5655254",
  "ENERGY SCIENCE AND TECHNOLOGY": "cda623cc-bf12-4fe0-bd47-370f750df33f",
  "ENERGY SCIENCE & TECHNOLOGY": "cda623cc-bf12-4fe0-bd47-370f750df33f",
  "CHEMICAL ENGINEERING": "8f7d89a8-2557-4295-9a5e-2519460736cd",
  "CHEMICAL ENGINEERING AND BIOTECHNOLOGY": "635c552a-b819-4c1f-ac01-7b8841c2ac8b",
  "SUSTAINABLE MANAGEMENT AND TECHNOLOGY": "8a55df8c-007b-47b4-b248-0a724bfcc610",
  "MANAGEMENT, TECHNOLOGY AND ENTREPRENEURSHIP": "603be80d-8feb-4fd9-b963-5ce79599becc",
  "MICRO- AND NANOTECHNOLOGIES FOR INTEGRATED SYSTEMS": "43cec2dd-07a1-4c6e-ab6d-b816c32fce17",
  "MOLECULAR & BIOLOGICAL CHEMISTRY": "7966388d-eca8-4de8-80bc-b955aa49e528",
  "HUMANITIES AND SOCIAL SCIENCES": "b8c1980c-7426-49a6-a847-f112d6a0edc1",
};

// Helper to find program ID
function findProgramId(programName: string): string | null {
  // Try exact match first
  if (PROGRAM_NAME_TO_ID[programName]) {
    return PROGRAM_NAME_TO_ID[programName];
  }
  // Try uppercase
  if (PROGRAM_NAME_TO_ID[programName.toUpperCase()]) {
    return PROGRAM_NAME_TO_ID[programName.toUpperCase()];
  }
  // Try title case
  const titleCase = programName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  if (PROGRAM_NAME_TO_ID[titleCase]) {
    return PROGRAM_NAME_TO_ID[titleCase];
  }
  // Fuzzy match - find best match
  const normalizedName = programName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, id] of Object.entries(PROGRAM_NAME_TO_ID)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedKey === normalizedName || normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
      return id;
    }
  }
  return null;
}

// Generate color for specializations
const SPECIALIZATION_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

// Generate color for components
const COMPONENT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted))",
];

interface ProgramData {
  program_name: string;
  courses: {
    course_name: string;
    ects_credits: number;
    course_type: string;
    specialization: string | null;
  }[];
  suggested_minors?: string[];
  credit_distribution_categories?: {
    category_name: string;
    credits: number;
  }[];
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for JSON data
    let jsonData: { epfl_programs: ProgramData[] };
    
    try {
      const body = await req.json();
      if (body.epfl_programs) {
        jsonData = body;
      } else if (body.json_url) {
        // Fetch JSON from URL
        const response = await fetch(body.json_url);
        jsonData = await response.json();
      } else {
        throw new Error("Missing epfl_programs data or json_url");
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body. Provide epfl_programs array or json_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      processed: 0,
      skipped: 0,
      errors: [] as string[],
      programs: [] as string[],
    };

    for (const program of jsonData.epfl_programs) {
      const programId = findProgramId(program.program_name);
      
      if (!programId) {
        results.errors.push(`Program not found: ${program.program_name}`);
        results.skipped++;
        continue;
      }

      results.programs.push(program.program_name);

      try {
        // 1. Upsert program_structures
        const structureData = {
          program_id: programId,
          total_credits: 120,
          duration: "2 years",
          contact_email: null,
          website: null,
          internship_note: null,
        };
        
        await supabase
          .from("program_structures")
          .upsert(structureData, { onConflict: "program_id" });

        // 2. Process credit_distribution_categories -> program_credit_components
        if (program.credit_distribution_categories && program.credit_distribution_categories.length > 0) {
          // Delete existing components for this program
          await supabase
            .from("program_credit_components")
            .delete()
            .eq("program_id", programId);

          const components = program.credit_distribution_categories.map((cat, idx) => ({
            program_id: programId,
            name: cat.category_name,
            credits: cat.credits,
            color: COMPONENT_COLORS[idx % COMPONENT_COLORS.length],
            sort_order: idx,
          }));

          if (components.length > 0) {
            await supabase.from("program_credit_components").insert(components);
          }
        }

        // 3. Process specializations from courses
        const specializationSet = new Set<string>();
        for (const course of program.courses) {
          if (course.specialization) {
            // Handle multiple specializations separated by comma
            const specs = course.specialization.split(",").map(s => s.trim());
            specs.forEach(s => {
              if (s && s.toLowerCase() !== "null" && s.toLowerCase() !== "both specializations") {
                specializationSet.add(s);
              }
            });
          }
        }

        // Delete existing specializations for this program
        await supabase
          .from("program_specializations")
          .delete()
          .eq("program_id", programId);

        const specializations = Array.from(specializationSet);
        if (specializations.length > 0) {
          const specData = specializations.map((spec, idx) => ({
            program_id: programId,
            code: spec.substring(0, 3).toUpperCase(),
            name: spec,
            color: SPECIALIZATION_COLORS[idx % SPECIALIZATION_COLORS.length],
            sort_order: idx,
          }));

          await supabase.from("program_specializations").insert(specData);
        }

        // 4. Process courses -> program_courses
        // Delete existing courses for this program
        await supabase
          .from("program_courses")
          .delete()
          .eq("program_id", programId);

        if (program.courses && program.courses.length > 0) {
          const courseData = program.courses.map((course, idx) => {
            let specCodes: string[] | null = null;
            if (course.specialization && course.specialization.toLowerCase() !== "null" && course.specialization.toLowerCase() !== "both specializations") {
              const specs = course.specialization.split(",").map(s => s.trim().substring(0, 3).toUpperCase());
              specCodes = specs.filter(s => s.length > 0);
            }

            return {
              program_id: programId,
              name: course.course_name,
              credits: course.ects_credits || 0,
              category: course.course_type || "option",
              specialization_codes: specCodes && specCodes.length > 0 ? specCodes : null,
              sort_order: idx,
            };
          });

          await supabase.from("program_courses").insert(courseData);
        }

        // 5. Process suggested_minors -> program_minors
        // Delete existing minors for this program
        await supabase
          .from("program_minors")
          .delete()
          .eq("program_id", programId);

        if (program.suggested_minors && program.suggested_minors.length > 0) {
          const minorData = program.suggested_minors.map((minor) => ({
            program_id: programId,
            name: minor,
          }));

          await supabase.from("program_minors").insert(minorData);
        }

        results.processed++;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Error processing ${program.program_name}: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} programs, skipped ${results.skipped}`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in seed-program-data-from-json:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
