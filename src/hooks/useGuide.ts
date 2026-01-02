import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useGuide = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndUpdateLoginCount = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch current user profile
        const { data: profile, error } = await supabase
          .from("Users(US)")
          .select("login_count, guide_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          return;
        }

        const currentLoginCount = profile?.login_count || 0;
        const guideCompleted = profile?.guide_completed || false;

        // Increment login count
        const newLoginCount = currentLoginCount + 1;
        
        await supabase
          .from("Users(US)")
          .update({ login_count: newLoginCount })
          .eq("id", user.id);

        // Show prompt if within first 3 logins and guide not completed
        if (newLoginCount <= 3 && !guideCompleted) {
          // Small delay to let the page render first
          setTimeout(() => {
            setShowPrompt(true);
          }, 1500);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error in guide check:", err);
        setIsLoading(false);
      }
    };

    checkAndUpdateLoginCount();
  }, [user]);

  const startGuide = () => {
    setShowPrompt(false);
    setShowGuide(true);
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  const closeGuide = () => {
    setShowGuide(false);
  };

  const completeGuide = async () => {
    setShowGuide(false);
    
    if (user) {
      try {
        await supabase
          .from("Users(US)")
          .update({ guide_completed: true })
          .eq("id", user.id);
        
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } catch (err) {
        console.error("Error marking guide complete:", err);
      }
    }
  };

  const openGuide = () => {
    setShowGuide(true);
  };

  return {
    showPrompt,
    showGuide,
    isLoading,
    startGuide,
    closePrompt,
    closeGuide,
    completeGuide,
    openGuide,
  };
};
