import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Sparkles, Search, FileText, CheckCircle2,
  Clock, AlertCircle, ChevronRight, Archive
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const statusConfig = {
  draft: { label: "Draft", icon: Clock, className: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", icon: Clock, className: "bg-accent text-accent-foreground" },
  analyzing: { label: "Analyzing", icon: Clock, className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-chart-2/10 text-chart-2" },
  error: { label: "Error", icon: AlertCircle, className: "bg-destructive/10 text-destructive" }
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "analyzing", label: "In Progress" },
  { value: "draft", label: "Draft" }
];

export default function SessionArchive() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["cases-archive", user?.email],
    queryFn: () => user ? base44.entities.AnalysisCase.filter({ created_by: user.email }, "-created_date", 200) : [],
    enabled: !!user,
    initialData: []
  });

  const filtered = cases.filter(c => {
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchSearch = !search ||
      c.core_question?.toLowerCase().includes(search.toLowerCase()) ||
      c.narrative?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleOpen = (c) => {
    if (c.status === "completed") navigate("/report/" + c.id);
    else if (c.status === "analyzing") navigate("/analyzing/" + c.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Session Archive</span>
          </div>
        </div>
        <Link to="/onboarding">
          <Button size="sm" className="rounded-full gap-1.5">
            New Session
          </Button>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 rounded-full"
            placeholder="Search sessions by question or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {f.label}
              <span className="ml-1 opacity-60">
                ({f.value === "all" ? cases.length : cases.filter(c => c.status === f.value).length})
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-4">{filtered.length} session{filtered.length !== 1 ? "s" : ""}</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Archive className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">
              {cases.length === 0 ? "No sessions yet" : "No matches found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {cases.length === 0
                ? "Start your first session to begin your reflection journey."
                : "Try a different search or filter."}
            </p>
            {cases.length === 0 && (
              <Link to="/onboarding">
                <Button variant="outline" className="rounded-full">Start First Session</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => {
              const config = statusConfig[c.status] || statusConfig.draft;
              const StatusIcon = config.icon;
              const clickable = c.status === "completed" || c.status === "analyzing";
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    onClick={() => clickable && handleOpen(c)}
                    disabled={!clickable}
                    className={`w-full text-left p-5 rounded-xl bg-card border border-border/60 transition-all group ${
                      clickable ? "hover:shadow-md hover:border-primary/20 cursor-pointer" : "cursor-default opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {c.core_question || c.narrative?.substring(0, 80) || "Untitled session"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(c.created_date), "MMMM d, yyyy")}
                            {c.relationship_status && ` · ${c.relationship_status.replace(/_/g, " ")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge className={`${config.className} rounded-full gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                        {clickable && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}