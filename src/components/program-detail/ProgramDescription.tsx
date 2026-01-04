import { FileText } from "lucide-react";

interface ProgramDescriptionProps {
  description: string | null | undefined;
}

export const ProgramDescription = ({ description }: ProgramDescriptionProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Description</h2>
      {description ? (
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Description not available yet. Please refer to the official program website for more details.
          </p>
        </div>
      )}
    </div>
  );
};
