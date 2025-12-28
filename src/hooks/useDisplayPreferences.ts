import { useUserProfile } from "@/hooks/useUserProfile";

export interface DisplayPreferences {
  display_compact: boolean;
  display_items_per_page: number;
}

export const useDisplayPreferences = (): DisplayPreferences => {
  const { data: profile } = useUserProfile();
  
  return {
    display_compact: profile?.display_compact ?? false,
    display_items_per_page: profile?.display_items_per_page ?? 20,
  };
};
