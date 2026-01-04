import { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useProgram, useProgramCourses } from "@/hooks/usePrograms";
import { useProgramStructure } from "@/hooks/useProgramStructure";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import {
  ProgramHeader,
  ProgramDescription,
  ProgramSpecializations,
  ProgramCreditsChart,
  ProgramCoursesTabs,
  ProgramAdditionalInfo,
  ProgramCoursesFilter,
} from "@/components/program-detail";

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: program, isLoading, error } = useProgram(slug!);
  const { data: courses, isLoading: coursesLoading } = useProgramCourses(program?.id || "");
  const { data: structure, isLoading: structureLoading } = useProgramStructure(program?.id);
  const { addItem } = useRecentlyViewed();

  // Track recently viewed program
  useEffect(() => {
    if (program) {
      addItem({
        id: program.id,
        type: "program",
        name: program.name,
        href: `/programs/${program.slug}`,
      });
    }
  }, [program, addItem]);

  // Fetch course details with bridge table info
  const { data: coursesWithInfo } = useQuery({
    queryKey: ["programCoursesDetail", program?.id],
    queryFn: async () => {
      if (!program?.id) return [];

      const { data: bridgeData } = await supabase
        .from("bridge_cp(C-P)")
        .select("*")
        .eq("id_program", program.id);

      if (!bridgeData) return courses || [];

      return courses?.map((course) => {
        const bridgeInfo = bridgeData.find((b) => b.id_course === course.id_course);
        return {
          ...course,
          year: bridgeInfo?.Year,
          mandatoryOptional: bridgeInfo?.["Mandatory/Optional"],
          level: bridgeInfo?.["Ba/Ma"],
        };
      });
    },
    enabled: !!program?.id && !!courses,
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

  // Stats
  const stats = useMemo(() => {
    if (!coursesWithInfo)
      return { total: 0, bachelor: 0, master: 0, mandatory: 0, optional: 0, totalEcts: 0 };

    return {
      total: coursesWithInfo.length,
      bachelor: coursesWithInfo.filter((c: any) => c.level === "Ba").length,
      master: coursesWithInfo.filter((c: any) => c.level === "Ma").length,
      mandatory: coursesWithInfo.filter((c: any) => c.mandatoryOptional === "Mandatory").length,
      optional: coursesWithInfo.filter((c: any) => c.mandatoryOptional === "Optional").length,
      totalEcts: coursesWithInfo.reduce((sum: number, c: any) => sum + (c.ects || 0), 0),
    };
  }, [coursesWithInfo]);

  // Determine if this is a Master program with structure data
  const isMaster = programInfo?.level?.toLowerCase().includes("master");
  const hasMasterStructure = !!structure && structure.courses.length > 0;

  if (isLoading || structureLoading) {
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
        {/* Header - Always shown */}
        <ProgramHeader
          program={program}
          programInfo={programInfo}
          structure={structure}
          courseCount={stats.total}
          totalEcts={stats.totalEcts}
        />

        {/* Description - Always shown */}
        <ProgramDescription description={program.description} />

        {/* Master-specific sections */}
        {isMaster && hasMasterStructure && (
          <>
            <ProgramSpecializations specializations={structure.specializations} />
            <ProgramCreditsChart components={structure.components} />
            <ProgramCoursesTabs
              courses={structure.courses}
              specializations={structure.specializations}
            />
            <ProgramAdditionalInfo
              internshipNote={structure.structure.internship_note}
              minors={structure.minors}
            />
          </>
        )}

        {/* Bachelor view OR Master without structure data */}
        {(!isMaster || !hasMasterStructure) && (
          <ProgramCoursesFilter
            courses={coursesWithInfo}
            isLoading={coursesLoading}
            showLevelFilter={!isMaster}
          />
        )}
      </div>
    </div>
  );
};

export default ProgramDetail;
