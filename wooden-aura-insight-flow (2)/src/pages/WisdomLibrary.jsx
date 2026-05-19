import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Search, BookMarked, Bookmark, RefreshCw,
  ArrowLeft, ChevronDown, ChevronUp, Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const TOPICS = [
  { value: "all", label: "All Topics" },
  { value: "attachment_styles", label: "Attachment Styles" },
  { value: "conflict_resolution", label: "Conflict Resolution" },
  { value: "communication", label: "Communication" },
  { value: "boundaries", label: "Boundaries" },
  { value: "trust", label: "Trust" },
  { value: "intimacy", label: "Intimacy" },
  { value: "self_awareness", label: "Self-Awareness" },
  { value: "co_parenting", label: "Co-Parenting" },
  { value: "other", label: "Other" }
];

const TOPIC_COLORS = {
  attachment_styles: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  conflict_resolution: "bg-destructive/10 text-destructive border-destructive/20",
  communication: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  boundaries: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  trust: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  intimacy: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  self_awareness: "bg-primary/10 text-primary border-primary/20",
  co_parenting: "bg-accent text-accent-foreground border-accent",
  other: "bg-muted text-muted-foreground border-border"
};

function WisdomCard({ entry, onToggleSave }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.content?.length > 200;

  return (
    <motion.div
      layout
      className="bg-card border border-border/60 rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs rounded-full border ${TOPIC_COLORS[entry.topic] || TOPIC_COLORS.other}`}>
            {TOPICS.find(t => t.value === entry.topic)?.label || entry.topic}
          </Badge>
          {entry.created_date && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.created_date), "MMM d, yyyy")}
            </span>
          )}
        </div>
        <button
          onClick={() => onToggleSave(entry)}
          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
          title={entry.saved ? "Remove bookmark" : "Bookmark"}
        >
          {entry.saved
            ? <BookMarked className="w-4 h-4 text-primary" />
            : <Bookmark className="w-4 h-4" />
          }
        </button>
      </div>

      <h3 className="font-heading font-semibold text-base mb-2">{entry.title}</h3>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {!isLong || expanded ? entry.content : entry.content.substring(0, 200) + "..."}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
        </button>
      )}
    </motion.div>
  );
}

export default function WisdomLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["wisdom"],
    queryFn: () => base44.entities.WisdomEntry.list("-created_date", 200),
    initialData: []
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports-wisdom"],
    queryFn: () => base44.entities.Report.list("-created_date", 20),
    initialData: []
  });

  const handleExtract = async () => {
    if (!reports.length) return;
    setExtracting(true);

    // Get report IDs already extracted
    const existingReportIds = new Set(entries.map(e => e.report_id).filter(Boolean));
    const newReports = reports.filter(r => !existingReportIds.has(r.id));

    for (const report of newReports) {
      const textBlocks = [
        report.communication_analysis,
        report.key_dynamics,
        report.advice,
        report.attachment_styles?.explanation,
        report.resources
      ].filter(Boolean).join("\n\n");

      if (!textBlocks) continue;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are extracting standalone wisdom entries from a relationship analysis report. 
Each entry should be a self-contained, useful insight or tip someone could revisit on its own.

Report content:
${textBlocks.substring(0, 3000)}

Extract 4–6 distinct wisdom entries. Each must have a short title, a clear topic category, and the insight text (2–4 sentences, self-contained).`,
        response_json_schema: {
          type: "object",
          properties: {
            entries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  topic: { type: "string", description: "One of: attachment_styles, conflict_resolution, communication, boundaries, trust, intimacy, self_awareness, co_parenting, other" },
                  content: { type: "string" }
                }
              }
            }
          }
        }
      });

      for (const entry of result.entries || []) {
        await base44.entities.WisdomEntry.create({
          ...entry,
          report_id: report.id,
          case_id: report.case_id,
          saved: false
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["wisdom"] });
    setExtracting(false);
  };

  const handleToggleSave = async (entry) => {
    await base44.entities.WisdomEntry.update(entry.id, { saved: !entry.saved });
    queryClient.invalidateQueries({ queryKey: ["wisdom"] });
  };

  const filtered = entries.filter(e => {
    const matchesTopic = activeTopic === "all" || e.topic === activeTopic;
    const matchesSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.content?.toLowerCase().includes(search.toLowerCase());
    const matchesSaved = !savedOnly || e.saved;
    return matchesTopic && matchesSearch && matchesSaved;
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Wisdom Library</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full gap-1.5"
          onClick={handleExtract}
          disabled={extracting || !reports.length}
        >
          {extracting
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Extracting...</>
            : <><Lightbulb className="w-3.5 h-3.5" /> Extract from Reports</>
          }
        </Button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Search + Saved toggle */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-full"
              placeholder="Search insights..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={savedOnly ? "default" : "outline"}
            size="sm"
            className="rounded-full gap-1.5 shrink-0"
            onClick={() => setSavedOnly(!savedOnly)}
          >
            <BookMarked className="w-3.5 h-3.5" />
            Saved
          </Button>
        </div>

        {/* Topic filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {TOPICS.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTopic(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeTopic === t.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} insight{filtered.length !== 1 ? "s" : ""}
          {activeTopic !== "all" && ` in ${TOPICS.find(t => t.value === activeTopic)?.label}`}
        </p>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Lightbulb className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">
              {entries.length === 0 ? "Your library is empty" : "No matches found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              {entries.length === 0
                ? "Extract insights from your completed reports to build your personal wisdom library."
                : "Try a different search or topic filter."}
            </p>
            {entries.length === 0 && reports.length > 0 && (
              <Button variant="outline" className="rounded-full" onClick={handleExtract} disabled={extracting}>
                {extracting ? "Extracting..." : "Extract Insights Now"}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <WisdomCard entry={entry} onToggleSave={handleToggleSave} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}