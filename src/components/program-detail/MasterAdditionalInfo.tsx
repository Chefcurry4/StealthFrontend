import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface MasterAdditionalInfoProps {
  suggestedMinors: string[];
  creditDistribution: { category_name: string; credits: number }[];
}

export const MasterAdditionalInfo = ({
  suggestedMinors,
  creditDistribution,
}: MasterAdditionalInfoProps) => {
  const hasMinors = suggestedMinors && suggestedMinors.length > 0;
  
  // Check if there's an internship component
  const internshipCategory = creditDistribution.find(
    (c) => 
      c.category_name.toLowerCase().includes("internship") ||
      c.category_name.toLowerCase().includes("industry")
  );

  // Check for thesis
  const thesisCategory = creditDistribution.find(
    (c) => c.category_name.toLowerCase().includes("thesis")
  );

  // Check for projects
  const projectCategory = creditDistribution.find(
    (c) => 
      c.category_name.toLowerCase().includes("project") &&
      !c.category_name.toLowerCase().includes("thesis")
  );

  if (!internshipCategory && !thesisCategory && !hasMinors && !projectCategory) return null;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {thesisCategory && (
            <div>
              <h3 className="font-semibold mb-2">{thesisCategory.category_name}</h3>
              <p className="text-sm text-muted-foreground">
                {thesisCategory.credits} ECTS - Complete an original research project in your chosen
                specialization
              </p>
            </div>
          )}
          
          {internshipCategory && (
            <div>
              <h3 className="font-semibold mb-2">Industrial Internship</h3>
              <p className="text-sm text-muted-foreground">
                {internshipCategory.credits} ECTS - Gain practical experience in industry or research
              </p>
            </div>
          )}

          {projectCategory && (
            <div>
              <h3 className="font-semibold mb-2">{projectCategory.category_name}</h3>
              <p className="text-sm text-muted-foreground">
                {projectCategory.credits} ECTS - Apply your knowledge in practical projects
              </p>
            </div>
          )}
          
          {hasMinors && (
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Recommended Minors</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedMinors.map((minor) => (
                  <Badge key={minor} variant="outline">
                    {minor}
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
