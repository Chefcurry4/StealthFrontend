import { Link } from "react-router-dom";
import { User, Wrench, Info, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherLink } from "@/components/TeacherLink";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Course } from "@/hooks/useCourses";

interface CourseInfoCardProps {
  course: Course;
}

export const CourseInfoCard = ({ course }: CourseInfoCardProps) => {
  const topics = course.topics?.split(',').map(t => t.trim()).filter(Boolean) || [];
  
  const getExamTypeExplanation = (examType: string | null) => {
    if (!examType) return null;
    const lowerType = examType.toLowerCase();
    if (lowerType.includes('oral')) {
      return "Oral examination: A face-to-face assessment where you answer questions verbally.";
    }
    if (lowerType.includes('written')) {
      return "Written examination: A traditional pen-and-paper or digital exam with questions to answer in writing.";
    }
    if (lowerType.includes('during') || lowerType.includes('semester')) {
      return "During the semester: Assessment includes midterms, projects, or continuous evaluation throughout the course.";
    }
    return null;
  };

  const examExplanation = getExamTypeExplanation(course.type_exam);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-primary">Course Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description Section */}
        <div>
          <h3 className="font-semibold text-base text-primary mb-2 uppercase tracking-wide">
            📝 Description
          </h3>
          {course.description ? (
            <p className="text-sm leading-relaxed">{course.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Course description is not available yet.
            </p>
          )}
        </div>

        {/* Schedule/Term/Language/ECTS Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-primary uppercase tracking-wide">Term</h4>
            <p className="text-sm font-medium">
              {course.term || <span className="text-muted-foreground italic">Not specified</span>}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-primary uppercase tracking-wide">Language</h4>
            <p className="text-sm font-medium">
              {course.language || <span className="text-muted-foreground italic">Not specified</span>}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-primary uppercase tracking-wide">Level</h4>
            <p className="text-sm font-medium">
              {course.ba_ma === "Ma" ? "Master" : course.ba_ma === "Ba" ? "Bachelor" : course.ba_ma || <span className="text-muted-foreground italic">Not specified</span>}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-primary uppercase tracking-wide">ECTS</h4>
            <p className="text-sm font-medium">
              {course.ects ? `${course.ects} credits` : <span className="text-muted-foreground italic">Not specified</span>}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-primary uppercase tracking-wide">Year of Study</h4>
            <p className="text-sm font-medium">
              {course.which_year || <span className="text-muted-foreground italic">Not specified</span>}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-primary uppercase tracking-wide">Type</h4>
            <p className="text-sm font-medium">
              {course.mandatory_optional || <span className="text-muted-foreground italic">Not specified</span>}
            </p>
          </div>
        </div>

        {/* Examination Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-base text-primary uppercase tracking-wide">
              📋 Examination
            </h3>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs p-4">
                  <div className="space-y-3 text-sm">
                    <p className="font-semibold">Exam Types:</p>
                    <div className="space-y-2">
                      <p><span className="font-medium text-primary">Oral:</span> Face-to-face verbal assessment</p>
                      <p><span className="font-medium text-primary">Written:</span> Traditional pen-and-paper or digital exam</p>
                      <p><span className="font-medium text-primary">During semester:</span> Includes midterms, projects, or continuous evaluation</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {course.type_exam ? (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1.5 font-medium">
                {course.type_exam}
              </Badge>
              {examExplanation && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {examExplanation}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Examination details are not available yet.
            </p>
          )}
        </div>

        {/* Topics Section */}
        <div>
          <h3 className="font-semibold text-base text-primary mb-3 uppercase tracking-wide">
            🏷️ Topics
          </h3>
          {topics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, idx) => (
                <Link 
                  key={idx}
                  to={`/courses?search=${encodeURIComponent(topic)}`}
                  className="inline-block"
                >
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-xs px-2.5 py-1"
                  >
                    {topic}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Topic information is not available yet.
            </p>
          )}
        </div>

        {/* Software & Equipment */}
        <div>
          <h3 className="font-semibold text-base text-primary mb-2 uppercase tracking-wide">
            🔧 Software & Equipment
          </h3>
          {course.software_equipment ? (
            <p className="text-sm leading-relaxed">{course.software_equipment}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Software & equipment information is not available yet.
            </p>
          )}
        </div>

        {/* Teachers Section */}
        <div>
          <h3 className="font-semibold text-base text-primary mb-3 uppercase tracking-wide">
            👨‍🏫 Teaching Staff
          </h3>
          {course.professor_name ? (
            <div className="space-y-2">
              {course.professor_name.split(';').map((name, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <TeacherLink teacherName={name.trim()} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Teaching staff information is not available yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
