import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Clock, BookOpen, ExternalLink, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Program } from "@/hooks/usePrograms";
import { FullProgramStructure } from "@/hooks/useProgramStructure";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProgramHeaderProps {
  program: Program;
  programInfo?: {
    level?: string;
    duration?: string;
    website?: string;
  } | null;
  structure?: FullProgramStructure | null;
  hasBachelor: boolean;
  hasMaster: boolean;
  selectedLevel: 'bachelor' | 'master' | null;
  onLevelChange: (level: 'bachelor' | 'master') => void;
  stats: {
    duration: string;
    courseCount: number;
    ects: number;
  };
}

export const ProgramHeader = ({
  program,
  programInfo,
  structure,
  hasBachelor,
  hasMaster,
  selectedLevel,
  onLevelChange,
  stats,
}: ProgramHeaderProps) => {
  const navigate = useNavigate();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: program.name,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const displayWebsite = structure?.structure?.website || programInfo?.website;
  const contactEmail = structure?.structure?.contact_email;

  return (
    <div className="mb-6">
      {/* Breadcrumb + Back Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/universities">Universities</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{program.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          {displayWebsite && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Official Page
              </a>
            </Button>
          )}
          {contactEmail && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`mailto:${contactEmail}`}>
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Title + Icon */}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-primary/10 rounded-xl shrink-0">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{program.name}</h1>

          {/* Bachelor/Master Clickable Tabs */}
          <div className="flex gap-3 mb-4">
            {hasBachelor && (
              <button
                onClick={() => onLevelChange('bachelor')}
                className={cn(
                  "px-6 py-3 rounded-lg font-semibold text-lg transition-all border-2",
                  selectedLevel === 'bachelor'
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-muted hover:bg-muted/80 border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Bachelor
              </button>
            )}
            {hasMaster && (
              <button
                onClick={() => onLevelChange('master')}
                className={cn(
                  "px-6 py-3 rounded-lg font-semibold text-lg transition-all border-2",
                  selectedLevel === 'master'
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-muted hover:bg-muted/80 border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Master
              </button>
            )}
          </div>

          {/* Dynamic Stats Strip */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {stats.duration && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {stats.duration}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {stats.courseCount} courses
            </span>
            <span className="font-bold text-foreground">
              {stats.ects} ECTS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
