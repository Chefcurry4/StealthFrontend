import { useState } from "react";
import { 
  Mail, 
  Plus, 
  Trash2, 
  Download, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  useEmailTracker, 
  useCreateEmailTrackerItem, 
  useUpdateEmailTrackerItem, 
  useDeleteEmailTrackerItem,
  exportEmailTrackerToCSV,
  EmailTrackerItem
} from "@/hooks/useEmailTracker";
import { useSavedLabs } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CONFIG = {
  draft: { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted/50', label: 'Draft' },
  sent: { icon: Send, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Sent' },
  replied: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Replied' },
  follow_up: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Follow Up' },
} as const;

export const WorkbenchEmailTracker = () => {
  const { data: trackedEmails, isLoading } = useEmailTracker();
  const { data: savedLabs } = useSavedLabs();
  const createItem = useCreateEmailTrackerItem();
  const updateItem = useUpdateEmailTrackerItem();
  const deleteItem = useDeleteEmailTrackerItem();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const [selectedLabId, setSelectedLabId] = useState<string>("");
  const [newNotes, setNewNotes] = useState("");

  const handleAddNew = async () => {
    if (!selectedLabId) {
      toast.error("Please select a lab");
      return;
    }

    await createItem.mutateAsync({
      labId: selectedLabId,
      status: "draft",
      notes: newNotes || undefined,
    });
    
    setShowAddNew(false);
    setSelectedLabId("");
    setNewNotes("");
    toast.success("Email tracking started!");
  };

  const handleStatusChange = (id: string, status: EmailTrackerItem["status"]) => {
    const updates: any = { id, status };
    if (status === "sent") {
      updates.sent_date = new Date().toISOString();
    }
    if (status === "replied") {
      updates.reply_received = true;
    }
    updateItem.mutate(updates);
    toast.success(`Status updated to ${STATUS_CONFIG[status].label}`);
  };

  const handleNotesUpdate = (id: string, notes: string) => {
    updateItem.mutate({ id, notes });
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id, {
      onSuccess: () => {
        toast.success("Email tracking removed");
        setDeleteConfirmId(null);
      }
    });
  };

  const handleExport = () => {
    if (!trackedEmails || trackedEmails.length === 0) {
      toast.error("No emails to export");
      return;
    }
    exportEmailTrackerToCSV(trackedEmails);
    toast.success("Exported as CSV");
  };

  // Get available labs (saved labs not already tracked)
  const availableLabs = savedLabs?.filter(
    saved => !trackedEmails?.some(tracked => tracked.lab_id === saved.Labs?.id_lab)
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <Badge key={key} variant="outline" className={cn("text-[9px] px-1.5", config.color)}>
              <config.icon className="h-2.5 w-2.5 mr-1" />
              {trackedEmails?.filter(e => e.status === key).length || 0}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={handleExport}
            disabled={!trackedEmails?.length}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={() => setShowAddNew(!showAddNew)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Track
          </Button>
        </div>
      </div>

      {/* Add new form */}
      {showAddNew && (
        <div className="p-3 rounded-lg border border-dashed bg-muted/30 space-y-2 animate-in fade-in-0 slide-in-from-top-2">
          <Select value={selectedLabId} onValueChange={setSelectedLabId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select a saved lab..." />
            </SelectTrigger>
            <SelectContent>
              {availableLabs.length === 0 ? (
                <SelectItem value="none" disabled>
                  No available labs (save labs first)
                </SelectItem>
              ) : (
                availableLabs.map(saved => (
                  <SelectItem key={saved.Labs?.id_lab} value={saved.Labs?.id_lab || ""}>
                    {saved.Labs?.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Input
            placeholder="Initial notes (optional)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="h-7 text-xs flex-1"
              onClick={handleAddNew}
              disabled={!selectedLabId || createItem.isPending}
            >
              {createItem.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Start Tracking"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setShowAddNew(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tracked emails list */}
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-2">
          {(!trackedEmails || trackedEmails.length === 0) && !showAddNew ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium mb-1">No Tracked Emails</p>
              <p className="text-[10px]">
                Track your lab outreach emails here
              </p>
            </div>
          ) : (
            trackedEmails?.map((item) => (
              <EmailTrackerCard
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onStatusChange={handleStatusChange}
                onNotesUpdate={handleNotesUpdate}
                onDelete={() => setDeleteConfirmId(item.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Email Tracking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tracking history for this lab email. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface EmailTrackerCardProps {
  item: EmailTrackerItem;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: EmailTrackerItem["status"]) => void;
  onNotesUpdate: (id: string, notes: string) => void;
  onDelete: () => void;
}

const EmailTrackerCard = ({ 
  item, 
  isExpanded, 
  onToggle, 
  onStatusChange, 
  onNotesUpdate,
  onDelete 
}: EmailTrackerCardProps) => {
  const [notes, setNotes] = useState(item.notes || "");
  const statusConfig = STATUS_CONFIG[item.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden transition-all",
      statusConfig.bgColor
    )}>
      {/* Header */}
      <div 
        className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", statusConfig.color)} />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{item.lab?.name || "Unknown Lab"}</p>
            {item.sent_date && (
              <p className="text-[10px] text-muted-foreground">
                Sent {format(new Date(item.sent_date), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={cn("text-[9px]", statusConfig.color)}>
            {statusConfig.label}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-2.5 pt-0 space-y-2.5 border-t border-border/50 animate-in fade-in-0 slide-in-from-top-1">
          {/* Lab link */}
          {item.lab?.slug && (
            <a 
              href={`/labs/${item.lab.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View Lab
            </a>
          )}

          {/* Status selector */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Status</label>
            <Select 
              value={item.status} 
              onValueChange={(v) => onStatusChange(item.id, v as EmailTrackerItem["status"])}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <config.icon className={cn("h-3 w-3", config.color)} />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onNotesUpdate(item.id, notes)}
              placeholder="Add notes..."
              className="min-h-[60px] text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
