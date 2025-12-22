import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  LayoutGrid, 
  Beaker, 
  FileText,
  CheckCircle2,
  BookOpen,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DiaryTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  pageType: string;
  presetItems?: Array<{
    itemType: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    content?: string;
  }>;
}

export const DIARY_TEMPLATES: DiaryTemplate[] = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start with an empty page",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-gray-100 text-gray-600 border-gray-200",
    pageType: "blank",
  },
  {
    id: "semester_overview",
    name: "Semester Overview",
    description: "Plan your entire semester with a grid view",
    icon: <Calendar className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-600 border-blue-200",
    pageType: "semester_overview",
    presetItems: [
      { itemType: "semester_planner", positionX: 20, positionY: 20, width: 500, height: 400 },
      { itemType: "text", positionX: 540, positionY: 20, width: 200, height: 80, content: "**Semester Goals**\n\n- Goal 1\n- Goal 2" },
    ],
  },
  {
    id: "weekly_planner",
    name: "Weekly Planner",
    description: "Organize your week with tasks and notes",
    icon: <LayoutGrid className="h-6 w-6" />,
    color: "bg-green-100 text-green-600 border-green-200",
    pageType: "weekly_planner",
    presetItems: [
      { itemType: "text", positionX: 20, positionY: 20, width: 300, height: 150, content: "**Monday - Wednesday**\n\n- [ ] Task 1\n- [ ] Task 2" },
      { itemType: "text", positionX: 340, positionY: 20, width: 300, height: 150, content: "**Thursday - Friday**\n\n- [ ] Task 1\n- [ ] Task 2" },
      { itemType: "text", positionX: 20, positionY: 190, width: 620, height: 100, content: "**Weekly Notes**\n\nAdd your notes here..." },
    ],
  },
  {
    id: "lab_progress",
    name: "Lab Progress Tracker",
    description: "Track your lab applications and communications",
    icon: <Beaker className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-600 border-purple-200",
    pageType: "lab_progress",
    presetItems: [
      { itemType: "lab_tracker", positionX: 20, positionY: 20, width: 350, height: 250 },
      { itemType: "text", positionX: 390, positionY: 20, width: 250, height: 150, content: "**Application Notes**\n\n- Prepare CV\n- Draft emails\n- Research topics" },
    ],
  },
  {
    id: "course_comparison",
    name: "Course Comparison",
    description: "Compare and evaluate courses side by side",
    icon: <BookOpen className="h-6 w-6" />,
    color: "bg-orange-100 text-orange-600 border-orange-200",
    pageType: "course_comparison",
    presetItems: [
      { itemType: "text", positionX: 20, positionY: 20, width: 200, height: 100, content: "**Mandatory Courses**\n\nDrag courses here" },
      { itemType: "text", positionX: 240, positionY: 20, width: 200, height: 100, content: "**Optional Courses**\n\nDrag courses here" },
      { itemType: "text", positionX: 460, positionY: 20, width: 200, height: 100, content: "**Total ECTS:** 0" },
    ],
  },
  {
    id: "todo_list",
    name: "To-Do List",
    description: "Simple task management page",
    icon: <ClipboardList className="h-6 w-6" />,
    color: "bg-amber-100 text-amber-600 border-amber-200",
    pageType: "todo_list",
    presetItems: [
      { itemType: "text", positionX: 20, positionY: 20, width: 300, height: 200, content: "**To Do**\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3" },
      { itemType: "text", positionX: 340, positionY: 20, width: 300, height: 200, content: "**Completed**\n\n- [x] Done task 1\n- [x] Done task 2" },
    ],
  },
];

interface DiaryTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: DiaryTemplate) => void;
}

export const DiaryTemplatesDialog = ({
  open,
  onOpenChange,
  onSelectTemplate,
}: DiaryTemplatesDialogProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = () => {
    const template = DIARY_TEMPLATES.find(t => t.id === selectedId);
    if (template) {
      onSelectTemplate(template);
      onOpenChange(false);
      setSelectedId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Choose a Template
          </DialogTitle>
          <DialogDescription>
            Start with a pre-made layout or create a blank page
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {DIARY_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                selectedId === template.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-border"
              )}
              onClick={() => setSelectedId(template.id)}
            >
              <div className={cn("p-3 rounded-lg w-fit mb-3", template.color)}>
                {template.icon}
              </div>
              <h3 className="font-medium text-sm mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              {selectedId === template.id && (
                <Badge className="mt-2 gap-1" variant="default">
                  <CheckCircle2 className="h-3 w-3" />
                  Selected
                </Badge>
              )}
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedId}>
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiaryTemplatesDialog;