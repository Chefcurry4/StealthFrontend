import { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Beaker, Mail, Plus, ChevronDown, ChevronUp, X, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { DiaryPage, DiaryPageItem } from "@/types/diary";
import { useDiaryLabComms, useCreateDiaryLabComm, useUpdateDiaryLabComm, useDeleteDiaryLabComm } from "@/hooks/useDiaryLabComms";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DiaryLabTrackerProps {
  page: DiaryPage;
  items: DiaryPageItem[];
  onRemoveItem: (id: string) => void;
  isLoading: boolean;
}

const STATUS_CONFIG = {
  draft: { icon: Clock, color: '#95a5a6', label: 'Draft' },
  sent: { icon: Send, color: '#3498db', label: 'Sent' },
  replied: { icon: CheckCircle, color: '#27ae60', label: 'Replied' },
  follow_up: { icon: AlertCircle, color: '#e74c3c', label: 'Follow Up' },
};

export const DiaryLabTracker = ({ page, items, onRemoveItem, isLoading }: DiaryLabTrackerProps) => {
  const { modeConfig } = useBackgroundTheme();
  const { data: labComms, isLoading: commsLoading } = useDiaryLabComms();
  const createLabComm = useCreateDiaryLabComm();
  const updateLabComm = useUpdateDiaryLabComm();
  const deleteLabComm = useDeleteDiaryLabComm();
  const [expandedComm, setExpandedComm] = useState<string | null>(null);
  const [labs, setLabs] = useState<any[]>([]);

  // Fetch lab details for items
  useEffect(() => {
    const fetchLabs = async () => {
      const labItems = items.filter(item => item.item_type === 'lab' && item.reference_id);
      if (labItems.length === 0) {
        setLabs([]);
        return;
      }

      const labIds = labItems.map(item => item.reference_id!);
      const { data, error } = await supabase
        .from('Labs(L)')
        .select('id_lab, name, slug, topics, professors')
        .in('id_lab', labIds);

      if (!error && data) {
        setLabs(data);
      }
    };

    fetchLabs();
  }, [items]);

  const { isOver, setNodeRef } = useDroppable({
    id: 'zone-lab-tracker',
  });

  const handleCreateComm = async (labId: string) => {
    createLabComm.mutate({ labId }, {
      onSuccess: () => toast.success("Lab communication started!"),
    });
  };

  const handleStatusChange = (commId: string, status: string) => {
    updateLabComm.mutate({ 
      id: commId, 
      status: status as any,
      sent_date: status === 'sent' ? new Date().toISOString() : undefined,
    });
  };

  const handleNotesChange = (commId: string, notes: string) => {
    updateLabComm.mutate({ id: commId, notes });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Lab Communications
        </h3>
        <div className="flex items-center gap-2 text-xs opacity-60">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: config.color }} />
              {config.label}
            </span>
          ))}
        </div>
      </div>

      {/* Drop zone for new labs */}
      <div
        ref={setNodeRef}
        className={cn(
          "rounded-lg border-2 border-dashed p-4 transition-all",
          isOver && "border-solid scale-[1.02]"
        )}
        style={{ 
          borderColor: isOver ? modeConfig.ui.buttonPrimary : modeConfig.ui.cardBorder,
          background: isOver ? modeConfig.ui.buttonPrimary + '10' : 'transparent'
        }}
      >
        <p className="text-sm text-center opacity-60">
          Drop saved labs here to start tracking communications
        </p>
      </div>

      {/* Labs from page items */}
      {labs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium opacity-70">Labs on this page</h4>
          {labs.map((lab) => {
            const item = items.find(i => i.reference_id === lab.id_lab);
            const comm = labComms?.find(c => c.lab_id === lab.id_lab);
            
            return (
              <LabCard
                key={lab.id_lab}
                lab={lab}
                comm={comm}
                item={item}
                onCreateComm={() => handleCreateComm(lab.id_lab)}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
                onRemove={() => item && onRemoveItem(item.id)}
                isExpanded={expandedComm === lab.id_lab}
                onToggleExpand={() => setExpandedComm(expandedComm === lab.id_lab ? null : lab.id_lab)}
                modeConfig={modeConfig}
              />
            );
          })}
        </div>
      )}

      {/* Existing communications without page items */}
      {labComms && labComms.filter(c => !labs.find(l => l.id_lab === c.lab_id)).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium opacity-70">Other Communications</h4>
          {labComms
            .filter(c => !labs.find(l => l.id_lab === c.lab_id))
            .map((comm: any) => (
              <LabCard
                key={comm.id}
                lab={comm.lab}
                comm={comm}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
                onDelete={() => deleteLabComm.mutate(comm.id)}
                isExpanded={expandedComm === comm.lab_id}
                onToggleExpand={() => setExpandedComm(expandedComm === comm.lab_id ? null : comm.lab_id)}
                modeConfig={modeConfig}
              />
            ))}
        </div>
      )}

      {labs.length === 0 && (!labComms || labComms.length === 0) && (
        <div className="text-center py-12 opacity-50">
          <Mail className="h-12 w-12 mx-auto mb-4" />
          <p>Drag labs from the sidebar to track your communications</p>
        </div>
      )}
    </div>
  );
};

interface LabCardProps {
  lab: any;
  comm?: any;
  item?: DiaryPageItem;
  onCreateComm?: () => void;
  onStatusChange: (commId: string, status: string) => void;
  onNotesChange: (commId: string, notes: string) => void;
  onRemove?: () => void;
  onDelete?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  modeConfig: any;
}

const LabCard = ({ 
  lab, comm, item, onCreateComm, onStatusChange, onNotesChange, 
  onRemove, onDelete, isExpanded, onToggleExpand, modeConfig 
}: LabCardProps) => {
  const [notes, setNotes] = useState(comm?.notes || '');
  const statusConfig = STATUS_CONFIG[comm?.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

  return (
    <div 
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: modeConfig.ui.cardBorder, background: modeConfig.ui.inputBackground }}
    >
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:opacity-80"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ background: statusConfig.color }}
          />
          <div>
            <h4 className="font-medium text-sm">{lab?.name}</h4>
            {comm?.sent_date && (
              <span className="text-xs opacity-60">
                Sent: {new Date(comm.sent_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!comm && onCreateComm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onCreateComm(); }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Start Tracking
            </Button>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t space-y-3" style={{ borderColor: modeConfig.ui.cardBorder }}>
          {lab?.topics && (
            <div className="flex flex-wrap gap-1">
              {lab.topics.split(/[,;]/).slice(0, 5).map((topic: string, i: number) => (
                <span 
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: modeConfig.ui.cardBorder }}
                >
                  {topic.trim()}
                </span>
              ))}
            </div>
          )}

          {comm && (
            <>
              <div>
                <label className="text-xs opacity-70 mb-1 block">Status</label>
                <Select
                  value={comm.status}
                  onValueChange={(value) => onStatusChange(comm.id, value)}
                >
                  <SelectTrigger className="w-full" style={{ background: modeConfig.ui.inputBackground }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: config.color }} />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs opacity-70 mb-1 block">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => onNotesChange(comm.id, notes)}
                  placeholder="Add notes about this communication..."
                  className="min-h-[80px]"
                  style={{ background: modeConfig.ui.inputBackground }}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            {onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <X className="h-4 w-4 mr-1" />
                Remove from page
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
                <X className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
