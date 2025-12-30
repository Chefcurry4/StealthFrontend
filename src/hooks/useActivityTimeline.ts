import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityItem {
  id: string;
  type: "saved_course" | "saved_lab" | "review" | "email_draft";
  title: string;
  description?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export const useActivityTimeline = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activity-timeline", user?.id],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];

      const activities: ActivityItem[] = [];

      // Fetch saved courses with course details
      const { data: savedCourses } = await supabase
        .from("user_saved_courses(US-C)")
        .select(`
          id,
          created_at,
          course:course_id (
            name_course,
            code
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      savedCourses?.forEach((item: any) => {
        if (item.course) {
          activities.push({
            id: item.id,
            type: "saved_course",
            title: item.course.name_course || "Unknown Course",
            description: item.course.code ? `Code: ${item.course.code}` : undefined,
            created_at: item.created_at,
          });
        }
      });

      // Fetch saved labs
      const { data: savedLabs } = await supabase
        .from("user_saved_labs(US-L)")
        .select(`
          id,
          created_at,
          lab:lab_id (
            name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      savedLabs?.forEach((item: any) => {
        if (item.lab) {
          activities.push({
            id: item.id,
            type: "saved_lab",
            title: item.lab.name || "Unknown Lab",
            created_at: item.created_at,
          });
        }
      });

      // Fetch course reviews
      const { data: reviews } = await supabase
        .from("course_reviews")
        .select(`
          id,
          rating,
          created_at,
          course:course_id (
            name_course
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      reviews?.forEach((item: any) => {
        activities.push({
          id: item.id,
          type: "review",
          title: item.course?.name_course || "Unknown Course",
          description: `Rated ${item.rating}/5 stars`,
          created_at: item.created_at,
        });
      });

      // Fetch email drafts
      const { data: drafts } = await supabase
        .from("email_drafts")
        .select("id, subject, recipient, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      drafts?.forEach((item) => {
        activities.push({
          id: item.id,
          type: "email_draft",
          title: item.subject || "Untitled Draft",
          description: item.recipient ? `To: ${item.recipient}` : undefined,
          created_at: item.created_at,
        });
      });

      // Sort all activities by date
      return activities.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 30);
    },
    enabled: !!user,
  });
};
