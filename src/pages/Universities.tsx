import { Search, MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Universities = () => {
  const sampleUniversities = [
    {
      id: 1,
      name: "École Polytechnique Fédérale de Lausanne (EPFL)",
      country: "Switzerland",
      countryCode: "CH",
      website: "https://www.epfl.ch",
      description: "Leading technical university in Europe with cutting-edge research facilities",
    },
    {
      id: 2,
      name: "ETH Zürich",
      country: "Switzerland",
      countryCode: "CH",
      website: "https://ethz.ch",
      description: "Swiss Federal Institute of Technology known for excellence in science and engineering",
    },
    {
      id: 3,
      name: "Technical University of Munich",
      country: "Germany",
      countryCode: "DE",
      website: "https://www.tum.de",
      description: "One of Europe's top universities for technology and innovation",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-4">
              Explore Universities
            </h1>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl">
              Discover partner universities worldwide and find the perfect destination for your exchange semester
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search universities by name or country..."
                  className="pl-10 bg-background"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Universities List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleUniversities.map((university) => (
                <Card key={university.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="text-lg">{university.name}</span>
                      <span className="text-2xl">{university.countryCode === "CH" ? "🇨🇭" : "🇩🇪"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{university.country}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {university.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Universities;
