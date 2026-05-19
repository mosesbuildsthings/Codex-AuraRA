import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  communication: "bg-primary/10 text-primary border-primary/20",
  quality_time: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  intimacy: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  conflict_resolution: "bg-destructive/10 text-destructive border-destructive/20",
  adventure: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  growth: "bg-primary/10 text-primary border-primary/20",
  other: "bg-muted text-muted-foreground border-border"
};

export default function SharedGoalCard({ goal, onRefresh }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await base44.entities.SharedGoal.update(goal.id, { status: newStatus });
    onRefresh();
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this shared goal?")) {
      await base44.entities.SharedGoal.delete(goal.id);
      onRefresh();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-card border border-border/60 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-medium">{goal.title}</p>
            <Badge className={`text-xs rounded-full border ${categoryColors[goal.category] || categoryColors.other}`}>
              {goal.category.replace(/_/g, " ")}
            </Badge>
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => handleDelete()}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="text-xs font-medium">{goal.progress || 0}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${goal.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Status buttons */}
      <div className="flex gap-2 flex-wrap">
        {["not_started", "in_progress", "completed"].map(status => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={updating}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              goal.status === status
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {status === "not_started" && "Not Started"}
            {status === "in_progress" && "In Progress"}
            {status === "completed" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
            {status === "completed" && "Completed"}
          </button>
        ))}
      </div>
    </motion.div>
  );
}