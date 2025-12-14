interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const Loader = ({ size = "md", fullScreen = false }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  const content = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-foreground/30 border-t-foreground animate-spin`}
        style={{
          animation: "spin 1s linear infinite, pulse 2s ease-in-out infinite",
        }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
