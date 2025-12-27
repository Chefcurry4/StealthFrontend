import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Star, Mail, Link2, ListPlus, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";
import { useCourseNotes, useUpdateCourseNotes } from "@/hooks/useCourseNotes";
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
  const { data: courseNotes } = useCourseNotes(courseId);
  const toggleSave = useToggleSaveCourse();
  const updateNotes = useUpdateCourseNotes();
  
  const [notes, setNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const isSaved = savedCourses?.some((saved: any) => saved.course_id === courseId);

  useEffect(() => {
    if (courseNotes?.note) {
      setNotes(courseNotes.note);
    }
  }, [courseNotes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== (courseNotes?.note || ""));
  };

  const handleSaveNotes = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    updateNotes.mutate({ courseId, note: notes }, {
      onSuccess: () => setHasChanges(false)
    });
  };

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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Your Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in to save personal notes, bookmark courses, and write reviews.
          </p>
          <Button className="w-full" onClick={() => navigate("/auth")}>
            Sign in to get started
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Your Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm text-muted-foreground">
            My notes / what to know
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add your personal notes about this course..."
            rows={4}
            className="resize-none"
          />
          {hasChanges && (
            <Button 
              size="sm" 
              onClick={handleSaveNotes}
              disabled={updateNotes.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Notes
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Saved changes sync to your profile.
          </p>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full justify-start gap-2" 
            variant={isSaved ? "secondary" : "default"}
            onClick={handleToggleSave}
            disabled={toggleSave.isPending}
            aria-label={isSaved ? "Remove from saved courses" : "Save course"}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved to Collection' : 'Save to Collection'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={onOpenReview}
            aria-label="Write a review"
          >
            <Star className="h-4 w-4" />
            Write a Review
          </Button>
        </div>

        <Separator />

        {/* Share Options */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Share</p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleSendEmail}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
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
