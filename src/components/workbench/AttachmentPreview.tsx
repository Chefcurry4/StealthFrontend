import { FileText, Image as ImageIcon, FileType, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentPreviewProps {
  name: string;
  type: string;
  content?: string;
  isReferenced?: boolean;
}

export const AttachmentPreview = ({
  name,
  type,
  content,
  isReferenced = false,
}: AttachmentPreviewProps) => {
  const isImage = type.includes("image");
  const isPdf = type.includes("pdf");
  const isText = type.includes("text");

  // For images, try to create a preview
  const getImagePreview = () => {
    // If content is base64 or data URL, show it
    if (content && (content.startsWith('data:image') || content.startsWith('http'))) {
      return (
        <div className="relative h-32 w-full rounded-lg overflow-hidden bg-accent/40">
          <img
            src={content}
            alt={name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <div className="text-xs font-medium text-white truncate">{name}</div>
          </div>
        </div>
      );
    }
    
    // Otherwise show icon
    return null;
  };

  // For PDFs, show a preview card
  const getPdfPreview = () => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
          <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
            <FileType className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-xs text-muted-foreground">PDF Document</div>
          </div>
          <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        {content && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 border border-border/30 max-h-20 overflow-y-auto">
            <div className="line-clamp-3">{content.slice(0, 200)}...</div>
          </div>
        )}
      </div>
    );
  };

  // For text files, show snippet
  const getTextPreview = () => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-xs text-muted-foreground">Text File</div>
          </div>
          <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        {content && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 border border-border/30 max-h-20 overflow-y-auto font-mono">
            <div className="line-clamp-3">{content.slice(0, 200)}...</div>
          </div>
        )}
      </div>
    );
  };

  const imagePreview = isImage ? getImagePreview() : null;

  return (
    <div
      className={cn(
        "transition-all duration-200",
        isReferenced && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background animate-pulse"
      )}
    >
      {imagePreview ? (
        imagePreview
      ) : isPdf ? (
        getPdfPreview()
      ) : isText ? (
        getTextPreview()
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
          <div className="h-9 w-9 rounded-lg bg-accent/40 flex items-center justify-center">
            <FileText className="h-4 w-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {type.toUpperCase()}
            </div>
          </div>
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
