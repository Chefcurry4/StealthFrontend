import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Microscope, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabs, LabFilters } from "@/hooks/useLabs";

const Labs = () => {
  const [filters, setFilters] = useState<LabFilters>({});
  const { data: labs, isLoading, error } = useLabs(filters);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-4">
              Explore Labs
            </h1>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl">
              Discover cutting-edge research facilities and practical learning opportunities
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search labs by name or research area..."
                  className="pl-10 bg-background"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Labs List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-muted-foreground">
                Error loading labs. Please try again.
              </p>
            ) : labs?.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No labs found matching your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {labs?.map((lab) => (
                  <Card key={lab.id_lab} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Microscope className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{lab.name}</CardTitle>
                          {lab.faculty_match && (
                            <p className="text-sm text-muted-foreground">{lab.faculty_match}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {lab.professors && (
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{lab.professors}</p>
                        </div>
                      )}
                      {lab.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lab.description}
                        </p>
                      )}
                      {lab.topics && (
                        <div className="flex flex-wrap gap-2">
                          {lab.topics.split(',').slice(0, 3).map((topic, idx) => (
                            <Badge key={idx} variant="secondary">
                              {topic.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Link to={`/labs/${lab.slug || lab.id_lab}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Save Lab
                        </Button>
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

export default Labs;
