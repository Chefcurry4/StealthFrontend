import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, GraduationCap, User, Globe, Calendar, Wrench, Bookmark, Star, Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCourse } from "@/hooks/useCourses";
import { useTeacherIdByCourse } from "@/hooks/useTeachers";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";
import { useCourseReviews, useCreateCourseReview, useUpdateCourseReview, useDeleteCourseReview } from "@/hooks/useCourseReviews";
import { TeacherLink } from "@/components/TeacherLink";
import { useState } from "react";
import { format } from "date-fns";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, error } = useCourse(id!);
  const { data: teacherId } = useTeacherIdByCourse(id!);
  const { user } = useAuth();
  const { data: savedCourses } = useSavedCourses();
  const toggleSave = useToggleSaveCourse();
  const { data: reviews } = useCourseReviews(id!);
  const createReview = useCreateCourseReview();
  const updateReview = useUpdateCourseReview();
  const deleteReview = useDeleteCourseReview();

  const [rating, setRating] = useState(5);
  const [difficulty, setDifficulty] = useState("");
  const [workload, setWorkload] = useState("");
  const [organization, setOrganization] = useState("");
  const [comment, setComment] = useState("");
  
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editDifficulty, setEditDifficulty] = useState("");
  const [editWorkload, setEditWorkload] = useState("");
  const [editOrganization, setEditOrganization] = useState("");
  const [editComment, setEditComment] = useState("");

  const isSaved = savedCourses?.some((saved: any) => saved.course_id === id);

  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleSave.mutate(id!);
  };

  const handleSubmitReview = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    createReview.mutate(
      {
        course_id: id!,
        rating,
        difficulty,
        workload,
        organization,
        comment,
      },
      {
        onSuccess: () => {
          setRating(5);
          setDifficulty("");
          setWorkload("");
          setOrganization("");
          setComment("");
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
    updateReview.mutate(
      {
        id: editingReviewId,
        rating: editRating,
        difficulty: editDifficulty,
        workload: editWorkload,
        organization: editOrganization,
        comment: editComment,
      },
      {
        onSuccess: () => {
          setEditingReviewId(null);
        },
      }
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReview.mutate(reviewId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Link to="/courses">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <p className="text-muted-foreground">Course not found</p>
        </div>
      </div>
    );
  }

  const topics = course.topics?.split(',').map(t => t.trim()).filter(Boolean) || [];

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
    onCancel?: () => void
  ) => (
    <div className="space-y-4">
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
      <div>
        <Label>Exam/Projects Difficulty</Label>
        <Select value={formDifficulty} onValueChange={setFormDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
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
        <Label>Workload</Label>
        <Select value={formWorkload} onValueChange={setFormWorkload}>
          <SelectTrigger>
            <SelectValue placeholder="Select workload" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Light">Light</SelectItem>
            <SelectItem value="Moderate">Moderate</SelectItem>
            <SelectItem value="Balanced">Balanced</SelectItem>
            <SelectItem value="Heavy">Heavy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Course Structure & Organization</Label>
        <Select value={formOrganization} onValueChange={setFormOrganization}>
          <SelectTrigger>
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Poor">Poor</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Great">Great</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Comment</Label>
        <Textarea
          value={formComment}
          onChange={(e) => setFormComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onSubmit} disabled={isPending}>
          {submitText}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/courses">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {course.code && <Badge variant="secondary">{course.code}</Badge>}
            {course.ba_ma && <Badge variant="outline">{course.ba_ma}</Badge>}
          </div>
          <h1 className="text-4xl font-bold mb-4">{course.name_course}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{course.description}</p>
                  </div>
                )}

                {topics.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Topics Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {course.type_exam && (
                  <div>
                    <h3 className="font-semibold mb-2">Examination</h3>
                    <p className="text-muted-foreground">{course.type_exam}</p>
                  </div>
                )}

                {course.software_equipment && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Software & Equipment
                    </h3>
                    <p className="text-muted-foreground">{course.software_equipment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {course.professor_name && (
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {course.professor_name.split(';').map((name, index, arr) => (
                      <span key={index} className="inline-flex items-center">
                        <TeacherLink teacherName={name.trim()} />
                        {index < arr.length - 1 && <span className="text-muted-foreground">;</span>}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Course Reviews {averageRating && `(${averageRating}/5)`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold">Write a Review</h3>
                    {renderReviewForm(
                      rating,
                      setRating,
                      difficulty,
                      setDifficulty,
                      workload,
                      setWorkload,
                      organization,
                      setOrganization,
                      comment,
                      setComment,
                      handleSubmitReview,
                      createReview.isPending,
                      "Submit Review"
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {reviews?.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews?.map((review: any) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        {editingReviewId === review.id ? (
                          <div>
                            <h4 className="font-semibold mb-4">Edit Review</h4>
                            {renderReviewForm(
                              editRating,
                              setEditRating,
                              editDifficulty,
                              setEditDifficulty,
                              editWorkload,
                              setEditWorkload,
                              editOrganization,
                              setEditOrganization,
                              editComment,
                              setEditComment,
                              handleUpdateReview,
                              updateReview.isPending,
                              "Update Review",
                              () => setEditingReviewId(null)
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Reviewer Info */}
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
                              
                              {/* Edit/Delete buttons for own reviews */}
                              {user && review.user_id === user.id && (
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleEditReview(review)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this review? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>
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
                            {review.comment && <p className="text-sm">{review.comment}</p>}
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.ects && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{course.ects}</strong> ECTS Credits
                    </span>
                  </div>
                )}

                {course.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.language}</span>
                  </div>
                )}

                {course.term && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.term}</span>
                  </div>
                )}

                {course.year && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.year}</span>
                  </div>
                )}

                {course.ba_ma && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.ba_ma}</span>
                  </div>
                )}

                {course.mandatory_optional && (
                  <div className="text-sm">
                    <strong>Type:</strong> {course.mandatory_optional}
                  </div>
                )}

                {course.which_year && (
                  <div className="text-sm">
                    <strong>Year of Study:</strong> {course.which_year}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button className="w-full" onClick={handleSave} disabled={toggleSave.isPending}>
                <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Course'}
              </Button>
              <Button variant="outline" className="w-full">
                Add to Learning Agreement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
