import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}

export const AuthRequiredDialog = ({ open, onOpenChange, feature }: AuthRequiredDialogProps) => {
  const { modeConfig } = useBackgroundTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        style={{
          background: modeConfig.ui.cardBackground,
          borderColor: modeConfig.ui.cardBorder,
          color: modeConfig.textColor,
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: modeConfig.textColor }}>
            Sign in to access {feature}
          </DialogTitle>
          <DialogDescription className="text-base opacity-80">
            Create a free account or sign in to unlock all features including {feature.toLowerCase()}, 
            saved items, learning agreements, and more.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Link to="/auth" onClick={() => onOpenChange(false)}>
            <Button 
              className="w-full gap-2"
              style={{ 
                background: modeConfig.ui.buttonPrimary,
                color: modeConfig.ui.buttonPrimaryText
              }}
            >
              <UserPlus className="h-4 w-4" />
              Create Free Account
            </Button>
          </Link>
          <Link to="/auth" onClick={() => onOpenChange(false)}>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              style={{ 
                borderColor: modeConfig.ui.cardBorder,
                color: modeConfig.textColor
              }}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
