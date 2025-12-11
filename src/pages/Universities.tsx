import { useState } from "react";
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

const Universities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const { data: universities, isLoading, error } = useUniversities(searchQuery);

  const filteredUniversities = universities?.filter(uni => 
    countryFilter === "all" || uni.country === countryFilter
  );

  const uniqueCountries = Array.from(new Set(universities?.map(u => u.country).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Universities
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-2xl">
              Discover {filteredUniversities?.length || 0} partner universities worldwide and find the perfect destination for your exchange semester
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search universities by name..."
                  className="pl-10 bg-white/10 backdrop-blur border-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[200px] bg-white/10 backdrop-blur border-white/20">
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
              <TabsList className="mb-6 bg-white/10 backdrop-blur">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredUniversities.map((university) => (
                      <Card key={university.uuid} className="flex flex-col overflow-hidden backdrop-blur-md bg-white/10 border-white/20">
                        <UniversityCardImage 
                          universityId={university.uuid}
                          universityName={university.name}
                          logoUrl={university.logo_url}
                          country={university.country}
                          className="h-32"
                        />
                        <CardHeader className="flex-1">
                          <CardTitle className="text-lg leading-tight line-clamp-2">{university.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {university.country && (
                            <div className="flex items-center gap-2 text-sm opacity-70">
                              <MapPin className="h-4 w-4" />
                              <span>{university.country}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Link to={`/universities/${university.slug}`} className="flex-1">
                              <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30">
                                View Details
                              </Button>
                            </Link>
                            {university.website && (
                              <a 
                                href={university.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20">
                                  <Globe className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
    </div>
  );
};

export default Universities;