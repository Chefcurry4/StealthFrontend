import { Link } from "react-router-dom";
import { EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePublicUserReviewCount } from "@/hooks/usePublicUserReviewCount";
import EpicReviewerBadge from "@/components/EpicReviewerBadge";
import { format } from "date-fns";

interface ReviewUserDisplayProps {
  userId: string;
  username?: string | null;
  profilePhotoUrl?: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

const ReviewUserDisplay = ({
  userId,
  username,
  profilePhotoUrl,
  isAnonymous,
  createdAt,
}: ReviewUserDisplayProps) => {
  const { data: reviewCount } = usePublicUserReviewCount(userId);
  const isEpic = reviewCount?.isEpic || false;

  if (isAnonymous) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-muted">
            <EyeOff className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-muted-foreground">
              Anonymous
            </span>
            {isEpic && <EpicReviewerBadge size="sm" />}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={`/user/${userId}`}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profilePhotoUrl || undefined} />
        <AvatarFallback className="text-xs">
          {username?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm hover:underline">
            {username || "Anonymous"}
          </span>
          {isEpic && <EpicReviewerBadge size="sm" />}
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(createdAt), "MMM d, yyyy")}
        </p>
      </div>
    </Link>
  );
};

export default ReviewUserDisplay;
