import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  variant?: "aurora" | "night" | "ethereal" | "subtle" | "warm" | "warm-subtle";
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
    subtle: "bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 dark:from-primary/10 dark:via-accent/10 dark:to-primary/10",
    warm: "bg-gradient-to-br from-orange-400/15 via-pink-400/15 to-rose-300/15 dark:from-orange-500/25 dark:via-pink-500/25 dark:to-rose-400/25",
    "warm-subtle": "bg-gradient-to-br from-orange-300/8 via-pink-300/8 to-rose-200/8 dark:from-orange-400/15 dark:via-pink-400/15 dark:to-rose-300/15"
  };

  return (
    <div className={cn("relative", gradients[variant], className)}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
