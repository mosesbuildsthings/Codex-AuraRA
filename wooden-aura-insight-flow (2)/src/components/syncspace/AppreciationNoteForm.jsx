import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const THEMES = [
  { value: "gratitude", label: "Gratitude", emoji: "🙏" },
  { value: "affection", label: "Affection", emoji: "💕" },
  { value: "admiration", label: "Admiration", emoji: "⭐" },
  { value: "encouragement", label: "Encouragement", emoji: "💪" },
  { value: "memory", label: "Cherished Memory", emoji: "💭" }
];

export default function AppreciationNoteForm({ syncSpaceId, partnerEmail, userEmail, onSave, onCancel }) {
  const [form, setForm] = useState({
    content: "",
    theme: "gratitude"
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);
    await base44.entities.AppreciationNote.create({
      sync_space_id: syncSpaceId,
      from_email: userEmail,
      to_email: partnerEmail,
      content: form.content,
      theme: form.theme,
      is_read: false
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Send Appreciation Note</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Choose a theme</Label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, theme: t.value })}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all flex items-center gap-1.5 ${
                  form.theme === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-1.5 block">Your Message</Label>
          <Textarea
            placeholder="Write a heartfelt message for your partner..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            className="min-h-[100px] resize-none"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">{form.content.length}/500</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="flex-1 rounded-full" disabled={saving || !form.content.trim()}>
            {saving ? "Sending..." : "Send Note"}
          </Button>
        </div>
      </form>
    </div>
  );
}