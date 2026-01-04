import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beaker, Users, Tag } from "lucide-react";
import { TeacherLink } from "@/components/TeacherLink";
import { TopicDescriptionPopup } from "@/components/TopicDescriptionPopup";

interface Lab {
  id_lab: string;
  name: string;
  description: string | null;
  topics: string | null;
  faculty_match: string | null;
  professors: string | null;
  link: string | null;
}

interface LabInfoCardProps {
  lab: Lab;
}

export const LabInfoCard = ({ lab }: LabInfoCardProps) => {
  const topics = lab.topics?.split(',').map(t => t.trim()).filter(Boolean) || [];
  const professors = lab.professors?.split(',').map(p => p.trim()).filter(Boolean) || [];

  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          About the Lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        {lab.description && (
          <div>
            <p className="text-muted-foreground leading-relaxed">{lab.description}</p>
          </div>
        )}

        {/* Faculty Match */}
        {lab.faculty_match && (
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Faculty Area
            </h3>
            <div className="flex flex-wrap gap-2">
              {lab.faculty_match.split(',').map((faculty, idx) => (
                <Badge key={idx} variant="secondary">{faculty.trim()}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Research Topics */}
        {topics.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Research Areas
              <span className="text-xs text-muted-foreground font-normal">(click for description)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, idx) => (
                <TopicDescriptionPopup
                  key={idx}
                  topicName={topic}
                  variant="badge"
                />
              ))}
            </div>
          </div>
        )}

        {/* Principal Investigators */}
        {professors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Principal Investigators
            </h3>
            <div className="flex flex-wrap gap-2">
              {professors.map((prof, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                >
                  <Users className="h-4 w-4" />
                  <TeacherLink teacherName={prof} />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};