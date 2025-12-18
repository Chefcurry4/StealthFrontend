import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Bookmark, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LabCardImage } from "@/components/LabCardImage";
import { useLabs, LabFilters } from "@/hooks/useLabs";
import { useUniversities } from "@/hooks/useUniversities";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedLabs, useToggleSaveLab } from "@/hooks/useSavedItems";
import { useLabSaveCounts } from "@/hooks/useLabSaveCounts";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { CATEGORY_FILTER_OPTIONS } from "@/lib/labCategories";
import { SEO } from "@/components/SEO";

type SortOption = 'name-asc' | 'name-desc' | 'most-saved';

const Labs = () => {
  const [filters, setFilters] = useState<LabFilters>({});
  const [researchDomain, setResearchDomain] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const { data: labs, isLoading, error, refetch } = useLabs(filters);
  const { data: universities } = useUniversities();
  const { user } = useAuth();
  const { data: savedLabs } = useSavedLabs();
  const { data: labSaveCounts } = useLabSaveCounts();
  const toggleSave = useToggleSaveLab();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["labs"] });
    await refetch();
  }, [queryClient, refetch]);

  const updateFilter = (key: keyof LabFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const uniqueFacultyAreas = Array.from(
    new Set(labs?.map(l => l.faculty_match).filter(Boolean))
  ) as string[];

  // Filter labs by research domain (client-side filtering based on category detection)
  const filteredLabs = labs?.filter(lab => {
    if (!researchDomain) return true;
    
    const combined = `${lab.topics || ''} ${lab.faculty_match || ''}`.toLowerCase();
    const domainCategory = CATEGORY_FILTER_OPTIONS.find(opt => opt.value === researchDomain);
    
    if (!domainCategory || !researchDomain) return true;
    
    // Match based on the category keywords
    const keywordPatterns: Record<string, RegExp> = {
      'ai-ml': /artificial intelligence|machine learning|neural|deep learning|nlp|natural language|computer vision|ai\b|ml\b|data science|big data|analytics/i,
      'robotics': /robot|automation|mechatronics|motion control|autonomous|drone|uav|manipulator/i,
      'architecture': /architect|urban|building design|heritage|typology|construction|spatial|housing|landscape/i,
      'biomedical': /biomedical|cancer|medical|imaging|therapy|diagnostics|biology|genetic|cell|tissue|pharma|drug/i,
      'chemistry': /chemistry|catalysis|synthesis|molecular|polymer|material|composite|nano|crystal/i,
      'physics': /physics|astrophysics|cosmology|photonics|optics|laser|plasma|particle|spectroscopy/i,
      'quantum': /quantum|qubits|quantum computing|superconducting|quantum mechanics/i,
      'environment': /environmental|climate|atmospheric|ecology|sustainability|hydrology|water|pollution|ecosystem/i,
      'mathematics': /mathematics|statistics|algorithm|numerical|optimization|probability|stochastic|geometry/i,
      'cs-security': /computer science|cybersecurity|formal methods|verification|cryptography|network|software|distributed/i,
      'energy': /energy|solar|fuel cell|battery|power system|renewable|electric|grid|thermal/i,
      'mechanical': /mechanical|structural|fluid dynamics|thermodynamics|civil|geotechnical|bridge|infrastructure/i,
      'neuroscience': /neuro|brain|cognition|neural systems|cognitive|psychology|perception/i,
      'electronics': /electronics|semiconductor|mems|microelectronics|integrated circuit|chip|sensor|signal/i,
      'telecommunications': /telecom|wireless|communication|antenna|radio|5g|signal processing|network/i,
      'transportation': /transport|mobility|traffic|vehicle|rail|automotive|logistics|aviation/i,
    };
    
    const pattern = keywordPatterns[researchDomain];
    return pattern ? pattern.test(combined) : true;
  });

  // Get aggregate save counts for each lab from all users
  const getLabSaveCount = (labId: string) => {
    return labSaveCounts?.[labId] || 0;
  };

  // Sort labs
  const sortedLabs = filteredLabs?.slice().sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'most-saved':
        return getLabSaveCount(b.id_lab) - getLabSaveCount(a.id_lab);
      default:
        return 0;
    }
  });

  return (
    <>
      <SEO 
        title="Research Labs"
        description={`Explore ${sortedLabs?.length || 424} cutting-edge research laboratories. Discover opportunities in AI, robotics, biomedical, energy, and more research domains.`}
        keywords={["research labs", "academic research", "university labs", "research opportunities", "scientific research"]}
      />
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Research Labs
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-2xl">
              Discover cutting-edge research facilities and practical learning opportunities
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search labs by name or research area..."
                  className="pl-10"
                  value={filters.search || ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b backdrop-blur theme-section" style={{ borderColor: 'var(--theme-card-border)' }}>
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select onValueChange={(value) => updateFilter("universityId", value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="University" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {universities?.map((uni) => (
                    <SelectItem key={uni.uuid} value={uni.uuid}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateFilter("facultyArea", value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Faculty Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculty Areas</SelectItem>
                  {uniqueFacultyAreas.slice(0, 20).sort().map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={researchDomain} onValueChange={setResearchDomain}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Research Domain" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[160px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="most-saved">Most Saved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Labs List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton key={i} className="h-52 sm:h-64 lg:h-80" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center opacity-70">
                Error loading labs. Please try again.
              </p>
            ) : sortedLabs?.length === 0 ? (
              <p className="text-center opacity-70">
                No labs found matching your search.
              </p>
            ) : (
              <>
                <p className="text-sm opacity-60 mb-4">{sortedLabs?.length} labs found</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {sortedLabs?.map((lab) => {
                    const topics = lab.topics?.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) || [];
                    
                    return (
                      <Card 
                        key={lab.id_lab} 
                        className="overflow-hidden flex flex-col backdrop-blur-md cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
                        onClick={() => navigate(`/labs/${lab.slug || lab.id_lab}`)}
                      >
                        <LabCardImage 
                          labName={lab.name} 
                          labId={lab.id_lab} 
                          topics={lab.topics}
                          facultyMatch={lab.faculty_match}
                          className="h-20 sm:h-24 lg:h-28" 
                        />
                        <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
                          <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 line-clamp-2">{lab.name}</h3>
                          
                          {topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-4 flex-1">
                              {topics.map((topic, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs theme-badge">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-auto">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="flex-1 theme-btn-secondary text-xs sm:text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="theme-btn-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!user) {
                                  navigate("/auth");
                                  return;
                                }
                                toggleSave.mutate(lab.id_lab);
                              }}
                            >
                              <Bookmark className={`h-4 w-4 ${savedLabs?.some((s: any) => s.lab_id === lab.id_lab) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      </PullToRefresh>
    </>
  );
};

export default Labs;
