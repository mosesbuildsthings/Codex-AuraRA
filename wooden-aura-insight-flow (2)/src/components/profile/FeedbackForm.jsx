import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SelectMobile } from "@/components/ui/select-mobile";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const TYPE_OPTIONS = [
  { value: "feature_request", label: "💡 Feature Request" },
  { value: "suggestion", label: "✨ General Suggestion" },
  { value: "bug", label: "🐛 Bug Report" },
  { value: "general", label: "💬 General Feedback" }
];

export default function FeedbackForm() {
  const { toast } = useToast();
  const [type, setType] = useState("suggestion");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await base44.entities.AppFeedback.create({ type, content });
    setSubmitting(false);
    setSubmitted(true);
    setContent("");
    toast({ title: "Thank you!", description: "Your feedback has been sent to the Aura team." });
    setTimeout(() => setSubmitted(false), 4000);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-chart-2/10 border border-chart-2/20">
        <CheckCircle2 className="w-4 h-4 text-chart-2" />
        <p className="text-sm text-chart-2 font-medium">Feedback sent! Thank you 🙏</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SelectMobile
        value={type}
        onValueChange={setType}
        options={TYPE_OPTIONS}
        placeholder="Feedback type"
      />
      <Textarea
        placeholder="What's on your mind? Feature ideas, bugs, improvements..."
        value={content}
        onChange={e => setContent(e.target.value)}
        className="resize-none min-h-[90px]"
      />
      <Button
        size="sm"
        className="rounded-full gap-1.5"
        onClick={handleSubmit}
        disabled={!content.trim() || submitting}
      >
        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
        {submitting ? "Sending…" : "Send Feedback"}
      </Button>
    </div>
  );
}