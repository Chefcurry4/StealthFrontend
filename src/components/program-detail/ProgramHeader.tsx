import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Clock, BookOpen, ExternalLink, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface ProgramHeaderProps {
  program: Program;
  programInfo?: {
    level?: string;
    duration?: string;
    website?: string;
  } | null;
  structure?: FullProgramStructure | null;
  courseCount: number;
  totalEcts: number;
}

export const ProgramHeader = ({
  program,
  programInfo,
  structure,
  courseCount,
  totalEcts,
}: ProgramHeaderProps) => {
  const navigate = useNavigate();

  const isMaster = programInfo?.level?.toLowerCase().includes("master");
  const isBachelor = programInfo?.level?.toLowerCase().includes("bachelor");

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

  const displayDuration = structure?.structure?.duration || programInfo?.duration;
  const displayCredits = structure?.structure?.total_credits || totalEcts;
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

      {/* Title + Degree Pills */}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-primary/10 rounded-xl shrink-0">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">{program.name}</h1>
            <div className="flex gap-2">
              {isBachelor && (
                <Badge variant="default" className="text-xs">Bachelor</Badge>
              )}
              {isMaster && (
                <Badge variant="secondary" className="text-xs">Master</Badge>
              )}
            </div>
          </div>

          {/* Summary Strip */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {displayDuration && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {displayDuration}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {courseCount} courses
            </span>
            <span className="font-bold text-foreground">
              {displayCredits} ECTS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
