import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, User, Save, LogOut, Trash2, AlertTriangle, MessageSquarePlus, Camera, Bell, FileDown, Shield } from "lucide-react";
import PdfExportButton from "@/components/export/PdfExportButton";
import PersonalityTests from "@/components/profile/PersonalityTests";
import FeedbackForm from "@/components/profile/FeedbackForm";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ATTACHMENT_STYLES = [
  { value: "secure", label: "Secure — comfortable with closeness and independence" },
  { value: "anxious", label: "Anxious — fear of abandonment, seeks reassurance" },
  { value: "avoidant", label: "Avoidant — values independence, uncomfortable with vulnerability" },
  { value: "disorganized", label: "Disorganized — mixed feelings about intimacy" },
  { value: "unsure", label: "I'm not sure yet" }
];

const RELATIONSHIP_GOALS_LIST = [
  "Improve communication",
  "Rebuild trust",
  "Deepen intimacy",
  "Better conflict resolution",
  "Understand my patterns",
  "Support my partner more"
];

export default function Profile() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    bio: "",
    attachment_style: "",
    relationship_intention: "",
    personal_goals: [],
    checkin_reminder_time: ""
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        bio: u.bio || "",
        attachment_style: u.attachment_style || "",
        relationship_intention: u.relationship_intention || "",
        personal_goals: u.personal_goals || [],
        checkin_reminder_time: u.checkin_reminder_time || ""
      });
    }).catch(() => {});
  }, []);

  const toggleGoal = (goal) => {
    setForm(f => ({
      ...f,
      personal_goals: f.personal_goals.includes(goal)
        ? f.personal_goals.filter(g => g !== goal)
        : [...f.personal_goals, goal]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    toast({ title: "Profile saved", description: "Your profile has been updated." });
  };

  const handleLogout = () => {
    base44.auth.logout("/goodbye");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_photo: file_url });
    setUser(u => ({ ...u, profile_photo: file_url }));
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete account through auth API
      await base44.auth.deleteAccount?.();
      toast({ title: "Account deleted", description: "Your account and data have been permanently removed." });
      // Fallback: logout and redirect
      setTimeout(() => base44.auth.logout("/"), 1000);
    } catch (error) {
      setDeleting(false);
      toast({ title: "Error", description: "Failed to delete account. Please contact support." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">My Profile</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground rounded-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20 space-y-6">
        {/* Identity card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">{user?.full_name || "—"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">About Me <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                placeholder="A few words about yourself and your relationship journey..."
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="resize-none min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-sm mb-1.5 block">Relationship Intention</Label>
              <Input
                placeholder="e.g. Heal and grow with my long-term partner"
                value={form.relationship_intention}
                onChange={e => setForm({ ...form, relationship_intention: e.target.value })}
              />
            </div>
          </div>
        </motion.div>

        {/* Attachment style */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-heading text-base font-semibold mb-1">Attachment Style</h3>
          <p className="text-xs text-muted-foreground mb-4">Knowing your style helps Aura give more personalized guidance.</p>
          <Select value={form.attachment_style} onValueChange={v => setForm({ ...form, attachment_style: v })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select your attachment style..." />
            </SelectTrigger>
            <SelectContent>
              {ATTACHMENT_STYLES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Personal goals */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-heading text-base font-semibold mb-1">What I'm Working On</h3>
          <p className="text-xs text-muted-foreground mb-4">Select all that resonate with you.</p>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_GOALS_LIST.map(goal => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  form.personal_goals.includes(goal)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Personality Tests */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <PersonalityTests form={form} onUpdate={(updates) => setForm(f => ({ ...f, ...updates }))} />
        </motion.div>

        {/* Daily check-in reminder */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-heading text-base font-semibold">Daily Check-In Reminder</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Pick a time and we'll send you a daily email nudge to log your relationship check-in. Leave blank to disable.</p>
          <div className="flex items-center gap-3">
            <Input
              type="time"
              value={form.checkin_reminder_time}
              onChange={e => setForm({ ...form, checkin_reminder_time: e.target.value })}
              className="w-36 rounded-xl"
            />
            {form.checkin_reminder_time && (
              <button
                type="button"
                onClick={() => setForm({ ...form, checkin_reminder_time: "" })}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear (disable)
              </button>
            )}
          </div>
        </motion.div>

        <Button className="w-full rounded-full gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>

        {/* Privacy Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <Link to="/privacy-settings" className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold">Privacy Settings</h3>
                <p className="text-xs text-muted-foreground">Encryption, data sharing & visibility</p>
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:text-primary transition-colors" />
          </Link>
        </motion.div>

        {/* PDF Export */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <FileDown className="w-4 h-4 text-primary" />
            <h3 className="font-heading text-base font-semibold">Export Your History</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Download all your journal entries, analysis reports, milestones and goals as a private PDF report.</p>
          <PdfExportButton isPremium={user?.role === 'premium' || user?.role === 'admin'} className="w-full" />
        </motion.div>

        {/* Feedback & Suggestions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            <h3 className="font-heading text-base font-semibold">Send Feedback & Suggestions</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Help us improve Aura. Share bugs, feature ideas, or general thoughts.</p>
          <FeedbackForm />
        </motion.div>

        {/* Delete Account Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading text-base font-semibold text-destructive mb-1">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                This action is permanent. All your data, journal entries, analyses, and shared content will be deleted forever.
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full rounded-full gap-2">
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and ALL associated data including:
                  <ul className="mt-2 ml-4 space-y-1 text-sm">
                    <li>• All journal entries</li>
                    <li>• Analysis reports</li>
                    <li>• Relationship goals and progress</li>
                    <li>• Partner connections</li>
                    <li>• All personal information</li>
                  </ul>
                  <p className="mt-3 font-semibold text-destructive">This cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2">
                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
                >
                  {deleting ? "Deleting..." : "Yes, Delete Everything"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
}