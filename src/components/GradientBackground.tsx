import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  variant?: "aurora" | "night" | "ethereal" | "subtle";
  className?: string;
  children: React.ReactNode;
}

export const GradientBackground = ({ 
  variant = "aurora", 
  className,
  children 
}: GradientBackgroundProps) => {
  const gradients = {
    aurora: "bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20",
    night: "bg-gradient-to-b from-slate-900/5 via-blue-900/10 to-purple-900/10 dark:from-slate-900/50 dark:via-blue-900/30 dark:to-purple-900/30",
    ethereal: "bg-gradient-to-br from-violet-400/10 via-purple-400/10 to-fuchsia-400/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-fuchsia-500/20",
    subtle: "bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 dark:from-primary/10 dark:via-accent/10 dark:to-primary/10"
  };

  return (
    <div className={cn(gradients[variant], className)}>
      {children}
    </div>
  );
};
