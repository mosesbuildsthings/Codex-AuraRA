import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { SelectMobile } from "@/components/ui/select-mobile";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORY_OPTIONS = [
  { value: "first", label: "A First", emoji: "🌟" },
  { value: "travel", label: "Travel Together", emoji: "✈️" },
  { value: "anniversary", label: "Anniversary", emoji: "💑" },
  { value: "achievement", label: "Shared Achievement", emoji: "🏆" },
  { value: "memory", label: "Special Memory", emoji: "💝" },
  { value: "other", label: "Other", emoji: "📌" }
];

const EMOJI_PRESETS = ["💑", "🌟", "✈️", "🏆", "💝", "🎉", "🌹", "🏠", "🥂", "🌅", "🎭", "🐾", "🧳", "🎁", "🌊"];

export default function MilestoneForm({ onSave, onCancel, initial = null }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    date: initial?.date || "",
    category: initial?.category || "memory",
    emoji: initial?.emoji || "💝",
    notes: initial?.notes || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    if (initial?.id) {
      await base44.entities.Milestone.update(initial.id, form);
    } else {
      await base44.entities.Milestone.create(form);
    }
    onSave();
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-lg font-semibold">{initial ? "Edit Milestone" : "Add a Milestone"}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Emoji picker */}
        <div>
          <Label className="text-sm mb-2 block">Choose an Emoji</Label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PRESETS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setForm({ ...form, emoji: e })}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  form.emoji === e ? "bg-primary/15 ring-2 ring-primary/40 scale-110" : "bg-muted hover:bg-muted/80"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label className="text-sm mb-1.5 block">Milestone Title</Label>
          <Input
            placeholder="e.g. Our First Trip Together"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Date + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-1.5 block">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Category</Label>
            <SelectMobile value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.emoji} {o.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectMobile>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-sm mb-1.5 block">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            placeholder="What made this moment special..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="flex-1 rounded-full" disabled={saving || !form.title || !form.date}>
            {saving ? "Saving..." : initial ? "Save Changes" : "Add Milestone"}
          </Button>
        </div>
      </form>
    </div>
  );
}