import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useProfilePictureUpload = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Must be logged in");

      // Delete existing profile picture first
      const { data: existingFiles } = await supabase.storage
        .from("profile-pictures")
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from("profile-pictures")
          .remove(filesToDelete);
      }

      // Upload new profile picture
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await supabase
        .from("Users(US)")
        .update({ profile_photo_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      return data.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile picture updated!");
    },
    onError: (error) => {
      toast.error("Failed to upload profile picture");
      console.error(error);
    },
  });
};
