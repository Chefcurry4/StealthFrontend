import { Search, BookOpen, GraduationCap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Courses = () => {
  const sampleCourses = [
    {
      id: 1,
      code: "CS-330",
      title: "Machine Learning",
      ects: 8,
      language: "English",
      university: "EPFL",
      term: "Fall",
      level: "Master",
      description: "Introduction to machine learning theory and algorithms",
    },
    {
      id: 2,
      code: "CS-450",
      title: "Advanced Algorithms",
      ects: 6,
      language: "English",
      university: "ETH Zürich",
      term: "Spring",
      level: "Master",
      description: "Advanced topics in algorithm design and complexity",
    },
    {
      id: 3,
      code: "PHYS-201",
      title: "Quantum Physics",
      ects: 6,
      language: "English",
      university: "EPFL",
      term: "Fall",
      level: "Bachelor",
      description: "Fundamentals of quantum mechanics and applications",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-4">
              Discover Courses
            </h1>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl">
              Browse 1000+ courses across partner universities and build your perfect learning agreement
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by course code, title, or keywords..."
                  className="pl-10 bg-background"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Courses List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              {sampleCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{course.code}</Badge>
                          <Badge variant="outline">{course.level}</Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{course.university}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.ects} ECTS</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.term}</span>
                          </div>
                          <span>🇬🇧 {course.language}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {course.description}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Save Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Courses;
