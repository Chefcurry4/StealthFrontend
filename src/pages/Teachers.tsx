import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Mail, Award, BookOpen } from "lucide-react";
import { TeacherCardImage } from "@/components/TeacherCardImage";
import { Button } from "@/components/ui/button";
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teachers?.map((teacher) => (
                  <Card key={teacher.id_teacher} className="flex flex-col overflow-hidden">
                    <TeacherCardImage 
                      teacherId={teacher.id_teacher}
                      teacherName={teacher.full_name || teacher.name || "Unknown"}
                      className="h-32"
                    />
                    <CardHeader className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{teacher.full_name || teacher.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {teacher.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a href={`mailto:${teacher.email}`} className="hover:text-primary truncate">
                            {teacher.email}
                          </a>
                        </div>
                      )}
                      {teacher.topics && teacher.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {teacher.topics.slice(0, 3).map((topic, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link to={`/teachers/${teacher.id_teacher}`}>
                        <Button variant="default" size="sm" className="w-full">
                          View Profile
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

export default Teachers;
