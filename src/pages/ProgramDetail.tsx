import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useProgram, useProgramCourses } from "@/hooks/usePrograms";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useMasterProgramData } from "@/hooks/useMasterProgramData";
import { AnimatePresence, motion } from "framer-motion";
import {
  ProgramHeader,
  ProgramDescription,
  ProgramCoursesFilter,
  MasterCoursesView,
  MasterCreditsChart,
  MasterSpecializations,
  MasterAdditionalInfo,
} from "@/components/program-detail";

const ProgramDetail = () => {
  const { uniSlug, programSlug } = useParams<{ uniSlug: string; programSlug: string }>();
  const navigate = useNavigate();
  const { data: program, isLoading, error } = useProgram(programSlug!);
  const { data: courses, isLoading: coursesLoading } = useProgramCourses(program?.id || "");
  const { addItem } = useRecentlyViewed();
  
  // Load master program data from JSON
  const { data: masterData, isLoading: masterDataLoading } = useMasterProgramData(programSlug);
  
  // State for Bachelor/Master tab selection
  const [selectedLevel, setSelectedLevel] = useState<'bachelor' | 'master' | null>(null);

  // Track recently viewed program
  useEffect(() => {
    if (program) {
      addItem({
        id: program.id,
        type: "program",
        name: program.name,
        href: `/programs/${uniSlug}/${program.slug}`,
      });
    }
  }, [program, addItem]);

  // Fetch course details with bridge table info - for Bachelor
  const { data: coursesWithInfo, isLoading: coursesWithInfoLoading } = useQuery({
    queryKey: ["programCoursesDetail", program?.id],
    queryFn: async () => {
      if (!program?.id) return [];

      // Join bridge table with courses table directly
      const { data: bridgeData } = await supabase
        .from("bridge_cp(C-P)")
        .select("*")
        .eq("id_program", program.id);

      if (!bridgeData || bridgeData.length === 0) return [];

      // Get all course IDs
      const courseIds = bridgeData.map(b => b.id_course);
      
      // Fetch course details
      const { data: courseDetails } = await supabase
        .from("Courses(C)")
        .select("*")
        .in("id_course", courseIds);

      if (!courseDetails) return [];

      // Merge bridge info with course details
      return bridgeData.map((bridge) => {
        const course = courseDetails.find((c) => c.id_course === bridge.id_course);
        return {
          id_course: bridge.id_course,
          name_course: course?.name_course || bridge.name_course,
          code: course?.code || bridge.code_course,
          ects: course?.ects,
          term: course?.term,
          language: course?.language,
          professor_name: course?.professor_name,
          year: bridge.Year,
          mandatoryOptional: bridge["Mandatory/Optional"],
          level: bridge["Ba/Ma"], // This is "Bachelor" or "Master"
        };
      });
    },
    enabled: !!program?.id,
  });

  // Fetch program info from bridge table
  const { data: programInfo } = useQuery({
    queryKey: ["programInfo", program?.id],
    queryFn: async () => {
      if (!program?.id) return null;

      const { data } = await supabase
        .from("bridge_up(U-P)")
        .select("*")
        .eq("id_program", program.id);

      if (!data || data.length === 0) return null;

      // Check if program has both levels
      const levels = data.map((r) => r.level?.toLowerCase?.());
      const hasBachelor = levels.some((l) => l?.includes("bachelor"));
      const hasMaster = levels.some((l) => l?.includes("master"));

      // Prefer Master row for structure data
      const masterRow = data.find((r) => r.level?.toLowerCase?.().includes("master"));
      const baseRow = masterRow ?? data[0];

      return {
        ...baseRow,
        hasBachelor,
        hasMaster,
        level: hasBachelor && hasMaster ? "Bachelor & Master" : baseRow.level,
      };
    },
    enabled: !!program?.id,
  });

  // Determine available levels
  const hasBachelor = programInfo?.hasBachelor ?? false;
  const hasMaster = programInfo?.hasMaster ?? false;
  
  // Check if we have JSON data for master
  const hasMasterJsonData = !!masterData && masterData.courses.length > 0;

  // Set default selected level based on available data
  useEffect(() => {
    if (selectedLevel === null && (hasBachelor || hasMaster)) {
      // Default to master if we have JSON data for it, otherwise bachelor
      if (hasMaster && hasMasterJsonData) {
        setSelectedLevel('master');
      } else if (hasBachelor) {
        setSelectedLevel('bachelor');
      } else {
        setSelectedLevel('master');
      }
    }
  }, [hasBachelor, hasMaster, selectedLevel, hasMasterJsonData]);

  // Calculate stats based on selected level
  const levelStats = useMemo(() => {
    if (!selectedLevel) {
      return { duration: '', courseCount: 0, ects: 0, courses: [] };
    }

    // For Master with JSON data
    if (selectedLevel === 'master' && masterData) {
      return {
        duration: '2 years',
        ects: masterData.totalCredits || 120,
        courseCount: masterData.courses.length,
        courses: [],
      };
    }

    // For Bachelor (use Supabase data)
    if (coursesWithInfo) {
      const levelFilter = selectedLevel === 'bachelor' ? 'Bachelor' : 'Master';
      const filteredCourses = coursesWithInfo.filter((c: any) => c.level === levelFilter);

      return {
        duration: selectedLevel === 'bachelor' ? '3 years' : '2 years',
        ects: selectedLevel === 'bachelor' ? 180 : 120,
        courseCount: filteredCourses.length,
        courses: filteredCourses,
      };
    }

    return { duration: '', courseCount: 0, ects: 0, courses: [] };
  }, [selectedLevel, coursesWithInfo, masterData]);

  if (isLoading || coursesWithInfoLoading || masterDataLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-6" />
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <p className="text-muted-foreground">Program not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with clickable Bachelor/Master tabs */}
        <ProgramHeader
          program={program}
          programInfo={programInfo}
          structure={null}
          hasBachelor={hasBachelor}
          hasMaster={hasMaster}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          stats={levelStats}
          universitySlug={uniSlug || ''}
        />

        {/* Description - Always shown */}
        <ProgramDescription description={program.description} />

        {/* Animated content based on level selection */}
        <AnimatePresence mode="wait">
          {/* Bachelor view - Simple course list from Supabase */}
          {selectedLevel === 'bachelor' && (
            <motion.div
              key="bachelor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProgramCoursesFilter
                courses={levelStats.courses}
                isLoading={coursesWithInfoLoading}
                showLevelFilter={false}
              />
            </motion.div>
          )}

          {/* Master view with JSON data */}
          {selectedLevel === 'master' && hasMasterJsonData && (
            <motion.div
              key="master-json"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MasterSpecializations specializations={masterData.specializations} />
              <MasterCreditsChart categories={masterData.creditDistribution} />
              <MasterCoursesView
                courses={masterData.courses}
                specializations={masterData.specializations}
              />
              <MasterAdditionalInfo
                suggestedMinors={masterData.suggestedMinors}
                creditDistribution={masterData.creditDistribution}
              />
            </motion.div>
          )}

          {/* Master view without JSON data - fallback to Supabase course list */}
          {selectedLevel === 'master' && !hasMasterJsonData && (
            <motion.div
              key="master-fallback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProgramCoursesFilter
                courses={levelStats.courses}
                isLoading={coursesWithInfoLoading}
                showLevelFilter={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgramDetail;
