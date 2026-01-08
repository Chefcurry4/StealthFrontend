import { useState } from "react";
import { 
  X, 
  GraduationCap, 
  Snowflake, 
  Sun, 
  FileText, 
  Mic, 
  CalendarClock,
  Download,
  Save,
  ChevronRight,
  ChevronLeft,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface SemesterPlanCourse {
  id_course: string;
  name_course: string;
  code?: string;
  ects?: number;
  type_exam?: string;
  ba_ma?: string;
  professor_name?: string;
  topics?: string;
  term?: string;
}

export interface SemesterPlan {
  winter: SemesterPlanCourse[];
  summer: SemesterPlanCourse[];
  generated_at?: string;
  title?: string;
}

interface WorkbenchSemesterPlannerProps {
  isOpen: boolean;
  onToggle: () => void;
  plan: SemesterPlan | null;
  onClearPlan: () => void;
  onSaveToDiary?: (plan: SemesterPlan) => void;
  onRemoveCourse: (semester: "winter" | "summer", courseId: string) => void;
}

// Helper function to count exam types
const countExamTypes = (courses: SemesterPlanCourse[]) => {
  let written = 0;
  let oral = 0;
  let projectMidterm = 0;

  courses.forEach((course) => {
    const examType = course.type_exam?.toLowerCase() || "";
    
    if (examType.includes("written") || examType.includes("écrit") || examType.includes("exam")) {
      written++;
    } else if (examType.includes("oral") || examType.includes("presentation")) {
      oral++;
    } else if (examType.includes("project") || examType.includes("midterm") || examType.includes("semester")) {
      projectMidterm++;
    } else if (examType.trim()) {
      projectMidterm++;
    }
  });

  return { written, oral, projectMidterm };
};

// Helper function to count levels
const countLevels = (courses: SemesterPlanCourse[]) => {
  let bachelor = 0;
  let master = 0;

  courses.forEach((course) => {
    const level = course.ba_ma?.toLowerCase() || "";
    if (level.includes("ba") || level.includes("bachelor")) {
      bachelor++;
    } else if (level.includes("ma") || level.includes("master")) {
      master++;
    }
  });

  return { bachelor, master };
};

export const WorkbenchSemesterPlanner = ({ 
  isOpen, 
  onToggle, 
  plan, 
  onClearPlan,
  onSaveToDiary,
  onRemoveCourse 
}: WorkbenchSemesterPlannerProps) => {
  const [selectedSemester, setSelectedSemester] = useState<"winter" | "summer">("winter");

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-accent"
        title="Open Semester Planner"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
  }

  const currentCourses = plan?.[selectedSemester] || [];
  const allCourses = [...(plan?.winter || []), ...(plan?.summer || [])];
  
  const totalEcts = allCourses.reduce((sum, c) => sum + (c.ects || 0), 0);
  const semesterEcts = currentCourses.reduce((sum, c) => sum + (c.ects || 0), 0);
  const examCounts = countExamTypes(allCourses);
  const levelCounts = countLevels(allCourses);

  const handleExportJson = () => {
    if (!plan) return;
    const dataStr = JSON.stringify(plan, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `semester-plan-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Semester plan exported as JSON");
  };

  return (
    <div className="w-80 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Semester Planner</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!plan || (plan.winter.length === 0 && plan.summer.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <GraduationCap className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm font-medium mb-2">No Semester Plan</p>
          <p className="text-xs">
            Ask hubAI to generate a semester plan, e.g., "Plan my winter semester with 30 ECTS including Machine Learning and Robotics"
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {/* Semester Toggle */}
            <div className="flex justify-center gap-1">
              <Button
                variant={selectedSemester === "winter" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSemester("winter")}
                className={cn(
                  "gap-1 h-7 text-xs px-3",
                  selectedSemester === "winter" && "bg-sky-600 hover:bg-sky-700"
                )}
              >
                <Snowflake className="h-3 w-3" />
                Winter ({plan.winter.length})
              </Button>
              <Button
                variant={selectedSemester === "summer" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSemester("summer")}
                className={cn(
                  "gap-1 h-7 text-xs px-3",
                  selectedSemester === "summer" && "bg-amber-600 hover:bg-amber-700"
                )}
              >
                <Sun className="h-3 w-3" />
                Summer ({plan.summer.length})
              </Button>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-muted/50 border">
              <div className="text-center p-1.5 rounded bg-background">
                <div className="text-sm font-bold text-primary">{totalEcts}</div>
                <div className="text-[8px] text-muted-foreground uppercase">Total ECTS</div>
              </div>
              <div className="text-center p-1.5 rounded bg-background">
                <div className="text-sm font-bold">{allCourses.length}</div>
                <div className="text-[8px] text-muted-foreground uppercase">Courses</div>
              </div>
              <div className="text-center p-1.5 rounded bg-background">
                <div className="text-sm font-bold text-indigo-600">{levelCounts.bachelor}</div>
                <div className="text-[8px] text-muted-foreground uppercase">Bachelor</div>
              </div>
              <div className="text-center p-1.5 rounded bg-background">
                <div className="text-sm font-bold text-purple-600">{levelCounts.master}</div>
                <div className="text-[8px] text-muted-foreground uppercase">Master</div>
              </div>

              {/* Exam Types */}
              <div className="col-span-4 flex items-center justify-center gap-3 py-1.5 border-t mt-1">
                <div className="flex items-center gap-1 text-[10px]">
                  <FileText className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{examCounts.written}</span>
                  <span className="text-muted-foreground">Written</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <Mic className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{examCounts.oral}</span>
                  <span className="text-muted-foreground">Oral</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <CalendarClock className="h-3 w-3 text-orange-500" />
                  <span className="font-medium">{examCounts.projectMidterm}</span>
                  <span className="text-muted-foreground">Project</span>
                </div>
              </div>
            </div>

            {/* Semester Courses */}
            <div className={cn(
              "rounded-lg border-2 border-dashed p-2 min-h-[200px]",
              selectedSemester === "winter" ? "bg-sky-50/50 border-sky-200 dark:bg-sky-950/20" : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {selectedSemester === "winter" ? (
                    <Snowflake className="h-3 w-3 text-sky-600" />
                  ) : (
                    <Sun className="h-3 w-3 text-amber-600" />
                  )}
                  <h4 className="text-xs font-medium">
                    {selectedSemester === "winter" ? "Winter" : "Summer"} Semester
                  </h4>
                </div>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {semesterEcts} ECTS
                </Badge>
              </div>

              <div className="space-y-1.5">
                {currentCourses.map((course) => {
                  const examType = course.type_exam?.toLowerCase() || "";
                  let examIcon = <CalendarClock className="h-2.5 w-2.5 text-orange-500" />;
                  if (examType.includes("written") || examType.includes("écrit")) {
                    examIcon = <FileText className="h-2.5 w-2.5 text-blue-500" />;
                  } else if (examType.includes("oral")) {
                    examIcon = <Mic className="h-2.5 w-2.5 text-green-500" />;
                  }

                  const levelLabel = course.ba_ma?.toLowerCase()?.includes("ba") ? "Ba" : 
                                    course.ba_ma?.toLowerCase()?.includes("ma") ? "Ma" : null;

                  return (
                    <div
                      key={course.id_course}
                      className="p-2 rounded bg-background border text-xs relative group shadow-sm hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => onRemoveCourse(selectedSemester, course.id_course)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                      <div className="font-medium text-foreground line-clamp-1 text-[10px]">
                        {course.name_course}
                      </div>
                      {course.code && (
                        <div className="text-[9px] text-muted-foreground">{course.code}</div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 text-muted-foreground flex-wrap">
                        {course.ects && (
                          <span className="font-medium text-[9px]">{course.ects} ECTS</span>
                        )}
                        {examIcon}
                        {levelLabel && (
                          <span className={cn(
                            "px-1 rounded text-[8px] font-medium",
                            levelLabel === "Ba" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                          )}>
                            {levelLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentCourses.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  No courses in {selectedSemester} semester
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Footer Actions */}
      {plan && (plan.winter.length > 0 || plan.summer.length > 0) && (
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex gap-2">
            {onSaveToDiary && (
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1 gap-1.5 h-8 text-xs"
                onClick={() => onSaveToDiary(plan)}
              >
                <Save className="h-3 w-3" />
                Save to Diary
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-8 text-xs"
              onClick={handleExportJson}
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full gap-1.5 h-7 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearPlan}
          >
            <Trash2 className="h-3 w-3" />
            Clear Plan
          </Button>
        </div>
      )}
    </div>
  );
};
