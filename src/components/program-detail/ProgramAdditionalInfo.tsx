import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgramMinor } from "@/hooks/useProgramStructure";

interface ProgramAdditionalInfoProps {
  internshipNote?: string | null;
  minors: ProgramMinor[];
}

export const ProgramAdditionalInfo = ({
  internshipNote,
  minors,
}: ProgramAdditionalInfoProps) => {
  const hasMinors = minors && minors.length > 0;
  
  if (!internshipNote && !hasMinors) return null;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Master's Thesis</h3>
            <p className="text-sm text-muted-foreground">
              30 ECTS - Complete an original research project in your chosen
              specialization
            </p>
          </div>
          {internshipNote && (
            <div>
              <h3 className="font-semibold mb-2">Internship</h3>
              <p className="text-sm text-muted-foreground">{internshipNote}</p>
            </div>
          )}
          {hasMinors && (
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Recommended Minors</h3>
              <div className="flex flex-wrap gap-2">
                {minors.map((minor) => (
                  <Badge key={minor.id} variant="outline">
                    {minor.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
