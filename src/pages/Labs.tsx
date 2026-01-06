import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Bookmark, ArrowUpDown, RotateCcw, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LabCardImage } from "@/components/LabCardImage";
import { useLabs, LabFilters } from "@/hooks/useLabs";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedLabs, useToggleSaveLab } from "@/hooks/useSavedItems";
import { useLabSaveCounts } from "@/hooks/useLabSaveCounts";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { useDisplayPreferences } from "@/hooks/useDisplayPreferences";
import { TopicFilterMultiSelect } from "@/components/TopicFilterMultiSelect";

type SortOption = 'name-asc' | 'name-desc' | 'most-saved';
type DisplaySize = '5' | '7' | '10';

const Labs = () => {
  const [filters, setFilters] = useState<LabFilters>({});
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [displaySize, setDisplaySize] = useState<DisplaySize>('7');
  const displayPrefs = useDisplayPreferences();
  const { data: labs, isLoading, error, refetch } = useLabs(filters);
  const { user } = useAuth();
  const { data: savedLabs } = useSavedLabs();
  const { data: labSaveCounts } = useLabSaveCounts();
  const toggleSave = useToggleSaveLab();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const hasActiveFilters = filters.search || filters.facultyArea || selectedTopics.length > 0;

  const resetFilters = () => {
    setFilters({});
    setSelectedTopics([]);
    setSortBy('name-asc');
    setDisplaySize('7');
  };

  const getGridCols = () => {
    if (displayPrefs.display_compact) {
      switch (displaySize) {
        case '5': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
        case '7': return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8';
        case '10': return 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12';
        default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      }
    }
    switch (displaySize) {
      case '5': return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case '7': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7';
      case '10': return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10';
      default: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }
  };

  const getCardSize = () => {
    if (displayPrefs.display_compact || displaySize === '10') {
      return { imageHeight: 'h-16 sm:h-18 lg:h-20', textSize: 'text-xs', padding: 'p-2' };
    }
    return { imageHeight: 'h-20 sm:h-24 lg:h-28', textSize: 'text-sm sm:text-base lg:text-lg', padding: 'p-3 sm:p-4' };
  };

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

  // Parse all individual faculties from comma-separated strings
  const uniqueFacultyAreas = useMemo(() => {
    const allFaculties = new Set<string>();
    labs?.forEach(lab => {
      if (lab.faculty_match) {
        lab.faculty_match.split(',').forEach(faculty => {
          const trimmed = faculty.trim();
          if (trimmed) allFaculties.add(trimmed);
        });
      }
    });
    return Array.from(allFaculties).sort();
  }, [labs]);

  // Filter labs by topic
  const filteredLabs = labs?.filter(lab => {
    // Topic filter - support multiple topics
    if (selectedTopics.length > 0) {
      const labTopics = lab.topics?.toLowerCase() || '';
      const hasMatchingTopic = selectedTopics.some(topic => 
        labTopics.includes(topic.toLowerCase())
      );
      if (!hasMatchingTopic) return false;
    }
    
    return true;
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
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              <TopicFilterMultiSelect
                selectedTopics={selectedTopics}
                onTopicsChange={setSelectedTopics}
                className="w-full"
              />

              <Select 
                value={filters.facultyArea || "all"} 
                onValueChange={(value) => updateFilter("facultyArea", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Faculty Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculty Areas</SelectItem>
                  {uniqueFacultyAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="most-saved">Most Saved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={displaySize} onValueChange={(value) => setDisplaySize(value as DisplaySize)}>
                <SelectTrigger className="w-full">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Display" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per row</SelectItem>
                  <SelectItem value="7">7 per row</SelectItem>
                  <SelectItem value="10">10 per row</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Labs List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className={`grid ${getGridCols()} gap-2 sm:gap-3 lg:gap-4`}>
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
                <div className={`grid ${getGridCols()} gap-2 sm:gap-3 lg:gap-4`}>
                  {sortedLabs?.map((lab) => {
                    const topics = lab.topics?.split(',').map(t => t.trim()).filter(Boolean).slice(0, displaySize === '10' ? 2 : 3) || [];
                    const cardSize = getCardSize();
                    
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
                          className={cardSize.imageHeight} 
                        />
                        <CardContent className={`${cardSize.padding} flex flex-col flex-1`}>
                          <h3 className={`font-bold ${cardSize.textSize} mb-2 sm:mb-3 line-clamp-2`}>{lab.name}</h3>
                          
                          {topics.length > 0 && displaySize !== '10' && (
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
                              className={`flex-1 theme-btn-secondary ${displaySize === '10' ? 'text-xs h-7' : 'text-xs sm:text-sm'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/labs/${lab.slug || lab.id_lab}`);
                              }}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={`theme-btn-secondary ${displaySize === '10' ? 'h-7 w-7 p-0' : ''}`}
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
