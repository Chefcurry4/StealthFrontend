import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Bookmark, RotateCcw, LayoutGrid } from "lucide-react";
import { CourseCardImage } from "@/components/CourseCardImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseCardSkeleton } from "@/components/skeletons/CourseCardSkeleton";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useCourses, CourseFilters } from "@/hooks/useCourses";
import { usePrograms } from "@/hooks/usePrograms";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { useCourseRatings } from "@/hooks/useCourseRatings";
import { useDisplayPreferences } from "@/hooks/useDisplayPreferences";
import { TopicFilterMultiSelect } from "@/components/TopicFilterMultiSelect";

type DisplaySize = '5' | '7' | '10';

const Courses = () => {
  const [filters, setFilters] = useState<CourseFilters>({});
  const [ectsRange, setEctsRange] = useState<[number, number]>([0, 30]);
  const [currentPage, setCurrentPage] = useState(1);
  const [displaySize, setDisplaySize] = useState<DisplaySize>('5');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const displayPrefs = useDisplayPreferences();
  const itemsPerPage = displayPrefs.display_items_per_page;
  const queryClient = useQueryClient();
  
  const { data: allCourses, isLoading, error, refetch } = useCourses(filters);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["courses"] });
    await refetch();
  }, [queryClient, refetch]);

  // Filter courses by selected topics
  const filteredCourses = useMemo(() => {
    if (!allCourses) return [];
    if (selectedTopics.length === 0) return allCourses;
    
    return allCourses.filter(course => {
      const courseTopics = course.topics?.toLowerCase() || '';
      return selectedTopics.some(topic => 
        courseTopics.includes(topic.toLowerCase())
      );
    });
  }, [allCourses, selectedTopics]);

  const { courses, totalPages } = useMemo(() => {
    if (!filteredCourses.length) return { courses: [], totalPages: 0 };
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      courses: filteredCourses.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredCourses.length / itemsPerPage)
    };
  }, [filteredCourses, currentPage, itemsPerPage]);
  
  // Fetch ratings for current page courses
  const courseIds = useMemo(() => courses.map(c => c.id_course), [courses]);
  const { data: ratingsMap } = useCourseRatings(courseIds);
  
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
    setCurrentPage(1);
  };

  const handleEctsChange = (value: number[]) => {
    setEctsRange([value[0], value[1]]);
    setFilters((prev) => ({
      ...prev,
      ectsMin: value[0],
      ectsMax: value[1],
    }));
  };

  const resetFilters = () => {
    setFilters({});
    setEctsRange([0, 30]);
    setSelectedTopics([]);
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '') || ectsRange[0] !== 0 || ectsRange[1] !== 30 || selectedTopics.length > 0;

  const getGridCols = () => {
    // If compact mode is enabled, show more items per row
    if (displayPrefs.display_compact) {
      switch (displaySize) {
        case '10': return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-12';
        case '7': return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9';
        default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      }
    }
    switch (displaySize) {
      case '10': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10';
      case '7': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7';
      default: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }
  };

  const getCardSize = () => {
    if (displayPrefs.display_compact) return 'small';
    return displaySize === '10' ? 'small' : 'default';
  };

  return (
    <>
      <SEO 
        title="Courses"
        description={`Browse ${allCourses?.length || 1000}+ university courses across partner institutions. Filter by language, level, ECTS credits, and more to build your perfect learning agreement.`}
        keywords={["university courses", "ECTS credits", "bachelor courses", "master courses", "course catalog"]}
      />
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Courses
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-2xl">
              Browse 1000+ courses across partner universities and build your perfect learning agreement
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by course code, title, or keywords..."
                  className="pl-10"
                  value={filters.search || ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b backdrop-blur theme-section" style={{ borderColor: 'var(--theme-card-border)' }}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 opacity-70" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Filters
                  </Button>
                )}
                <div className="hidden lg:flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 opacity-70" />
                  <Select value={displaySize} onValueChange={(v) => setDisplaySize(v as DisplaySize)}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per row</SelectItem>
                      <SelectItem value="7">7 per row</SelectItem>
                      <SelectItem value="10">10 per row</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Filter Row 1: Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              <TopicFilterMultiSelect
                selectedTopics={selectedTopics}
                onTopicsChange={(topics) => {
                  setSelectedTopics(topics);
                  setCurrentPage(1);
                }}
              />

              <Select 
                value={filters.programId || "all"} 
                onValueChange={(value) => updateFilter("programId", value)}
              >
                <SelectTrigger className="w-full">
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

              <Select 
                value={filters.language || "all"} 
                onValueChange={(value) => updateFilter("language", value)}
              >
                <SelectTrigger className="w-full">
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

              <Select 
                value={filters.term || "all"} 
                onValueChange={(value) => updateFilter("term", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                  <SelectItem value="Winter/Summer">Winter/Summer</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.examType || "all"} 
                onValueChange={(value) => updateFilter("examType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Types</SelectItem>
                  <SelectItem value="Written">Written</SelectItem>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="During the semester">During Semester</SelectItem>
                </SelectContent>
              </Select>

              {/* ECTS Slider */}
              <div className="flex flex-col justify-center">
                <label className="text-xs font-medium mb-1">
                  ECTS: {ectsRange[0]} - {ectsRange[1]}
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

            {/* Filter Row 2: Button Groups */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {/* Level (Bachelor/Master) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium opacity-70">Level:</span>
                <div className="flex gap-1">
                  <Button
                    variant={filters.level === "Ba" ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => updateFilter("level", filters.level === "Ba" ? "all" : "Ba")}
                  >
                    Bachelor
                  </Button>
                  <Button
                    variant={filters.level === "Ma" ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => updateFilter("level", filters.level === "Ma" ? "all" : "Ma")}
                  >
                    Master
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Courses List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className={`grid ${getGridCols()} gap-2 sm:gap-3 lg:gap-4`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <p className="text-center opacity-70">
                Error loading courses. Please try again.
              </p>
            ) : courses.length === 0 ? (
              <p className="text-center opacity-70">
                No courses found matching your filters.
              </p>
            ) : (
              <>
                <div className="mb-4 text-sm opacity-70">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, allCourses?.length || 0)} of {allCourses?.length || 0} courses
                </div>
                <div className={`grid ${getGridCols()} gap-2 sm:gap-3 lg:gap-4`}>
                  {courses?.map((course) => {
                    const isSaved = savedCourses?.some((sc: any) => sc.course_id === course.id_course);
                    const isSmall = getCardSize() === 'small';
                    
                    return (
                      <Card 
                        key={course.id_course} 
                        className="flex flex-col overflow-hidden backdrop-blur-md cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
                        onClick={() => navigate(`/courses/${course.id_course}`)}
                      >
                        <CourseCardImage 
                          courseId={course.id_course}
                          courseName={course.name_course}
                          level={course.ba_ma}
                          className={isSmall ? "h-14 sm:h-16 lg:h-18" : "h-20 sm:h-24 lg:h-28"}
                          averageRating={ratingsMap?.[course.id_course]?.average_rating}
                          reviewCount={ratingsMap?.[course.id_course]?.review_count}
                        />
                        <CardHeader className={`flex-1 ${isSmall ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4 lg:p-6'}`}>
                          <CardTitle className={`${isSmall ? 'text-xs sm:text-sm' : 'text-sm sm:text-base lg:text-lg'} line-clamp-2`}>{course.name_course}</CardTitle>
                          {course.code && (
                            <p className={`${isSmall ? 'text-[10px]' : 'text-xs sm:text-sm'} opacity-70`}>{course.code}</p>
                          )}
                        </CardHeader>
                        <CardContent className={`space-y-2 ${isSmall ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4 lg:p-6'} pt-0`}>
                          <div className="flex flex-wrap gap-1">
                            {course.ects && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full ${isSmall ? 'text-[8px]' : 'text-[10px] sm:text-xs'} font-medium theme-badge`}>
                                {course.ects} ECTS
                              </span>
                            )}
                            {course.language && !isSmall && (
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium theme-badge opacity-80">
                                {course.language}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className={`flex-1 theme-btn-secondary ${isSmall ? 'text-[10px] h-6' : 'text-xs sm:text-sm'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/courses/${course.id_course}`);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant={isSaved ? "default" : "outline"}
                              size="sm"
                              className={`theme-btn-secondary ${isSmall ? 'p-1.5 h-6' : 'p-2 sm:p-2.5'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!user) {
                                  navigate("/auth");
                                  return;
                                }
                                toggleSave.mutate(course.id_course);
                              }}
                            >
                              <Bookmark className={`${isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3 sm:h-4 sm:w-4'} ${isSaved ? "fill-current" : ""}`} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
      </PullToRefresh>
    </>
  );
};

export default Courses;