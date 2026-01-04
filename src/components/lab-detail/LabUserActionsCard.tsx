import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bookmark, Share2, Copy, Mail, AlertTriangle, Star, ExternalLink, Beaker, FlaskConical, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedLabs, useToggleSaveLab } from "@/hooks/useSavedItems";
import { toast } from "sonner";

interface LabUserActionsCardProps {
  labId: string;
  labName: string;
  labLink?: string | null;
  onOpenReview: () => void;
  reviewSummary?: {
    avgResearchQuality: string | null;
    avgMentorship: string | null;
    avgWorkEnvironment: string | null;
    totalReviews: number;
  };
}

export const LabUserActionsCard = ({
  labId,
  labName,
  labLink,
  onOpenReview,
  reviewSummary,
}: LabUserActionsCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: savedLabs } = useSavedLabs();
  const toggleSave = useToggleSaveLab();
  
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const isSaved = savedLabs?.some((saved: any) => saved.lab_id === labId);

  const handleToggleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleSave.mutate(labId);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Check out this lab: ${labName}`);
    const body = encodeURIComponent(`I found this interesting research lab:\n\n${labName}\n\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleReportMistake = () => {
    if (!reportType) {
      toast.error("Please select a category");
      return;
    }
    const subject = encodeURIComponent(`Lab Mistake Report: ${labName}`);
    const body = encodeURIComponent(
      `Lab: ${labName}\nCategory: ${reportType}\n\nDescription:\n${reportDescription}\n\nURL: ${window.location.href}`
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
    setReportOpen(false);
    setReportType("");
    setReportDescription("");
    toast.success("Report prepared in your email client");
  };

  const getQualityColor = (value: string | null) => {
    if (!value) return "text-muted-foreground";
    if (value === "Excellent") return "text-green-500";
    if (value === "Good") return "text-blue-500";
    if (value === "Fair") return "text-yellow-500";
    return "text-red-500";
  };

  // Not logged in view
  if (!user) {
    return (
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4 px-2 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to save labs and write reviews
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Sign In
            </Button>
          </div>

          {reviewSummary && reviewSummary.totalReviews > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  Review Summary
                </h4>
                <div className="space-y-2 text-sm">
                  {reviewSummary.avgResearchQuality && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Research Quality</span>
                      <span className={`font-medium ${getQualityColor(reviewSummary.avgResearchQuality)}`}>
                        {reviewSummary.avgResearchQuality}
                      </span>
                    </div>
                  )}
                  {reviewSummary.avgMentorship && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mentorship</span>
                      <span className={`font-medium ${getQualityColor(reviewSummary.avgMentorship)}`}>
                        {reviewSummary.avgMentorship}
                      </span>
                    </div>
                  )}
                  {reviewSummary.avgWorkEnvironment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Work Environment</span>
                      <span className={`font-medium ${getQualityColor(reviewSummary.avgWorkEnvironment)}`}>
                        {reviewSummary.avgWorkEnvironment}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Lab Website */}
          {labLink && (
            <a
              href={labLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Lab Website
            </a>
          )}

          {/* Share Options */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Share</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1">
                <Copy className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail} className="flex-1">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Logged in view
  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save & Review */}
        <div className="space-y-2">
          <Button 
            className="w-full justify-start gap-2.5 h-11 text-sm" 
            variant={isSaved ? "secondary" : "default"}
            onClick={handleToggleSave}
            disabled={toggleSave.isPending}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved to Collection' : 'Save to Collection'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2.5 h-11 text-sm"
            onClick={onOpenReview}
          >
            <Star className="h-4 w-4 text-yellow-500" />
            Write a Review
          </Button>
        </div>

        {/* Review Summary */}
        {reviewSummary && reviewSummary.totalReviews > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Review Summary
                <Badge variant="secondary" className="ml-auto text-xs">
                  {reviewSummary.totalReviews} review{reviewSummary.totalReviews !== 1 && 's'}
                </Badge>
              </h4>
              <div className="space-y-2 text-sm">
                {reviewSummary.avgResearchQuality && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Research Quality</span>
                    <span className={`font-medium ${getQualityColor(reviewSummary.avgResearchQuality)}`}>
                      {reviewSummary.avgResearchQuality}
                    </span>
                  </div>
                )}
                {reviewSummary.avgMentorship && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mentorship</span>
                    <span className={`font-medium ${getQualityColor(reviewSummary.avgMentorship)}`}>
                      {reviewSummary.avgMentorship}
                    </span>
                  </div>
                )}
                {reviewSummary.avgWorkEnvironment && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work Environment</span>
                    <span className={`font-medium ${getQualityColor(reviewSummary.avgWorkEnvironment)}`}>
                      {reviewSummary.avgWorkEnvironment}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Lab Website */}
        {labLink && (
          <a
            href={labLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Lab Website
          </a>
        )}

        {/* Share Options */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Share</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1">
              <Copy className="h-4 w-4 mr-1" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendEmail} className="flex-1">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
          </div>
        </div>

        <Separator />

        {/* Report a Mistake */}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report a Mistake</DialogTitle>
              <DialogDescription>
                Help us improve by reporting any inaccuracies about this lab.
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
                    <SelectItem value="description">Description</SelectItem>
                    <SelectItem value="researchers">Researchers</SelectItem>
                    <SelectItem value="topics">Research Topics</SelectItem>
                    <SelectItem value="website">Website Link</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the issue..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReportMistake}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};