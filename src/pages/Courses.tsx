import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BookOpen, GraduationCap, Clock, Filter, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBackground } from "@/components/GradientBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useCourses, CourseFilters } from "@/hooks/useCourses";
import { useUniversities } from "@/hooks/useUniversities";
import { usePrograms } from "@/hooks/usePrograms";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";

const Courses = () => {
  const [filters, setFilters] = useState<CourseFilters>({});
  const [ectsRange, setEctsRange] = useState<[number, number]>([0, 30]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const { data: allCourses, isLoading, error } = useCourses(filters);

  const { courses, totalPages } = useMemo(() => {
    if (!allCourses) return { courses: [], totalPages: 0 };
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      courses: allCourses.slice(startIndex, endIndex),
      totalPages: Math.ceil(allCourses.length / itemsPerPage)
    };
  }, [allCourses, currentPage]);
  const { data: universities } = useUniversities();
  const { data: programs } = usePrograms();
  const { user } = useAuth();
  const { data: savedCourses } = useSavedCourses();
  const toggleSave = useToggleSaveCourse();
  const navigate = useNavigate();

  const updateFilter = (key: keyof CourseFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
    setCurrentPage(1); // Reset to page 1 when filtering
  };

  const handleEctsChange = (value: number[]) => {
    setEctsRange([value[0], value[1]]);
    setFilters((prev) => ({
      ...prev,
      ectsMin: value[0],
      ectsMax: value[1],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <GradientBackground variant="subtle">
          <section className="py-16">
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
                  value={filters.search || ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </div>
              </div>
            </div>
          </section>
        </GradientBackground>

        {/* Filters */}
        <section className="py-6 border-b bg-background/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select onValueChange={(value) => updateFilter("universityId", value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="University" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {universities?.map((uni) => (
                    <SelectItem key={uni.uuid} value={uni.uuid}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("programId", value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs?.map((prog) => (
                    <SelectItem key={prog.id} value={prog.id}>
                      {prog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("language", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="French/English">French/English</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("level", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Ba">Bachelor</SelectItem>
                  <SelectItem value="Ma">Master</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("term", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                  <SelectItem value="Win">Win</SelectItem>
                  <SelectItem value="Sum">Sum</SelectItem>
                  <SelectItem value="Winter/Summer">Winter/Summer</SelectItem>
                  <SelectItem value="Summer/Winter">Summer/Winter</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("examType", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Written">Written</SelectItem>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="During semester">During semester</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("mandatoryOptional", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Mandatory">Mandatory</SelectItem>
                  <SelectItem value="Optional">Optional</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("whichYear", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 max-w-xs">
              <label className="text-sm font-medium mb-2 block">
                ECTS Credits: {ectsRange[0]} - {ectsRange[1]}
              </label>
              <Slider
                min={0}
                max={30}
                step={1}
                value={ectsRange}
                onValueChange={handleEctsChange}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Courses List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-muted-foreground">
                Error loading courses. Please try again.
              </p>
            ) : courses.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No courses found matching your filters.
              </p>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, allCourses?.length || 0)} of {allCourses?.length || 0} courses
                </div>
                <div className="space-y-4">
                  {courses.map((course) => (
                  <Card key={course.id_course} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {course.code && <Badge variant="secondary">{course.code}</Badge>}
                            {course.ba_ma && <Badge variant="outline">{course.ba_ma}</Badge>}
                          </div>
                          <CardTitle className="text-xl mb-2">{course.name_course}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {course.ects && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.ects} ECTS</span>
                              </div>
                            )}
                            {course.term && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.term}</span>
                              </div>
                            )}
                            {course.language && <span>🌐 {course.language}</span>}
                            {course.professor_name && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                <span>{course.professor_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {course.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Link to={`/courses/${course.id_course}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (!user) {
                              navigate("/auth");
                              return;
                            }
                            toggleSave.mutate(course.id_course);
                          }}
                        >
                          <Bookmark className={`h-4 w-4 ${savedCourses?.some((s: any) => s.course_id === course.id_course) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Courses;
