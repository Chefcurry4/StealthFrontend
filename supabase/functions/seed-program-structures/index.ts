import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Master structure data for all programs (migrated from MasterStructure.tsx)
const MASTER_STRUCTURES: Record<string, any> = {
  "8fdc4640-719b-43a4-a398-cdaacc9cb6e0": {
    // Life-Sc
    structure: {
      total_credits: 120,
      duration: "2 years",
      contact_email: "master.lse@epfl.ch",
      website: "go.epfl.ch/master-life-sciences-engineering",
      internship_note: null,
    },
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
    minors: [],
  },
  "f48170bd-53f9-4774-81e7-7759355a3f0a": {
    // AR (Architecture)
    structure: {
      total_credits: 120,
      duration: "2 years",
      contact_email: "master.architecture@epfl.ch",
      website: "go.epfl.ch/master-architecture",
      internship_note: null,
    },
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
    minors: [],
  },
  "4e746be0-7627-48f0-b1dd-7758040860a5": {
    // CIV (Civil Engineering)
    structure: {
      total_credits: 120,
      duration: "2 years",
      contact_email: "secretariat.sgc@epfl.ch",
      website: "go.epfl.ch/master-civil-engineering",
      internship_note: null,
    },
    components: [
      { name: "Master's Thesis", credits: 30, color: "hsl(var(--chart-1))" },
      { name: "Options", credits: 60, color: "hsl(var(--chart-2))" },
      { name: "Transversal Courses", credits: 14, color: "hsl(var(--chart-3))" },
      { name: "Projects & Lab", credits: 16, color: "hsl(var(--chart-4))" },
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
      { name: "Geotechnical laboratory and field testing", credits: 4, specializations: ["B"] },
      { name: "Groundwater hydrology", credits: 4, specializations: ["B", "E"] },
      { name: "Hydrology for engineers", credits: 4, specializations: ["E"] },
      { name: "Image processing for earth observation", credits: 4, specializations: ["C"] },
      { name: "Indoor air quality and ventilation", credits: 4, specializations: ["F"] },
      { name: "Introduction to urban operations research", credits: 4, specializations: ["C"] },
      { name: "Modal choice and demand management", credits: 3, specializations: ["C"] },
      { name: "Modern timber structures", credits: 4, specializations: ["D"] },
      { name: "Physics of solar energy conversion", credits: 4, specializations: ["F"] },
      { name: "Reinforced concrete structures", credits: 4, specializations: ["D"] },
      { name: "Rock mechanics", credits: 4, specializations: ["B"] },
      { name: "Slope stability", credits: 4, specializations: ["B"] },
      { name: "Steel structures II", credits: 4, specializations: ["D"] },
      { name: "Structural systems and safety", credits: 4, specializations: ["D"] },
      { name: "Sustainable building renovation", credits: 4, specializations: ["D", "F"] },
      { name: "Transport economics", credits: 3, specializations: ["C"] },
      { name: "Transportation systems engineering", credits: 4, specializations: ["C"] },
      { name: "Travel survey methods", credits: 2, specializations: ["C"] },
      { name: "Urban data science", credits: 4, specializations: ["C", "F"] },
      { name: "Water resources engineering and management", credits: 5, specializations: ["E"] },
    ],
    innovationCourses: [
      { name: "Civil engineering project 1", credits: 8 },
      { name: "Civil engineering project 2", credits: 8 },
      { name: "Projet ENAC or UE architecture", credits: 4 },
      { name: "Summer Workshop", credits: 4 },
      { name: "UE génie civil: Advanced drawing structures", credits: 4 },
    ],
    minors: [
      "Computational science and engineering",
      "Data science",
      "Energy",
      "Engineering for sustainability",
      "Imaging",
      "Integrated design, architecture and sustainability (IDEAS)",
      "Management, technology and entrepreneurship",
      "Sustainable construction",
    ],
  },
  "5fb9a7dd-f940-4494-b347-9e50a4cef25a": {
    // URB-SYS (Urban Systems)
    structure: {
      total_credits: 120,
      duration: "2 years",
      contact_email: "urbansystems.info@epfl.ch",
      website: "go.epfl.ch/master-urban-systems",
      internship_note: "The program includes a compulsory 8-week internship which can be extended to 6 months.",
    },
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
    minors: [],
  },
  "bc20c2b2-632e-47a7-8c0b-693ca5655254": {
    // ENV-Sc (Environmental Sciences)
    structure: {
      total_credits: 120,
      duration: "2 years",
      contact_email: "master.sie@epfl.ch",
      website: "go.epfl.ch/master-environmental-engineering",
      internship_note: "The program includes a compulsory 8-week internship which can be extended to 6 months.",
    },
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: string[] = [];

    for (const [programId, data] of Object.entries(MASTER_STRUCTURES)) {
      // Insert structure
      const { error: structureError } = await supabase
        .from("program_structures")
        .upsert({
          program_id: programId,
          total_credits: data.structure.total_credits,
          duration: data.structure.duration,
          contact_email: data.structure.contact_email,
          website: data.structure.website,
          internship_note: data.structure.internship_note,
        }, { onConflict: "program_id" });

      if (structureError) {
        results.push(`Structure error for ${programId}: ${structureError.message}`);
        continue;
      }

      // Delete existing related data
      await supabase.from("program_specializations").delete().eq("program_id", programId);
      await supabase.from("program_credit_components").delete().eq("program_id", programId);
      await supabase.from("program_courses").delete().eq("program_id", programId);
      await supabase.from("program_minors").delete().eq("program_id", programId);

      // Insert specializations
      if (data.specializations?.length > 0) {
        const specs = data.specializations.map((s: any, i: number) => ({
          program_id: programId,
          code: s.code,
          name: s.name,
          color: s.color,
          sort_order: i,
        }));
        const { error } = await supabase.from("program_specializations").insert(specs);
        if (error) results.push(`Specializations error: ${error.message}`);
      }

      // Insert components
      if (data.components?.length > 0) {
        const comps = data.components.map((c: any, i: number) => ({
          program_id: programId,
          name: c.name,
          credits: c.credits,
          color: c.color,
          sort_order: i,
        }));
        const { error } = await supabase.from("program_credit_components").insert(comps);
        if (error) results.push(`Components error: ${error.message}`);
      }

      // Insert courses
      const allCourses = [
        ...(data.coreCourses || []).map((c: any, i: number) => ({ ...c, category: "core", sort_order: i })),
        ...(data.transversalCourses || []).map((c: any, i: number) => ({ ...c, category: "transversal", sort_order: 100 + i })),
        ...(data.optionCourses || []).map((c: any, i: number) => ({ ...c, category: "optional", sort_order: 200 + i })),
        ...(data.innovationCourses || []).map((c: any, i: number) => ({ ...c, category: "innovation", sort_order: 300 + i })),
      ];

      if (allCourses.length > 0) {
        const courses = allCourses.map((c: any) => ({
          program_id: programId,
          name: c.name,
          credits: c.credits,
          category: c.category,
          specialization_codes: c.specializations || [],
          sort_order: c.sort_order,
        }));
        const { error } = await supabase.from("program_courses").insert(courses);
        if (error) results.push(`Courses error: ${error.message}`);
      }

      // Insert minors
      if (data.minors?.length > 0) {
        const minors = data.minors.map((m: string) => ({
          program_id: programId,
          name: m,
        }));
        const { error } = await supabase.from("program_minors").insert(minors);
        if (error) results.push(`Minors error: ${error.message}`);
      }

      results.push(`✓ Seeded ${programId}`);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
