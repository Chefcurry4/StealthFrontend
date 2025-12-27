import { useNavigate } from "react-router-dom";
import { Bookmark, Star, Mail, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";
import { useToast } from "@/hooks/use-toast";

interface UserDetailsCardProps {
  courseId: string;
  courseName: string;
  onOpenReview: () => void;
}

export const UserDetailsCard = ({ courseId, courseName, onOpenReview }: UserDetailsCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: savedCourses } = useSavedCourses();
  const toggleSave = useToggleSaveCourse();

  const isSaved = savedCourses?.some((saved: any) => saved.course_id === courseId);

  const handleToggleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleSave.mutate(courseId);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Course link copied to clipboard",
    });
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Course: ${courseName}`);
    const body = encodeURIComponent(`Check out this course:\n\n${courseName}\n\n${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // If not logged in, show CTA
  if (!user) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-primary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center space-y-6">
          <p className="text-base text-muted-foreground text-center">
            Sign in to save courses, write reviews, and more.
          </p>
          <Button className="w-full" size="lg" onClick={() => navigate("/auth")}>
            Sign in to get started
          </Button>
          
          <Separator />
          
          {/* Share Options available to everyone */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold text-center">Share this course</p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleSendEmail}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleCopyLink}
              >
                <Link2 className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-6">
        {/* Action Buttons */}
        <div className="space-y-3 flex-1">
          <Button 
            className="w-full justify-start gap-3 h-14 text-base" 
            variant={isSaved ? "secondary" : "default"}
            onClick={handleToggleSave}
            disabled={toggleSave.isPending}
            aria-label={isSaved ? "Remove from saved courses" : "Save course"}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved to Collection' : 'Save to Collection'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-14 text-base"
            onClick={onOpenReview}
            aria-label="Write a review"
          >
            <Star className="h-5 w-5 text-yellow-500" />
            Write a Review
          </Button>
        </div>

        <Separator />

        {/* Share Options */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Share</p>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleSendEmail}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleCopyLink}
            >
              <Link2 className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
