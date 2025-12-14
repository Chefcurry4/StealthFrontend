import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, GraduationCap, User, Globe, Calendar, Wrench, Bookmark, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/useCourses";
import { useTeacherIdByCourse } from "@/hooks/useTeachers";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";
import { useCourseReviews, useCreateCourseReview } from "@/hooks/useCourseReviews";
import { TeacherLink } from "@/components/TeacherLink";
import { useState } from "react";

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

  const [rating, setRating] = useState(5);
  const [difficulty, setDifficulty] = useState("");
  const [workload, setWorkload] = useState("");
  const [organization, setOrganization] = useState("");
  const [comment, setComment] = useState("");

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
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-3 block">Rating: {rating} Star{rating !== 1 && "s"}</Label>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const starValue = i + 1;
                              const isFull = rating >= starValue;
                              const isHalf = !isFull && rating >= starValue - 0.5;
                              return (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    isFull ? "fill-primary text-primary" : isHalf ? "fill-primary/50 text-primary" : "text-muted"
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <Slider
                            value={[rating]}
                            onValueChange={(v) => setRating(v[0])}
                            min={1}
                            max={5}
                            step={0.5}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Exam/Projects Difficulty</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
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
                        <Select value={workload} onValueChange={setWorkload}>
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
                        <Select value={organization} onValueChange={setOrganization}>
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
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your experience..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleSubmitReview} disabled={createReview.isPending}>
                        Submit Review
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {reviews?.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews?.map((review: any) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const starValue = i + 1;
                              const isFull = review.rating >= starValue;
                              const isHalf = !isFull && review.rating >= starValue - 0.5;
                              return (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    isFull ? "fill-primary text-primary" : isHalf ? "fill-primary/50 text-primary" : "text-muted"
                                  }`}
                                />
                              );
                            })}
                          </div>
                          {review.difficulty && <Badge variant="outline">{review.difficulty}</Badge>}
                          {review.workload && <Badge variant="outline">{review.workload}</Badge>}
                          {review.organization && <Badge variant="outline">{review.organization}</Badge>}
                        </div>
                        {review.comment && <p className="text-sm">{review.comment}</p>}
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
