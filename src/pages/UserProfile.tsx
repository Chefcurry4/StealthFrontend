import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicUserProfile } from "@/hooks/usePublicUserProfile";
import { useUserReviews } from "@/hooks/useUserReviews";
import { format } from "date-fns";

// Color utility functions for review badges
const getDifficultyColor = (difficulty: string | null) => {
  if (!difficulty) return "";
  const lower = difficulty.toLowerCase();
  if (lower.includes("easy")) return "text-green-600 border-green-600";
  if (lower.includes("medium")) return "text-yellow-500 border-yellow-500";
  if (lower.includes("difficult") && lower.includes("very")) return "text-red-600 border-red-600";
  if (lower.includes("difficult")) return "text-orange-500 border-orange-500";
  return "";
};

const getWorkloadColor = (workload: string | null) => {
  if (!workload) return "";
  const lower = workload.toLowerCase();
  if (lower.includes("light")) return "text-green-700 border-green-700";
  if (lower.includes("okay") || lower.includes("moderate")) return "text-yellow-500 border-yellow-500";
  if (lower.includes("heavy")) return "text-red-600 border-red-600";
  return "";
};

const getOrganizationColor = (organization: string | null) => {
  if (!organization) return "";
  const lower = organization.toLowerCase();
  if (lower.includes("great")) return "text-green-700 border-green-700";
  if (lower.includes("good")) return "text-green-500 border-green-500";
  if (lower.includes("fair")) return "text-orange-500 border-orange-500";
  if (lower.includes("poor")) return "text-red-600 border-red-600";
  return "";
};

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { data: profile, isLoading: profileLoading } = usePublicUserProfile(userId!);
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews(userId!);

  if (profileLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-6 backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profile_photo_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {profile.username}
                </h1>
                {profile.email_public && profile.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {format(new Date(profile.created_at), "MMMM yyyy")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Course Reviews ({reviews?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : reviews?.length === 0 ? (
              <p className="text-muted-foreground">No reviews published yet.</p>
            ) : (
              reviews?.map((review: any) => (
                <div key={review.id} className="p-4 border rounded-lg" style={{ borderColor: 'var(--theme-card-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <Link 
                      to={`/courses/${review.course?.id_course}`}
                      className="font-medium hover:underline"
                    >
                      {review.course?.name_course || "Unknown Course"}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
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
                    {review.difficulty && (
                      <Badge variant="outline" className={getDifficultyColor(review.difficulty)}>
                        {review.difficulty}
                      </Badge>
                    )}
                    {review.workload && (
                      <Badge variant="outline" className={getWorkloadColor(review.workload)}>
                        {review.workload === "Moderate" ? "Okay" : review.workload}
                      </Badge>
                    )}
                    {review.organization && (
                      <Badge variant="outline" className={getOrganizationColor(review.organization)}>
                        {review.organization}
                      </Badge>
                    )}
                  </div>
                  {review.comment && <p className="text-sm">{review.comment}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
