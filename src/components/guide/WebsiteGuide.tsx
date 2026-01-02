import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronLeft, ChevronRight, GraduationCap, BookOpen, 
  Microscope, Bot, BookMarked, Search, User, Sparkles,
  Home, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
  features: string[];
  color: string;
  route?: string; // Optional route to navigate to
  avatarMessage: string; // What the avatar says
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
    id: "search",
    title: "Global Search",
    description: "Find anything instantly! Use Ctrl+K (or Cmd+K) to open the search from anywhere.",
    icon: Search,
    emoji: "🔍",
    features: [
      "Search universities, courses, labs",
      "Smart autocomplete suggestions",
      "Filter by category type",
      "Recent searches saved"
    ],
    color: "from-blue-500/20 to-blue-500/5",
    route: "/",
    avatarMessage: "Pro tip: Press Ctrl+K anytime to search. It's super fast!"
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
  const navigate = useNavigate();
  const location = useLocation();
  
  const totalSteps = guideSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const step = guideSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = guideSteps[currentStep + 1];
      setCurrentStep(currentStep + 1);
      // Navigate to the next step's route if different
      if (nextStep.route && nextStep.route !== location.pathname) {
        navigate(nextStep.route);
      }
    } else {
      onComplete();
      navigate("/"); // Return to home on completion
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = guideSteps[currentStep - 1];
      setCurrentStep(currentStep - 1);
      if (prevStep.route && prevStep.route !== location.pathname) {
        navigate(prevStep.route);
      }
    }
  };

  const handleSkip = () => {
    onComplete();
    navigate("/");
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
    const targetStep = guideSteps[index];
    if (targetStep.route && targetStep.route !== location.pathname) {
      navigate(targetStep.route);
    }
  };

  // Navigate to initial route when guide opens
  useEffect(() => {
    if (isOpen && guideSteps[0].route && location.pathname !== guideSteps[0].route) {
      navigate(guideSteps[0].route);
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
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay that darkens the background but still shows it */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
      />
      
      {/* Floating avatar guide in bottom left */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed bottom-6 left-6 z-[101] max-w-md"
      >
        {/* Avatar with speech bubble */}
        <div className="flex items-end gap-3">
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
            className="shrink-0"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg border-2 border-background">
              <span className="text-3xl">📚</span>
            </div>
          </motion.div>
          
          {/* Speech bubble */}
          <motion.div
            key={step.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-card rounded-2xl shadow-xl border p-4 max-w-sm"
          >
            {/* Triangle pointer */}
            <div className="absolute -left-2 bottom-4 w-4 h-4 bg-card border-l border-b rotate-45" />
            
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Guide</span>
            </div>
            <p className="text-sm leading-relaxed">{step.avatarMessage}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main guide card - positioned at top right */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 50, opacity: 0 }}
        className="fixed top-20 right-6 z-[101] w-full max-w-sm"
      >
        <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
          {/* Progress bar */}
          <div className="h-1">
            <Progress value={progress} className="h-1 rounded-none" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="p-5">
            {/* Step indicator dots */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {guideSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-6 bg-primary"
                      : index < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Icon and title */}
                <div className={`mx-auto w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{step.emoji}</span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{step.title}</h2>
                </div>

                <p className="text-sm text-muted-foreground text-center mb-4">
                  {step.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {step.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 text-xs"
                    >
                      <Sparkles className="h-3 w-3 text-primary shrink-0" />
                      <span className="line-clamp-1">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-5 pb-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-muted-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="icon"
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleNext} size="sm" className="min-w-[80px]">
                {currentStep === totalSteps - 1 ? (
                  "Finish!"
                ) : (
                  <>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
