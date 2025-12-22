import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Beaker, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  GraduationCap,
  Users
} from "lucide-react";
import { useToggleSaveCourse, useToggleSaveLab, useSavedCourses, useSavedLabs } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

interface CourseResult {
  id_course: string;
  name_course: string;
  code?: string;
  ects?: number;
  ba_ma?: string;
  professor_name?: string;
  language?: string;
  topics?: string;
}

interface LabResult {
  id_lab: string;
  name: string;
  slug?: string;
  topics?: string;
  professors?: string;
  faculty_match?: string;
}

interface AIResultCardProps {
  type: "course" | "lab";
  data: CourseResult | LabResult;
  className?: string;
}

export const AIResultCard = ({ type, data, className }: AIResultCardProps) => {
  const toggleSaveCourse = useToggleSaveCourse();
  const toggleSaveLab = useToggleSaveLab();
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();
  const [isSaving, setIsSaving] = useState(false);

  const isCourse = type === "course";
  const courseData = data as CourseResult;
  const labData = data as LabResult;

  const id = isCourse ? courseData.id_course : labData.id_lab;
  const name = isCourse ? courseData.name_course : labData.name;
  const slug = !isCourse ? labData.slug : undefined;

  // Check if already saved
  const isSaved = isCourse 
    ? savedCourses?.some(sc => sc.course_id === id)
    : savedLabs?.some(sl => sl.lab_id === id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
      if (isCourse) {
        await toggleSaveCourse.mutateAsync(id);
      } else {
        await toggleSaveLab.mutateAsync(id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const linkTo = isCourse ? `/courses/${id}` : `/labs/${slug || id}`;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-md border-border/50",
        "bg-gradient-to-br",
        isCourse 
          ? "from-blue-500/5 to-indigo-500/5 hover:border-blue-500/30" 
          : "from-green-500/5 to-emerald-500/5 hover:border-green-500/30",
        className
      )}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div className={cn(
            "shrink-0 p-1.5 rounded-lg",
            isCourse ? "bg-blue-500/10 text-blue-600" : "bg-green-500/10 text-green-600"
          )}>
            {isCourse ? <BookOpen className="h-4 w-4" /> : <Beaker className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <Link 
              to={linkTo}
              className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {name}
            </Link>
            {isCourse && courseData.code && (
              <p className="text-xs text-muted-foreground mt-0.5">{courseData.code}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0",
              isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {isCourse && (
            <>
              {courseData.ects && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {courseData.ects} ECTS
                </Badge>
              )}
              {courseData.ba_ma && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    courseData.ba_ma === "Ba" ? "border-orange-500/50 text-orange-600" : "border-purple-500/50 text-purple-600"
                  )}
                >
                  <GraduationCap className="h-2.5 w-2.5 mr-0.5" />
                  {courseData.ba_ma === "Ba" ? "Bachelor" : "Master"}
                </Badge>
              )}
              {courseData.language && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {courseData.language.split(',')[0]}
                </Badge>
              )}
            </>
          )}
          {!isCourse && labData.faculty_match && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {labData.faculty_match.split(',')[0]}
            </Badge>
          )}
        </div>

        {/* Details */}
        {isCourse && courseData.professor_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Users className="h-3 w-3" />
            <span className="truncate">{courseData.professor_name.split(',')[0]}</span>
          </div>
        )}
        {!isCourse && labData.professors && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Users className="h-3 w-3" />
            <span className="truncate">{labData.professors.split(',')[0]}</span>
          </div>
        )}

        {/* Topics preview */}
        {(isCourse ? courseData.topics : labData.topics) && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {(isCourse ? courseData.topics : labData.topics)?.slice(0, 80)}...
          </p>
        )}

        {/* View link */}
        <Link 
          to={linkTo}
          className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View details
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
};

// Parser to extract courses/labs from AI response
export const parseAIResults = (content: string): { courses: CourseResult[], labs: LabResult[] } => {
  const courses: CourseResult[] = [];
  const labs: LabResult[] = [];

  // Look for JSON blocks with <!--COURSES:...--> and <!--LABS:...-->
  const coursesMatch = content.match(/<!--COURSES:(.*?)-->/s);
  const labsMatch = content.match(/<!--LABS:(.*?)-->/s);

  if (coursesMatch) {
    try {
      const parsed = JSON.parse(coursesMatch[1]);
      if (Array.isArray(parsed)) {
        courses.push(...parsed);
      }
    } catch (e) {
      console.error("Failed to parse courses:", e);
    }
  }

  if (labsMatch) {
    try {
      const parsed = JSON.parse(labsMatch[1]);
      if (Array.isArray(parsed)) {
        labs.push(...parsed);
      }
    } catch (e) {
      console.error("Failed to parse labs:", e);
    }
  }

  return { courses, labs };
};

// Component to render all result cards from an AI message
interface AIResultCardsProps {
  content: string;
  className?: string;
}

export const AIResultCards = ({ content, className }: AIResultCardsProps) => {
  const { courses, labs } = parseAIResults(content);

  if (courses.length === 0 && labs.length === 0) return null;

  return (
    <div className={cn("mt-3 space-y-3", className)}>
      {courses.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Courses found ({courses.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {courses.slice(0, 6).map((course) => (
              <AIResultCard key={course.id_course} type="course" data={course} />
            ))}
          </div>
          {courses.length > 6 && (
            <p className="text-xs text-muted-foreground">
              +{courses.length - 6} more courses in the response above
            </p>
          )}
        </div>
      )}

      {labs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Beaker className="h-3 w-3" />
            Labs found ({labs.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {labs.slice(0, 6).map((lab) => (
              <AIResultCard key={lab.id_lab} type="lab" data={lab} />
            ))}
          </div>
          {labs.length > 6 && (
            <p className="text-xs text-muted-foreground">
              +{labs.length - 6} more labs in the response above
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIResultCard;
