import { GraduationCap, BookOpen, Microscope, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UniversityStatsSectionProps {
  programsCount: number;
  coursesCount: number;
  labsCount: number;
  facultyCount: number;
  bachelorCourses?: number;
  masterCourses?: number;
}

export const UniversityStatsSection = ({ 
  programsCount, 
  coursesCount, 
  labsCount, 
  facultyCount,
  bachelorCourses = 0,
  masterCourses = 0
}: UniversityStatsSectionProps) => {
  const stats = [
    {
      label: "Programs",
      value: programsCount,
      icon: GraduationCap,
      subtitle: null,
    },
    {
      label: "Courses",
      value: coursesCount,
      icon: BookOpen,
      subtitle: `Ba: ${bachelorCourses} • Ma: ${masterCourses}`,
    },
    {
      label: "Research Labs",
      value: labsCount,
      icon: Microscope,
      subtitle: null,
    },
    {
      label: "Faculty",
      value: facultyCount,
      icon: Users,
      subtitle: null,
    },
  ];

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-lg font-semibold uppercase tracking-wide text-muted-foreground mb-6">
        University Stats
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-6">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs text-muted-foreground mt-1">{stat.subtitle}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
