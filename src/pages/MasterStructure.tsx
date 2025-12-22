import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap, Lightbulb, FlaskConical, Info, ExternalLink, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Course type with optional DB link
interface Course {
  name: string;
  credits: number;
  specializations?: string[];
  code?: string;
}

interface ProgramStructure {
  title: string;
  totalCredits: number;
  duration: string;
  contact: string;
  website: string;
  components: { name: string; credits: number; color: string }[];
  specializations: { code: string; name: string; color: string }[];
  coreCourses: Course[];
  optionCourses: Course[];
  innovationCourses?: Course[];
  transversalCourses?: Course[];
  minors?: string[];
  internshipNote?: string;
}

// Master structure data for all programs
const MASTER_STRUCTURES: Record<string, ProgramStructure> = {
  "Life-Sc": {
    title: "Master of Science in Life Sciences Engineering",
    totalCredits: 120,
    duration: "2 years",
    contact: "master.lse@epfl.ch",
    website: "go.epfl.ch/master-life-sciences-engineering",
    components: [
      { name: "Master's Thesis", credits: 30, color: "hsl(var(--chart-1))" },
      { name: "Core Courses", credits: 24, color: "hsl(var(--chart-2))" },
      { name: "Options", credits: 44, color: "hsl(var(--chart-3))" },
      { name: "Scientific Thinking", credits: 4, color: "hsl(var(--chart-4))" },
      { name: "Innovation & Entrepreneurship", credits: 4, color: "hsl(var(--chart-5))" },
      { name: "SHS Requirements", credits: 6, color: "hsl(var(--muted))" },
    ],
    specializations: [
      { code: "B", name: "Biomedical Engineering", color: "bg-blue-500" },
      { code: "J", name: "Molecular & Cellular Biology", color: "bg-green-500" },
      { code: "K", name: "Computational Biology", color: "bg-purple-500" },
      { code: "L", name: "Neuroscience", color: "bg-orange-500" },
    ],
    coreCourses: [
      { name: "Basics in bioinstrumentation", credits: 4, specializations: [] },
      { name: "Bioimage informatics", credits: 4, specializations: [] },
      { name: "Biomechanics of the cardiovascular system", credits: 3, specializations: ["B"] },
      { name: "Biomechanics of the musculoskeletal system", credits: 5, specializations: ["B"] },
      { name: "Biomedical optics", credits: 3, specializations: ["B"] },
      { name: "Biophysics: physics of biological systems", credits: 4, specializations: [] },
      { name: "Biophysics: physics of the cell", credits: 3, specializations: [] },
      { name: "Biostatistics", credits: 5, specializations: ["K"] },
      { name: "Brain-like computation and intelligence", credits: 5, specializations: [] },
      { name: "Cancer biology I", credits: 5, specializations: ["J"] },
      { name: "Cellular biology and biochemistry for engineers", credits: 4, specializations: [] },
    ],
    optionCourses: [
      { name: "Computational cell biology", credits: 4, specializations: ["K"] },
      { name: "Computational motor control", credits: 4, specializations: [] },
      { name: "Computational neurosciences: neuronal dynamics", credits: 5, specializations: ["K", "L"] },
      { name: "Deep learning", credits: 4, specializations: [] },
      { name: "Deep learning in biomedicine", credits: 6, specializations: ["K"] },
      { name: "Digital epidemiology", credits: 4, specializations: ["K"] },
      { name: "Experimental biomicroscopy", credits: 4, specializations: ["B", "J", "L"] },
      { name: "Fundamentals of biomedical imaging", credits: 4, specializations: ["B"] },
      { name: "Image analysis and pattern recognition", credits: 4, specializations: [] },
      { name: "Immunoengineering", credits: 4, specializations: ["J"] },
      { name: "Lab immersion I", credits: 8, specializations: ["B", "J", "K", "L"] },
      { name: "Neural signals and signal processing", credits: 6, specializations: ["L"] },
      { name: "Neuroscience", credits: 4, specializations: ["L"] },
      { name: "Single cell biology", credits: 4, specializations: ["J", "K", "L"] },
      { name: "Stem cells and organoids", credits: 3, specializations: ["B", "J"] },
      { name: "Synthetic biology", credits: 4, specializations: ["L"] },
    ],
    innovationCourses: [
      { name: "Concept to early-stage drug and medtech products", credits: 4 },
      { name: "Entrepreneurship in food and nutrition science", credits: 4 },
      { name: "Entrepreneurship in life sciences", credits: 4 },
      { name: "Strategic management of innovation", credits: 4 },
    ],
  },
  "Archi": {
    title: "Master of Science in Architecture",
    totalCredits: 120,
    duration: "2 years",
    contact: "master.architecture@epfl.ch",
    website: "go.epfl.ch/master-architecture",
    components: [
      { name: "Master's Thesis", credits: 30, color: "hsl(var(--chart-1))" },
      { name: "Core Courses", credits: 24, color: "hsl(var(--chart-2))" },
      { name: "Options", credits: 27, color: "hsl(var(--chart-3))" },
      { name: "Superstudio", credits: 24, color: "hsl(var(--chart-4))" },
      { name: "SHS Requirements", credits: 15, color: "hsl(var(--chart-5))" },
    ],
    specializations: [
      { code: "A", name: "Design", color: "bg-red-500" },
      { code: "B", name: "Habitat", color: "bg-blue-500" },
      { code: "C", name: "Territory", color: "bg-green-500" },
      { code: "D", name: "Rehabilitation", color: "bg-yellow-500" },
      { code: "E", name: "Sustainability", color: "bg-purple-500" },
    ],
    coreCourses: [
      { name: "Énoncé théorique de master", credits: 12, specializations: [] },
      { name: "Superstudio A", credits: 12, specializations: [] },
      { name: "The origins of domestic space", credits: 3, specializations: ["A", "B", "C", "D", "E"] },
      { name: "Visions et stratégies", credits: 6, specializations: [] },
      { name: "Architecture and monasticism", credits: 3, specializations: [] },
      { name: "Data centers: architecture, environment, information", credits: 3, specializations: ["E"] },
      { name: "Exquisite corpse: Architecture assembled", credits: 3, specializations: ["C"] },
      { name: "Political economy of design", credits: 3, specializations: [] },
      { name: "Reading the Renaissance", credits: 3, specializations: [] },
    ],
    optionCourses: [
      { name: "UE C: Habitat et société", credits: 4, specializations: ["B", "E"] },
      { name: "UE D: Territoire et société", credits: 4, specializations: ["B"] },
      { name: "UE F: Architecture et réhabilitation", credits: 4, specializations: ["D"] },
      { name: "UE H: Graphie", credits: 4, specializations: [] },
      { name: "UE J: Territoire et paysage", credits: 4, specializations: ["C"] },
      { name: "UE K: Architecture et durabilité : études de performances", credits: 4, specializations: ["C", "D"] },
      { name: "UE N: Constructing the view", credits: 4, specializations: ["A", "C", "E"] },
      { name: "UE R: Introduction au BIM (Building Information Modeling)", credits: 4, specializations: [] },
      { name: "UE S: Foundations, basements, and the underground", credits: 4, specializations: ["D"] },
      { name: "UE U: Cartography", credits: 4, specializations: ["B", "C"] },
      { name: "UE V: Visions et utopies", credits: 4, specializations: ["E"] },
      { name: "UE X: Experience design", credits: 4, specializations: ["A"] },
      { name: "Architectural anthropology", credits: 3, specializations: [] },
      { name: "Architecture et énergie solaire", credits: 4, specializations: [] },
      { name: "Architecture merveilleuse", credits: 3, specializations: ["E"] },
      { name: "Behind/Beyond future cities", credits: 3, specializations: [] },
      { name: "Building design in the circular economy", credits: 3, specializations: ["D"] },
      { name: "Climate and water sensitive urban design", credits: 4, specializations: [] },
      { name: "Comfort and architecture: sustainable strategies", credits: 3, specializations: ["D"] },
      { name: "Construction policy", credits: 3, specializations: [] },
      { name: "Digital design and making: a critical introduction", credits: 3, specializations: ["A"] },
      { name: "Économie du sol et de l'immobilier", credits: 3, specializations: ["B"] },
      { name: "Économie spatiale et régionale", credits: 3, specializations: ["C"] },
      { name: "Green spaces – concepts and planning approaches", credits: 4, specializations: [] },
      { name: "Habitat et développement urbain", credits: 3, specializations: ["B", "C"] },
      { name: "Habitat et typologie", credits: 3, specializations: ["B", "E"] },
    ],
  },
  "CE": {
    title: "Master of Science in Civil Engineering",
    totalCredits: 120,
    duration: "2 years",
    contact: "master.civil@epfl.ch",
    website: "go.epfl.ch/master-civil-engineering",
    components: [
      { name: "Master's Thesis", credits: 30, color: "hsl(var(--chart-1))" },
      { name: "Options", credits: 60, color: "hsl(var(--chart-2))" },
      { name: "Transversal Courses", credits: 20, color: "hsl(var(--chart-3))" },
      { name: "SHS Requirements", credits: 10, color: "hsl(var(--chart-4))" },
    ],
    specializations: [
      { code: "B", name: "Geotechnics", color: "bg-amber-600" },
      { code: "C", name: "Transport and Mobility", color: "bg-blue-500" },
      { code: "D", name: "Structural Engineering", color: "bg-red-500" },
      { code: "E", name: "Hydraulics", color: "bg-cyan-500" },
      { code: "F", name: "Urban Energy", color: "bg-green-500" },
    ],
    coreCourses: [],
    transversalCourses: [
      { name: "Analyse et gestion de risques", credits: 2, specializations: [] },
      { name: "Computational systems thinking for sustainable eng.", credits: 4, specializations: [] },
      { name: "Contrats de construction et responsabilité", credits: 3, specializations: [] },
      { name: "Droit public pour ingénieur·es civil·es", credits: 2, specializations: [] },
      { name: "Etudes d'impact sur l'environnement", credits: 3, specializations: [] },
      { name: "Innovation for construction and the environment", credits: 3, specializations: [] },
      { name: "Intercultural presentation skills", credits: 2, specializations: [] },
      { name: "Management de projet et analyse de risque", credits: 4, specializations: [] },
      { name: "Programming concept in scientific computing", credits: 4, specializations: [] },
      { name: "Research skills for engineers", credits: 2, specializations: [] },
    ],
    optionCourses: [
      { name: "Advanced composites in engineering structures", credits: 3, specializations: ["D"] },
      { name: "Bridge design", credits: 3, specializations: [] },
      { name: "Composites design and innovation", credits: 3, specializations: [] },
      { name: "Computational geomechanics", credits: 4, specializations: ["B"] },
      { name: "Conception et réalisation des voies de circulation", credits: 3, specializations: ["C"] },
      { name: "Continuum mechanics and applications", credits: 6, specializations: ["B", "D"] },
      { name: "Dam engineering", credits: 3, specializations: ["E"] },
      { name: "Decision-aid methodologies in transportation", credits: 4, specializations: ["C"] },
      { name: "Deep learning for autonomous vehicles", credits: 6, specializations: ["C"] },
      { name: "Design of precast concrete structures", credits: 3, specializations: [] },
      { name: "Dynamics of structures", credits: 4, specializations: ["D"] },
      { name: "Energy and comfort in buildings", credits: 5, specializations: ["F"] },
      { name: "Energy conversion and renewable energy", credits: 4, specializations: ["E", "F"] },
      { name: "Energy geostructures", credits: 4, specializations: ["B", "F"] },
      { name: "Engineering of existing structures", credits: 4, specializations: ["D"] },
      { name: "Fracture of materials", credits: 4, specializations: ["B"] },
      { name: "Fundamentals of traffic operations and control", credits: 4, specializations: ["C"] },
      { name: "Geotechnical earthquake engineering", credits: 3, specializations: ["B", "D"] },
      { name: "Hydraulic structures", credits: 4, specializations: ["E"] },
      { name: "Hydrologie urbaine", credits: 4, specializations: ["E"] },
      { name: "Mathematical modelling of structures", credits: 4, specializations: ["D"] },
      { name: "Nonlinear analysis of structures", credits: 4, specializations: ["D"] },
      { name: "River hydraulics and fluvial engineering", credits: 3, specializations: ["E"] },
      { name: "Seismic engineering", credits: 4, specializations: ["D"] },
      { name: "Soil mechanics", credits: 4, specializations: ["B"] },
      { name: "Urban hydraulic systems", credits: 4, specializations: ["E"] },
    ],
    minors: ["Computational science and engineering", "Data science", "Territorial engineering"],
  },
  "US": {
    title: "Master of Science in Urban Systems",
    totalCredits: 120,
    duration: "2 years",
    contact: "urbansystems.info@epfl.ch",
    website: "go.epfl.ch/master-urban-systems",
    internshipNote: "The program includes a compulsory 8-week internship which can be extended to 6 months.",
    components: [
      { name: "Master's Thesis", credits: 30, color: "hsl(var(--chart-1))" },
      { name: "Core Foundations", credits: 19, color: "hsl(var(--chart-2))" },
      { name: "Specialization", credits: 30, color: "hsl(var(--chart-3))" },
      { name: "Core Options", credits: 13, color: "hsl(var(--chart-4))" },
      { name: "SHS Projects", credits: 15, color: "hsl(var(--chart-5))" },
      { name: "Internship", credits: 13, color: "hsl(var(--muted))" },
    ],
    specializations: [
      { code: "A", name: "Mobility and Transportation", color: "bg-blue-500" },
      { code: "B", name: "Sustainable Transitions", color: "bg-green-500" },
      { code: "C", name: "Health and Well-being", color: "bg-purple-500" },
    ],
    coreCourses: [
      { name: "Computational systems thinking for sustainable engineering", credits: 4, specializations: [] },
      { name: "Social justice and transition in the urban context", credits: 3, specializations: [] },
      { name: "Systems approaches for urban transitions", credits: 4, specializations: [] },
      { name: "Urban digital twins", credits: 4, specializations: [] },
      { name: "Urban governance", credits: 4, specializations: [] },
    ],
    optionCourses: [
      { name: "Climate and water sensitive urban design", credits: 4, specializations: [] },
      { name: "Computational methods in urban studies", credits: 3, specializations: [] },
      { name: "Ecological contributions to cities in transformation", credits: 3, specializations: [] },
      { name: "Innovation for construction and the environment", credits: 3, specializations: [] },
      { name: "AI for urban history", credits: 4, specializations: ["B", "C"] },
      { name: "Air pollution", credits: 5, specializations: ["C"] },
      { name: "Analyse territoriale et urbaine", credits: 4, specializations: ["B"] },
      { name: "Behind/Beyond future cities", credits: 3, specializations: ["B"] },
      { name: "Building design in the circular economy", credits: 3, specializations: ["B"] },
      { name: "City and mobility", credits: 3, specializations: ["A"] },
      { name: "Comfort and architecture: sustainable strategies", credits: 3, specializations: ["C"] },
      { name: "Conception et réalisation des voies de circulation", credits: 3, specializations: ["A"] },
      { name: "Decision-aid methodologies in transportation", credits: 4, specializations: ["A"] },
      { name: "Digital epidemiology", credits: 4, specializations: ["C"] },
      { name: "Energy supply, economics, and transition", credits: 2, specializations: ["A", "B"] },
      { name: "Exploratory data analysis in environmental health", credits: 4, specializations: ["C"] },
      { name: "Fundamentals of traffic operations and control", credits: 4, specializations: ["A"] },
      { name: "Green spaces - concepts and planning approaches", credits: 4, specializations: ["A", "B", "C"] },
      { name: "Groundwater and soil remediation", credits: 4, specializations: ["C"] },
      { name: "Image processing for earth observation", credits: 4, specializations: ["A", "C"] },
      { name: "Indoor air quality and ventilation", credits: 4, specializations: ["C"] },
    ],
  },
  "SIE": {
    title: "Master of Science in Environmental Sciences and Engineering",
    totalCredits: 120,
    duration: "2 years",
    contact: "master.sie@epfl.ch",
    website: "go.epfl.ch/master-environmental-engineering",
    internshipNote: "The program includes a compulsory 8-week internship which can be extended to 6 months.",
    components: [
      { name: "Master's Thesis", credits: 30, color: "hsl(var(--chart-1))" },
      { name: "Core Courses", credits: 25, color: "hsl(var(--chart-2))" },
      { name: "Options", credits: 50, color: "hsl(var(--chart-3))" },
      { name: "SHS Requirements", credits: 6, color: "hsl(var(--chart-4))" },
      { name: "Internship", credits: 9, color: "hsl(var(--chart-5))" },
    ],
    specializations: [
      { code: "D", name: "Water Resources and Management (WRM)", color: "bg-blue-500" },
      { code: "E", name: "Climate Change Anticipation and Adaptation (CCAA)", color: "bg-orange-500" },
      { code: "F", name: "Environmental Sensing and Computation (ESC)", color: "bg-purple-500" },
      { code: "G", name: "Biological and Chemical Processes (BCP)", color: "bg-green-500" },
    ],
    coreCourses: [
      { name: "Atmospheric processes: from cloud to global scales", credits: 5, specializations: ["E"] },
      { name: "Sensing and spatial modeling for earth observation", credits: 5, specializations: ["F"] },
      { name: "Sustainability, climate and energy", credits: 5, specializations: [] },
      { name: "Water and wastewater treatment", credits: 5, specializations: ["G"] },
      { name: "Water resources engineering and management", credits: 5, specializations: ["D"] },
    ],
    optionCourses: [
      { name: "Air pollution", credits: 5, specializations: ["E"] },
      { name: "Applied data analysis", credits: 8, specializations: ["F"] },
      { name: "Applied ecology", credits: 4, specializations: ["E", "G"] },
      { name: "Applied wastewater engineering", credits: 3, specializations: ["D", "G"] },
      { name: "Basics of mobile robotics", credits: 4, specializations: ["F"] },
      { name: "Climate and water sensitive urban design", credits: 4, specializations: ["D", "E"] },
      { name: "Development engineering", credits: 4, specializations: [] },
      { name: "Distributed intelligent systems", credits: 5, specializations: ["F"] },
      { name: "Ecohydrological modeling", credits: 4, specializations: ["D"] },
      { name: "Ecological contributions to cities in transformation", credits: 3, specializations: ["E"] },
      { name: "Energy conversion and renewable energy", credits: 4, specializations: ["E"] },
      { name: "Environmental economics", credits: 4, specializations: [] },
      { name: "Environmental transport phenomena", credits: 5, specializations: ["F"] },
      { name: "Etudes d'impact sur l'environnement", credits: 3, specializations: ["E"] },
      { name: "Exploratory data analysis in environmental health", credits: 4, specializations: ["E", "F"] },
      { name: "Fate and behaviour of environmental contaminants", credits: 4, specializations: ["G"] },
      { name: "Global change ecology and fluvial ecosystems", credits: 4, specializations: ["D", "G"] },
      { name: "Groundwater and soil remediation", credits: 4, specializations: ["D", "G"] },
      { name: "Hydraulique fluviale et aménagement de cours d'eau", credits: 3, specializations: ["D"] },
      { name: "Hydrogeophysics", credits: 3, specializations: ["D", "G"] },
      { name: "Hydrologie urbaine", credits: 4, specializations: ["D", "E", "G"] },
      { name: "Image processing for earth observation", credits: 4, specializations: ["E", "F"] },
      { name: "Image processing I", credits: 3, specializations: ["F"] },
      { name: "Image processing II", credits: 3, specializations: ["F"] },
      { name: "Indoor air quality and ventilation", credits: 4, specializations: ["F"] },
      { name: "Irrigation and drainage engineering", credits: 4, specializations: ["D"] },
      { name: "Limnology", credits: 5, specializations: ["D", "G"] },
      { name: "Material flow analysis and resource management", credits: 4, specializations: ["G"] },
      { name: "Microbial ecology", credits: 4, specializations: ["G"] },
      { name: "Multivariate statistics in R", credits: 4, specializations: ["F", "G"] },
      { name: "Occupational and environmental health", credits: 3, specializations: ["G"] },
      { name: "Physics and hydrology of snow", credits: 4, specializations: ["D", "E"] },
      { name: "Risques hydrologiques et aménagements", credits: 3, specializations: ["D", "E"] },
    ],
    minors: ["Data science", "Energy", "Engineering for sustainability", "Imaging", "Integrated design, architecture and sustainability"],
  },
};

// Program slug mapping for the URL
const PROGRAM_SLUG_MAP: Record<string, string> = {
  "Life-Sc": "Life-Sc",
  "Archi": "Archi",
  "CE": "CE",
  "US": "US",
  "SIE": "SIE",
};

const MasterStructure = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch courses from DB to enable linking
  const { data: dbCourses } = useQuery({
    queryKey: ["allCoursesForStructure"],
    queryFn: async () => {
      const { data } = await supabase
        .from("Courses(C)")
        .select("id_course, name_course, code");
      return data || [];
    },
  });

  // Find matching course in DB by name (fuzzy match)
  const findCourseLink = (courseName: string): string | null => {
    if (!dbCourses) return null;
    
    const normalized = courseName.toLowerCase().trim();
    
    // Try exact match first
    const exactMatch = dbCourses.find(c => 
      c.name_course?.toLowerCase().trim() === normalized
    );
    if (exactMatch) return `/courses/${exactMatch.id_course}`;
    
    // Try partial match (course name contains or is contained)
    const partialMatch = dbCourses.find(c => {
      const dbName = c.name_course?.toLowerCase().trim() || "";
      return dbName.includes(normalized) || normalized.includes(dbName);
    });
    if (partialMatch) return `/courses/${partialMatch.id_course}`;
    
    // Try word-based matching (at least 3 significant words match)
    const courseWords = normalized.split(/\s+/).filter(w => w.length > 3);
    const wordMatch = dbCourses.find(c => {
      const dbWords = (c.name_course?.toLowerCase() || "").split(/\s+/).filter(w => w.length > 3);
      const matchCount = courseWords.filter(w => dbWords.some(dw => dw.includes(w) || w.includes(dw))).length;
      return matchCount >= Math.min(3, courseWords.length);
    });
    if (wordMatch) return `/courses/${wordMatch.id_course}`;
    
    return null;
  };

  const structure = slug ? MASTER_STRUCTURES[slug] : null;

  if (!structure) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <p className="text-muted-foreground">Master structure not available for this program yet.</p>
        </div>
      </div>
    );
  }
  
  // Prepare pie chart data
  const pieData = structure.components.map(c => ({
    name: c.name,
    value: c.credits,
    color: c.color,
  }));

  const getSpecializationBadge = (code: string) => {
    const spec = structure.specializations.find(s => s.code === code);
    if (!spec) return null;
    return (
      <Tooltip key={code}>
        <TooltipTrigger>
          <Badge variant="outline" className={`${spec.color} text-white text-xs px-1.5 py-0`}>
            {code}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{spec.name}</TooltipContent>
      </Tooltip>
    );
  };

  const CourseRow = ({ course, index }: { course: Course; index: number }) => {
    const courseLink = findCourseLink(course.name);
    
    const content = (
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`font-medium ${courseLink ? 'group-hover:text-primary transition-colors' : ''}`}>
          {course.name}
        </span>
        {courseLink && (
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {course.specializations && course.specializations.length > 0 && (
          <div className="flex gap-1">
            {course.specializations.map(s => getSpecializationBadge(s))}
          </div>
        )}
      </div>
    );

    if (courseLink) {
      return (
        <Link
          to={courseLink}
          key={index}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
        >
          {content}
          <Badge variant="secondary" className="shrink-0">{course.credits} ECTS</Badge>
        </Link>
      );
    }

    return (
      <div 
        key={index}
        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
      >
        {content}
        <Badge variant="secondary" className="shrink-0">{course.credits} ECTS</Badge>
      </div>
    );
  };

  const hasTransversal = structure.transversalCourses && structure.transversalCourses.length > 0;
  const hasInnovation = structure.innovationCourses && structure.innovationCourses.length > 0;
  const hasCore = structure.coreCourses && structure.coreCourses.length > 0;

  return (
    <div className="min-h-screen py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Program
        </Button>

        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl shrink-0">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{structure.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>{structure.duration}</span>
                <span>•</span>
                <span>{structure.totalCredits} ECTS</span>
                <span>•</span>
                <a href={`mailto:${structure.contact}`} className="text-primary hover:underline">
                  {structure.contact}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Specializations Legend */}
        {structure.specializations.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {structure.specializations.map((spec) => (
                  <div key={spec.code} className="flex items-center gap-2">
                    <Badge className={`${spec.color} text-white`}>{spec.code}</Badge>
                    <span className="text-sm">{spec.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credits Distribution Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Credits Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} ECTS`, 'Credits']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Sections */}
        <Tabs defaultValue={hasCore ? "core" : (hasTransversal ? "transversal" : "options")} className="space-y-4">
          <TabsList className={`grid w-full ${hasInnovation ? 'grid-cols-3' : (hasTransversal ? 'grid-cols-3' : 'grid-cols-2')}`}>
            {hasCore && (
              <TabsTrigger value="core" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Core ({structure.coreCourses.length})
              </TabsTrigger>
            )}
            {hasTransversal && (
              <TabsTrigger value="transversal" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Transversal ({structure.transversalCourses!.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="options" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Options ({structure.optionCourses.length})
            </TabsTrigger>
            {hasInnovation && (
              <TabsTrigger value="innovation" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Innovation ({structure.innovationCourses!.length})
              </TabsTrigger>
            )}
          </TabsList>

          {hasCore && (
            <TabsContent value="core">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Core Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {structure.coreCourses.map((course, index) => (
                      <CourseRow key={index} course={course} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {hasTransversal && (
            <TabsContent value="transversal">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compulsory Transversal Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {structure.transversalCourses!.map((course, index) => (
                      <CourseRow key={index} course={course} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="options">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {structure.optionCourses.map((course, index) => (
                    <CourseRow key={index} course={course} index={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {hasInnovation && (
            <TabsContent value="innovation">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Innovation & Entrepreneurship</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {structure.innovationCourses!.map((course, index) => (
                      <CourseRow key={index} course={course} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Master's Thesis</h3>
                <p className="text-sm text-muted-foreground">30 ECTS - Complete an original research project in your chosen specialization</p>
              </div>
              {structure.internshipNote && (
                <div>
                  <h3 className="font-semibold mb-2">Internship</h3>
                  <p className="text-sm text-muted-foreground">{structure.internshipNote}</p>
                </div>
              )}
              {structure.minors && structure.minors.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Recommended Minors</h3>
                  <div className="flex flex-wrap gap-2">
                    {structure.minors.map((minor, idx) => (
                      <Badge key={idx} variant="outline">{minor}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterStructure;