import { Link } from "react-router-dom";
import { useLearningAgreements } from "@/hooks/useLearningAgreements";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Plus } from "lucide-react";
import { Loader } from "@/components/Loader";
import { formatDistanceToNow } from "date-fns";

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "submitted":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  }
};

export const WorkbenchLearningAgreements = () => {
  const { data: agreements, isLoading } = useLearningAgreements();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Learning Agreements</h3>
        <Badge variant="secondary">{agreements?.length || 0} agreements</Badge>
      </div>

      <Button asChild className="w-full">
        <Link to="/learning-agreements/new">
          <Plus className="h-4 w-4 mr-2" />
          Create New Agreement
        </Link>
      </Button>

      {agreements?.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No learning agreements yet</p>
      ) : (
        <div className="grid gap-3">
          {agreements?.map((agreement: any) => (
            <Card key={agreement.id} className="bg-card/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">
                      {agreement.title || `${agreement.agreement_type} Agreement`}
                    </h4>
                    <Badge className={getStatusColor(agreement.status)}>
                      {agreement.status || "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {agreement.university?.name || "No university"} • 
                    Updated {formatDistanceToNow(new Date(agreement.updated_at), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/learning-agreements/${agreement.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
