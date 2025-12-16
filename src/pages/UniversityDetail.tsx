import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useUniversity } from "@/hooks/useUniversities";
import { useProgramsByUniversity } from "@/hooks/usePrograms";
import { useLabsByUniversity } from "@/hooks/useLabs";
import { useCoursesByUniversity } from "@/hooks/useCourses";
import { useTeachersByUniversity } from "@/hooks/useTeachers";
import { useUniversityMedia, useToggleLikeMedia } from "@/hooks/useUniversityMedia";
import { useAuth } from "@/contexts/AuthContext";
import { ExternalLink, MapPin, Loader2, ArrowLeft, GraduationCap, Microscope, BookOpen, Users, Image as ImageIcon, Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UniversityCampusGallery } from "@/components/UniversityCampusGallery";
import { TeacherPopup } from "@/components/TeacherPopup";
import { SEO, generateUniversitySchema, generateBreadcrumbSchema } from "@/components/SEO";

const UniversityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [programSearch, setProgramSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [teacherPopupOpen, setTeacherPopupOpen] = useState(false);
  
  const { data: university, isLoading, error } = useUniversity(slug || "");
  const { data: programs } = useProgramsByUniversity(university?.uuid || "");
  const { data: labs } = useLabsByUniversity(university?.uuid || "");
  const { data: courses } = useCoursesByUniversity(university?.uuid || "");
  const { data: teachers } = useTeachersByUniversity(university?.uuid || "");
  const { data: media } = useUniversityMedia(university?.uuid || "");
  const toggleLike = useToggleLikeMedia();
  
  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    if (!programSearch.trim()) return programs;
    const search = programSearch.toLowerCase();
    return programs.filter(p => p.name.toLowerCase().includes(search));
  }, [programs, programSearch]);

  const handleLike = (mediaId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleLike.mutate(mediaId);
  };

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
          <Link to="/universities">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Universities
            </Button>
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

  return (
    <>
      <SEO 
        title={university.name}
        description={`Explore ${university.name} in ${university.country}. ${programs?.length || 0} programs, ${courses?.length || 0} courses, and ${labs?.length || 0} research labs available for exchange students.`}
        keywords={[university.name, university.country || "", "exchange university", "study abroad", "university programs"]}
        structuredData={{ "@graph": [breadcrumbSchema, universitySchema] }}
      />
      <div className="container mx-auto px-4 py-8">
      <Link to="/universities">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Universities
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6">
          <div className="flex items-start gap-4 sm:gap-6">
            {university.logo_url && (
              <img 
                src={university.logo_url} 
                alt={university.name} 
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">{university.name}</h1>
              {university.country && (
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-base sm:text-lg">{university.country}</span>
                </div>
              )}
              {university.website && (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm sm:text-base"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Official Website
                </a>
              )}
            </div>
          </div>
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            <UniversityCampusGallery 
              universityName={university.name}
              universityId={university.uuid}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programs?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ba: {courses?.filter(c => c.ba_ma === 'Ba').length || 0} • 
                Ma: {courses?.filter(c => c.ba_ma === 'Ma').length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Microscope className="h-4 w-4 text-muted-foreground" />
                Labs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labs?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Faculty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Programs Offered ({programs?.length || 0})
              </CardTitle>
              {programs && programs.length > 3 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search programs..."
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {programs && programs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPrograms.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No programs match "{programSearch}"
                  </p>
                ) : (
                  filteredPrograms.map((program: any) => (
                    <Link
                      key={program.id}
                      to={`/programs/${program.slug || program.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <h3 className="font-semibold">{program.name}</h3>
                      {program.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {program.description}
                        </p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No programs found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5" />
              Research Labs ({labs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {labs && labs.length > 0 ? (
              <div className="space-y-2">
                {labs.slice(0, 5).map((lab: any) => (
                  <Link
                    key={lab.id_lab}
                    to={`/labs/${lab.slug || lab.id_lab}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h3 className="font-semibold mb-1">{lab.name}</h3>
                    {lab.topics && (
                      <div className="flex flex-wrap gap-1">
                        {lab.topics.split(',').slice(0, 2).map((topic: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {topic.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
                {labs.length > 5 && (
                  <Link to="/labs">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Labs
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No labs found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Featured Faculty ({teachers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teachers && teachers.length > 0 ? (
              <div className="space-y-2">
                {teachers.slice(0, 10).map((teacher: any) => (
                  <button
                    key={teacher.id_teacher}
                    onClick={() => {
                      setSelectedTeacherId(teacher.id_teacher);
                      setTeacherPopupOpen(true);
                    }}
                    className="block w-full text-left p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h3 className="font-semibold">{teacher.full_name || teacher.name}</h3>
                    {teacher["h-index"] && (
                      <p className="text-sm text-muted-foreground">h-index: {teacher["h-index"]}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No faculty information available</p>
            )}
          </CardContent>
        </Card>

        <TeacherPopup
          teacherId={selectedTeacherId}
          open={teacherPopupOpen}
          onOpenChange={setTeacherPopupOpen}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Courses Available ({courses?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-2">
                {courses.slice(0, 5).map((course: any) => (
                  <Link
                    key={course.id_course}
                    to={`/courses/${course.id_course}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{course.name_course}</h3>
                        {course.code && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {course.code}
                          </Badge>
                        )}
                      </div>
                      {course.ects && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {course.ects} ECTS
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {courses.length > 5 && (
                  <Link to="/courses">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Courses
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No courses found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Campus Photos ({media?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {media?.length === 0 ? (
              <p className="text-muted-foreground">No photos yet. Be the first to share!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media?.map((item: any) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.image_url}
                      alt="Campus photo"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 bg-background/80 hover:bg-background"
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {item.likes_count}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default UniversityDetail;
