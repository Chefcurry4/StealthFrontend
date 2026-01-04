import { useParams, Link, useNavigate } from "react-router-dom";
import { useRef, useEffect, useMemo } from "react";
import { ChevronRight, Beaker, Bookmark, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLab, useUniversitiesByLab } from "@/hooks/useLabs";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedLabs, useToggleSaveLab } from "@/hooks/useSavedItems";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useLabReviews, calculateLabReviewSummary } from "@/hooks/useLabReviews";
import { SEO, generateLabSchema, generateBreadcrumbSchema } from "@/components/SEO";
import { 
  LabInfoCard, 
  LabUserActionsCard, 
  LabReviewSection,
  type LabReviewSectionHandle 
} from "@/components/lab-detail";

const LabDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: lab, isLoading, error } = useLab(slug!);
  const { data: universities } = useUniversitiesByLab(lab?.id_lab || "");
  const { user } = useAuth();
  const { data: savedLabs } = useSavedLabs();
  const toggleSave = useToggleSaveLab();
  const { addItem } = useRecentlyViewed();
  const { data: reviews } = useLabReviews(lab?.id_lab || "");
  const reviewSectionRef = useRef<LabReviewSectionHandle>(null);

  // Calculate review summary
  const reviewSummary = useMemo(() => {
    return calculateLabReviewSummary(reviews);
  }, [reviews]);

  const isSaved = savedLabs?.some((saved: any) => saved.lab_id === lab?.id_lab);

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Track recently viewed lab
  useEffect(() => {
    if (lab) {
      addItem({
        id: lab.id_lab,
        type: 'lab',
        name: lab.name,
        href: `/labs/${lab.slug}`,
        topics: lab.topics || undefined,
      });
    }
  }, [lab, addItem]);

  const handleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (lab) {
      toggleSave.mutate(lab.id_lab);
    }
  };

  const handleOpenReview = () => {
    reviewSectionRef.current?.scrollToForm();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <Skeleton className="h-5 w-48 mb-4" />
            <Skeleton className="h-10 w-2/3 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (error || !lab) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link to="/labs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Labs
          </Link>
          <div className="text-center py-16">
            <Beaker className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Lab Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The lab you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/labs">
              <Button>Browse All Labs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: typeof window !== "undefined" ? window.location.origin : "" },
    { name: "Labs", url: `${typeof window !== "undefined" ? window.location.origin : ""}/labs` },
    { name: lab.name, url: typeof window !== "undefined" ? window.location.href : "" },
  ]);

  const labSchema = generateLabSchema({
    name: lab.name,
    description: lab.description || undefined,
    topics: lab.topics || undefined,
    link: lab.link || undefined,
    university: universities?.[0]?.name,
  });

  return (
    <>
      <SEO 
        title={lab.name}
        description={lab.description || `${lab.name} - Research laboratory. ${lab.topics ? `Research areas: ${lab.topics.split(',').slice(0, 3).join(", ")}` : ""}`}
        keywords={[lab.name, ...(lab.topics?.split(',').slice(0, 5) || []), "research lab", "university research"]}
        structuredData={{ "@graph": [breadcrumbSchema, labSchema] }}
      />
      
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <header className="mb-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-muted-foreground mb-4">
              <Link to="/labs" className="hover:text-foreground transition-colors">
                Labs
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-foreground truncate max-w-[300px]">{lab.name}</span>
            </nav>

            {/* Title and Actions Row */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 break-words">
                  {lab.name}
                </h1>
                
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {lab.faculty_match && (
                    <Badge variant="secondary">
                      {lab.faculty_match}
                    </Badge>
                  )}
                  {universities && universities.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {universities[0].name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Save Button (Header) */}
              <Button
                size="lg"
                variant={isSaved ? "secondary" : "default"}
                onClick={handleSave}
                disabled={toggleSave.isPending}
                className="shrink-0 gap-2"
                aria-label={isSaved ? "Remove from saved labs" : "Save lab"}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Lab'}
              </Button>
            </div>
          </header>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Lab Info */}
            <div className="lg:col-span-2 flex">
              <LabInfoCard lab={lab} />
            </div>

            {/* Right Column - User Actions */}
            <div className="lg:col-span-1 flex">
              <LabUserActionsCard 
                labId={lab.id_lab}
                labName={lab.name}
                labLink={lab.link}
                onOpenReview={handleOpenReview}
                reviewSummary={reviewSummary.totalReviews > 0 ? reviewSummary : undefined}
              />
            </div>
          </div>

          {/* Universities Section */}
          {universities && universities.length > 1 && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Associated Universities ({universities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {universities.map((uni: any) => (
                      <Link
                        key={uni.uuid}
                        to={`/universities/${uni.slug}`}
                        className="block p-3 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {uni.logo_url && (
                            <img 
                              src={uni.logo_url} 
                              alt={uni.name} 
                              className="h-8 w-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-sm">{uni.name}</h3>
                            {uni.country && (
                              <p className="text-xs text-muted-foreground">{uni.country}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mb-8">
            <LabReviewSection 
              ref={reviewSectionRef}
              labId={lab.id_lab} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LabDetail;