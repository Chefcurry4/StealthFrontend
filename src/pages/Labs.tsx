import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Bookmark } from "lucide-react";
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
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";

const Labs = () => {
  const [filters, setFilters] = useState<LabFilters>({});
  const { data: labs, isLoading, error, refetch } = useLabs(filters);
  const { data: universities } = useUniversities();
  const { user } = useAuth();
  const { data: savedLabs } = useSavedLabs();
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

  return (
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
                <SelectTrigger className="w-[250px]">
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
            ) : labs?.length === 0 ? (
              <p className="text-center opacity-70">
                No labs found matching your search.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                {labs?.map((lab) => {
                  const topics = lab.topics?.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) || [];
                  
                  return (
                    <Card key={lab.id_lab} className="overflow-hidden flex flex-col backdrop-blur-md">
                      <LabCardImage labName={lab.name} labId={lab.id_lab} className="h-20 sm:h-24 lg:h-28" />
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
                          <Link to={`/labs/${lab.slug || lab.id_lab}`} className="flex-1">
                            <Button variant="secondary" size="sm" className="w-full theme-btn-secondary text-xs sm:text-sm">
                              View Details
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="theme-btn-secondary"
                            onClick={() => {
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
            )}
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
};

export default Labs;