import { useState } from "react";
import { Filter, GraduationCap, Microscope } from "lucide-react";
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

interface Lab {
  id_lab: string;
  name: string;
  slug?: string;
  description?: string;
  topics?: string;
  image?: string;
}

interface UniversityContentTabsProps {
  programs: Program[];
  labs: Lab[];
}

type TabType = "programs" | "labs";
type FilterType = "all" | "bachelor" | "master";

export const UniversityContentTabs = ({ programs, labs }: UniversityContentTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("programs");
  const [filter, setFilter] = useState<FilterType>("all");
  const [visibleCount, setVisibleCount] = useState(5);

  const filteredPrograms = programs.filter(p => {
    if (filter === "all") return true;
    const name = p.name.toLowerCase();
    if (filter === "bachelor") return name.includes("bachelor") || name.includes("bsc") || name.includes("b.sc");
    if (filter === "master") return name.includes("master") || name.includes("msc") || name.includes("m.sc");
    return true;
  });

  const currentItems = activeTab === "programs" 
    ? filteredPrograms.slice(0, visibleCount)
    : labs.slice(0, visibleCount);

  const totalItems = activeTab === "programs" ? filteredPrograms.length : labs.length;
  const hasMore = visibleCount < totalItems;

  const handleViewMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setVisibleCount(5);
    setFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Tab Buttons and Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "programs" ? "default" : "outline"}
            size="lg"
            onClick={() => handleTabChange("programs")}
            className="gap-2 rounded-full px-6"
          >
            <GraduationCap className="h-5 w-5" />
            Programs
          </Button>
          <Button
            variant={activeTab === "labs" ? "default" : "outline"}
            size="lg"
            onClick={() => handleTabChange("labs")}
            className="gap-2 rounded-full px-6"
          >
            <Microscope className="h-5 w-5" />
            Labs
          </Button>
        </div>

        {activeTab === "programs" && (
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
        )}
      </div>

      {/* List Items */}
      <div className="space-y-3">
        {currentItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {activeTab} found
          </div>
        ) : (
          currentItems.map((item: any) => (
            <Link 
              key={item.id || item.id_lab} 
              to={activeTab === "programs" 
                ? `/programs/${item.slug || item.id}` 
                : `/labs/${item.slug || item.id_lab}`
              }
            >
              <UniversityListCard
                title={item.name}
                description={item.description || item.topics}
                image={item.image}
                type={activeTab === "programs" ? "program" : "lab"}
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
          onClick={handleViewMore}
        >
          VIEW MORE... ({totalItems - visibleCount} remaining)
        </Button>
      )}
    </div>
  );
};
