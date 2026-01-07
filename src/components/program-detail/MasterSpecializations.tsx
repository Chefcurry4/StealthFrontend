import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MasterSpecializationsProps {
  specializations: string[];
}

// Color palette for specialization badges
const specializationColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-cyan-500",
  "bg-amber-500",
];

export const MasterSpecializations = ({ specializations }: MasterSpecializationsProps) => {
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
        <div className="flex flex-wrap gap-3">
          {specializations.map((spec, idx) => {
            const color = specializationColors[idx % specializationColors.length];
            const shortCode = spec
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 3)
              .toUpperCase();
            
            return (
              <div key={spec} className="flex items-center gap-2">
                <Badge className={`${color} text-white`}>{shortCode}</Badge>
                <span className="text-sm">{spec}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
