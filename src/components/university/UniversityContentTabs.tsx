import { useState } from "react";
import { Filter, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UniversityListCard } from "./UniversityListCard";
import { Link, useParams } from "react-router-dom";

interface Program {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  level?: string | null;
}

interface UniversityContentTabsProps {
  programs: Program[];
  universitySlug: string;
}

type FilterType = "all" | "bachelor" | "master";

export const UniversityContentTabs = ({ programs, universitySlug }: UniversityContentTabsProps) => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredPrograms = programs.filter((p) => {
    if (filter === "all") return true;
    const level = p.level?.toLowerCase() || "";
    const name = p.name.toLowerCase();
    if (filter === "bachelor")
      return (
        level === "bachelor" ||
        name.includes("bachelor") || name.includes("bsc") || name.includes("b.sc")
      );
    if (filter === "master")
      return (
        level === "master" ||
        name.includes("master") || name.includes("msc") || name.includes("m.sc")
      );
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tab Header and Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="default" size="lg" className="gap-2 rounded-full px-6">
            <GraduationCap className="h-5 w-5" />
            Programs
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => setFilter("all")}>
              All Programs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("bachelor")}>
              Bachelor Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("master")}>
              Master Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Indicator */}
      {filter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing: {filter === "bachelor" ? "Bachelor" : "Master"} programs
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs h-6 px-2"
          >
            Clear
          </Button>
        </div>
      )}

      {/* List Items */}
      <div className="space-y-3">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No programs found
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <Link key={program.id} to={`/programs/${universitySlug}/${program.slug || program.id}`}>
              <UniversityListCard
                title={program.name}
                description={program.description}
                image={program.image}
                programSlug={program.slug}
                type="program"
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
