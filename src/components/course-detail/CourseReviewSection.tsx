import { useState, forwardRef, useImperativeHandle } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Pencil, Trash2, ThumbsUp, ArrowUpDown, MessageCircle, Info, Send, EyeOff } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseReviews, useCreateCourseReview, useUpdateCourseReview, useDeleteCourseReview, useToggleReviewUpvote, useCreateReviewReply, useReviewReplies } from "@/hooks/useCourseReviews";
import { format } from "date-fns";

interface CourseReviewSectionProps {
  courseId: string;
}

export interface CourseReviewSectionHandle {
  scrollToForm: () => void;
}

// Star rating component with yellow fill and transitions
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

// Info tooltip component for review fields
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

// Reply component for individual review
const ReviewReplies = ({ reviewId, courseId }: { reviewId: string; courseId: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: replies } = useReviewReplies(reviewId);
  const createReply = useCreateReviewReply();
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleSubmitReply = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!replyText.trim()) return;
    
    createReply.mutate(
      { reviewId, content: replyText, courseId },
      {
        onSuccess: () => {
          setReplyText("");
          setShowReplyForm(false);
        },
      }
    );
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      {/* Replies list */}
      {replies && replies.length > 0 && (
        <div className="space-y-2 mb-3">
          {replies.map((reply: any) => (
            <div key={reply.id} className="pl-4 border-l-2 border-muted">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/user/${reply.user_id}`} className="flex items-center gap-1.5 hover:opacity-80">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={reply.user?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {reply.user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{reply.user?.username || "Anonymous"}</span>
                </Link>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(reply.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply button / form */}
      {!showReplyForm ? (
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 text-xs h-7"
          onClick={() => user ? setShowReplyForm(true) : navigate("/auth")}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Reply
        </Button>
      ) : (
        <div className="flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="text-sm"
          />
          <div className="flex flex-col gap-1">
            <Button 
              size="sm" 
              className="h-7 px-2"
              onClick={handleSubmitReply}
              disabled={createReply.isPending || !replyText.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2"
              onClick={() => {
                setShowReplyForm(false);
                setReplyText("");
              }}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CourseReviewSection = forwardRef<CourseReviewSectionHandle, CourseReviewSectionProps>(
  ({ courseId }, ref) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: reviews } = useCourseReviews(courseId);
    const createReview = useCreateCourseReview();
    const updateReview = useUpdateCourseReview();
    const deleteReview = useDeleteCourseReview();
    const toggleUpvote = useToggleReviewUpvote();

    const [sortBy, setSortBy] = useState<"recent" | "highest">("recent");
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [rating, setRating] = useState(5);
    const [difficulty, setDifficulty] = useState("");
    const [workload, setWorkload] = useState("");
    const [organization, setOrganization] = useState("");
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [validationError, setValidationError] = useState("");
    
    // Edit state
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editDifficulty, setEditDifficulty] = useState("");
    const [editWorkload, setEditWorkload] = useState("");
    const [editOrganization, setEditOrganization] = useState("");
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
          document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }));

    const averageRating = reviews?.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    const sortedReviews = reviews ? [...reviews].sort((a, b) => {
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) : [];

    const handleSubmitReview = () => {
      const missingFields = [];
      if (!difficulty) missingFields.push("Difficulty");
      if (!workload) missingFields.push("Workload");
      if (!organization) missingFields.push("Organization");
      
      if (missingFields.length > 0) {
        setValidationError(`Please select: ${missingFields.join(", ")}`);
        return;
      }
      
      setValidationError("");
      createReview.mutate(
        { course_id: courseId, rating, difficulty, workload, organization, comment, is_anonymous: isAnonymous },
        {
          onSuccess: () => {
            setRating(5);
            setDifficulty("");
            setWorkload("");
            setOrganization("");
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
      setEditDifficulty(review.difficulty || "");
      setEditWorkload(review.workload || "");
      setEditOrganization(review.organization || "");
      setEditComment(review.comment || "");
      setEditIsAnonymous(review.is_anonymous || false);
    };

    const handleUpdateReview = () => {
      if (!editingReviewId) return;
      
      const missingFields = [];
      if (!editDifficulty) missingFields.push("Difficulty");
      if (!editWorkload) missingFields.push("Workload");
      if (!editOrganization) missingFields.push("Organization");
      
      if (missingFields.length > 0) {
        setEditValidationError(`Please select: ${missingFields.join(", ")}`);
        return;
      }
      
      updateReview.mutate(
        { id: editingReviewId, rating: editRating, difficulty: editDifficulty, workload: editWorkload, organization: editOrganization, comment: editComment, is_anonymous: editIsAnonymous },
        { onSuccess: () => setEditingReviewId(null) }
      );
    };

    const handleUpvote = (reviewId: string, hasUpvoted: boolean) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      toggleUpvote.mutate({ reviewId, hasUpvoted });
    };

    const renderReviewForm = (
      formRating: number,
      setFormRating: (v: number) => void,
      formDifficulty: string,
      setFormDifficulty: (v: string) => void,
      formWorkload: string,
      setFormWorkload: (v: string) => void,
      formOrganization: string,
      setFormOrganization: (v: string) => void,
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
            <StarRating 
              rating={formRating} 
              size="lg" 
              interactive 
              onRatingChange={setFormRating}
            />
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
              Difficulty <span className="text-destructive ml-0.5">*</span>
              <FieldInfoTooltip 
                title="Difficulty" 
                description="How challenging was the course content and exams? Consider the complexity of concepts, pace of learning, and exam difficulty."
              />
            </Label>
            <Select value={formDifficulty} onValueChange={setFormDifficulty}>
              <SelectTrigger className={`h-10 ${!formDifficulty && error ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Difficult">Difficult</SelectItem>
                <SelectItem value="Very Difficult">Very Difficult</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center text-sm">
              Workload <span className="text-destructive ml-0.5">*</span>
              <FieldInfoTooltip 
                title="Workload" 
                description="How much time and effort did the course require? Consider homework, projects, readings, and study time relative to ECTS credits."
              />
            </Label>
            <Select value={formWorkload} onValueChange={setFormWorkload}>
              <SelectTrigger className={`h-10 ${!formWorkload && error ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Okay">Okay</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center text-sm">
              Organization <span className="text-destructive ml-0.5">*</span>
              <FieldInfoTooltip 
                title="Organization" 
                description="How well-structured was the course? Consider clarity of materials, scheduling, professor communication, and overall course management."
              />
            </Label>
            <Select value={formOrganization} onValueChange={setFormOrganization}>
              <SelectTrigger className={`h-10 ${!formOrganization && error ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Great">Great</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Comment (optional)</Label>
          <Textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="anonymous" 
            checked={formIsAnonymous}
            onCheckedChange={(checked) => setFormIsAnonymous(checked === true)}
          />
          <label
            htmlFor="anonymous"
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
          {/* Review Form */}
          {user && showForm && (
            <div id="review-form" className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              {renderReviewForm(
                rating, setRating,
                difficulty, setDifficulty,
                workload, setWorkload,
                organization, setOrganization,
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

          {/* Reviews List */}
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
                        editDifficulty, setEditDifficulty,
                        editWorkload, setEditWorkload,
                        editOrganization, setEditOrganization,
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
                                  <AlertDialogAction onClick={() => deleteReview.mutate(review.id)}>
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
                        {review.difficulty && (
                          <Badge variant="outline">
                            <span className="font-bold mr-1">Difficulty:</span>{review.difficulty}
                          </Badge>
                        )}
                        {review.workload && (
                          <Badge variant="outline">
                            <span className="font-bold mr-1">Workload:</span>{review.workload}
                          </Badge>
                        )}
                        {review.organization && (
                          <Badge variant="outline">
                            <span className="font-bold mr-1">Organization:</span>{review.organization}
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

                      {/* Replies Section */}
                      <ReviewReplies reviewId={review.id} courseId={courseId} />
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

CourseReviewSection.displayName = "CourseReviewSection";

// Helper function to calculate review summary
export const calculateReviewSummary = (reviews: any[] | undefined) => {
  if (!reviews || reviews.length === 0) {
    return {
      avgDifficulty: null,
      avgWorkload: null,
      avgOrganization: null,
      totalReviews: 0,
    };
  }

  const difficultyMap: Record<string, number> = {
    "Easy": 1, "Medium": 2, "Difficult": 3, "Very Difficult": 4
  };
  const workloadMap: Record<string, number> = {
    "Light": 1, "Moderate": 2, "Heavy": 3
  };
  const organizationMap: Record<string, number> = {
    "Poor": 1, "Fair": 2, "Good": 3, "Great": 4
  };

  const reverseDifficulty = ["Easy", "Medium", "Difficult", "Very Difficult"];
  const reverseWorkload = ["Light", "Moderate", "Heavy"];
  const reverseOrganization = ["Poor", "Fair", "Good", "Great"];

  const difficulties = reviews.filter(r => r.difficulty).map(r => difficultyMap[r.difficulty] || 0);
  const workloads = reviews.filter(r => r.workload).map(r => workloadMap[r.workload] || 0);
  const organizations = reviews.filter(r => r.organization).map(r => organizationMap[r.organization] || 0);

  const avgDifficultyNum = difficulties.length > 0 
    ? Math.round(difficulties.reduce((a, b) => a + b, 0) / difficulties.length)
    : 0;
  const avgWorkloadNum = workloads.length > 0 
    ? Math.round(workloads.reduce((a, b) => a + b, 0) / workloads.length)
    : 0;
  const avgOrganizationNum = organizations.length > 0 
    ? Math.round(organizations.reduce((a, b) => a + b, 0) / organizations.length)
    : 0;

  return {
    avgDifficulty: avgDifficultyNum > 0 ? reverseDifficulty[avgDifficultyNum - 1] : null,
    avgWorkload: avgWorkloadNum > 0 ? reverseWorkload[avgWorkloadNum - 1] : null,
    avgOrganization: avgOrganizationNum > 0 ? reverseOrganization[avgOrganizationNum - 1] : null,
    totalReviews: reviews.length,
  };
};
