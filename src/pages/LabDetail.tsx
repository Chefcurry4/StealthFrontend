import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, ExternalLink, MapPin, Bookmark, Filter, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GradientBackground } from "@/components/GradientBackground";
import { useLab, useUniversitiesByLab, useLabs } from "@/hooks/useLabs";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedLabs, useToggleSaveLab } from "@/hooks/useSavedItems";

const LabDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: lab, isLoading, error } = useLab(slug!);
  const { data: universities } = useUniversitiesByLab(lab?.id_lab || "");
  const { user } = useAuth();
  const { data: savedLabs } = useSavedLabs();
  const toggleSave = useToggleSaveLab();
  
  const [activeFilter, setActiveFilter] = useState<{type: string, value: string} | null>(null);
  
  // Fetch related labs based on active filter
  const { data: relatedLabs } = useLabs(
    activeFilter?.type === 'faculty' ? { facultyArea: activeFilter.value } :
    activeFilter?.type === 'topic' ? { search: activeFilter.value } :
    {}
  );

  const isSaved = savedLabs?.some((saved: any) => saved.lab_id === lab?.id_lab);

  const handleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (lab) {
      toggleSave.mutate(lab.id_lab);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Link to="/labs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Labs
            </Button>
          </Link>
          <p className="text-muted-foreground">Lab not found</p>
        </div>
      </div>
    );
  }

  const topics = lab.topics?.split(',').map(t => t.trim()).filter(Boolean) || [];
  const professors = lab.professors?.split(',').map(p => p.trim()).filter(Boolean) || [];
  
  // Filter related labs to exclude current lab
  const filteredRelatedLabs = relatedLabs?.filter(l => l.id_lab !== lab.id_lab).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <GradientBackground variant="night">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Link to="/labs">
              <Button variant="ghost" className="mb-6 backdrop-blur bg-background/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Labs
              </Button>
            </Link>

            <div className="flex items-start gap-6">
              <div className="p-4 bg-background/80 backdrop-blur rounded-xl">
                <Microscope className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{lab.name}</h1>
                {lab.faculty_match && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setActiveFilter({type: 'faculty', value: lab.faculty_match!})}
                    className="mb-2"
                  >
                    {lab.faculty_match}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </GradientBackground>

      {/* Active Filter Indicator */}
      {activeFilter && (
        <section className="py-3 bg-accent/50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Filtering by <strong>{activeFilter.type}</strong>: {activeFilter.value}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveFilter(null)}
                className="ml-auto"
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About the Lab</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lab.description && (
                    <p className="text-muted-foreground leading-relaxed">{lab.description}</p>
                  )}

                  {topics.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        Research Areas
                        <span className="text-xs text-muted-foreground">(click to explore similar labs)</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => setActiveFilter({type: 'topic', value: topic})}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {professors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Principal Investigators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {professors.map((prof, idx) => (
                        <Link 
                          key={idx}
                          to={`/teachers?search=${encodeURIComponent(prof)}`}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-accent rounded-lg hover:bg-accent/70 transition-colors"
                        >
                          <Users className="h-4 w-4" />
                          <span>{prof}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Labs */}
              {activeFilter && filteredRelatedLabs && filteredRelatedLabs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Labs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredRelatedLabs.map((relatedLab) => (
                        <Link
                          key={relatedLab.id_lab}
                          to={`/labs/${relatedLab.slug || relatedLab.id_lab}`}
                          className="p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <h4 className="font-semibold mb-1">{relatedLab.name}</h4>
                          {relatedLab.faculty_match && (
                            <p className="text-xs text-muted-foreground">{relatedLab.faculty_match}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {universities && universities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Universities ({universities.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {universities.map((uni: any) => (
                        <Link
                          key={uni.uuid}
                          to={`/universities/${uni.slug}`}
                          className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {uni.logo_url && (
                              <img 
                                src={uni.logo_url} 
                                alt={uni.name} 
                                className="h-8 w-8 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-sm">{uni.name}</h3>
                              {uni.country && (
                                <p className="text-xs text-muted-foreground">{uni.country}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {lab.link && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lab Website</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={lab.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Lab Website
                    </a>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Button className="w-full" onClick={handleSave} disabled={toggleSave.isPending}>
                  <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Lab'}
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Lab
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LabDetail;
