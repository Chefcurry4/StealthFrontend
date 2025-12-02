import graduationCapIcon from "@/assets/graduation-cap-loader.png";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const Loader = ({ size = "md", fullScreen = false }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const content = (
    <div className="flex items-center justify-center">
      <div className="relative">
        <img
          src={graduationCapIcon}
          alt="Loading"
          className={`${sizeClasses[size]} animate-[bounce_1s_ease-in-out_infinite]`}
        />
        <div className="absolute inset-0 animate-[ping_1.5s_ease-in-out_infinite] opacity-30">
          <img
            src={graduationCapIcon}
            alt=""
            className={sizeClasses[size]}
          />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
