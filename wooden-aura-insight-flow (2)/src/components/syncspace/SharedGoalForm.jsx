import React, { useState } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectMobile } from "@/components/ui/select-mobile";
import { X } from "lucide-react";

const CATEGORIES = [
  { value: "communication", label: "Communication" },
  { value: "quality_time", label: "Quality Time" },
  { value: "intimacy", label: "Intimacy" },
  { value: "conflict_resolution", label: "Conflict Resolution" },
  { value: "adventure", label: "Adventure" },
  { value: "growth", label: "Personal Growth" },
  { value: "other", label: "Other" }
];

export default function SharedGoalForm({ syncSpaceId, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "communication",
    target_date: ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    await base44.entities.SharedGoal.create({
      sync_space_id: syncSpaceId,
      ...form,
      status: "not_started",
      progress: 0
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Create Shared Goal</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm mb-1.5 block">Goal Title</Label>
          <Input
            placeholder="e.g. Monthly date night"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label className="text-sm mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            placeholder="Why is this goal important to you both?"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="min-h-[70px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-1.5 block">Category</Label>
            <SelectMobile
              value={form.category}
              onValueChange={v => setForm({ ...form, category: v })}
            >
              {CATEGORIES.map(c => (
                <SelectPrimitive.Item key={c.value} value={c.value}>
                  {c.label}
                </SelectPrimitive.Item>
              ))}
            </SelectMobile>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Target Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              type="date"
              value={form.target_date}
              onChange={e => setForm({ ...form, target_date: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="flex-1 rounded-full" disabled={saving || !form.title}>
            {saving ? "Creating..." : "Create Goal"}
          </Button>
        </div>
      </form>
    </div>
  );
}