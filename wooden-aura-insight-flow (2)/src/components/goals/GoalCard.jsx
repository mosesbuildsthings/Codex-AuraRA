import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronDown, ChevronUp, Trash2, Pencil, CalendarDays,
  LinkIcon, CheckCircle2, Circle, Pause, Play
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const STATUS_CONFIG = {
  not_started: { label: "Not Started", icon: Circle, className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Play, className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-chart-2/10 text-chart-2" },
  paused: { label: "Paused", icon: Pause, className: "bg-chart-3/10 text-chart-3" }
};

const CATEGORY_COLORS = {
  communication: "bg-chart-1/10 text-chart-1",
  quality_time: "bg-chart-3/10 text-chart-3",
  intimacy: "bg-chart-5/10 text-chart-5",
  conflict_resolution: "bg-destructive/10 text-destructive",
  personal_growth: "bg-primary/10 text-primary",
  adventure: "bg-chart-4/10 text-chart-4",
  other: "bg-muted text-muted-foreground"
};

export default function GoalCard({ goal, onRefresh, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(goal.progress_notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const config = STATUS_CONFIG[goal.status] || STATUS_CONFIG.not_started;
  const StatusIcon = config.icon;
  const isOverdue = goal.target_date && isPast(parseISO(goal.target_date)) && goal.status !== "completed";

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    await base44.entities.RelationshipGoal.update(goal.id, { status: newStatus });
    onRefresh();
    setUpdatingStatus(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await base44.entities.RelationshipGoal.update(goal.id, { progress_notes: notes });
    onRefresh();
    setSavingNotes(false);
  };

  return (
    <motion.div layout className="bg-card border border-border/60 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge className={`text-xs rounded-full ${CATEGORY_COLORS[goal.category] || ""}`}>
                {goal.category?.replace(/_/g, " ")}
              </Badge>
              <Badge className={`text-xs rounded-full gap-1 ${config.className}`}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </Badge>
              {isOverdue && (
                <Badge className="text-xs rounded-full bg-destructive/10 text-destructive">Overdue</Badge>
              )}
            </div>
            <p className="font-medium text-sm">{goal.title}</p>
            {goal.target_date && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                Target: {format(parseISO(goal.target_date), "MMM d, yyyy")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(goal)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(goal.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setExpanded(!expanded)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border/40 space-y-4">
              {goal.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{goal.description}</p>
              )}

              {goal.linked_insight && (
                <div className="p-3 rounded-lg bg-accent/40 border border-accent/60">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <LinkIcon className="w-3 h-3" /> Linked Insight
                  </p>
                  <p className="text-xs italic leading-relaxed">"{goal.linked_insight}"</p>
                </div>
              )}

              {/* Status updater */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Update Status</p>
                <Select value={goal.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Progress notes */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Progress Notes</p>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How's it going? Log any updates..."
                  className="min-h-[80px] resize-none text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full mt-2"
                  onClick={handleSaveNotes}
                  disabled={savingNotes || notes === goal.progress_notes}
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}