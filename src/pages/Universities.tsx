import { useState, useCallback } from "react";
import { UniversityCardImage } from "@/components/UniversityCardImage";
import { Search, MapPin, Globe, Map as MapIcon, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUniversities } from "@/hooks/useUniversities";
import { Link } from "react-router-dom";
import UniversityMap from "@/components/UniversityMap";
import { UniversityCardSkeleton } from "@/components/skeletons/UniversityCardSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";

const Universities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const { data: universities, isLoading, error, refetch } = useUniversities(searchQuery);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["universities"] });
    await refetch();
  }, [queryClient, refetch]);

  const filteredUniversities = universities?.filter(uni => 
    countryFilter === "all" || uni.country === countryFilter
  );

  const uniqueCountries = Array.from(new Set(universities?.map(u => u.country).filter(Boolean))) as string[];

  return (
    <>
      <SEO 
        title="Universities"
        description={`Explore ${filteredUniversities?.length || 12} partner universities worldwide. Find the perfect destination for your exchange semester and discover available programs.`}
        keywords={["partner universities", "exchange universities", "study abroad destinations", "university programs"]}
      />
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Universities
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-2xl">
              Discover all partner universities and plan your perfect semester
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search universities by name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.sort().map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Universities List/Map */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-6 theme-card backdrop-blur">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  Map View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                {isLoading && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <UniversityCardSkeleton key={i} />
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-center py-12">
                    <p className="text-destructive">Failed to load universities. Please try again later.</p>
                  </div>
                )}

                {filteredUniversities && filteredUniversities.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="opacity-70">No universities found matching your filters.</p>
                  </div>
                )}

                {filteredUniversities && filteredUniversities.length > 0 && (
                  <>
                    {/* Beta notice */}
                    <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                      <p className="text-sm text-foreground">
                        <strong>Beta Version:</strong> This is the Beta version of Students Hub. For now only EPFL is covered, but more universities and features to come in next versions!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                      {filteredUniversities.map((university) => {
                        const isEPFL = university.name.toLowerCase().includes('epfl') || university.slug.toLowerCase().includes('epfl');
                        
                        const cardContent = (
                          <Card className={`flex flex-col overflow-hidden backdrop-blur-md transition-all duration-200 ${isEPFL ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}>
                            <UniversityCardImage 
                              universityId={university.uuid}
                              universityName={university.name}
                              logoUrl={university.logo_url}
                              country={university.country_code}
                              className="h-20 sm:h-24 lg:h-26"
                            />
                            <CardHeader className="flex-1 p-3 sm:p-4 lg:p-6">
                              <CardTitle className="text-base sm:text-lg lg:text-xl leading-tight line-clamp-2">{university.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-6 pt-0">
                              {university.country && (
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm opacity-70">
                                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>{university.country}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" className="flex-1 theme-btn-secondary text-xs sm:text-sm" onClick={(e) => e.stopPropagation()} disabled={!isEPFL}>
                                  {isEPFL ? 'View Details' : 'Coming Soon'}
                                </Button>
                                {university.website && isEPFL && (
                                  <a 
                                    href={university.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button variant="outline" size="sm" className="theme-btn-secondary p-2 sm:p-2.5">
                                      <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );

                        if (isEPFL) {
                          return (
                            <Link to={`/universities/${university.slug}`} key={university.uuid} className="block">
                              {cardContent}
                            </Link>
                          );
                        }
                        
                        return (
                          <div key={university.uuid}>
                            {cardContent}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="map">
                {filteredUniversities && filteredUniversities.length > 0 ? (
                  <UniversityMap universities={filteredUniversities} />
                ) : (
                  <div className="text-center py-12">
                    <p className="opacity-70">No universities to display on map</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
      </PullToRefresh>
    </>
  );
};

export default Universities;