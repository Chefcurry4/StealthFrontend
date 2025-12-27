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

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
  
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this course: ${courseName}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
            <div className="grid grid-cols-3 gap-2">
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
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleShareWhatsApp}
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                WhatsApp
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

        {/* Review Summary */}
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

        {/* Share Options */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Share</p>
          <div className="grid grid-cols-3 gap-2">
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
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleShareWhatsApp}
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              WhatsApp
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
