import { Link } from "react-router-dom";
import { User, Wrench, Mail, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeacherLink } from "@/components/TeacherLink";
import { Course } from "@/hooks/useCourses";

interface CourseInfoCardProps {
  course: Course;
}

export const CourseInfoCard = ({ course }: CourseInfoCardProps) => {
  const topics = course.topics?.split(',').map(t => t.trim()).filter(Boolean) || [];
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Course Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description Section */}
        {course.description && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">
              Description
            </h3>
            <p className="text-sm leading-relaxed">{course.description}</p>
          </div>
        )}

        {/* Schedule/Term/Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {course.term && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Term</h4>
              <p className="text-sm">{course.term}</p>
            </div>
          )}
          {course.language && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Language</h4>
              <p className="text-sm">{course.language}</p>
            </div>
          )}
          {course.ba_ma && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Level</h4>
              <p className="text-sm">{course.ba_ma === "Ma" ? "Master" : course.ba_ma === "Ba" ? "Bachelor" : course.ba_ma}</p>
            </div>
          )}
          {course.which_year && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Year of Study</h4>
              <p className="text-sm">{course.which_year}</p>
            </div>
          )}
          {course.mandatory_optional && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
              <p className="text-sm">{course.mandatory_optional}</p>
            </div>
          )}
        </div>

        {/* Examination Section */}
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">
            Examination
          </h3>
          {course.type_exam ? (
            <p className="text-sm">{course.type_exam}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Examination details not available</p>
          )}
        </div>

        {/* Topics Section */}
        {topics.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, idx) => (
                <Link 
                  key={idx}
                  to={`/courses?search=${encodeURIComponent(topic)}`}
                  className="inline-block"
                >
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    {topic}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Software & Equipment */}
        {course.software_equipment && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Software & Equipment
            </h3>
            <p className="text-sm">{course.software_equipment}</p>
          </div>
        )}

        {/* Teachers Section */}
        {course.professor_name && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
              Teaching Staff
            </h3>
            <div className="space-y-2">
              {course.professor_name.split(';').map((name, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <TeacherLink teacherName={name.trim()} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
