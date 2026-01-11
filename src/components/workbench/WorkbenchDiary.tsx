import { useState, useRef } from "react";
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
  Trash2,
  Plus,
  Edit2,
  Check,
  Image,
  FileJson,
  BookMarked,
  Mail,
  Info,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { SemesterPlan, SemesterPlanCourse } from "@/hooks/useSemesterPlans";
import { ModuleInfoPopup } from "./ModuleInfoPopup";
import { WorkbenchEmailTracker } from "./WorkbenchEmailTracker";

export type { SemesterPlanCourse, SemesterPlan };

// Temporary plan from AI (before saving)
export interface TempSemesterPlan {
  winter: SemesterPlanCourse[];
  summer: SemesterPlanCourse[];
  generated_at?: string;
  title?: string;
}

interface WorkbenchDiaryProps {
  isOpen: boolean;
  onToggle: () => void;
  // Saved plans from DB
  savedPlans: SemesterPlan[];
  // Temp plan from AI
  tempPlan: TempSemesterPlan | null;
  // Actions
  onSaveTempPlan: (name: string, winterCourses: SemesterPlanCourse[], summerCourses: SemesterPlanCourse[]) => Promise<void>;
  onClearTempPlan: () => void;
  onDeletePlan: (planId: string) => void;
  onUpdatePlanName: (planId: string, newName: string) => void;
  onRemoveCourseFromPlan: (planId: string, courseId: string) => void;
  // Saved courses for adding
  savedCourses?: Array<{
    id_course: string;
    name_course: string;
    code?: string;
    ects?: number;
    type_exam?: string;
    ba_ma?: string;
    professor_name?: string;
    term?: string;
  }>;
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

// Helper function to extract and count topics from courses
const getTopicSummary = (courses: SemesterPlanCourse[]) => {
  const topicCounts: Record<string, number> = {};
  
  courses.forEach((course) => {
    const topics = course.topics?.split(',').map(t => t.trim()).filter(Boolean) || [];
    topics.forEach((topic) => {
      // Normalize topic name (capitalize first letter)
      const normalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
      topicCounts[normalizedTopic] = (topicCounts[normalizedTopic] || 0) + 1;
    });
  });
  
  // Sort by count descending, take top 4
  return Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([topic, count]) => ({ topic, count }));
};

export const WorkbenchDiary = ({ 
  isOpen, 
  onToggle, 
  savedPlans,
  tempPlan,
  onSaveTempPlan,
  onClearTempPlan,
  onDeletePlan,
  onUpdatePlanName,
  onRemoveCourseFromPlan,
  savedCourses
}: WorkbenchDiaryProps) => {
  const [activeTab, setActiveTab] = useState<"planner" | "emails">("planner");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savePlanName, setSavePlanName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const planCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-accent"
        title="Open Diary"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
  }

  const winterPlans = savedPlans.filter(p => p.semester_type === "winter");
  const summerPlans = savedPlans.filter(p => p.semester_type === "summer");

  const handleStartEdit = (plan: SemesterPlan) => {
    setEditingPlanId(plan.id);
    setEditingName(plan.name);
  };

  const handleSaveEdit = () => {
    if (editingPlanId && editingName.trim()) {
      onUpdatePlanName(editingPlanId, editingName.trim());
    }
    setEditingPlanId(null);
    setEditingName("");
  };

  const handleSaveTempPlan = async () => {
    if (!tempPlan || !savePlanName.trim()) {
      toast.error("Please enter a name for your plan");
      return;
    }
    
    setIsSaving(true);
    try {
      await onSaveTempPlan(savePlanName.trim(), tempPlan.winter, tempPlan.summer);
      setSavePlanName("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = (plan: SemesterPlan) => {
    const totalEcts = plan.courses.reduce((sum, c) => sum + (c.ects || 0), 0);
    const headers = ["Name", "Code", "ECTS", "Exam Type", "Level", "Professor", "Topics", "", "Total Ects"];
    const rows = plan.courses.map((c, idx) => [
      c.name_course,
      c.code || "",
      c.ects?.toString() || "",
      c.type_exam || "",
      c.ba_ma || "",
      c.professor_name || "",
      c.topics || "",
      "",
      idx === 0 ? totalEcts.toString() : ""
    ]);
    
    // Add header row with plan info
    const titleRow = [`Created by UniPandan`, "", "", "", "", "", "", "", ""];
    const emptyRow = ["", "", "", "", "", "", "", "", ""];
    
    const csv = [titleRow.map(cell => `"${cell}"`).join(","), emptyRow.map(cell => `"${cell}"`).join(","), headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  };

  const handleExportPNG = async (plan: SemesterPlan, elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    try {
      // Get computed background color from the theme
      const computedStyle = getComputedStyle(document.documentElement);
      const bgColor = computedStyle.getPropertyValue('--background').trim();
      const backgroundColor = bgColor ? `hsl(${bgColor})` : '#ffffff';
      
      const canvas = await html2canvas(element, { 
        backgroundColor: backgroundColor,
        scale: 2,
        useCORS: true
      });
      
      // Create final canvas with favicon watermark
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return;
      
      // Add padding for watermark
      const padding = 40;
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height + padding;
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      
      // Draw original content
      ctx.drawImage(canvas, 0, 0);
      
      // Draw watermark at bottom right
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() 
        ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim()})` 
        : '#888888';
      ctx.font = '20px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🐼 UniPandan', finalCanvas.width - 20, finalCanvas.height - 12);
      
      const url = finalCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plan.name.replace(/\s+/g, "_")}.png`;
      a.click();
      toast.success("Exported as PNG");
    } catch {
      toast.error("Failed to export as PNG");
    }
  };

  const handleExportTempCSV = (courses: SemesterPlanCourse[], semesterType: string) => {
    const totalEcts = courses.reduce((sum, c) => sum + (c.ects || 0), 0);
    const headers = ["Name", "Code", "ECTS", "Exam Type", "Level", "Professor", "Topics", "", "Total Ects"];
    const rows = courses.map((c, idx) => [
      c.name_course,
      c.code || "",
      c.ects?.toString() || "",
      c.type_exam || "",
      c.ba_ma || "",
      c.professor_name || "",
      c.topics || "",
      "",
      idx === 0 ? totalEcts.toString() : ""
    ]);
    
    const titleRow = [`Created by UniPandan`, "", "", "", "", "", "", "", ""];
    const emptyRow = ["", "", "", "", "", "", "", "", ""];
    
    const csv = [titleRow.map(cell => `"${cell}"`).join(","), emptyRow.map(cell => `"${cell}"`).join(","), headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${semesterType}_semester_plan.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  };

  const renderCourseCard = (course: SemesterPlanCourse, planId?: string) => {
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
        {planId && (
          <button
            onClick={() => onRemoveCourseFromPlan(planId, course.id_course)}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
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
  };

  const renderPlanCard = (plan: SemesterPlan) => {
    const examCounts = countExamTypes(plan.courses);
    const levelCounts = countLevels(plan.courses);
    const topicSummary = getTopicSummary(plan.courses);
    const elementId = `plan-${plan.id}`;
    
    return (
      <div 
        key={plan.id} 
        id={elementId}
        className={cn(
          "rounded-xl border p-3 space-y-2.5 shadow-sm",
          plan.semester_type === "winter" 
            ? "bg-gradient-to-br from-sky-50 to-blue-50/50 border-sky-200/60 dark:from-sky-950/30 dark:to-blue-950/20 dark:border-sky-800/40" 
            : "bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/60 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-800/40"
        )}
      >
        <div className={cn(
          "flex items-center justify-between rounded-lg px-2.5 py-1.5",
          plan.semester_type === "winter"
            ? "bg-sky-100/70 dark:bg-sky-900/30"
            : "bg-amber-100/70 dark:bg-amber-900/30"
        )}>
          <div className="flex items-center gap-2">
            {plan.semester_type === "winter" ? (
              <Snowflake className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
            {editingPlanId === plan.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-6 text-xs w-32"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                />
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSaveEdit}>
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className="text-xs font-medium truncate max-w-[120px]">{plan.name}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-5 w-5" 
              onClick={() => handleStartEdit(plan)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-5 w-5">
                  <Download className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportCSV(plan)}>
                  <FileJson className="h-3 w-3 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPNG(plan, elementId)}>
                  <Image className="h-3 w-3 mr-2" />
                  Export PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-5 w-5 text-destructive hover:text-destructive" 
              onClick={() => setDeleteConfirmId(plan.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
            {plan.total_ects} ECTS
          </Badge>
          <span>{plan.courses.length} courses</span>
          {examCounts.written > 0 && <span className="text-blue-500">{examCounts.written} Written</span>}
          {examCounts.oral > 0 && <span className="text-green-500">{examCounts.oral} Oral</span>}
          {examCounts.projectMidterm > 0 && <span className="text-orange-500">{examCounts.projectMidterm} Project</span>}
        </div>
        
        {/* Topic Summary */}
        {topicSummary.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {topicSummary.map(({ topic, count }) => (
              <Badge 
                key={topic} 
                variant="outline" 
                className="text-[8px] px-1.5 py-0 bg-primary/5 border-primary/20"
              >
                {topic}{count > 1 ? ` ×${count}` : ''}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Courses */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
          {plan.courses.map((course) => renderCourseCard(course, plan.id))}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
    <div className="w-72 sm:w-80 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-2.5 sm:p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-xs sm:text-sm">Diary</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "planner" | "emails")} className="flex-1 flex flex-col">
        <div className="px-2.5 pt-2">
          <TabsList className="w-full h-8">
            <TabsTrigger value="planner" className="flex-1 text-xs gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Planner
              <ModuleInfoPopup
                title="Semester Planner"
                description="Plan your semester by organizing courses into winter and summer terms. The AI can suggest course combinations based on your interests."
                tips={[
                  "Ask the AI to create a semester plan for you",
                  "Save and export plans as CSV or PNG",
                  "Track ECTS, exam types, and topics"
                ]}
              />
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex-1 text-xs gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Emails
              <ModuleInfoPopup
                title="Email Tracker"
                description="Keep track of your thesis/lab outreach emails. Log when you contacted a lab, whether they replied, and any follow-up actions needed."
                tips={[
                  "Perfect for managing multiple lab applications",
                  "Track status: Draft → Sent → Replied",
                  "Export tracking data as CSV"
                ]}
              />
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Semester Planner Tab */}
        <TabsContent value="planner" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {/* Temp Plan from AI - Show at TOP with NEW badge */}
              {tempPlan && (
                <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300" ref={planCardRef}>
                  {/* NEW Badge */}
                  <div className="flex items-center justify-center">
                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-medium text-xs px-3 py-1 shadow-md animate-pulse">
                      ✨ NEW PLAN
                    </Badge>
                  </div>
                  
                  {/* Plan Title */}
                  {tempPlan.title && (
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {tempPlan.title}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Winter Semester */}
                  {tempPlan.winter.length > 0 && (() => {
                    const winterExams = countExamTypes(tempPlan.winter);
                    const winterTopics = getTopicSummary(tempPlan.winter);
                    return (
                      <div 
                        id="temp-winter-plan"
                        className="rounded-xl border-2 border-dashed p-3 bg-gradient-to-br from-sky-50 to-blue-50/50 border-sky-300/60 dark:from-sky-950/30 dark:to-blue-950/20 dark:border-sky-700/50 shadow-sm"
                      >
                        <div className={cn(
                          "flex items-center justify-between mb-2.5 rounded-lg px-2.5 py-1.5",
                          "bg-sky-100/70 dark:bg-sky-900/30"
                        )}>
                          <div className="flex items-center gap-1.5">
                            <Snowflake className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                            <span className="text-xs font-medium">Winter ({tempPlan.winter.length})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                              {tempPlan.winter.reduce((s, c) => s + (c.ects || 0), 0)} ECTS
                            </Badge>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5 text-muted-foreground hover:text-foreground"
                              onClick={() => handleExportTempCSV(tempPlan.winter, "winter")}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {/* Exam & Topic Summary */}
                        <div className="flex flex-wrap items-center gap-1 text-[9px] text-muted-foreground mb-2">
                          {winterExams.written > 0 && <span className="text-blue-500">{winterExams.written} Written</span>}
                          {winterExams.oral > 0 && <span className="text-green-500">{winterExams.oral} Oral</span>}
                          {winterExams.projectMidterm > 0 && <span className="text-orange-500">{winterExams.projectMidterm} Project</span>}
                        </div>
                        {winterTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {winterTopics.map(({ topic, count }) => (
                              <Badge 
                                key={topic} 
                                variant="outline" 
                                className="text-[8px] px-1.5 py-0 bg-primary/5 border-primary/20"
                              >
                                {topic}{count > 1 ? ` ×${count}` : ''}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="space-y-1.5 scrollbar-thin max-h-48 overflow-y-auto">
                          {tempPlan.winter.map((c) => renderCourseCard(c))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Summer Semester */}
                  {tempPlan.summer.length > 0 && (() => {
                    const summerExams = countExamTypes(tempPlan.summer);
                    const summerTopics = getTopicSummary(tempPlan.summer);
                    return (
                      <div 
                        id="temp-summer-plan"
                        className="rounded-xl border-2 border-dashed p-3 bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-300/60 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-700/50 shadow-sm"
                      >
                        <div className={cn(
                          "flex items-center justify-between mb-2.5 rounded-lg px-2.5 py-1.5",
                          "bg-amber-100/70 dark:bg-amber-900/30"
                        )}>
                          <div className="flex items-center gap-1.5">
                            <Sun className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-medium">Summer ({tempPlan.summer.length})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                              {tempPlan.summer.reduce((s, c) => s + (c.ects || 0), 0)} ECTS
                            </Badge>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5 text-muted-foreground hover:text-foreground"
                              onClick={() => handleExportTempCSV(tempPlan.summer, "summer")}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {/* Exam & Topic Summary */}
                        <div className="flex flex-wrap items-center gap-1 text-[9px] text-muted-foreground mb-2">
                          {summerExams.written > 0 && <span className="text-blue-500">{summerExams.written} Written</span>}
                          {summerExams.oral > 0 && <span className="text-green-500">{summerExams.oral} Oral</span>}
                          {summerExams.projectMidterm > 0 && <span className="text-orange-500">{summerExams.projectMidterm} Project</span>}
                        </div>
                        {summerTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {summerTopics.map(({ topic, count }) => (
                              <Badge 
                                key={topic} 
                                variant="outline" 
                                className="text-[8px] px-1.5 py-0 bg-primary/5 border-primary/20"
                              >
                                {topic}{count > 1 ? ` ×${count}` : ''}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="space-y-1.5 scrollbar-thin max-h-48 overflow-y-auto">
                          {tempPlan.summer.map((c) => renderCourseCard(c))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Save/Clear Actions */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter plan name..."
                      value={savePlanName}
                      onChange={(e) => setSavePlanName(e.target.value)}
                      className="flex-1 h-8 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTempPlan()}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSaveTempPlan}
                      disabled={isSaving || !savePlanName.trim()}
                      className="h-8 px-3 text-xs"
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={onClearTempPlan}
                      className="h-8 px-3 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Saved Plans */}
              {savedPlans.length === 0 && !tempPlan ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <GraduationCap className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-xs font-medium mb-1">No Saved Plans</p>
                  <p className="text-[10px]">
                    Ask pandanAI to generate a semester plan, then save it here
                  </p>
                </div>
              ) : (
                <>
                  {/* Separator if temp plan exists */}
                  {tempPlan && savedPlans.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span>Saved Plans</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  
                  {/* Winter Plans */}
                  {winterPlans.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400 uppercase">
                        <Snowflake className="h-3 w-3" />
                        Winter Semesters ({winterPlans.length})
                      </div>
                      {winterPlans.map(renderPlanCard)}
                    </div>
                  )}
                  
                  {/* Summer Plans */}
                  {summerPlans.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">
                        <Sun className="h-3 w-3" />
                        Summer Semesters ({summerPlans.length})
                      </div>
                      {summerPlans.map(renderPlanCard)}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Email Tracker Tab */}
        <TabsContent value="emails" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <WorkbenchEmailTracker />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Semester Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The plan will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirmId) onDeletePlan(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
};
