import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramSpecialization } from "@/hooks/useProgramStructure";

interface ProgramSpecializationsProps {
  specializations: ProgramSpecialization[];
}

export const ProgramSpecializations = ({ specializations }: ProgramSpecializationsProps) => {
  if (!specializations || specializations.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5" />
          Specializations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {specializations.map((spec) => (
            <div key={spec.id} className="flex items-center gap-2">
              <Badge className={`${spec.color} text-white`}>{spec.code}</Badge>
              <span className="text-sm">{spec.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
