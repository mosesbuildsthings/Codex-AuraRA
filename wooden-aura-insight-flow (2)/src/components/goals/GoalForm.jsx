import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { SelectMobile } from "@/components/ui/select-mobile";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { value: "communication", label: "Communication" },
  { value: "quality_time", label: "Quality Time" },
  { value: "intimacy", label: "Intimacy" },
  { value: "conflict_resolution", label: "Conflict Resolution" },
  { value: "personal_growth", label: "Personal Growth" },
  { value: "adventure", label: "Adventure" },
  { value: "other", label: "Other" }
];

const SUGGESTED = [
  "Improve our weekly check-ins",
  "Plan one weekend getaway per month",
  "Practice active listening daily",
  "Have a phone-free dinner twice a week",
  "Write one appreciation note per week",
  "Schedule a monthly relationship review"
];

export default function GoalForm({ initial, reports, queryClient, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    category: initial?.category || "communication",
    target_date: initial?.target_date || "",
    linked_case_id: initial?.linked_case_id || "",
    linked_insight: initial?.linked_insight || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    const payload = { ...form, status: initial?.status || "not_started" };
    if (initial?.id) {
      await base44.entities.RelationshipGoal.update(initial.id, payload);
      onSave();
    } else {
      const created = await base44.entities.RelationshipGoal.create(payload);
      // Optimistic update already done by parent, just refresh
      onSave(created);
    }
  };

  const completedReports = reports.filter(r => r.title);

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-lg font-semibold">{initial ? "Edit Goal" : "New Relationship Goal"}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggestions */}
      {!initial && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, title: s })}
                className="px-3 py-1 rounded-full text-xs border border-border hover:border-primary/40 hover:bg-muted transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm mb-1.5 block">Goal Title</Label>
          <Input
            placeholder="e.g. Plan one weekend getaway per month"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label className="text-sm mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            placeholder="Why is this important to you? What does success look like?"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
         <div>
           <Label className="text-sm mb-1.5 block">Category</Label>
           <SelectMobile value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
             <SelectContent>
               {CATEGORIES.map(c => (
                 <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
               ))}
             </SelectContent>
           </SelectMobile>
         </div>
          <div>
            <Label className="text-sm mb-1.5 block">Target Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} />
          </div>
        </div>

        {/* Link to report */}
        {completedReports.length > 0 && (
          <div>
            <Label className="text-sm mb-1.5 block">Link to Report <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <SelectMobile value={form.linked_case_id} onValueChange={v => setForm({ ...form, linked_case_id: v })}>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {completedReports.map(r => (
                  <SelectItem key={r.id} value={r.case_id || r.id}>{r.title}</SelectItem>
                ))}
              </SelectContent>
            </SelectMobile>
          </div>
        )}

        {/* Linked insight */}
        {form.linked_case_id && (
          <div>
            <Label className="text-sm mb-1.5 block">Paste Linked Insight <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              placeholder="Paste the specific advice or insight from the report that inspired this goal..."
              value={form.linked_insight}
              onChange={e => setForm({ ...form, linked_insight: e.target.value })}
              className="min-h-[70px] resize-none text-sm"
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="flex-1 rounded-full" disabled={saving || !form.title}>
            {saving ? "Saving..." : initial ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </form>
    </div>
  );
}