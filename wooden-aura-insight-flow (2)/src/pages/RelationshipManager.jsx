import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SelectMobile } from "@/components/ui/select-mobile";
import {
  Plus, Heart, Users, User, Briefcase, Star, Archive,
  ChevronRight, CheckCircle2, Pencil, X, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const TYPE_OPTIONS = [
  { value: "romantic_partner", label: "💕 Romantic Partner" },
  { value: "spouse", label: "💍 Spouse" },
  { value: "ex_partner", label: "💔 Ex-Partner" },
  { value: "friend", label: "👯 Friend" },
  { value: "family", label: "👨‍👩‍👧 Family" },
  { value: "colleague", label: "💼 Colleague" },
  { value: "other", label: "✨ Other" }
];

const TYPE_ICONS = {
  romantic_partner: "💕",
  spouse: "💍",
  ex_partner: "💔",
  friend: "👯",
  family: "👨‍👩‍👧",
  colleague: "💼",
  other: "✨"
};

const EMPTY_FORM = {
  name: "", relationship_type: "romantic_partner", partner_name: "",
  partner_age: "", duration: "", notes: "", emoji: ""
};

export default function RelationshipManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: relationships = [] } = useQuery({
    queryKey: ["relationships"],
    queryFn: () => base44.entities.RelationshipProfile.list("-created_date", 50),
    initialData: []
  });

  const activeRelationship = relationships.find(r => r.is_current);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      partner_age: form.partner_age ? parseInt(form.partner_age) : undefined,
      emoji: form.emoji || TYPE_ICONS[form.relationship_type] || "✨"
    };
    if (editingId) {
      // Optimistic update
      queryClient.setQueryData(["relationships"], (old) =>
        old?.map((r) => r.id === editingId ? { ...r, ...data } : r) || []
      );
      await base44.entities.RelationshipProfile.update(editingId, data);
    } else {
      const tempId = "temp-" + Date.now();
      // Optimistic insert
      queryClient.setQueryData(["relationships"], (old) =>
        [{ ...data, id: tempId, created_date: new Date().toISOString() }, ...(old || [])]
      );
      await base44.entities.RelationshipProfile.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ["relationships"] });
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    toast({ title: editingId ? "Updated" : "Relationship added" });
  };

  const handleSetActive = async (id) => {
    // Deactivate all, then activate selected
    for (const r of relationships) {
      if (r.is_current) await base44.entities.RelationshipProfile.update(r.id, { is_current: false });
    }
    await base44.entities.RelationshipProfile.update(id, { is_current: true });
    queryClient.invalidateQueries({ queryKey: ["relationships"] });
    toast({ title: "Active relationship updated" });
  };

  const handleEdit = (r) => {
    setForm({ ...EMPTY_FORM, ...r, partner_age: r.partner_age || "" });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleArchive = async (id) => {
    // Optimistic update
    queryClient.setQueryData(["relationships"], (old) =>
      old?.map((r) => r.id === id ? { ...r, status: "archived" } : r) || []
    );
    await base44.entities.RelationshipProfile.update(id, { status: "archived" });
    queryClient.invalidateQueries({ queryKey: ["relationships"] });
  };

  const activeOnes = relationships.filter(r => r.status !== "archived");
  const archivedOnes = relationships.filter(r => r.status === "archived");

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-heading text-lg font-bold">Relationship Manager</span>
          </div>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}>
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-20 space-y-6">
        {/* Active relationship banner */}
        {activeRelationship && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <span className="text-3xl">{activeRelationship.emoji}</span>
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">Currently Working On</p>
              <p className="font-heading font-semibold">{activeRelationship.name}</p>
              {activeRelationship.partner_name && (
                <p className="text-xs text-muted-foreground">{activeRelationship.partner_name}</p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border/60 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold">{editingId ? "Edit Relationship" : "New Relationship"}</h3>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Label / Nickname *</Label>
                <Input placeholder="e.g. Sarah - My Partner" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Relationship Type</Label>
                <SelectMobile
                  value={form.relationship_type}
                  onValueChange={v => setForm({ ...form, relationship_type: v })}
                  options={TYPE_OPTIONS}
                  placeholder="Select type"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Their Name</Label>
                  <Input placeholder="Partner's name" value={form.partner_name} onChange={e => setForm({ ...form, partner_name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Their Age</Label>
                  <Input type="number" placeholder="Age" value={form.partner_age} onChange={e => setForm({ ...form, partner_age: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">How long have you known them?</Label>
                <Input placeholder="e.g. 3 years" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Notes</Label>
                <Textarea placeholder="Anything important to note about this relationship..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="min-h-[70px] resize-none" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-full" onClick={handleSave} disabled={!form.name.trim() || saving}>
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Add Relationship"}
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Relationship list */}
        {activeOnes.length === 0 && !showForm ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
            <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-heading text-base font-semibold mb-1">No relationships yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add a relationship to start organizing your journey.</p>
            <Button size="sm" className="rounded-full gap-1.5" onClick={() => setShowForm(true)}>
              <Plus className="w-3.5 h-3.5" /> Add First Relationship
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOnes.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-2xl border transition-all ${r.is_current ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.emoji || TYPE_ICONS[r.relationship_type] || "✨"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{r.name}</p>
                      {r.is_current && <Badge className="bg-primary/10 text-primary rounded-full text-xs">Active</Badge>}
                    </div>
                    {r.partner_name && <p className="text-xs text-muted-foreground">{r.partner_name}{r.duration ? ` · ${r.duration}` : ""}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {!r.is_current && (
                      <Button size="sm" variant="outline" className="rounded-full text-xs h-7 px-2.5" onClick={() => handleSetActive(r.id)}>
                        Set Active
                      </Button>
                    )}
                    <button onClick={() => handleEdit(r)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleArchive(r.id)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                      <Archive className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                {r.notes && <p className="text-xs text-muted-foreground mt-2 pl-11 leading-relaxed">{r.notes}</p>}
              </motion.div>
            ))}
          </div>
        )}

        {archivedOnes.length > 0 && (
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Archived ({archivedOnes.length})</summary>
            <div className="mt-2 space-y-2">
              {archivedOnes.map(r => (
                <div key={r.id} className="p-3 rounded-xl border border-border/40 bg-muted/20 flex items-center gap-2 opacity-60">
                  <span>{r.emoji}</span>
                  <p className="text-sm">{r.name}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}