import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

interface NetworkNode {
  id: string;
  name: string;
  type: "university" | "program" | "lab" | "teacher";
  val: number;
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
}

export const UniversityNetwork = ({
  universityId,
  universityName,
  programs = [],
  labs = [],
  teachers = [],
}: UniversityNetworkProps) => {
  const [graphData, setGraphData] = useState<{ nodes: NetworkNode[]; links: NetworkLink[] }>({
    nodes: [],
    links: [],
  });
  const containerRef = useRef<HTMLDivElement>(null);

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

    setGraphData({ nodes, links });
  }, [universityId, universityName, programs, labs, teachers]);

  const getNodeColor = (node: NetworkNode) => {
    switch (node.type) {
      case "university":
        return "hsl(var(--primary))";
      case "program":
        return "hsl(var(--accent))";
      case "lab":
        return "hsl(var(--secondary))";
      case "teacher":
        return "hsl(var(--muted))";
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
      <CardContent>
        <div ref={containerRef} className="w-full h-[500px] border rounded-lg bg-background">
          {graphData.nodes.length > 0 && (
            <ForceGraph2D
              graphData={graphData}
              nodeLabel="name"
              nodeColor={getNodeColor}
              nodeRelSize={6}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              width={containerRef.current?.clientWidth || 800}
              height={500}
              backgroundColor="transparent"
            />
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
            <span>University</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--accent))" }} />
            <span>Programs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--secondary))" }} />
            <span>Labs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--muted))" }} />
            <span>Faculty</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
