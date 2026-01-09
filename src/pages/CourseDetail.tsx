import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronRight, BookOpen, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useCourseReviews } from "@/hooks/useCourseReviews";
import { SEO, generateCourseSchema, generateBreadcrumbSchema } from "@/components/SEO";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { 
  CourseInfoCard, 
  UserDetailsCard, 
  CourseReviewSection, 
  SimilarCoursesSection,
  type CourseReviewSectionHandle 
} from "@/components/course-detail";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: course, isLoading, error, refetch } = useCourse(id!);
  
  // Check if user came from workbench
  const cameFromWorkbench = location.state?.fromWorkbench === true;
  const workbenchConversationId = location.state?.conversationId;
  const { user } = useAuth();
  const { data: savedCourses } = useSavedCourses();
  const toggleSave = useToggleSaveCourse();
  const { addItem } = useRecentlyViewed();
  const { data: reviews } = useCourseReviews(id!);
  const reviewSectionRef = useRef<CourseReviewSectionHandle>(null);

  // Calculate review summary
  const reviewSummary = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    
    const difficultyMap: Record<string, number> = { "Easy": 1, "Medium": 2, "Difficult": 3, "Very Difficult": 4 };
    const workloadMap: Record<string, number> = { "Light": 1, "Okay": 2, "Heavy": 3 };
    const organizationMap: Record<string, number> = { "Poor": 1, "Fair": 2, "Good": 3, "Great": 4 };
    
    const difficulties = reviews.filter(r => r.difficulty).map(r => difficultyMap[r.difficulty!] || 0).filter(v => v > 0);
    const workloads = reviews.filter(r => r.workload).map(r => workloadMap[r.workload!] || 0).filter(v => v > 0);
    const organizations = reviews.filter(r => r.organization).map(r => organizationMap[r.organization!] || 0).filter(v => v > 0);
    const ratings = reviews.filter(r => r.rating).map(r => Number(r.rating));
    
    const avgDiffNum = difficulties.length ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length : 0;
    const avgWorkNum = workloads.length ? workloads.reduce((a, b) => a + b, 0) / workloads.length : 0;
    const avgOrgNum = organizations.length ? organizations.reduce((a, b) => a + b, 0) / organizations.length : 0;
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    const getDifficultyLabel = (n: number) => n <= 1.5 ? "Easy" : n <= 2.5 ? "Medium" : n <= 3.5 ? "Difficult" : "Very Difficult";
    const getWorkloadLabel = (n: number) => n <= 1.5 ? "Light" : n <= 2.5 ? "Okay" : "Heavy";
    const getOrganizationLabel = (n: number) => n <= 1.5 ? "Poor" : n <= 2.5 ? "Fair" : n <= 3.5 ? "Good" : "Great";
    
    return {
      avgDifficulty: difficulties.length ? getDifficultyLabel(avgDiffNum) : null,
      avgWorkload: workloads.length ? getWorkloadLabel(avgWorkNum) : null,
      avgOrganization: organizations.length ? getOrganizationLabel(avgOrgNum) : null,
      avgRating: ratings.length ? avgRating : null,
      totalReviews: reviews.length,
    };
  }, [reviews]);

  const isSaved = savedCourses?.some((saved: any) => saved.course_id === id);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["courses", id] });
    await queryClient.invalidateQueries({ queryKey: ["course-reviews", id] });
    await refetch();
  }, [queryClient, id, refetch]);

  // Track recently viewed course
  useEffect(() => {
    if (course) {
      addItem({
        id: course.id_course,
        type: 'course',
        name: course.name_course,
        href: `/courses/${course.id_course}`,
        ects: course.ects || undefined,
        code: course.code || undefined,
      });
    }
  }, [course, addItem]);

  const handleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleSave.mutate(id!);
  };

  const handleOpenReview = () => {
    reviewSectionRef.current?.scrollToForm();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-5 w-48 mb-4" />
            <Skeleton className="h-10 w-2/3 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          
          {/* Two Column Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (error || !course) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Courses
          </Link>
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/courses">
              <Button>Browse All Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: typeof window !== "undefined" ? window.location.origin : "" },
    { name: "Courses", url: `${typeof window !== "undefined" ? window.location.origin : ""}/courses` },
    { name: course.name_course, url: typeof window !== "undefined" ? window.location.href : "" },
  ]);

  const courseSchema = generateCourseSchema({
    name: course.name_course,
    description: course.description || undefined,
    code: course.code || undefined,
    ects: course.ects || undefined,
    professor: course.professor_name || undefined,
  });

  return (
    <>
      <SEO 
        title={course.name_course}
        description={course.description || `${course.name_course} - ${course.ects || "?"} ECTS course. ${course.ba_ma === "Ma" ? "Master" : "Bachelor"} level.`}
        keywords={[course.name_course, course.code || "", course.ba_ma === "Ma" ? "master course" : "bachelor course", "university course", "ECTS"]}
        structuredData={{ "@graph": [breadcrumbSchema, courseSchema] }}
      />
      
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <header className="mb-8">
            {/* Back to Workbench button if came from there */}
            {cameFromWorkbench && (
              <Button
                variant="outline"
                size="sm"
                className="mb-4 gap-2"
                onClick={() => navigate('/workbench', { state: { conversationId: workbenchConversationId } })}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to AI Chat
              </Button>
            )}
            
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-muted-foreground mb-4">
              <Link to="/courses" className="hover:text-foreground transition-colors">
                Courses
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-foreground truncate max-w-[300px]">{course.name_course}</span>
            </nav>

            {/* Title and Actions Row */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 break-words">
                  {course.name_course}
                </h1>
                
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {course.code && (
                    <Badge variant="secondary" className="font-mono">
                      {course.code}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {course.ects ? `${course.ects} ECTS` : "ECTS: ?"}
                  </Badge>
                  {course.ba_ma && (
                    <Badge variant="outline">
                      {course.ba_ma === "Ma" ? "Master" : course.ba_ma === "Ba" ? "Bachelor" : course.ba_ma}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Save Button (Header) */}
              <Button
                size="lg"
                variant={isSaved ? "secondary" : "default"}
                onClick={handleSave}
                disabled={toggleSave.isPending}
                className="shrink-0 gap-2"
                aria-label={isSaved ? "Remove from saved courses" : "Save course"}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Course'}
              </Button>
            </div>
          </header>

          {/* Two Column Layout - Equal Height */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Course Info */}
            <div className="lg:col-span-2 flex">
              <CourseInfoCard course={course} />
            </div>

            {/* Right Column - User Details */}
            <div className="lg:col-span-1 flex">
              <UserDetailsCard 
                courseId={id!} 
                courseName={course.name_course}
                courseCode={course.code || undefined}
                onOpenReview={handleOpenReview}
                reviewSummary={reviewSummary || undefined}
              />
            </div>
          </div>

          {/* Reviews Section - Full Width */}
          <div className="mb-8">
            <CourseReviewSection 
              ref={reviewSectionRef}
              courseId={id!} 
            />
          </div>

          {/* Similar Courses Section */}
          <div className="mb-8">
            <SimilarCoursesSection 
              courseId={id!} 
              topics={course.topics} 
            />
          </div>
        </div>
      </div>
      </PullToRefresh>
    </>
  );
};

export default CourseDetail;
