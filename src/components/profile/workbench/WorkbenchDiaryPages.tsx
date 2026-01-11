import { Link } from "react-router-dom";
import { CalendarDays, Mail, Lightbulb, Sparkles, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DiaryModule {
  id: string;
  name: string;
  emoji?: string;
  description: string;
  features: string[];
  isComingSoon?: boolean;
  route: string;
}

const diaryModules: DiaryModule[] = [
  {
    id: "pandamester",
    name: "Pandamester",
    emoji: "🎓",
    description: "Plan your semester with AI assistance. Organize courses by term and export your plans.",
    features: ["AI-generated plans", "Winter/Summer terms", "Export CSV & PNG"],
    isComingSoon: false,
    route: "/workbench"
  },
  {
    id: "pandamail",
    name: "Pandamail",
    emoji: "📧",
    description: "Track your lab outreach emails. Monitor responses and manage follow-ups.",
    features: ["Email tracking", "Response status", "Follow-up reminders"],
    isComingSoon: true,
    route: "/workbench"
  }
];

const ModuleCard = ({ module }: { module: DiaryModule }) => {
  return (
    <Card className={`bg-background/40 border-border/50 hover:bg-background/60 transition-all hover:shadow-md ${module.isComingSoon ? 'opacity-80' : ''}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {module.emoji && <span className="text-2xl sm:text-3xl">{module.emoji}</span>}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm sm:text-base">{module.name}</h4>
                {module.isComingSoon && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    Coming Soon
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
          {module.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {module.features.map((feature) => (
            <Badge 
              key={feature} 
              variant="outline" 
              className="text-[10px] sm:text-xs px-2 py-0.5 bg-background/50"
            >
              {feature}
            </Badge>
          ))}
        </div>

        <Link to={module.route}>
          <Button 
            variant={module.isComingSoon ? "outline" : "default"} 
            size="sm" 
            className="w-full text-xs sm:text-sm h-9"
            disabled={module.isComingSoon}
          >
            {module.isComingSoon ? (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                Available Soon
              </>
            ) : (
              <>
                Open in Workbench
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </>
            )}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const handleSubmitIdea = () => {
  toast.success(
    "Thanks for your interest! Email your module ideas to feedback@unipandan.com",
    { duration: 5000 }
  );
};

export const WorkbenchDiaryPages = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base sm:text-lg">Diary Modules</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Organize your academic journey with smart tools
          </p>
        </div>
        <Link to="/workbench">
          <Button variant="outline" size="sm" className="text-xs">
            <CalendarDays className="h-3.5 w-3.5 mr-2" />
            Open Workbench
          </Button>
        </Link>
      </div>

      {/* Module Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {diaryModules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>

      {/* Submit Module Idea */}
      <div className="border border-dashed border-border/60 rounded-xl p-4 sm:p-5 bg-background/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-primary/70" />
          <span className="font-medium text-sm">Have an idea for a new module?</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          We're always looking for ways to help students better organize their academic life
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSubmitIdea}
          className="text-xs text-primary hover:text-primary/80"
        >
          <Mail className="h-3.5 w-3.5 mr-2" />
          Submit Your Idea
        </Button>
      </div>
    </div>
  );
};
