import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle, ChevronRight, Trash2, Edit3, Search, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const statusConfig = {
  draft: { label: "Draft", icon: Clock, className: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", icon: Clock, className: "bg-accent text-accent-foreground" },
  analyzing: { label: "Analyzing", icon: Clock, className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-chart-2/10 text-chart-2" },
  error: { label: "Error", icon: AlertCircle, className: "bg-destructive/10 text-destructive" }
};

function AnalysisCard({ analysis, onEdit, onDelete, onView }) {
  const config = statusConfig[analysis.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group p-5 rounded-xl bg-card border border-border/60 hover:shadow-md hover:border-primary/20 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          onClick={onView}
          className="flex-1 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {analysis.title || analysis.core_question || "Untitled reflection"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(analysis.created_date), "MMM d, yyyy")}
                {analysis.relationship_status && ` • ${analysis.relationship_status.replace(/_/g, " ")}`}
              </p>
              {analysis.primary_challenges && analysis.primary_challenges.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {analysis.primary_challenges.slice(0, 2).map((challenge, i) => (
                    <Badge key={i} variant="outline" className="text-xs rounded-full">
                      {challenge}
                    </Badge>
                  ))}
                  {analysis.primary_challenges.length > 2 && (
                    <Badge variant="outline" className="text-xs rounded-full">
                      +{analysis.primary_challenges.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`${config.className} rounded-full gap-1 text-xs`}>
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </Badge>
          <div className="hidden group-hover:flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalysisManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => base44.entities.AnalysisCase.list("-created_date", 100),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }) => base44.entities.AnalysisCase.update(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AnalysisCase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      setDeleteId(null);
    }
  });

  const handleSaveTitle = (id) => {
    if (editTitle.trim()) {
      updateMutation.mutate({ id, title: editTitle });
    }
  };

  const handleEdit = (analysis) => {
    setEditingId(analysis.id);
    setEditTitle(analysis.title || analysis.core_question || "");
  };

  const filtered = analyses.filter(a => {
    const matchesSearch = (a.title || a.core_question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.primary_challenges || []).some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Relationship Sessions</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Search and Filter */}
        {analyses.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, question, or challenge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-card border-border/60"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {["all", "draft", "submitted", "analyzing", "completed", "error"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filterStatus === status
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {status === "all" ? "All Sessions" : statusConfig[status].label}
                  {status !== "all" && ` (${analyses.filter(a => a.status === status).length})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
          >
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No analyses yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Begin your first relationship reflection consultation.</p>
            <Link to="/onboarding">
              <Button className="rounded-full">Start First Analysis</Button>
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No sessions match your search.</p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((analysis) => (
                <div key={analysis.id}>
                  {editingId === analysis.id ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-xl bg-card border border-primary/30 space-y-3"
                    >
                      <label className="text-xs font-medium text-muted-foreground">Rename Session</label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="rounded-lg"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 rounded-lg"
                          onClick={() => handleSaveTitle(analysis.id)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <AnalysisCard
                      analysis={analysis}
                      onView={() => {
                        if (analysis.status === "completed") navigate("/report/" + analysis.id);
                        else if (analysis.status === "analyzing") navigate("/analyzing/" + analysis.id);
                      }}
                      onEdit={() => handleEdit(analysis)}
                      onDelete={() => setDeleteId(analysis.id)}
                    />
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Session</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this relationship session and all associated data. This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}