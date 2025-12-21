import { Link } from "react-router-dom";
import { Book, Calendar, FileText, Plus } from "lucide-react";
import { useDiaryNotebooks } from "@/hooks/useDiaryNotebooks";
import { useDiaryPages } from "@/hooks/useDiaryPages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DiaryPageThumbnail } from "@/components/diary/DiaryPageThumbnail";
import { format } from "date-fns";

interface NotebookWithPages {
  notebook: any;
  pages: any[];
}

const NotebookCard = ({ notebook }: { notebook: any }) => {
  const { data: pages, isLoading } = useDiaryPages(notebook.id);

  return (
    <Card className="bg-background/30 border-border/50 hover:bg-background/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Book className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{notebook.name}</h4>
              <p className="text-xs text-muted-foreground">
                Created {format(new Date(notebook.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <Link to="/diary">
            <Button variant="ghost" size="sm" className="text-xs">
              Open
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : pages && pages.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {pages.map((page) => (
              <Link
                key={page.id}
                to="/diary"
                className="group relative"
              >
                <DiaryPageThumbnail 
                  pageId={page.id} 
                  title={page.title}
                  className="h-16 w-full hover:ring-2 hover:ring-primary/50 transition-all"
                />
                <div className="absolute bottom-0 left-1 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg px-1.5 py-1">
                  <p className="text-[10px] text-white truncate font-medium">
                    {page.title || `Page ${page.page_number}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">No pages yet</p>
        )}

        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {pages?.length || 0} {(pages?.length || 0) === 1 ? "page" : "pages"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Updated {format(new Date(notebook.updated_at), "MMM d")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const WorkbenchDiaryPages = () => {
  const { data: notebooks, isLoading } = useDiaryNotebooks();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!notebooks || notebooks.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">No Diary Notebooks</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first notebook to start organizing your academic journey
        </p>
        <Link to="/diary">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Notebook
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Your Diary Notebooks</h3>
          <p className="text-sm text-muted-foreground">
            {notebooks.length} {notebooks.length === 1 ? "notebook" : "notebooks"}
          </p>
        </div>
        <Link to="/diary">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {notebooks.map((notebook) => (
          <NotebookCard key={notebook.id} notebook={notebook} />
        ))}
      </div>
    </div>
  );
};
