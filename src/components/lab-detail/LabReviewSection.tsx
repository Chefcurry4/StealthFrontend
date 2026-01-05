import { useState, forwardRef, useImperativeHandle } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Pencil, Trash2, ThumbsUp, ArrowUpDown, Info, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useLabReviews, useCreateLabReview, useUpdateLabReview, useDeleteLabReview, useToggleLabReviewUpvote } from "@/hooks/useLabReviews";
import { format } from "date-fns";

interface LabReviewSectionProps {
  labId: string;
}

export interface LabReviewSectionHandle {
  scrollToForm: () => void;
}

const StarRating = ({ 
  rating, 
  size = "sm",
  interactive = false,
  onRatingChange,
}: { 
  rating: number; 
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  const displayRating = hoverRating || rating;
  
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFull = displayRating >= starValue;
        const isHalf = !isFull && displayRating >= starValue - 0.5;
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all duration-200`}
          >
            <Star
              className={`${sizeClasses[size]} transition-all duration-200 ${
                isFull 
                  ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" 
                  : isHalf 
                    ? "fill-yellow-400/50 text-yellow-400" 
                    : "text-muted-foreground/40"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

const FieldInfoTooltip = ({ title, description }: { title: string; description: string }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-help transition-colors inline ml-1" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-3">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const LabReviewSection = forwardRef<LabReviewSectionHandle, LabReviewSectionProps>(
  ({ labId }, ref) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: reviews } = useLabReviews(labId);
    const createReview = useCreateLabReview();
    const updateReview = useUpdateLabReview();
    const deleteReview = useDeleteLabReview();
    const toggleUpvote = useToggleLabReviewUpvote();

    const [sortBy, setSortBy] = useState<"recent" | "highest">("recent");
    const [showForm, setShowForm] = useState(false);
    
    const [rating, setRating] = useState(5);
    const [researchQuality, setResearchQuality] = useState("");
    const [mentorship, setMentorship] = useState("");
    const [workEnvironment, setWorkEnvironment] = useState("");
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [validationError, setValidationError] = useState("");
    
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editResearchQuality, setEditResearchQuality] = useState("");
    const [editMentorship, setEditMentorship] = useState("");
    const [editWorkEnvironment, setEditWorkEnvironment] = useState("");
    const [editComment, setEditComment] = useState("");
    const [editIsAnonymous, setEditIsAnonymous] = useState(false);
    const [editValidationError, setEditValidationError] = useState("");

    useImperativeHandle(ref, () => ({
      scrollToForm: () => {
        if (!user) {
          navigate("/auth");
          return;
        }
        setShowForm(true);
        setTimeout(() => {
          document.getElementById("lab-review-form")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }));

    const averageRating = reviews?.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    const sortedReviews = reviews ? [...reviews].sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) : [];

    const handleSubmitReview = () => {
      const missingFields = [];
      if (!researchQuality) missingFields.push("Research Quality");
      if (!mentorship) missingFields.push("Mentorship");
      if (!workEnvironment) missingFields.push("Work Environment");
      
      if (missingFields.length > 0) {
        setValidationError(`Please select: ${missingFields.join(", ")}`);
        return;
      }
      
      setValidationError("");
      createReview.mutate(
        { lab_id: labId, rating, research_quality: researchQuality, mentorship, work_environment: workEnvironment, comment, is_anonymous: isAnonymous },
        {
          onSuccess: () => {
            setRating(5);
            setResearchQuality("");
            setMentorship("");
            setWorkEnvironment("");
            setComment("");
            setIsAnonymous(false);
            setShowForm(false);
          },
        }
      );
    };

    const handleEditReview = (review: any) => {
      setEditingReviewId(review.id);
      setEditRating(review.rating);
      setEditResearchQuality(review.research_quality || "");
      setEditMentorship(review.mentorship || "");
      setEditWorkEnvironment(review.work_environment || "");
      setEditComment(review.comment || "");
      setEditIsAnonymous(review.is_anonymous || false);
    };

    const handleUpdateReview = () => {
      if (!editingReviewId) return;
      
      const missingFields = [];
      if (!editResearchQuality) missingFields.push("Research Quality");
      if (!editMentorship) missingFields.push("Mentorship");
      if (!editWorkEnvironment) missingFields.push("Work Environment");
      
      if (missingFields.length > 0) {
        setEditValidationError(`Please select: ${missingFields.join(", ")}`);
        return;
      }
      
      updateReview.mutate(
        { id: editingReviewId, rating: editRating, research_quality: editResearchQuality, mentorship: editMentorship, work_environment: editWorkEnvironment, comment: editComment, is_anonymous: editIsAnonymous },
        { onSuccess: () => setEditingReviewId(null) }
      );
    };

    const handleUpvote = (reviewId: string, hasUpvoted: boolean) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      toggleUpvote.mutate({ reviewId, labId, hasUpvoted });
    };

    const renderReviewForm = (
      formRating: number,
      setFormRating: (v: number) => void,
      formResearchQuality: string,
      setFormResearchQuality: (v: string) => void,
      formMentorship: string,
      setFormMentorship: (v: string) => void,
      formWorkEnvironment: string,
      setFormWorkEnvironment: (v: string) => void,
      formComment: string,
      setFormComment: (v: string) => void,
      formIsAnonymous: boolean,
      setFormIsAnonymous: (v: boolean) => void,
      onSubmit: () => void,
      isPending: boolean,
      submitText: string,
      onCancel?: () => void,
      error?: string
    ) => (
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        <div>
          <Label className="mb-3 block">Rating: {formRating} Star{formRating !== 1 && "s"}</Label>
          <div className="flex items-center gap-4">
            <StarRating rating={formRating} size="lg" interactive onRatingChange={setFormRating} />
            <Slider
              value={[formRating]}
              onValueChange={(v) => setFormRating(v[0])}
              min={1}
              max={5}
              step={0.5}
              className="flex-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center text-sm">
              Research Quality <span className="text-destructive ml-0.5">*</span>
              <FieldInfoTooltip 
                title="Research Quality" 
                description="Quality of research output, publications, and innovation in the lab."
              />
            </Label>
            <Select value={formResearchQuality} onValueChange={setFormResearchQuality}>
              <SelectTrigger className={`h-10 ${!formResearchQuality && error ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center text-sm">
              Mentorship <span className="text-destructive ml-0.5">*</span>
              <FieldInfoTooltip 
                title="Mentorship" 
                description="Quality of guidance and support from supervisors and senior researchers."
              />
            </Label>
            <Select value={formMentorship} onValueChange={setFormMentorship}>
              <SelectTrigger className={`h-10 ${!formMentorship && error ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center text-sm">
              Work Environment <span className="text-destructive ml-0.5">*</span>
              <FieldInfoTooltip 
                title="Work Environment" 
                description="Lab atmosphere, work-life balance, and collaboration culture."
              />
            </Label>
            <Select value={formWorkEnvironment} onValueChange={setFormWorkEnvironment}>
              <SelectTrigger className={`h-10 ${!formWorkEnvironment && error ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Comment (optional)</Label>
          <Textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Share your experience working in this lab..."
            rows={3}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="lab-anonymous" 
            checked={formIsAnonymous}
            onCheckedChange={(checked) => setFormIsAnonymous(checked === true)}
          />
          <label
            htmlFor="lab-anonymous"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5"
          >
            <EyeOff className="h-4 w-4" />
            Post anonymously
          </label>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={isPending}>{submitText}</Button>
          {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
        </div>
      </div>
    );

    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                Reviews
              </CardTitle>
              {averageRating && (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">{averageRating}</span>
                  <div className="flex flex-col">
                    <StarRating rating={parseFloat(averageRating)} size="md" />
                    <span className="text-xs text-muted-foreground">{reviews?.length} review{reviews?.length !== 1 && "s"}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "highest")}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              {user && !showForm && (
                <Button onClick={() => setShowForm(true)}>Write Review</Button>
              )}
              {!user && (
                <Button onClick={() => navigate("/auth")}>Sign in to Review</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && showForm && (
            <div id="lab-review-form" className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              {renderReviewForm(
                rating, setRating,
                researchQuality, setResearchQuality,
                mentorship, setMentorship,
                workEnvironment, setWorkEnvironment,
                comment, setComment,
                isAnonymous, setIsAnonymous,
                handleSubmitReview,
                createReview.isPending,
                "Submit Review",
                () => setShowForm(false),
                validationError
              )}
            </div>
          )}

          <div className="space-y-3">
            {sortedReviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              sortedReviews.map((review: any) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  {editingReviewId === review.id ? (
                    <div>
                      <h4 className="font-semibold mb-4">Edit Review</h4>
                      {renderReviewForm(
                        editRating, setEditRating,
                        editResearchQuality, setEditResearchQuality,
                        editMentorship, setEditMentorship,
                        editWorkEnvironment, setEditWorkEnvironment,
                        editComment, setEditComment,
                        editIsAnonymous, setEditIsAnonymous,
                        handleUpdateReview,
                        updateReview.isPending,
                        "Update Review",
                        () => setEditingReviewId(null),
                        editValidationError
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        {review.is_anonymous ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-muted">
                                <EyeOff className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-sm text-muted-foreground">
                                Anonymous
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(review.created_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Link 
                            to={`/user/${review.user_id}`}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.user?.profile_photo_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {review.user?.username?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-sm hover:underline">
                                {review.user?.username || "Anonymous"}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(review.created_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </Link>
                        )}
                        
                        {user && review.user_id === user.id && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEditReview(review)} className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteReview.mutate({ id: review.id, labId })}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <StarRating rating={review.rating} size="sm" />
                        {review.research_quality && (
                          <Badge variant="outline">
                            <span className="font-bold mr-1">Research:</span>{review.research_quality}
                          </Badge>
                        )}
                        {review.mentorship && (
                          <Badge variant="outline">
                            <span className="font-bold mr-1">Mentorship:</span>{review.mentorship}
                          </Badge>
                        )}
                        {review.work_environment && (
                          <Badge variant="outline">
                            <span className="font-bold mr-1">Environment:</span>{review.work_environment}
                          </Badge>
                        )}
                      </div>
                      {review.comment && <p className="text-sm mb-3">{review.comment}</p>}
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant={review.hasUpvoted ? "default" : "outline"}
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleUpvote(review.id, review.hasUpvoted)}
                          disabled={toggleUpvote.isPending}
                        >
                          <ThumbsUp className={`h-4 w-4 ${review.hasUpvoted ? "fill-current" : ""}`} />
                          <span>{review.upvote_count || 0}</span>
                        </Button>
                        <span className="text-xs text-muted-foreground">Helpful</span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

LabReviewSection.displayName = "LabReviewSection";