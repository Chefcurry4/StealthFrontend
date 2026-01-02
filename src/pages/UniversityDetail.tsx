import { useParams, Link } from "react-router-dom";
import { useUniversity } from "@/hooks/useUniversities";
import { useProgramsByUniversity } from "@/hooks/usePrograms";
import { useLabsByUniversity } from "@/hooks/useLabs";
import { useCoursesByUniversity } from "@/hooks/useCourses";
import { useTeachersByUniversity } from "@/hooks/useTeachers";
import { useUniversityMedia } from "@/hooks/useUniversityMedia";
import { ExternalLink, MapPin, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  UniversityHeroGallery, 
  UniversityContentTabs, 
  UniversityStatsSection 
} from "@/components/university";
import { SEO, generateUniversitySchema, generateBreadcrumbSchema } from "@/components/SEO";

const UniversityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: university, isLoading, error } = useUniversity(slug || "");
  const { data: programs } = useProgramsByUniversity(university?.uuid || "");
  const { data: labs } = useLabsByUniversity(university?.uuid || "");
  const { data: courses } = useCoursesByUniversity(university?.uuid || "");
  const { data: teachers } = useTeachersByUniversity(university?.uuid || "");
  const { data: media } = useUniversityMedia(university?.uuid || "");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">University not found</p>
          <Link to="/universities" className="text-primary hover:underline">
            ← Back to Universities
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: typeof window !== "undefined" ? window.location.origin : "" },
    { name: "Universities", url: `${typeof window !== "undefined" ? window.location.origin : ""}/universities` },
    { name: university.name, url: typeof window !== "undefined" ? window.location.href : "" },
  ]);

  const universitySchema = generateUniversitySchema({
    name: university.name,
    description: `${university.name} - Partner university in ${university.country}. Offering ${programs?.length || 0} programs and ${courses?.length || 0} courses.`,
    country: university.country || undefined,
    website: university.website || undefined,
    logo: university.logo_url || undefined,
  });

  const bachelorCourses = courses?.filter(c => c.ba_ma === 'Ba').length || 0;
  const masterCourses = courses?.filter(c => c.ba_ma === 'Ma').length || 0;

  return (
    <>
      <SEO 
        title={university.name}
        description={`Explore ${university.name} in ${university.country}. ${programs?.length || 0} programs, ${courses?.length || 0} courses, and ${labs?.length || 0} research labs available for exchange students.`}
        keywords={[university.name, university.country || "", "exchange university", "study abroad", "university programs"]}
        structuredData={{ "@graph": [breadcrumbSchema, universitySchema] }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/universities">Universities</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{university.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">{university.name}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
            {university.country && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{university.country}</span>
              </div>
            )}
            
            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Visit off. site
              </a>
            )}
          </div>
        </div>

        {/* Campus Gallery Hero */}
        <UniversityHeroGallery 
          universityName={university.name}
          universityId={university.uuid}
          media={media}
        />

        {/* Main Content Tabs (Programs / Labs) */}
        <UniversityContentTabs 
          programs={programs || []}
          labs={labs || []}
        />

        {/* Statistics Section at Bottom */}
        <UniversityStatsSection 
          programsCount={programs?.length || 0}
          coursesCount={courses?.length || 0}
          labsCount={labs?.length || 0}
          facultyCount={teachers?.length || 0}
          bachelorCourses={bachelorCourses}
          masterCourses={masterCourses}
        />
      </div>
    </>
  );
};

export default UniversityDetail;
