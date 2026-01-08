import { Link } from "react-router-dom";
import { Mail, Award, BookOpen, GraduationCap, Copy, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTeacher, useTeacherCourses } from "@/hooks/useTeachers";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { toast } from "sonner";
import { useState } from "react";

interface TeacherPopupProps {
  teacherId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeacherPopup = ({ teacherId, open, onOpenChange }: TeacherPopupProps) => {
  const { data: teacher, isLoading } = useTeacher(teacherId || "");
  const { data: courses, isLoading: coursesLoading } = useTeacherCourses(teacherId || "");
  const { modeConfig } = useBackgroundTheme();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    if (teacher?.email) {
      try {
        await navigator.clipboard.writeText(teacher.email);
        setCopiedEmail(true);
        toast.success("Email copied to clipboard");
        setTimeout(() => setCopiedEmail(false), 2000);
      } catch {
        toast.error("Failed to copy email");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg max-h-[85vh] overflow-hidden shadow-xl backdrop-blur-md"
        style={{
          background: `${modeConfig.ui.cardBackground}f5`,
          borderColor: modeConfig.ui.cardBorder,
          color: modeConfig.textColor,
        }}
      >
        {isLoading ? (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : teacher ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div 
                  className="h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${modeConfig.ui.buttonPrimary}20` }}
                >
                  <GraduationCap className="h-8 w-8" style={{ color: modeConfig.ui.buttonPrimary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-bold mb-1" style={{ color: modeConfig.textColor }}>
                    {teacher.full_name || teacher.name}
                  </DialogTitle>
                  {teacher.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 opacity-60 flex-shrink-0" />
                      <span className="text-sm opacity-80 truncate">{teacher.email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={handleCopyEmail}
                      >
                        {copiedEmail ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-60" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-4">
                {/* Academic Metrics */}
                {(teacher["h-index"] || teacher.citations) && (
                  <div className="flex gap-3">
                    {teacher["h-index"] && (
                      <div 
                        className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1"
                        style={{ background: modeConfig.ui.buttonSecondary }}
                      >
                        <Award className="h-4 w-4" style={{ color: modeConfig.ui.buttonPrimary }} />
                        <div>
                          <div className="text-lg font-bold">{teacher["h-index"]}</div>
                          <div className="text-xs opacity-60">h-index</div>
                        </div>
                      </div>
                    )}
                    {teacher.citations && (
                      <div 
                        className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1"
                        style={{ background: modeConfig.ui.buttonSecondary }}
                      >
                        <BookOpen className="h-4 w-4" style={{ color: modeConfig.ui.buttonPrimary }} />
                        <div>
                          <div className="text-lg font-bold">{teacher.citations}</div>
                          <div className="text-xs opacity-60">Citations</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Research Topics */}
                {teacher.topics && teacher.topics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 opacity-70">Research Topics</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.topics.slice(0, 8).map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {teacher.topics.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{teacher.topics.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Courses Taught */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 opacity-70">
                    Courses Taught ({courses?.length || 0})
                  </h4>
                  {coursesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : courses && courses.length > 0 ? (
                    <div className="space-y-2">
                      {courses.slice(0, 5).map((course: any) => (
                        <Link
                          key={course.id_course}
                          to={`/courses/${course.id_course}`}
                          onClick={() => onOpenChange(false)}
                          className="block p-3 rounded-lg border transition-colors hover:bg-primary/5"
                          style={{ borderColor: modeConfig.ui.cardBorder }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {course.code && (
                              <Badge variant="secondary" className="text-xs">
                                {course.code}
                              </Badge>
                            )}
                            {course.ects && (
                              <span className="text-xs opacity-60">{course.ects} ECTS</span>
                            )}
                          </div>
                          <div className="font-medium text-sm">{course.name_course}</div>
                        </Link>
                      ))}
                      {courses.length > 5 && (
                        <Link
                          to={`/teachers/${teacherId}`}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center justify-center gap-1 p-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                        >
                          View all {courses.length} courses
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm opacity-60">No courses found</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="p-4 text-center opacity-60">
            Teacher not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
