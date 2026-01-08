import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  Beaker, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  GraduationCap,
  Users,
  ArrowUpDown,
  Filter,
  BookmarkPlus,
  Loader2
} from "lucide-react";
import { useToggleSaveCourse, useToggleSaveLab, useSavedCourses, useSavedLabs } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
                    courseData.ba_ma === "Bachelor" ? "border-orange-500/50 text-orange-600" : "border-purple-500/50 text-purple-600"
                  )}
                >
                  <GraduationCap className="h-2.5 w-2.5 mr-0.5" />
                  {courseData.ba_ma === "Bachelor" ? "Bachelor" : "Master"}
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

type SortOption = "name" | "ects-asc" | "ects-desc";
type FilterLevel = "all" | "Bachelor" | "Master";

// Component to render all result cards from an AI message
interface AIResultCardsProps {
  content: string;
  className?: string;
}

export const AIResultCards = ({ content, className }: AIResultCardsProps) => {
  const { courses, labs } = parseAIResults(content);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [filterProfessor, setFilterProfessor] = useState<string>("all");
  const [isSavingAll, setIsSavingAll] = useState<"courses" | "labs" | null>(null);
  
  const toggleSaveCourse = useToggleSaveCourse();
  const toggleSaveLab = useToggleSaveLab();
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();

  // Get unique professors from courses
  const professors = useMemo(() => {
    const profs = new Set<string>();
    courses.forEach(c => {
      if (c.professor_name) {
        c.professor_name.split(',').forEach(p => profs.add(p.trim()));
      }
    });
    return Array.from(profs).sort();
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];
    
    // Apply level filter
    if (filterLevel !== "all") {
      result = result.filter(c => c.ba_ma === filterLevel);
    }
    
    // Apply professor filter
    if (filterProfessor !== "all") {
      result = result.filter(c => 
        c.professor_name?.toLowerCase().includes(filterProfessor.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name_course.localeCompare(b.name_course));
        break;
      case "ects-asc":
        result.sort((a, b) => (a.ects || 0) - (b.ects || 0));
        break;
      case "ects-desc":
        result.sort((a, b) => (b.ects || 0) - (a.ects || 0));
        break;
    }
    
    return result;
  }, [courses, sortBy, filterLevel, filterProfessor]);

  // Get unsaved items
  const unsavedCourses = useMemo(() => 
    filteredCourses.filter(c => !savedCourses?.some(sc => sc.course_id === c.id_course)),
    [filteredCourses, savedCourses]
  );

  const unsavedLabs = useMemo(() => 
    labs.filter(l => !savedLabs?.some(sl => sl.lab_id === l.id_lab)),
    [labs, savedLabs]
  );

  const handleSaveAllCourses = async () => {
    if (unsavedCourses.length === 0) {
      toast.info("All courses already saved");
      return;
    }
    
    setIsSavingAll("courses");
    try {
      for (const course of unsavedCourses) {
        await toggleSaveCourse.mutateAsync(course.id_course);
      }
      toast.success(`Saved ${unsavedCourses.length} courses`);
    } catch (error) {
      toast.error("Failed to save some courses");
    } finally {
      setIsSavingAll(null);
    }
  };

  const handleSaveAllLabs = async () => {
    if (unsavedLabs.length === 0) {
      toast.info("All labs already saved");
      return;
    }
    
    setIsSavingAll("labs");
    try {
      for (const lab of unsavedLabs) {
        await toggleSaveLab.mutateAsync(lab.id_lab);
      }
      toast.success(`Saved ${unsavedLabs.length} labs`);
    } catch (error) {
      toast.error("Failed to save some labs");
    } finally {
      setIsSavingAll(null);
    }
  };

  if (courses.length === 0 && labs.length === 0) return null;

  return (
    <div className={cn("mt-3 space-y-4", className)}>
      {courses.length > 0 && (
        <div className="space-y-2">
          {/* Header with filters */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Courses found ({filteredCourses.length}/{courses.length})
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Level filter */}
              <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v as FilterLevel)}>
                <SelectTrigger className="h-7 text-xs w-[100px]">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                </SelectContent>
              </Select>

              {/* Professor filter */}
              {professors.length > 0 && (
                <Select value={filterProfessor} onValueChange={setFilterProfessor}>
                  <SelectTrigger className="h-7 text-xs w-[120px]">
                    <Users className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All professors</SelectItem>
                    {professors.slice(0, 10).map(prof => (
                      <SelectItem key={prof} value={prof}>
                        {prof.length > 20 ? prof.slice(0, 20) + '...' : prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="h-7 text-xs w-[110px]">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="ects-asc">ECTS (low-high)</SelectItem>
                  <SelectItem value="ects-desc">ECTS (high-low)</SelectItem>
                </SelectContent>
              </Select>

              {/* Save all button */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleSaveAllCourses}
                disabled={isSavingAll === "courses" || unsavedCourses.length === 0}
              >
                {isSavingAll === "courses" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <BookmarkPlus className="h-3 w-3" />
                )}
                Save all ({unsavedCourses.length})
              </Button>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredCourses.slice(0, 6).map((course) => (
              <AIResultCard key={course.id_course} type="course" data={course} />
            ))}
          </div>
          {filteredCourses.length > 6 && (
            <p className="text-xs text-muted-foreground">
              +{filteredCourses.length - 6} more courses in the response above
            </p>
          )}
        </div>
      )}

      {labs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Beaker className="h-3 w-3" />
              Labs found ({labs.length})
            </p>
            
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleSaveAllLabs}
              disabled={isSavingAll === "labs" || unsavedLabs.length === 0}
            >
              {isSavingAll === "labs" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <BookmarkPlus className="h-3 w-3" />
              )}
              Save all ({unsavedLabs.length})
            </Button>
          </div>
          
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
