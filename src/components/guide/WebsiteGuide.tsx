import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronLeft, ChevronRight, GraduationCap, BookOpen, 
  Microscope, Bot, BookMarked, User, Sparkles,
  MessageCircle, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
  features: string[];
  color: string;
  route: string;
  avatarMessage: string;
  screenshot?: string;
}

const guideSteps: GuideStep[] = [
  {
    id: "welcome",
    title: "Welcome to Students Hub! 🎓",
    description: "I'm your guide! Let me show you around this amazing platform for planning your exchange semester.",
    icon: Sparkles,
    emoji: "👋",
    features: [
      "12+ partner universities to explore",
      "1400+ courses to discover",
      "400+ research labs to find",
      "AI-powered recommendations"
    ],
    color: "from-primary/20 to-primary/5",
    route: "/",
    avatarMessage: "Hi there! I'm so excited to show you around. Let's explore together!"
  },
  {
    id: "universities",
    title: "Universities Page",
    description: "Browse all partner universities. View campus photos, explore programs, and see what each has to offer.",
    icon: GraduationCap,
    emoji: "🏛️",
    features: [
      "Campus photo galleries",
      "Programs and courses list",
      "Interactive location maps",
      "Research lab connections"
    ],
    color: "from-emerald-500/20 to-emerald-500/5",
    route: "/universities",
    avatarMessage: "This is where you discover your dream destination! Each university has so much to explore."
  },
  {
    id: "courses",
    title: "Courses Page",
    description: "Explore 1400+ courses! Filter by topic, language, ECTS credits, and more.",
    icon: BookOpen,
    emoji: "📚",
    features: [
      "Multi-topic filtering",
      "Student reviews & ratings",
      "ECTS and difficulty info",
      "Save favorites easily"
    ],
    color: "from-green-500/20 to-green-500/5",
    route: "/courses",
    avatarMessage: "Here you can find the perfect courses for your exchange. Don't forget to check the reviews!"
  },
  {
    id: "labs",
    title: "Research Labs",
    description: "Discover cutting-edge research labs. Perfect for thesis projects or research collaborations!",
    icon: Microscope,
    emoji: "🔬",
    features: [
      "Filter by research topic",
      "Find professors to contact",
      "See related programs",
      "Save labs for later"
    ],
    color: "from-purple-500/20 to-purple-500/5",
    route: "/labs",
    avatarMessage: "Looking for research opportunities? This is your goldmine! Find labs that match your interests."
  },
  {
    id: "workbench",
    title: "AI Workbench",
    description: "Your personal AI study advisor! Get recommendations, compose emails to professors, and manage everything.",
    icon: Bot,
    emoji: "🤖",
    features: [
      "AI-powered study advisor",
      "Smart email composer",
      "Saved items dashboard",
      "Conversation history"
    ],
    color: "from-orange-500/20 to-orange-500/5",
    route: "/workbench",
    avatarMessage: "This is where the magic happens! Ask me anything about your exchange planning."
  },
  {
    id: "diary",
    title: "My Diary",
    description: "Plan your semester visually! Create pages, track lab communications, and organize your study journey.",
    icon: BookMarked,
    emoji: "📔",
    features: [
      "Semester planning pages",
      "Drag-and-drop organization",
      "Lab communication tracker",
      "Custom notes & templates"
    ],
    color: "from-rose-500/20 to-rose-500/5",
    route: "/diary",
    avatarMessage: "Your personal space to plan everything! Create pages and organize your semester beautifully."
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "Customize your experience! Set preferences, themes, and access all your saved content.",
    icon: User,
    emoji: "👤",
    features: [
      "Personal flashcard design",
      "Theme customization",
      "Saved items collection",
      "Activity timeline"
    ],
    color: "from-cyan-500/20 to-cyan-500/5",
    route: "/profile",
    avatarMessage: "Make this space truly yours! Customize everything to your liking."
  }
];

interface WebsiteGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const WebsiteGuide = ({ isOpen, onClose, onComplete }: WebsiteGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const totalSteps = guideSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const step = guideSteps[currentStep];
  const Icon = step.icon;

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }, [currentStep, totalSteps, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const goToStep = useCallback((index: number) => {
    setCurrentStep(index);
  }, []);

  // Reset step when guide closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Full screen overlay */}
      <motion.div
        key="guide-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Main guide modal */}
        <motion.div
          key="guide-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="h-1">
            <Progress value={progress} className="h-1 rounded-none" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Step indicator dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {guideSteps.map((s, index) => (
                <button
                  key={`dot-${s.id}`}
                  onClick={() => goToStep(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                      ? "w-2.5 bg-primary/50"
                      : "w-2.5 bg-muted"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${step.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                {/* Left side - Avatar and message */}
                <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
                  {/* Avatar */}
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg border-2 border-background`}>
                      <span className="text-4xl">{step.emoji}</span>
                    </div>
                  </motion.div>
                  
                  {/* Speech bubble */}
                  <div className="mt-4 relative bg-muted/50 rounded-xl p-4 max-w-[240px]">
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-muted/50 rotate-45" />
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Guide</span>
                    </div>
                    <p className="text-sm leading-relaxed">{step.avatarMessage}</p>
                  </div>
                </div>

                {/* Right side - Content */}
                <div className="flex-1">
                  {/* Icon and title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{step.title}</h2>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {step.description}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {step.features.map((feature, index) => (
                      <motion.div
                        key={`${step.id}-feature-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 text-sm"
                      >
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Visit page link */}
                  {step.route !== "/" && (
                    <Link
                      to={step.route}
                      onClick={onClose}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit this page
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="icon"
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {currentStep + 1} / {totalSteps}
              </span>
              <Button 
                onClick={handleNext} 
                size="sm" 
                className="min-w-[100px]"
              >
                {currentStep === totalSteps - 1 ? (
                  "Get Started!"
                ) : (
                  <>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
