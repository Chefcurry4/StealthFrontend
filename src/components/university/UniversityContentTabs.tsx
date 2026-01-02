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
import { Link } from "react-router-dom";

interface Program {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
}

interface UniversityContentTabsProps {
  programs: Program[];
}

type FilterType = "all" | "bachelor" | "master";

export const UniversityContentTabs = ({ programs }: UniversityContentTabsProps) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 10;

  const filteredPrograms = programs.filter((p) => {
    if (filter === "all") return true;
    const name = p.name.toLowerCase();
    if (filter === "bachelor")
      return (
        name.includes("bachelor") || name.includes("bsc") || name.includes("b.sc")
      );
    if (filter === "master")
      return (
        name.includes("master") || name.includes("msc") || name.includes("m.sc")
      );
    return true;
  });

  const displayedPrograms = showAll
    ? filteredPrograms
    : filteredPrograms.slice(0, INITIAL_COUNT);

  const hasMore = filteredPrograms.length > INITIAL_COUNT && !showAll;

  const handleShowAll = () => {
    setShowAll(true);
  };

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
        {displayedPrograms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No programs found
          </div>
        ) : (
          displayedPrograms.map((program) => (
            <Link key={program.id} to={`/programs/${program.slug || program.id}`}>
              <UniversityListCard
                title={program.name}
                description={program.description}
                image={program.image}
                type="program"
              />
            </Link>
          ))
        )}
      </div>

      {/* View More Button */}
      {hasMore && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={handleShowAll}
        >
          VIEW ALL {filteredPrograms.length} PROGRAMS
        </Button>
      )}

      {showAll && filteredPrograms.length > INITIAL_COUNT && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll(false)}
        >
          Show Less
        </Button>
      )}
    </div>
  );
};
