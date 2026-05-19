import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Send, Loader2, Bug, Lightbulb, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const TYPES = [
  { value: "suggestion", label: "Suggestion", icon: Sparkles, color: "bg-primary/10 text-primary" },
  { value: "feature_request", label: "Feature Request", icon: Lightbulb, color: "bg-chart-3/10 text-chart-3" },
  { value: "bug", label: "Bug Report", icon: Bug, color: "bg-destructive/10 text-destructive" },
  { value: "general", label: "General", icon: MessageCircle, color: "bg-muted text-muted-foreground" },
];

const typeConfig = Object.fromEntries(TYPES.map(t => [t.value, t]));

export default function Feedback() {
  const { toast } = useToast();
  const [type, setType] = useState("suggestion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState("submit");

  const { data: feedbackList = [], refetch } = useQuery({
    queryKey: ["feedback"],
    queryFn: () => base44.entities.AppFeedback.list("-created_date", 50),
    enabled: tab === "view",
  });

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await base44.entities.AppFeedback.create({ type, title: title.trim() || undefined, content });
    setSubmitting(false);
    setSubmitted(true);
    setTitle("");
    setContent("");
    toast({ title: "Thank you!", description: "Your feedback has been sent to the Aura team." });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-20">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-1">Feedback & Suggestions</h1>
        <p className="text-muted-foreground text-sm">Help us make Aura better for everyone.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-6">
        {["submit", "view"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "submit" ? "Submit Feedback" : "View Submitted"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "submit" ? (
          <motion.div key="submit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <CheckCircle2 className="w-12 h-12 text-chart-2" />
                <p className="font-heading text-lg font-semibold">Feedback sent!</p>
                <p className="text-muted-foreground text-sm">Thank you for helping improve Aura 🙏</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Type selector */}
                <div>
                  <p className="text-sm font-medium mb-2">Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          onClick={() => setType(t.value)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            type === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1.5">Short title <span className="text-muted-foreground font-normal">(optional)</span></p>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Add dark mode toggle"
                    className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1.5">Details</p>
                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Describe your idea, suggestion, or bug in as much detail as you'd like..."
                    className="resize-none min-h-[120px]"
                  />
                </div>

                <Button
                  className="w-full rounded-xl gap-2"
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? "Sending…" : "Send Feedback"}
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {feedbackList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No feedback submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {feedbackList.map(item => {
                  const cfg = typeConfig[item.type] || typeConfig.general;
                  const Icon = cfg.icon;
                  return (
                    <div key={item.id} className="p-4 rounded-xl bg-card border border-border/60">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                            <Icon className="w-3 h-3" /> {cfg.label}
                          </span>
                          {item.title && <span className="text-sm font-medium">{item.title}</span>}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(item.created_date), "MMM d")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}