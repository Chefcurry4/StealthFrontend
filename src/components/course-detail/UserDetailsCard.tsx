import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Star, Mail, Link2, AlertTriangle, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";
import { useToast } from "@/hooks/use-toast";

interface UserDetailsCardProps {
  courseId: string;
  courseName: string;
  courseCode?: string;
  onOpenReview: () => void;
  reviewSummary?: {
    avgDifficulty: string | null;
    avgWorkload: string | null;
    avgOrganization: string | null;
    totalReviews: number;
  };
}

export const UserDetailsCard = ({ 
  courseId, 
  courseName, 
  courseCode,
  onOpenReview,
  reviewSummary 
}: UserDetailsCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: savedCourses } = useSavedCourses();
  const toggleSave = useToggleSaveCourse();
  
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

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

  const handleReportMistake = async () => {
    if (!reportType || !reportDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a category and provide a description",
        variant: "destructive",
      });
      return;
    }

    setReportSubmitting(true);
    
    // Create mailto link to send report
    const subject = encodeURIComponent(`[Course Mistake Report] ${courseName} (${courseCode || courseId})`);
    const body = encodeURIComponent(
      `Course: ${courseName}\n` +
      `Code: ${courseCode || 'N/A'}\n` +
      `URL: ${window.location.href}\n\n` +
      `Category: ${reportType}\n\n` +
      `Description:\n${reportDescription}`
    );
    
    window.open(`mailto:massimoperfetti4@gmail.com?subject=${subject}&body=${body}`);
    
    setReportSubmitting(false);
    setReportOpen(false);
    setReportType("");
    setReportDescription("");
    
    toast({
      title: "Report prepared",
      description: "Your email client should open with the report. Thank you for helping us improve!",
    });
  };

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return "text-muted-foreground";
    const lower = difficulty.toLowerCase();
    if (lower.includes("easy")) return "text-green-500";
    if (lower.includes("medium")) return "text-yellow-500";
    if (lower.includes("difficult") || lower.includes("hard")) return "text-orange-500";
    if (lower.includes("very")) return "text-red-500";
    return "text-muted-foreground";
  };

  const getWorkloadColor = (workload: string | null) => {
    if (!workload) return "text-muted-foreground";
    const lower = workload.toLowerCase();
    if (lower.includes("light")) return "text-green-500";
    if (lower.includes("moderate")) return "text-yellow-500";
    if (lower.includes("heavy")) return "text-red-500";
    return "text-muted-foreground";
  };

  const getOrganizationColor = (organization: string | null) => {
    if (!organization) return "text-muted-foreground";
    const lower = organization.toLowerCase();
    if (lower.includes("great")) return "text-green-500";
    if (lower.includes("good")) return "text-emerald-400";
    if (lower.includes("fair")) return "text-yellow-500";
    if (lower.includes("poor")) return "text-red-500";
    return "text-muted-foreground";
  };

  // If not logged in, show CTA
  if (!user) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-primary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Sign in to save courses, write reviews, and more.
          </p>
          <Button className="w-full" size="default" onClick={() => navigate("/auth")}>
            Sign in to get started
          </Button>
          
          {/* Review Summary for non-logged users */}
          {reviewSummary && reviewSummary.totalReviews > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Review Summary</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className={`text-sm font-semibold ${getDifficultyColor(reviewSummary.avgDifficulty)}`}>
                      {reviewSummary.avgDifficulty || "N/A"}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Workload</p>
                    <p className={`text-sm font-semibold ${getWorkloadColor(reviewSummary.avgWorkload)}`}>
                      {reviewSummary.avgWorkload || "N/A"}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Organization</p>
                    <p className={`text-sm font-semibold ${getOrganizationColor(reviewSummary.avgOrganization)}`}>
                      {reviewSummary.avgOrganization || "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Based on {reviewSummary.totalReviews} review{reviewSummary.totalReviews !== 1 && "s"}
                </p>
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Share Options available to everyone */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold text-center">Share this course</p>
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1.5"
                onClick={handleSendEmail}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1.5"
                onClick={handleCopyLink}
              >
                <Link2 className="h-3.5 w-3.5" />
                Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full justify-start gap-2.5 h-11 text-sm" 
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
            className="w-full justify-start gap-2.5 h-11 text-sm"
            onClick={onOpenReview}
            aria-label="Write a review"
          >
            <Star className="h-4 w-4 text-yellow-500" />
            Write a Review
          </Button>
        </div>

        <Separator />

        {/* Review Summary - Always shown */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">📊 User Review Summary</p>
          {reviewSummary && reviewSummary.totalReviews > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Difficulty</p>
                  <p className={`text-sm font-semibold ${getDifficultyColor(reviewSummary.avgDifficulty)}`}>
                    {reviewSummary.avgDifficulty || "N/A"}
                  </p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Workload</p>
                  <p className={`text-sm font-semibold ${getWorkloadColor(reviewSummary.avgWorkload)}`}>
                    {reviewSummary.avgWorkload || "N/A"}
                  </p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Organization</p>
                  <p className={`text-sm font-semibold ${getOrganizationColor(reviewSummary.avgOrganization)}`}>
                    {reviewSummary.avgOrganization || "N/A"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Based on {reviewSummary.totalReviews} review{reviewSummary.totalReviews !== 1 && "s"}
              </p>
            </>
          ) : (
            <div className="text-center py-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This course has no reviews yet.
              </p>
              <p className="text-sm text-primary font-medium mt-1">
                Be the first one to review the course! 🌟
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Share Options */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Share</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5"
              onClick={handleSendEmail}
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5"
              onClick={handleCopyLink}
            >
              <Link2 className="h-3.5 w-3.5" />
              Link
            </Button>
          </div>
        </div>

        <Separator />

        {/* Report Mistake */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Report a Mistake
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Report a Mistake
              </DialogTitle>
              <DialogDescription>
                Help us improve by reporting any incorrect information about this course.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wrong-info">Wrong Information</SelectItem>
                    <SelectItem value="outdated">Outdated Content</SelectItem>
                    <SelectItem value="missing">Missing Information</SelectItem>
                    <SelectItem value="wrong-teacher">Wrong Teacher</SelectItem>
                    <SelectItem value="wrong-ects">Wrong ECTS</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please describe the mistake you found..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReportMistake}
                disabled={reportSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
