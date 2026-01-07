import { useQuery } from "@tanstack/react-query";

export interface JsonCourse {
  course_name: string;
  ects_credits: number;
  course_type: "core" | "option";
  specialization: string | null;
}

export interface CreditCategory {
  category_name: string;
  credits: number;
}

export interface JsonProgram {
  program_name: string;
  courses: JsonCourse[];
  suggested_minors: string[];
  credit_distribution_categories: CreditCategory[];
}

export interface MasterProgramData {
  courses: JsonCourse[];
  creditDistribution: CreditCategory[];
  suggestedMinors: string[];
  specializations: string[];
  totalCredits: number;
}

// Map program slugs to JSON program names
const slugToNameMapping: Record<string, string> = {
  "QUANT": "Quantum Science and Engineering",
  "URB-SYS": "Urban Systems",
  "SUST": "Sustainable Management and Technology",
  "PH": "Physics and Applied Physics",
  "CS": "Computer Science",
  "CYB": "Cybersecurity",
  "DS": "Data Science",
  "EE": "Electrical and Electronics Engineering",
  "MA": "Mathematics",
  "ME": "Mechanical Engineering",
  "CIV": "Civil Engineering",
  "CH": "Chemistry",
  "CH-ENG": "Chemical Engineering",
  "CHB-ENG": "Chemical Engineering and Biotechnology",
  "COM-SYS": "Communication Systems",
  "COM-Sc": "Computational Science and Engineering",
  "DH": "Digital Humanities",
  "Energy-Sc": "Energy Science & Technology",
  "ENV-Sc": "Environmental Sciences Engineering",
  "FE": "Financial Engineering",
  "Life-Sc": "Life Sciences Engineering",
  "MAT-Sc": "Materials Science and Engineering",
  "MICRO": "Microengineering",
  "Molecular-CH": "Molecular & Biological Chemistry",
  "MTE": "Management, Technology and Entrepreneurship",
  "NANO": "Micro- and Nanotechnologies for Integrated Systems",
  "Neuro-X": "Neuro-X",
  "NUCLEAR": "Nuclear Engineering",
  "RO": "Robotics",
  "ST": "Statistics",
  "AR": "Architecture",
  "MA++": "Applied Mathematics",
};

// Reverse mapping for lookup
const nameToSlugMapping: Record<string, string> = Object.fromEntries(
  Object.entries(slugToNameMapping).map(([k, v]) => [v.toLowerCase(), k])
);

export const useMasterProgramData = (programSlug: string | undefined) => {
  return useQuery({
    queryKey: ["masterProgramData", programSlug],
    queryFn: async (): Promise<MasterProgramData | null> => {
      if (!programSlug) return null;

      // Map slug to program name
      const programName = slugToNameMapping[programSlug];
      if (!programName) {
        console.log(`No mapping found for slug: ${programSlug}`);
        return null;
      }

      // Fetch the JSON file
      const response = await fetch("/data/master_program_pages.json");
      if (!response.ok) {
        throw new Error("Failed to fetch program data");
      }

      const data = await response.json();
      const programs: JsonProgram[] = data.epfl_programs;

      // Find matching program (case-insensitive)
      const program = programs.find(
        (p) => p.program_name.toLowerCase() === programName.toLowerCase()
      );

      if (!program) {
        console.log(`Program not found in JSON: ${programName}`);
        return null;
      }

      // Extract unique specializations from courses
      const specializations = [
        ...new Set(
          program.courses
            .map((c) => c.specialization)
            .filter((s): s is string => s !== null && s.length > 0)
        ),
      ];

      // Calculate total credits from distribution
      const totalCredits = program.credit_distribution_categories.reduce(
        (sum, cat) => sum + cat.credits,
        0
      );

      return {
        courses: program.courses,
        creditDistribution: program.credit_distribution_categories,
        suggestedMinors: program.suggested_minors,
        specializations,
        totalCredits,
      };
    },
    enabled: !!programSlug,
    staleTime: Infinity, // JSON data is static
  });
};

export const getSlugFromProgramName = (name: string): string | undefined => {
  return nameToSlugMapping[name.toLowerCase()];
};
