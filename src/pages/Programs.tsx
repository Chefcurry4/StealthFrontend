import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { ProgramCardImage } from "@/components/ProgramCardImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProgramCardSkeleton } from "@/components/skeletons/ProgramCardSkeleton";
import { usePrograms } from "@/hooks/usePrograms";

const Programs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: programs, isLoading, error } = usePrograms(searchQuery);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Programs
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-2xl">
              Discover academic programs across partner universities
            </p>

            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search programs by name..."
                  className="pl-10 bg-white/10 backdrop-blur border-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ProgramCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <p className="text-center opacity-70">
                Error loading programs. Please try again.
              </p>
            ) : programs?.length === 0 ? (
              <p className="text-center opacity-70">
                No programs found matching your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {programs?.map((program) => (
                  <Card key={program.id} className="flex flex-col overflow-hidden backdrop-blur-md bg-white/10 border-white/20">
                    <ProgramCardImage 
                      programId={program.id}
                      programName={program.name}
                      className="h-32"
                    />
                    <CardHeader className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{program.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {program.description && (
                        <p className="text-sm opacity-70 mb-4 line-clamp-2">
                          {program.description}
                        </p>
                      )}
                      <Link to={`/programs/${program.slug || program.id}`}>
                        <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30">
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