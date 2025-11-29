import { useParams, Link } from "react-router-dom";
import { useUniversity } from "@/hooks/useUniversities";
import { ExternalLink, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UniversityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: university, isLoading, error } = useUniversity(slug || "");

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Programs Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Programs will be displayed here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research Labs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Labs will be displayed here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Courses will be displayed here
            </p>
            <Link to="/courses">
              <Button className="mt-4 w-full" variant="outline">
                Browse All Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniversityDetail;
