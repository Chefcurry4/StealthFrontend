import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUniversity } from "@/hooks/useUniversities";
import { useProgramsByUniversity } from "@/hooks/usePrograms";
import { useLabsByUniversity } from "@/hooks/useLabs";
import { useCoursesByUniversity } from "@/hooks/useCourses";
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
  UniversityStatsSection,
  UniversityPhotoUploadModal,
} from "@/components/university";
import { SEO, generateUniversitySchema, generateBreadcrumbSchema } from "@/components/SEO";

// University descriptions
const universityDescriptions: Record<string, string> = {
  epfl: "The École Polytechnique Fédérale de Lausanne (EPFL) is a public research university founded in 1969, located in Lausanne, Switzerland. It is one of the two Swiss Federal Institutes of Technology and is renowned worldwide for its cutting-edge research in engineering, technology, and natural sciences. The campus sits on the shores of Lake Geneva, offering students a unique blend of academic excellence and stunning natural beauty.",
};

const UniversityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: university, isLoading, error } = useUniversity(slug || "");
  const { data: programs } = useProgramsByUniversity(university?.uuid || "");
  const { data: labs } = useLabsByUniversity(university?.uuid || "");
  const { data: courses } = useCoursesByUniversity(university?.uuid || "");
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

  const bachelorCourses = courses?.filter((c) => c.ba_ma === "Bachelor's").length || 0;
  const masterCourses = courses?.filter((c) => c.ba_ma === "Master's").length || 0;

  // Get university description
  const description = universityDescriptions[slug?.toLowerCase() || ""] ||
    `${university.name} is a distinguished institution located in ${university.country || "Europe"}. The university offers a diverse range of academic programs and research opportunities for international exchange students.`;

  return (
    <>
      <SEO
        title={university.name}
        description={`Explore ${university.name} in ${university.country}. ${programs?.length || 0} programs and ${courses?.length || 0} courses available for exchange students.`}
        keywords={[
          university.name,
          university.country || "",
          "exchange university",
          "study abroad",
          "university programs",
        ]}
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

        {/* Header Section with Gallery Side by Side */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Title, Location, Description */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold">{university.name}</h1>

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

            {/* University Description */}
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {/* Right: Campus Gallery */}
          <div>
            <UniversityHeroGallery
              universityName={university.name}
              universityId={university.uuid}
              media={media}
              onUploadClick={() => setUploadModalOpen(true)}
            />
          </div>
        </div>

        {/* Main Content - Programs Only */}
        <UniversityContentTabs programs={programs || []} />

        {/* Statistics Section at Bottom */}
        <UniversityStatsSection
          programsCount={programs?.length || 0}
          coursesCount={(university as any).courses_count || 0}
          bachelorCourses={bachelorCourses}
          masterCourses={masterCourses}
          universityName={university.name}
          studentCount={(university as any).student_count}
          endowment={(university as any).endowment}
          campusArea={(university as any).campus_area}
        />
      </div>

      {/* Photo Upload Modal */}
      <UniversityPhotoUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        universityId={university.uuid}
        universityName={university.name}
      />
    </>
  );
};

export default UniversityDetail;
