import { useState } from "react";
import { Search, MapPin, Globe, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUniversities } from "@/hooks/useUniversities";
import { Link } from "react-router-dom";

const Universities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: universities, isLoading, error } = useUniversities(searchQuery);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-4">
              Explore Universities
            </h1>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl">
              Discover {universities?.length || 0} partner universities worldwide and find the perfect destination for your exchange semester
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search universities by name or country..."
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Universities List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load universities. Please try again later.</p>
              </div>
            )}

            {universities && universities.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No universities found matching your search.</p>
              </div>
            )}

            {universities && universities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((university) => (
                  <Card key={university.uuid} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        {university.logo_url && (
                          <img 
                            src={university.logo_url} 
                            alt={university.name} 
                            className="h-12 w-12 object-contain flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <CardTitle className="text-lg leading-tight">{university.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {university.country && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{university.country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Link to={`/universities/${university.slug}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        {university.website && (
                          <a 
                            href={university.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Universities;
