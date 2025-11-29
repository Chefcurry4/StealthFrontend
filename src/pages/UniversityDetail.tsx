import { useParams, Link, useNavigate } from "react-router-dom";
import { useUniversity } from "@/hooks/useUniversities";
import { useProgramsByUniversity } from "@/hooks/usePrograms";
import { useLabsByUniversity } from "@/hooks/useLabs";
import { useCoursesByUniversity } from "@/hooks/useCourses";
import { useTeachersByUniversity } from "@/hooks/useTeachers";
import { useUniversityMedia, useToggleLikeMedia } from "@/hooks/useUniversityMedia";
import { useAuth } from "@/contexts/AuthContext";
import { UniversityNetwork } from "@/components/UniversityNetwork";
import { ExternalLink, MapPin, Loader2, ArrowLeft, GraduationCap, Microscope, BookOpen, Users, Image as ImageIcon, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UniversityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: university, isLoading, error } = useUniversity(slug || "");
  const { data: programs } = useProgramsByUniversity(university?.uuid || "");
  const { data: labs } = useLabsByUniversity(university?.uuid || "");
  const { data: courses } = useCoursesByUniversity(university?.uuid || "");
  const { data: teachers } = useTeachersByUniversity(university?.uuid || "");
  const { data: media } = useUniversityMedia(university?.uuid || "");
  const toggleLike = useToggleLikeMedia();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/universities">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Universities
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-start gap-6 mb-6">
          {university.logo_url && (
            <img 
              src={university.logo_url} 
              alt={university.name} 
              className="h-20 w-20 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="text-4xl font-bold mb-2">{university.name}</h1>
            {university.country && (
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{university.country}</span>
              </div>
            )}
            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Official Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <UniversityNetwork
          universityId={university.uuid}
          universityName={university.name}
          programs={programs}
          labs={labs}
          teachers={teachers}
          courses={courses}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Programs Offered ({programs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {programs && programs.length > 0 ? (
              <div className="space-y-2">
                {programs.slice(0, 5).map((program: any) => (
                  <Link
                    key={program.id}
                    to={`/programs/${program.slug || program.id}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h3 className="font-semibold">{program.name}</h3>
                  </Link>
                ))}
                {programs.length > 5 && (
                  <Link to="/programs">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Programs
                    </Button>
                  </Link>
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
                {teachers.slice(0, 5).map((teacher: any) => (
                  <Link
                    key={teacher.id_teacher}
                    to={`/teachers/${teacher.id_teacher}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h3 className="font-semibold">{teacher.full_name || teacher.name}</h3>
                    {teacher["h-index"] && (
                      <p className="text-sm text-muted-foreground">h-index: {teacher["h-index"]}</p>
                    )}
                  </Link>
                ))}
                {teachers.length > 5 && (
                  <Link to="/teachers">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Faculty
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No faculty information available</p>
            )}
          </CardContent>
        </Card>

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
  );
};

export default UniversityDetail;
