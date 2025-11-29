import { Search, Microscope, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Labs = () => {
  const sampleLabs = [
    {
      id: 1,
      name: "Artificial Intelligence Laboratory",
      university: "EPFL",
      professors: "Prof. Martin Jaggi, Prof. Antoine Bosselut",
      topics: ["Machine Learning", "Natural Language Processing", "Computer Vision"],
      description: "Leading research in AI with focus on deep learning and neural architectures",
    },
    {
      id: 2,
      name: "Quantum Computing Lab",
      university: "ETH Zürich",
      professors: "Prof. Andreas Wallraff",
      topics: ["Quantum Computing", "Quantum Information", "Superconducting Circuits"],
      description: "Pioneering research in quantum computing hardware and algorithms",
    },
    {
      id: 3,
      name: "Robotics Systems Laboratory",
      university: "EPFL",
      professors: "Prof. Aude Billard",
      topics: ["Robotics", "Human-Robot Interaction", "Learning Algorithms"],
      description: "Research on adaptive robots and learning from demonstration",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-4">
              Explore Labs
            </h1>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl">
              Discover cutting-edge research facilities and practical learning opportunities
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search labs by name or research area..."
                  className="pl-10 bg-background"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Labs List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sampleLabs.map((lab) => (
                <Card key={lab.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Microscope className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{lab.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{lab.university}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{lab.professors}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lab.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lab.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Save Lab
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

export default Labs;
