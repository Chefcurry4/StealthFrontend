import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBackground } from "@/components/GradientBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrograms } from "@/hooks/usePrograms";

const Programs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: programs, isLoading, error } = usePrograms(searchQuery);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <GradientBackground variant="ethereal">
          <section className="py-16">
            <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-4">
              Explore Programs
            </h1>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl">
              Discover academic programs across partner universities
            </p>

            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search programs by name..."
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              </div>
            </div>
          </section>
        </GradientBackground>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-muted-foreground">
                Error loading programs. Please try again.
              </p>
            ) : programs?.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No programs found matching your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs?.map((program) => (
                  <Card key={program.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{program.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {program.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {program.description}
                        </p>
                      )}
                      <Link to={`/programs/${program.slug || program.id}`}>
                        <Button variant="default" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
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

export default Programs;
