import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Star, FileText } from "lucide-react";
import CalendarSyncButton from "@/components/calendar/CalendarSyncButton";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import MilestoneForm from "./MilestoneForm";

const categoryColors = {
  first: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  travel: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  anniversary: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  achievement: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  memory: "bg-primary/10 text-primary border-primary/20",
  other: "bg-muted text-muted-foreground border-border"
};

export default function MilestoneTimeline({ milestones, cases, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Merge milestones and completed cases into a unified timeline
  const timelineItems = [
    ...milestones.map((m) => ({
      id: m.id,
      type: "milestone",
      date: m.date,
      title: m.title,
      emoji: m.emoji || "💝",
      category: m.category,
      notes: m.notes,
      raw: m
    })),
    ...cases
      .filter((c) => c.status === "completed")
      .map((c) => ({
        id: c.id,
        type: "analysis",
        date: c.created_date?.split("T")[0],
        title: c.core_question || "Relationship Reflection",
        emoji: "🔍",
        category: "analysis",
        notes: null,
        raw: c
      }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleDelete = async (id) => {
    setDeletingId(id);
    await base44.entities.Milestone.delete(id);
    onRefresh();
    setDeletingId(null);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingMilestone(null);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-semibold">Relationship Timeline</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your milestones and reflections, side by side</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={() => { setEditingMilestone(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Milestone
        </Button>
      </div>

      <AnimatePresence>
        {(showForm || editingMilestone) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <MilestoneForm
              initial={editingMilestone}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingMilestone(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {timelineItems.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
          <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-sm mb-1">No milestones yet</p>
          <p className="text-xs text-muted-foreground mb-4">Start by adding your first shared memory.</p>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add First Milestone
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-border/60 rounded-full" />

          <div className="space-y-4 pl-14">
            {timelineItems.map((item, i) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative group"
              >
                {/* Dot on timeline */}
                <div className={`absolute -left-14 top-4 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 shadow-sm
                  ${item.type === "analysis" ? "bg-background border-border" : "bg-card border-primary/20"}`}>
                  {item.type === "analysis" ? <FileText className="w-4 h-4 text-muted-foreground" /> : item.emoji}
                </div>

                <div className={`p-4 rounded-xl border transition-all
                  ${item.type === "analysis"
                    ? "bg-muted/30 border-border/40"
                    : "bg-card border-border/60 hover:shadow-md hover:border-primary/20"
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm">{item.title}</p>
                        {item.type === "milestone" && item.category && (
                          <Badge className={`text-xs rounded-full border ${categoryColors[item.category] || categoryColors.other}`}>
                            {item.category}
                          </Badge>
                        )}
                        {item.type === "analysis" && (
                          <Badge className="text-xs rounded-full bg-primary/8 text-primary border border-primary/20">
                            Reflection
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.date ? format(parseISO(item.date), "MMMM d, yyyy") : ""}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground/80 mt-1.5 italic">"{item.notes}"</p>
                      )}
                      {item.type === "milestone" && item.date && (
                        <div className="mt-2">
                          <CalendarSyncButton
                            title={`${item.emoji} ${item.title}`}
                            description={item.notes || ""}
                            date={new Date(item.date + "T09:00:00")}
                            durationMinutes={60}
                          />
                        </div>
                      )}
                    </div>

                    {item.type === "milestone" && (
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingMilestone(item.raw); setShowForm(false); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}