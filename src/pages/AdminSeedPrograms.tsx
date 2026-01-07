import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, FileText, Database } from "lucide-react";

// Program data from JSON
const PROGRAM_DATA = {
  "epfl_programs": [
    {
      "program_name": "Quantum Science and Engineering",
      "courses": [
        { "course_name": "Computational complexity", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Computational quantum physics", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Fundamentals of quantum sensing and metrology", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Fundamentals of solid-state materials", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Introduction to quantum computation", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Introduction to quantum cryptography", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Introduction to quantum information processing", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Introduction to quantum science and technology", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Project in Quantum and nanocomputing", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Quantum electrodynamics and quantum optics", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Quantum mechanics for non-physicists", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Semiconductor devices I", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Solid state systems for quantum information", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Advanced cryptography", "ects_credits": 6, "course_type": "option", "specialization": "Quantum information and computation" },
        { "course_name": "Algorithms II", "ects_credits": 8, "course_type": "option", "specialization": "Quantum information and computation" },
        { "course_name": "Quantum computing", "ects_credits": 6, "course_type": "option", "specialization": "Both specializations" },
        { "course_name": "Machine learning", "ects_credits": 8, "course_type": "option", "specialization": "Both specializations" }
      ],
      "suggested_minors": [],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Core courses", "credits": 18 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Options", "credits": 38 },
        { "category_name": "Semester Projects", "credits": 16 },
        { "category_name": "Industrial internship", "credits": 12 }
      ]
    },
    {
      "program_name": "Urban Systems",
      "courses": [
        { "course_name": "Computational systems thinking for sustainable engineering", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Social justice and transition in the urban context", "ects_credits": 3, "course_type": "core", "specialization": null },
        { "course_name": "Systems approaches for urban transitions", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Urban digital twins", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Urban governance", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Climate and water sensitive urban design", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Science of climate change", "ects_credits": 4, "course_type": "core", "specialization": null }
      ],
      "suggested_minors": [],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Core foundations", "credits": 19 },
        { "category_name": "Core options", "credits": 15 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Projects", "credits": 30 },
        { "category_name": "Specializations", "credits": 20 }
      ]
    },
    {
      "program_name": "Sustainable Management and Technology",
      "courses": [
        { "course_name": "Data science and causal inference for sustainability", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Data science and machine learning", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Science of climate change", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Technology, sustainability and public policy", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Transformative project", "ects_credits": 10, "course_type": "core", "specialization": null }
      ],
      "suggested_minors": [],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis in industry", "credits": 30 },
        { "category_name": "Technology", "credits": 27 },
        { "category_name": "Economics and management", "credits": 24 },
        { "category_name": "Transferable skills and group projects", "credits": 19 },
        { "category_name": "Leadership competencies", "credits": 6 },
        { "category_name": "Electives", "credits": 14 }
      ]
    },
    {
      "program_name": "Physics and Applied Physics",
      "courses": [
        { "course_name": "Project in Astrophysics, particles, high energy physics", "ects_credits": 8, "course_type": "core", "specialization": null },
        { "course_name": "Project in Condensed matter physics", "ects_credits": 8, "course_type": "core", "specialization": null },
        { "course_name": "Project in Physics of biological and complex systems", "ects_credits": 8, "course_type": "core", "specialization": null },
        { "course_name": "Quantum field theory I", "ects_credits": 6, "course_type": "option", "specialization": "Physics" },
        { "course_name": "Machine learning for physicists", "ects_credits": 6, "course_type": "option", "specialization": "Applied Physics" }
      ],
      "suggested_minors": ["Engineering for sustainability", "Photonics", "Physics of living systems", "Quantum science and engineering", "Space technologies"],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Optional courses", "credits": 38 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Projects", "credits": 16 },
        { "category_name": "Research training, industrial internship or further courses", "credits": 30 }
      ]
    },
    {
      "program_name": "Nuclear Engineering",
      "courses": [
        { "course_name": "Physics of nuclear reactors", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Radiation and reactor experiments", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Technology and safety of nuclear power plants", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Nuclear fusion and plasma physics", "ects_credits": 4, "course_type": "option", "specialization": "EPFL" }
      ],
      "suggested_minors": [],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "EPFL compulsory courses", "credits": 20 },
        { "category_name": "ETHZ compulsory courses", "credits": 18 },
        { "category_name": "PSI compulsory courses and project", "credits": 32 },
        { "category_name": "Elective courses", "credits": 20 }
      ]
    },
    {
      "program_name": "Neuro-X",
      "courses": [
        { "course_name": "Brain-like computation and intelligence", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Computational neuroscience: neuronal dynamics", "ects_credits": 5, "course_type": "core", "specialization": null },
        { "course_name": "Machine learning", "ects_credits": 8, "course_type": "core", "specialization": null },
        { "course_name": "Neural interfaces", "ects_credits": 6, "course_type": "core", "specialization": null },
        { "course_name": "Deep learning", "ects_credits": 4, "course_type": "option", "specialization": "Data Science and Machine Learning" }
      ],
      "suggested_minors": ["Biomedical technologies", "Imaging", "Photonics"],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Core courses", "credits": 31 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Internship", "credits": 8 },
        { "category_name": "Options", "credits": 30 },
        { "category_name": "Semester projects", "credits": 15 }
      ]
    },
    {
      "program_name": "Molecular and Biological Chemistry",
      "courses": [
        { "course_name": "Analytical and bioanalytical chemistry", "ects_credits": 8, "course_type": "core", "specialization": "Analytical and bioanalytical chemistry" },
        { "course_name": "Biological chemistry and biophysics", "ects_credits": 8, "course_type": "core", "specialization": "Biological chemistry and biophysics" },
        { "course_name": "Organic chemistry", "ects_credits": 8, "course_type": "core", "specialization": "Organic chemistry" },
        { "course_name": "Physical chemistry", "ects_credits": 8, "course_type": "core", "specialization": "Physical chemistry" }
      ],
      "suggested_minors": ["Life sciences engineering", "Physics", "Physics of living systems"],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Thematic modules", "credits": 24 },
        { "category_name": "Options", "credits": 12 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Projects I", "credits": 18 },
        { "category_name": "Project II", "credits": 30 }
      ]
    },
    {
      "program_name": "Microengineering",
      "courses": [
        { "course_name": "Products design and systems engineering", "ects_credits": 10, "course_type": "core", "specialization": null },
        { "course_name": "Machine learning I", "ects_credits": 4, "course_type": "core", "specialization": null },
        { "course_name": "Advanced MEMS and microsystems", "ects_credits": 3, "course_type": "core", "specialization": "Micro and nanosystems" },
        { "course_name": "Nanotechnology", "ects_credits": 3, "course_type": "core", "specialization": "Optics and photonics, Micro and nanosystems" }
      ],
      "suggested_minors": ["Biomedical technologies", "Imaging", "Photonics"],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Basic compulsory courses", "credits": 14 },
        { "category_name": "Basics for orientations", "credits": 15 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Options", "credits": 35 },
        { "category_name": "Semester projects", "credits": 20 }
      ]
    },
    {
      "program_name": "Mechanical Engineering",
      "courses": [
        { "course_name": "Advanced control systems", "ects_credits": 3, "course_type": "option", "specialization": "Automatic and systems, Fluid mechanics, Thermal sciences, Mechanics of solids and structures, Biomechanics" },
        { "course_name": "Advanced design for sustainable future", "ects_credits": 5, "course_type": "option", "specialization": "Design and production" },
        { "course_name": "Aerodynamics", "ects_credits": 4, "course_type": "option", "specialization": "Fluid mechanics, Thermal sciences, Mechanics of solids and structures" },
        { "course_name": "Turbulence", "ects_credits": 5, "course_type": "option", "specialization": "Fluid mechanics" }
      ],
      "suggested_minors": ["Biomedical technologies", "Computational science and engineering", "Energy", "Management, technology and entrepreneurship", "Materials science", "Space technologies"],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Options", "credits": 74 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Semester project", "credits": 10 }
      ]
    },
    {
      "program_name": "Mathematics",
      "courses": [
        { "course_name": "Abstract analysis on groups", "ects_credits": 5, "course_type": "option", "specialization": "Algebra and geometry" },
        { "course_name": "Algebraic geometry II - Schemes and sheaves", "ects_credits": 10, "course_type": "option", "specialization": "Algebra and geometry" },
        { "course_name": "Calculus of variations", "ects_credits": 5, "course_type": "option", "specialization": "Analysis" },
        { "course_name": "Computational linear algebra", "ects_credits": 5, "course_type": "option", "specialization": "Numerical analysis" },
        { "course_name": "Statistical machine learning", "ects_credits": 5, "course_type": "option", "specialization": "Probability and interactions / Statistics" }
      ],
      "suggested_minors": [],
      "credit_distribution_categories": [
        { "category_name": "Master's thesis", "credits": 30 },
        { "category_name": "Optional courses", "credits": 44 },
        { "category_name": "Project in social and human sciences", "credits": 6 },
        { "category_name": "Semester project", "credits": 10 }
      ]
    }
  ]
};

interface SeedResult {
  program: string;
  success: boolean;
  error?: string;
}

export default function AdminSeedPrograms() {
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [scrapedContent, setScrapedContent] = useState<string>("");

  const handleScrapeAppliedMath = async () => {
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-program-data", {
        body: { action: "scrape_applied_math" },
      });

      if (error) throw error;

      if (data.success) {
        setScrapedContent(data.markdown || "");
        toast.success("Applied Mathematics PDF scraped successfully!");
      } else {
        toast.error(data.error || "Failed to scrape PDF");
      }
    } catch (error) {
      console.error("Error scraping:", error);
      toast.error("Failed to scrape Applied Mathematics PDF");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSeedPrograms = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke("seed-program-data", {
        body: { 
          action: "seed_programs",
          programData: PROGRAM_DATA
        },
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.results);
        const successCount = data.results.filter((r: SeedResult) => r.success).length;
        toast.success(`Seeded ${successCount}/${data.results.length} programs successfully!`);
      } else {
        toast.error(data.error || "Failed to seed programs");
      }
    } catch (error) {
      console.error("Error seeding:", error);
      toast.error("Failed to seed program data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin: Seed Program Data</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scrape Applied Mathematics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use Firecrawl to scrape the Applied Mathematics PDF from EPFL.
            </p>
            <Button 
              onClick={handleScrapeAppliedMath} 
              disabled={isScraping}
              variant="outline"
            >
              {isScraping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                "Scrape PDF"
              )}
            </Button>
            
            {scrapedContent && (
              <div className="mt-4 p-4 bg-muted rounded-lg max-h-64 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">{scrapedContent.substring(0, 2000)}...</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed All Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Seed the 10 EPFL Master programs from the JSON data.
            </p>
            <Button 
              onClick={handleSeedPrograms} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                "Seed Programs"
              )}
            </Button>

            {results.length > 0 && (
              <div className="mt-4 space-y-2">
                {results.map((result, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded ${
                      result.success ? "bg-green-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{result.program}</span>
                    {result.error && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {result.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
