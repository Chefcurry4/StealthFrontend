import { GraduationCap, BookOpen, Users, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UniversityStatsSectionProps {
  programsCount: number;
  coursesCount: number;
  bachelorCourses?: number;
  masterCourses?: number;
  universityName?: string;
  // Extended stats from database
  studentCount?: number | null;
  endowment?: string | null;
  campusArea?: string | null;
}

export const UniversityStatsSection = ({
  programsCount,
  coursesCount,
  bachelorCourses = 0,
  masterCourses = 0,
  universityName = "This university",
  studentCount,
  endowment,
  campusArea,
}: UniversityStatsSectionProps) => {
  const stats = [
    {
      label: "Programs",
      value: programsCount,
      icon: GraduationCap,
    },
    {
      label: "Courses",
      value: coursesCount,
      icon: BookOpen,
      subtitle: coursesCount > 0 ? `Ba: ${bachelorCourses} • Ma: ${masterCourses}` : null,
    },
    {
      label: "Students",
      value: studentCount ? studentCount.toLocaleString() : "N/A",
      icon: Users,
    },
    {
      label: "Endowment",
      value: endowment || "N/A",
      icon: DollarSign,
    },
    {
      label: "Campus Area",
      value: campusArea || "N/A",
      icon: MapPin,
    },
  ];

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-lg font-semibold uppercase tracking-wide text-muted-foreground mb-6">
        University Stats
      </h2>

      {/* Modern Stats Layout */}
      <div className="space-y-6">
        {/* Key Numbers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center bg-muted/30">
              <CardContent className="pt-6 pb-4">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
                {stat.subtitle && (
                  <div className="text-xs text-muted-foreground/70 mt-0.5">
                    {stat.subtitle}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contextual Sentences */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-primary">{universityName}</span>{" "}
                offers a comprehensive academic portfolio with{" "}
                <span className="font-medium">{programsCount} exchange programs</span>{" "}
                across various disciplines. With a strong emphasis on research and innovation,
                the university provides excellent opportunities for international students.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed">
                The institution boasts a vibrant campus life with state-of-the-art facilities
                spread across{" "}
                <span className="font-medium">{campusArea || "136 acres"}</span>.
                Students benefit from world-class laboratories, libraries, and collaboration
                spaces that foster academic excellence and innovation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Academic Breakdown Bar */}
        {coursesCount > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Course Distribution</span>
                <span className="text-xs text-muted-foreground">
                  {coursesCount} total courses
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="bg-primary h-full transition-all"
                  style={{
                    width: `${coursesCount > 0 ? (bachelorCourses / coursesCount) * 100 : 50}%`,
                  }}
                />
                <div
                  className="bg-primary/50 h-full transition-all"
                  style={{
                    width: `${coursesCount > 0 ? (masterCourses / coursesCount) * 100 : 50}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Bachelor: {bachelorCourses}</span>
                <span>Master: {masterCourses}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
