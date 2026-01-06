import { useUserProfile } from "@/hooks/useUserProfile";

export interface DisplayPreferences {
  display_compact: boolean;
  display_items_per_page: number;
}

export const useDisplayPreferences = (): DisplayPreferences => {
  const { data: profile } = useUserProfile();
  
  return {
    // Default to compact view (true) when no profile/preference is set
    display_compact: profile?.display_compact ?? true,
    display_items_per_page: profile?.display_items_per_page ?? 20,
  };
};
