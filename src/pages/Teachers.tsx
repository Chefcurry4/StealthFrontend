import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, GraduationCap, Mail, Award, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBackground } from "@/components/GradientBackground";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeachers } from "@/hooks/useTeachers";

const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: teachers, isLoading, error } = useTeachers(searchQuery);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <GradientBackground variant="aurora">
          <section className="py-16">
            <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-4">
              Meet Our Faculty
            </h1>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl">
              Explore 900+ professors and researchers across partner universities
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              </div>
            </div>
          </section>
        </GradientBackground>

        {/* Teachers List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-muted-foreground">
                Error loading teachers. Please try again.
              </p>
            ) : teachers?.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No teachers found matching your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers?.map((teacher) => (
                  <Link key={teacher.id_teacher} to={`/teachers/${teacher.id_teacher}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg line-clamp-2">
                              {teacher.full_name || teacher.name}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {teacher.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {teacher["h-index"] && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              h-index: {teacher["h-index"]}
                            </Badge>
                          )}
                          {teacher.citations && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {teacher.citations} citations
                            </Badge>
                          )}
                        </div>

                        {teacher.topics && teacher.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {teacher.topics.slice(0, 3).map((topic, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {teacher.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{teacher.topics.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Teachers;
