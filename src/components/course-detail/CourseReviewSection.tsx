import { useState, forwardRef, useImperativeHandle } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Pencil, Trash2, ThumbsUp, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseReviews, useCreateCourseReview, useUpdateCourseReview, useDeleteCourseReview, useToggleReviewUpvote } from "@/hooks/useCourseReviews";
import { format } from "date-fns";

interface CourseReviewSectionProps {
  courseId: string;
}

export interface CourseReviewSectionHandle {
  scrollToForm: () => void;
}

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
    const [validationError, setValidationError] = useState("");
    
    // Edit state
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editDifficulty, setEditDifficulty] = useState("");
    const [editWorkload, setEditWorkload] = useState("");
    const [editOrganization, setEditOrganization] = useState("");
    const [editComment, setEditComment] = useState("");
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

    const renderStars = (ratingValue: number, size: "sm" | "md" = "sm") => {
      const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
      return (
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isFull = ratingValue >= starValue;
            const isHalf = !isFull && ratingValue >= starValue - 0.5;
            return (
              <Star
                key={i}
                className={`${sizeClass} ${
                  isFull ? "fill-primary text-primary" : isHalf ? "fill-primary/50 text-primary" : "text-muted"
                }`}
              />
            );
          })}
        </div>
      );
    };

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
        { course_id: courseId, rating, difficulty, workload, organization, comment },
        {
          onSuccess: () => {
            setRating(5);
            setDifficulty("");
            setWorkload("");
            setOrganization("");
            setComment("");
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
        { id: editingReviewId, rating: editRating, difficulty: editDifficulty, workload: editWorkload, organization: editOrganization, comment: editComment },
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
          <div className="flex items-center gap-3">
            {renderStars(formRating, "md")}
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
          <div>
            <Label>Difficulty <span className="text-destructive">*</span></Label>
            <Select value={formDifficulty} onValueChange={setFormDifficulty}>
              <SelectTrigger className={!formDifficulty && error ? "border-destructive" : ""}>
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
          <div>
            <Label>Workload <span className="text-destructive">*</span></Label>
            <Select value={formWorkload} onValueChange={setFormWorkload}>
              <SelectTrigger className={!formWorkload && error ? "border-destructive" : ""}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Organization <span className="text-destructive">*</span></Label>
            <Select value={formOrganization} onValueChange={setFormOrganization}>
              <SelectTrigger className={!formOrganization && error ? "border-destructive" : ""}>
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
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews
              </CardTitle>
              {averageRating && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{averageRating}</span>
                  <div className="flex flex-col">
                    {renderStars(parseFloat(averageRating))}
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
                        {renderStars(review.rating)}
                        {review.difficulty && <Badge variant="outline">{review.difficulty}</Badge>}
                        {review.workload && <Badge variant="outline">{review.workload}</Badge>}
                        {review.organization && <Badge variant="outline">{review.organization}</Badge>}
                      </div>
                      {review.comment && <p className="text-sm mb-3">{review.comment}</p>}
                      
                      <div className="flex items-center gap-2 mt-2">
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

CourseReviewSection.displayName = "CourseReviewSection";
