import { useState } from "react";
import { Upload, X, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadUniversityMedia } from "@/hooks/useUniversityMedia";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UniversityPhotoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universityId: string;
  universityName: string;
}

export const UniversityPhotoUploadModal = ({
  open,
  onOpenChange,
  universityId,
  universityName,
}: UniversityPhotoUploadModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const uploadMutation = useUploadUniversityMedia();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [moderating, setModerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage first
      const fileExt = file.name.split(".").pop();
      const fileName = `${universityId}/${user.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Run content moderation
      setModerating(true);
      try {
        const { data: moderationResult, error: moderationError } = await supabase.functions
          .invoke("moderate-image", {
            body: { imageUrl },
          });

        if (moderationError) {
          console.error("Moderation error:", moderationError);
          // Continue anyway if moderation fails
        } else if (moderationResult && !moderationResult.safe) {
          // Delete the uploaded image
          await supabase.storage.from("profile-pictures").remove([fileName]);
          
          toast({
            title: "Image rejected",
            description: moderationResult.reason || "This image doesn't meet our community guidelines",
            variant: "destructive",
          });
          setUploading(false);
          setModerating(false);
          return;
        }
      } catch (modError) {
        console.error("Moderation check failed:", modError);
        // Continue anyway if moderation fails
      }
      setModerating(false);

      // Save to university_media table
      await uploadMutation.mutateAsync({
        university_id: universityId,
        image_url: imageUrl,
        type: "campus",
      });

      setFile(null);
      setPreview(null);
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not upload your photo";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setModerating(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Campus Photo</DialogTitle>
          <DialogDescription>
            Share your photos of {universityName}'s campus with other students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full aspect-video object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <Label
                htmlFor="photo-upload"
                className="cursor-pointer text-primary hover:underline"
              >
                Click to select a photo
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG up to 5MB
              </p>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Security notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Images are reviewed for appropriate content before publishing</span>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {moderating ? "Checking..." : "Uploading..."}
                </>
              ) : (
                "Upload Photo"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
