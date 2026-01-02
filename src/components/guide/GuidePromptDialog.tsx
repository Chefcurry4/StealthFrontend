import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuidePromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGuide: () => void;
}

export const GuidePromptDialog = ({ isOpen, onClose, onStartGuide }: GuidePromptDialogProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 text-center">
            {/* Animated illustration */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6"
            >
              <Compass className="h-10 w-10 text-primary" />
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Welcome to Students Hub!</h2>
            </div>

            <p className="text-muted-foreground mb-6">
              Would you like a quick tour of the platform? We'll show you all the features to help you plan your perfect exchange semester.
            </p>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={onStartGuide} 
                className="w-full"
                size="lg"
              >
                <Compass className="h-4 w-4 mr-2" />
                Take the Tour
              </Button>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-muted-foreground"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
