import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Network, Search, X } from "lucide-react";

interface NetworkNode {
  id: string;
  name: string;
  type: "university" | "program" | "lab" | "teacher" | "course";
  val: number;
  level?: string; // For courses: Ba or Ma
}

interface NetworkLink {
  source: string;
  target: string;
}

interface UniversityNetworkProps {
  universityId: string;
  universityName: string;
  programs?: any[];
  labs?: any[];
  teachers?: any[];
  courses?: any[];
}

export const UniversityNetwork = ({
  universityId,
  universityName,
  programs = [],
  labs = [],
  teachers = [],
  courses = [],
}: UniversityNetworkProps) => {
  const [graphData, setGraphData] = useState<{ nodes: NetworkNode[]; links: NetworkLink[] }>({
    nodes: [],
    links: [],
  });
  const [filteredData, setFilteredData] = useState<{ nodes: NetworkNode[]; links: NetworkLink[] }>({
    nodes: [],
    links: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(["university", "program", "lab", "teacher", "course"]));
  const [courseLevelFilter, setCourseLevelFilter] = useState<"all" | "Ba" | "Ma">("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Update dimensions on container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 500,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Build initial graph data
  useEffect(() => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // Add university node
    nodes.push({
      id: universityId,
      name: universityName,
      type: "university",
      val: 30,
    });

    // Add program nodes
    programs.slice(0, 10).forEach((program) => {
      nodes.push({
        id: program.id,
        name: program.name,
        type: "program",
        val: 15,
      });
      links.push({
        source: universityId,
        target: program.id,
      });
    });

    // Add lab nodes
    labs.slice(0, 10).forEach((lab) => {
      nodes.push({
        id: lab.id_lab,
        name: lab.name,
        type: "lab",
        val: 15,
      });
      links.push({
        source: universityId,
        target: lab.id_lab,
      });
    });

    // Add teacher nodes
    teachers.slice(0, 15).forEach((teacher) => {
      nodes.push({
        id: teacher.id_teacher,
        name: teacher.full_name || teacher.name,
        type: "teacher",
        val: 10,
      });
      links.push({
        source: universityId,
        target: teacher.id_teacher,
      });
    });

    // Add course nodes
    courses.slice(0, 20).forEach((course) => {
      nodes.push({
        id: course.id_course,
        name: course.name_course,
        type: "course",
        val: 8,
        level: course.ba_ma,
      });
      links.push({
        source: universityId,
        target: course.id_course,
      });
    });

    setGraphData({ nodes, links });
  }, [universityId, universityName, programs, labs, teachers, courses]);

  // Apply filters and search
  useEffect(() => {
    let nodes = graphData.nodes.filter(node => {
      // Always include university node
      if (node.type === "university") return true;
      
      // Apply entity type filters
      if (!activeFilters.has(node.type)) return false;
      
      // Apply course level filter
      if (node.type === "course" && courseLevelFilter !== "all") {
        if (node.level !== courseLevelFilter) return false;
      }
      
      // Apply search filter
      if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    setFilteredData({ nodes, links });
  }, [graphData, activeFilters, courseLevelFilter, searchTerm]);

  const toggleFilter = (type: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getNodeColor = (node: NetworkNode) => {
    switch (node.type) {
      case "university":
        return "hsl(var(--primary))";
      case "program":
        return "hsl(var(--chart-1))";
      case "lab":
        return "hsl(var(--chart-2))";
      case "teacher":
        return "hsl(var(--chart-3))";
      case "course":
        return node.level === "Ma" ? "hsl(var(--chart-4))" : "hsl(var(--chart-5))";
      default:
        return "hsl(var(--foreground))";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          University Network Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Entity Type Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground mr-2">Show:</span>
          <Badge
            variant={activeFilters.has("program") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleFilter("program")}
          >
            Programs ({programs.length})
          </Badge>
          <Badge
            variant={activeFilters.has("lab") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleFilter("lab")}
          >
            Labs ({labs.length})
          </Badge>
          <Badge
            variant={activeFilters.has("teacher") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleFilter("teacher")}
          >
            Faculty ({teachers.length})
          </Badge>
          <Badge
            variant={activeFilters.has("course") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleFilter("course")}
          >
            Courses ({courses.length})
          </Badge>
        </div>

        {/* Course Level Filter */}
        {activeFilters.has("course") && courses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Course Level:</span>
            <Badge
              variant={courseLevelFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCourseLevelFilter("all")}
            >
              All
            </Badge>
            <Badge
              variant={courseLevelFilter === "Ba" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCourseLevelFilter("Ba")}
            >
              Bachelor
            </Badge>
            <Badge
              variant={courseLevelFilter === "Ma" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCourseLevelFilter("Ma")}
            >
              Master
            </Badge>
          </div>
        )}

        {/* Network Visualization */}
        <div ref={containerRef} className="w-full h-[500px] border rounded-lg bg-background overflow-hidden">
          {filteredData.nodes.length > 0 ? (
            <ForceGraph2D
              graphData={filteredData}
              nodeLabel="name"
              nodeColor={getNodeColor}
              nodeRelSize={6}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="transparent"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No entities match your filters
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
            <span>University</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            <span>Programs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span>Labs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
            <span>Faculty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-5))" }} />
            <span>Bachelor Courses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
            <span>Master Courses</span>
          </div>
        </div>

        {/* Stats */}
        <div className="text-xs text-muted-foreground">
          Showing {filteredData.nodes.length - 1} of {graphData.nodes.length - 1} entities
        </div>
      </CardContent>
    </Card>
  );
};
