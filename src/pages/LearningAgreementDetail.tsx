import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileCheck, Construction } from "lucide-react";

const LearningAgreementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate("/profile")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Construction className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Learning Agreements</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground max-w-md mx-auto">
              This feature is coming soon! You'll be able to create, manage, and export 
              your learning agreements directly from this page.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <FileCheck className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningAgreementDetail;
