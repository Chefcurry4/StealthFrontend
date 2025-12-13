import { ActivityTimeline } from "@/components/profile/ActivityTimeline";

export const WorkbenchActivity = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Timeline</h3>
      <ActivityTimeline />
    </div>
  );
};
