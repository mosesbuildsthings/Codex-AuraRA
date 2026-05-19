import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, ArrowLeft, Target, CheckCircle2, Play, Circle, Pause, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GoalCard from "@/components/goals/GoalCard";
import GoalForm from "@/components/goals/GoalForm";
import GoalsProgressDashboard from "@/components/goals/GoalsProgressDashboard";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not Started", icon: Circle },
  { value: "in_progress", label: "In Progress", icon: Play },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "paused", label: "Paused", icon: Pause }
];

export default function RelationshipGoals() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeStatus, setActiveStatus] = useState("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.RelationshipGoal.list("-created_date", 100),
    initialData: []
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports-goals"],
    queryFn: () => base44.entities.Report.list("-created_date", 20),
    initialData: []
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["goals"] });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => base44.entities.RelationshipGoal.delete(id),
    onMutate: (id) => {
      // Optimistically remove from cache
      queryClient.setQueryData(["goals"], (old) =>
        old?.filter((g) => g.id !== id) || []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => {
      refresh();
    },
  });

  const handleSaveGoal = (newGoal) => {
    // Optimistic update
    queryClient.setQueryData(["goals"], (old) => [newGoal, ...(old || [])]);
    setShowForm(false);
    setEditingGoal(null);
    refresh();
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingGoal(null);
    refresh();
  };

  const handleDelete = (id) => {
    deleteGoalMutation.mutate(id);
  };

  const handleClearAll = async () => {
    setClearing(true);
    for (const g of goals) {
      await base44.entities.RelationshipGoal.delete(g.id);
    }
    refresh();
    setClearing(false);
    setShowClearConfirm(false);
  };

  const filtered = activeStatus === "all" ? goals : goals.filter(g => g.status === activeStatus);

  const completedCount = goals.filter(g => g.status === "completed").length;
  const inProgressCount = goals.filter(g => g.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Relationship Goals</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {goals.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-muted-foreground hover:text-destructive gap-1.5"
              onClick={() => setShowClearConfirm(true)}
            >
              Reset All
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => { setEditingGoal(null); setShowForm(true); }}
          >
            <Plus className="w-4 h-4" /> New Goal
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Visual Progress Dashboard */}
        <GoalsProgressDashboard goals={goals} />

        {/* Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
              <p className="text-2xl font-bold">{goals.length}</p>
              <p className="text-sm text-muted-foreground">Total Goals</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
              <p className="text-2xl font-bold text-primary">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
              <p className="text-2xl font-bold text-chart-2">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        )}

        {/* Clear confirm */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm">Delete all goals and progress?</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
                <Button size="sm" variant="destructive" className="rounded-full" onClick={handleClearAll} disabled={clearing}>
                  {clearing ? "Clearing..." : "Delete All"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence>
          {(showForm || editingGoal) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <GoalForm
                initial={editingGoal}
                reports={reports}
                queryClient={queryClient}
                onSave={editingGoal ? handleSave : handleSaveGoal}
                onCancel={() => { setShowForm(false); setEditingGoal(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status filter */}
        {goals.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-5">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeStatus === tab.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {tab.icon && <tab.icon className="w-3 h-3" />}
                {tab.label}
                {tab.value !== "all" && (
                  <span className="opacity-60">
                    ({goals.filter(g => g.status === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Goal list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              Set long-term relationship objectives and track your progress toward them.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Create Your First Goal
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No goals with this status.</p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((goal, i) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GoalCard
                    goal={goal}
                    onRefresh={refresh}
                    onEdit={(g) => { setEditingGoal(g); setShowForm(false); }}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}