import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Microscope, Users, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLab, useUniversitiesByLab } from "@/hooks/useLabs";

const LabDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: lab, isLoading, error } = useLab(slug!);
  const { data: universities } = useUniversitiesByLab(lab?.id_lab || "");

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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/labs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Labs
          </Button>
        </Link>

        <div className="mb-8">
          {lab.image && (
            <div className="mb-6">
              <img
                src={lab.image}
                alt={lab.name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Microscope className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">{lab.name}</h1>
          </div>
          {lab.faculty_match && (
            <Badge variant="outline" className="mb-4">
              {lab.faculty_match}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Lab</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lab.description && (
                  <div>
                    <p className="text-muted-foreground">{lab.description}</p>
                  </div>
                )}

                {topics.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Research Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {lab.professors && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Principal Investigators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{lab.professors}</p>
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
                    Universities with this Lab ({universities.length})
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
                            <h3 className="font-semibold">{uni.name}</h3>
                            {uni.country && (
                              <p className="text-sm text-muted-foreground">{uni.country}</p>
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
              <Button className="w-full">Save Lab</Button>
              <Button variant="outline" className="w-full">
                Contact Lab
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDetail;
