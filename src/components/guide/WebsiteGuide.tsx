import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronLeft, ChevronRight, GraduationCap, BookOpen, 
  Microscope, Bot, BookMarked, Search, User, Sparkles,
  MapPin, Star, FileText, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  illustration: string;
  features: string[];
  color: string;
}

const guideSteps: GuideStep[] = [
  {
    id: "welcome",
    title: "Welcome to Students Hub! 🎓",
    description: "Your AI-powered companion for planning your international study semester. Let's take a quick tour of what you can do here.",
    icon: Sparkles,
    illustration: "🌍",
    features: [
      "Explore 12+ partner universities",
      "Discover 1400+ courses",
      "Find 400+ research labs",
      "Get personalized AI recommendations"
    ],
    color: "from-primary/20 to-primary/5"
  },
  {
    id: "search",
    title: "Powerful Search",
    description: "Use the global search to find anything instantly - universities, courses, labs, or professors.",
    icon: Search,
    illustration: "🔍",
    features: [
      "Search across all content types",
      "Smart autocomplete suggestions",
      "Filter by categories",
      "Quick access from anywhere (Ctrl+K)"
    ],
    color: "from-blue-500/20 to-blue-500/5"
  },
  {
    id: "universities",
    title: "Explore Universities",
    description: "Browse partner universities around the world. View campus photos, programs offered, and location details.",
    icon: GraduationCap,
    illustration: "🏛️",
    features: [
      "Interactive campus galleries",
      "Program and course listings",
      "Location maps",
      "Research labs connections"
    ],
    color: "from-blue-500/20 to-blue-500/5"
  },
  {
    id: "courses",
    title: "Discover Courses",
    description: "Find the perfect courses for your exchange semester. Filter by topic, see reviews, and save your favorites.",
    icon: BookOpen,
    illustration: "📚",
    features: [
      "Topic-based filtering",
      "Student reviews and ratings",
      "Course difficulty indicators",
      "Save courses to your list"
    ],
    color: "from-green-500/20 to-green-500/5"
  },
  {
    id: "labs",
    title: "Research Labs",
    description: "Explore cutting-edge research labs. Find opportunities for thesis projects, internships, or research collaborations.",
    icon: Microscope,
    illustration: "🔬",
    features: [
      "Browse by research topic",
      "Professor contact information",
      "Related programs and courses",
      "Save labs for later"
    ],
    color: "from-purple-500/20 to-purple-500/5"
  },
  {
    id: "workbench",
    title: "AI Workbench",
    description: "Your personal AI advisor to help plan your semester. Get recommendations, compose emails to professors, and manage your saved items.",
    icon: Bot,
    illustration: "🤖",
    features: [
      "AI-powered study advisor",
      "Smart email composer",
      "Saved courses and labs",
      "Conversation history"
    ],
    color: "from-orange-500/20 to-orange-500/5"
  },
  {
    id: "diary",
    title: "My Diary",
    description: "Plan your semester visually with an interactive notebook. Track lab communications and organize your study plans.",
    icon: BookMarked,
    illustration: "📔",
    features: [
      "Semester planning pages",
      "Drag-and-drop course cards",
      "Lab communication tracker",
      "Custom notes and templates"
    ],
    color: "from-rose-500/20 to-rose-500/5"
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "Customize your experience. Set your university, preferences, and access all your saved content.",
    icon: User,
    illustration: "👤",
    features: [
      "Personal flashcard",
      "Theme customization",
      "Saved items access",
      "Activity timeline"
    ],
    color: "from-cyan-500/20 to-cyan-500/5"
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

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border overflow-hidden"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1">
            <Progress value={progress} className="h-1 rounded-none" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {guideSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-6 bg-primary"
                      : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Illustration */}
                <div className={`mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6`}>
                  <span className="text-5xl">{step.illustration}</span>
                </div>

                {/* Title with icon */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {step.description}
                </p>

                {/* Features grid */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-8">
                  {step.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-left text-sm"
                    >
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 pt-0">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="icon"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleNext} className="min-w-[100px]">
                {currentStep === totalSteps - 1 ? (
                  "Get Started"
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
