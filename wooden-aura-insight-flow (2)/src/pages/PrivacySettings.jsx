import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Shield, Lock, Users, Eye, EyeOff, ChevronRight, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const GOAL_VISIBILITY_OPTIONS = [
  { value: "private",       label: "Only Me",           desc: "No one else can see your goals." },
  { value: "partner",       label: "Partner Only",       desc: "Only your connected partner can view." },
  { value: "sync_space",    label: "Sync Space Members", desc: "Visible to everyone in your Sync Space." },
];

export default function PrivacySettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    journal_encrypted: true,
    goals_visibility: "private",
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setSettings({
        journal_encrypted: u.journal_encrypted !== false, // default true
        goals_visibility: u.goals_visibility || "private",
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(settings);
    setSaving(false);
    toast({ title: "Privacy settings saved", description: "Your preferences have been updated." });
  };

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 pb-20 pt-6 space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Privacy Settings</h1>
            <p className="text-xs text-muted-foreground">Control how your data is stored and shared.</p>
          </div>
        </motion.div>

        {/* Journal Encryption */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-base font-semibold">Journal Privacy</h2>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="journal-encrypted" className="text-sm font-medium cursor-pointer">
                Encrypt journal entries
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, your journal entries are marked as end-to-end encrypted and never used to train AI models.
              </p>
            </div>
            <Switch
              id="journal-encrypted"
              checked={settings.journal_encrypted}
              onCheckedChange={() => toggle("journal_encrypted")}
            />
          </div>

          {settings.journal_encrypted && (
            <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-primary/80">
                Encryption is active. New entries will be stored with privacy protection enabled.
              </p>
            </div>
          )}
        </motion.div>

        {/* Goals Visibility */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-base font-semibold">Shared Goals Visibility</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Choose who can see your relationship goals when they are marked as shared.
          </p>

          <div className="space-y-2">
            {GOAL_VISIBILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSettings(s => ({ ...s, goals_visibility: opt.value }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  settings.goals_visibility === opt.value
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  settings.goals_visibility === opt.value ? "bg-primary/20" : "bg-muted"
                }`}>
                  {opt.value === "private" ? <EyeOff className="w-4 h-4" /> :
                   opt.value === "partner"  ? <Users className="w-4 h-4" /> :
                                              <Eye className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${settings.goals_visibility === opt.value ? "text-primary/70" : "text-muted-foreground"}`}>
                    {opt.desc}
                  </p>
                </div>
                {settings.goals_visibility === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Button className="w-full rounded-full gap-2" onClick={handleSave} disabled={saving}>
            <Shield className="w-4 h-4" />
            {saving ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}