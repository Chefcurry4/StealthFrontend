import { useActivityTimeline } from "@/hooks/useActivityTimeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/Loader";
import { 
  BookOpen, 
  FlaskConical, 
  GraduationCap, 
  FileText, 
  Star, 
  Mail,
  GitCommit
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday, isSameWeek } from "date-fns";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "saved_course":
      return <BookOpen className="h-4 w-4" />;
    case "saved_lab":
      return <FlaskConical className="h-4 w-4" />;
    case "saved_program":
      return <GraduationCap className="h-4 w-4" />;
    case "agreement":
      return <FileText className="h-4 w-4" />;
    case "review":
      return <Star className="h-4 w-4" />;
    case "email_draft":
      return <Mail className="h-4 w-4" />;
    default:
      return <GitCommit className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "saved_course":
      return "bg-blue-500";
    case "saved_lab":
      return "bg-purple-500";
    case "saved_program":
      return "bg-green-500";
    case "agreement":
      return "bg-orange-500";
    case "review":
      return "bg-yellow-500";
    case "email_draft":
      return "bg-pink-500";
    default:
      return "bg-muted-foreground";
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case "saved_course":
      return "Saved a course";
    case "saved_lab":
      return "Saved a lab";
    case "saved_program":
      return "Saved a program";
    case "agreement":
      return "Created an agreement";
    case "review":
      return "Reviewed a course";
    case "email_draft":
      return "Created an email draft";
    default:
      return "Activity";
  }
};

const groupActivitiesByDate = (activities: any[]) => {
  const groups: { label: string; items: any[] }[] = [];
  let currentGroup: { label: string; items: any[] } | null = null;

  activities.forEach((activity) => {
    const date = new Date(activity.created_at);
    let label: string;

    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else if (isSameWeek(date, new Date())) {
      label = "This Week";
    } else {
      label = format(date, "MMMM yyyy");
    }

    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(activity);
  });

  return groups;
};

export const ActivityTimeline = () => {
  const { data: activities, isLoading } = useActivityTimeline();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Your recent actions and contributions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Your recent actions and contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <GitCommit className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start exploring courses, labs, and programs to see your activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Your recent actions and contributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {groupedActivities.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                {group.label}
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-4">
                  {group.items.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${getActivityColor(activity.type)} text-white shrink-0`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">
                              {getActivityLabel(activity.type)}
                            </p>
                            <p className="font-medium truncate">{activity.title}</p>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
