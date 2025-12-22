import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap, Lightbulb, FlaskConical, Info } from "lucide-react";
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

// Master structure data for Life Sciences Engineering
const LSE_STRUCTURE = {
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
    { name: "Internship (Optional)", credits: 8, color: "hsl(var(--accent))" },
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
    { name: "Cancer biology II", credits: 5, specializations: [] },
    { name: "Causal thinking", credits: 5, specializations: [] },
    { name: "Cellular biology and biochemistry for engineers", credits: 4, specializations: [] },
  ],
  optionCourses: [
    { name: "Computational cell biology", credits: 4, specializations: ["K"] },
    { name: "Computational motor control", credits: 4, specializations: [] },
    { name: "Computational neurosciences: neuronal dynamics", credits: 5, specializations: ["K", "L"] },
    { name: "Computational optical imaging", credits: 4, specializations: [] },
    { name: "Controlling behavior in animals and robots", credits: 5, specializations: [] },
    { name: "Deep learning", credits: 4, specializations: [] },
    { name: "Deep learning in biomedicine", credits: 6, specializations: ["K"] },
    { name: "Deep reinforcement learning", credits: 6, specializations: [] },
    { name: "Digital epidemiology", credits: 4, specializations: ["K"] },
    { name: "Ethics for Life sciences engineers", credits: 2, specializations: [] },
    { name: "Experimental biomicroscopy", credits: 4, specializations: ["B", "J", "L"] },
    { name: "Fundamentals of biomedical imaging", credits: 4, specializations: ["B"] },
    { name: "Fundamentals of biophotonics", credits: 3, specializations: ["B"] },
    { name: "Fundamentals of biosensors and electronic biochips", credits: 3, specializations: ["B", "L"] },
    { name: "iGEM", credits: 12, specializations: [] },
    { name: "iGEM lab", credits: 6, specializations: [] },
    { name: "Image analysis and pattern recognition", credits: 4, specializations: [] },
    { name: "Immunoengineering", credits: 4, specializations: ["J"] },
    { name: "Immunology - advances and therapeutic implications", credits: 5, specializations: ["J"] },
    { name: "Infection biology", credits: 5, specializations: ["J"] },
    { name: "Introduction to natural language processing", credits: 6, specializations: ["K"] },
    { name: "Lab immersion I", credits: 8, specializations: ["B", "J", "K", "L"] },
    { name: "Lab immersion II", credits: 8, specializations: ["B", "J", "K", "L"] },
    { name: "Lab immersion III", credits: 12, specializations: [] },
    { name: "Lab immersion academic (outside EPFL) or in industry", credits: 22, specializations: [] },
    { name: "Lab on cell-free synthetic biology", credits: 4, specializations: [] },
    { name: "Linear models", credits: 5, specializations: [] },
    { name: "Management of intellectual property", credits: 3, specializations: [] },
    { name: "Mechanobiology: how mechanics regulate life", credits: 4, specializations: [] },
    { name: "Micro- and nanorobotics", credits: 3, specializations: [] },
    { name: "Neural circuits of motivated behaviors", credits: 4, specializations: ["L"] },
    { name: "Neural interfaces", credits: 6, specializations: [] },
    { name: "Neural signals and signal processing", credits: 6, specializations: ["L"] },
    { name: "Neuroscience", credits: 4, specializations: ["L"] },
    { name: "Neuroscience: behavior and cognition", credits: 5, specializations: ["L"] },
    { name: "Neuroscience: cellular and circuit mechanisms", credits: 5, specializations: ["L"] },
    { name: "Neuroscience: from molecular mechanisms to disease", credits: 5, specializations: ["L"] },
    { name: "New tools and research strategies in personalized health", credits: 4, specializations: ["B", "J"] },
    { name: "Nutrition: from molecules to health", credits: 4, specializations: ["J"] },
    { name: "Pharmacology and pharmacokinetics", credits: 2, specializations: [] },
    { name: "Physics of life", credits: 4, specializations: [] },
    { name: "Planetary health", credits: 4, specializations: [] },
    { name: "Principles and applications of systems biology", credits: 3, specializations: ["K"] },
    { name: "Randomness and information in biological data", credits: 4, specializations: ["K"] },
    { name: "Regulatory, quality and clinical affairs", credits: 2, specializations: [] },
    { name: "Sensors in medical instrumentation", credits: 3, specializations: ["B"] },
    { name: "Single cell biology", credits: 4, specializations: ["J", "K", "L"] },
    { name: "Statistical physics of biomacromolecules", credits: 4, specializations: [] },
    { name: "Stem cells and organoids", credits: 3, specializations: ["B", "J"] },
    { name: "Structural biology", credits: 4, specializations: ["J", "K"] },
    { name: "Structural mechanics", credits: 4, specializations: ["B", "J"] },
    { name: "Synthetic biology", credits: 4, specializations: ["L"] },
    { name: "Systems neuroscience", credits: 4, specializations: ["L"] },
    { name: "Translational neuroengineering", credits: 6, specializations: [] },
    { name: "Trends in chemical biology and drug discovery", credits: 4, specializations: [] },
    { name: "Understanding statistics and experimental design", credits: 4, specializations: [] },
  ],
  innovationCourses: [
    { name: "Concept to early-stage drug and medtech products", credits: 4 },
    { name: "Entrepreneurship in food and nutrition science", credits: 4 },
    { name: "Entrepreneurship in life sciences", credits: 4 },
    { name: "Introduction au droit et à l'éthique", credits: 4 },
    { name: "Strategic management of innovation", credits: 4 },
  ],
};

const MasterStructure = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // For now, only Life Sciences Engineering is supported
  if (slug !== "Life-Sc") {
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

  const structure = LSE_STRUCTURE;
  
  // Prepare pie chart data
  const pieData = structure.components.filter(c => c.name !== "Internship (Optional)" && c.name !== "SHS Requirements").map(c => ({
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
        <Tabs defaultValue="core" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="core" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Core ({structure.coreCourses.length})
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Options ({structure.optionCourses.length})
            </TabsTrigger>
            <TabsTrigger value="innovation" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Innovation ({structure.innovationCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="core">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Core Courses (24 ECTS required)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {structure.coreCourses.map((course, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{course.name}</span>
                        <div className="flex gap-1">
                          {course.specializations.map(s => getSpecializationBadge(s))}
                        </div>
                      </div>
                      <Badge variant="secondary">{course.credits} ECTS</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Courses (44 ECTS required)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {structure.optionCourses.map((course, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">{course.name}</span>
                        <div className="flex gap-1">
                          {course.specializations.map(s => getSpecializationBadge(s))}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{course.credits} ECTS</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="innovation">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Innovation & Entrepreneurship (4 ECTS required)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {structure.innovationCourses.map((course, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{course.name}</span>
                      <Badge variant="secondary">{course.credits} ECTS</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Scientific Thinking</h3>
                <p className="text-sm text-muted-foreground">4 ECTS required - Develop critical thinking and scientific methodology skills</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Master's Thesis</h3>
                <p className="text-sm text-muted-foreground">30 ECTS - Complete an original research project in your chosen specialization</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Optional Internship</h3>
                <p className="text-sm text-muted-foreground">Up to 8 ECTS - Gain practical experience in industry or research labs</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">SHS Requirements</h3>
                <p className="text-sm text-muted-foreground">6 ECTS - Social and human sciences courses for a well-rounded education</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterStructure;
