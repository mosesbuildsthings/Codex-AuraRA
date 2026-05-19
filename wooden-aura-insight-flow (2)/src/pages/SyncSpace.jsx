import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Plus, Send, Heart, Target, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

import SharedGoalCard from "@/components/syncspace/SharedGoalCard";
import SharedGoalForm from "@/components/syncspace/SharedGoalForm";
import AppreciationNoteForm from "@/components/syncspace/AppreciationNoteForm";
import AppreciationNoteList from "@/components/syncspace/AppreciationNoteList";
import SyncedMoodCalendar from "@/components/syncspace/SyncedMoodCalendar";

export default function SyncSpace() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: syncSpaces = [] } = useQuery({
    queryKey: ["sync-spaces"],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.SyncSpace.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
    initialData: []
  });

  const { data: sharedGoals = [] } = useQuery({
    queryKey: ["shared-goals"],
    queryFn: async () => {
      if (!syncSpaces.length) return [];
      const goals = await Promise.all(
        syncSpaces.map(s => base44.entities.SharedGoal.filter({ sync_space_id: s.id }))
      );
      return goals.flat();
    },
    enabled: !!syncSpaces.length,
    initialData: []
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["appreciation-notes"],
    queryFn: async () => {
      if (!syncSpaces.length) return [];
      const allNotes = await Promise.all(
        syncSpaces.map(s => base44.entities.AppreciationNote.filter({ sync_space_id: s.id }))
      );
      return allNotes.flat();
    },
    enabled: !!syncSpaces.length,
    initialData: []
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 30),
    initialData: []
  });

  const activeSpace = syncSpaces[0];
  const unreadNotes = notes.filter(n => !n.is_read && n.to_email === user?.email);
  const completedGoals = sharedGoals.filter(g => g.status === "completed").length;
  const inProgressGoals = sharedGoals.filter(g => g.status === "in_progress").length;

  if (!activeSpace) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-heading text-xl font-bold">Sync Space</span>
        </nav>
        <div className="max-w-4xl mx-auto px-6 pb-20 text-center py-20">
          <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No active sync space</p>
          <p className="text-sm text-muted-foreground mb-6">Connect with your partner to create a shared space.</p>
          <Link to="/partner">
            <Button className="rounded-full">Go to Partner Connect</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-heading text-xl font-bold">{activeSpace.name}</span>
        </div>
        <Link to="/coach">
          <Button variant="outline" size="sm" className="rounded-full gap-1.5">
            <MessageCircle className="w-4 h-4" /> Coach
          </Button>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border/60">
            <p className="text-2xl font-bold">{sharedGoals.length}</p>
            <p className="text-xs text-muted-foreground">Shared Goals</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/60">
            <p className="text-2xl font-bold">{unreadNotes.length}</p>
            <p className="text-xs text-muted-foreground">New Notes</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/60">
            <p className="text-2xl font-bold text-chart-2">{completedGoals}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        <Tabs defaultValue="goals">
          <TabsList className="bg-muted rounded-xl mb-6 h-10 p-1">
            <TabsTrigger value="goals" className="rounded-lg text-sm gap-1.5">
              <Target className="w-3.5 h-3.5" /> Goals
            </TabsTrigger>
            <TabsTrigger value="moods" className="rounded-lg text-sm gap-1.5">
              <Heart className="w-3.5 h-3.5" /> Moods
            </TabsTrigger>
            <TabsTrigger value="appreciation" className="rounded-lg text-sm gap-1.5">
              <Send className="w-3.5 h-3.5" /> Notes
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Button
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => setShowGoalForm(true)}
            >
              <Plus className="w-4 h-4" /> New Goal
            </Button>

            <AnimatePresence>
              {showGoalForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  <SharedGoalForm
                    syncSpaceId={activeSpace.id}
                    onSave={() => {
                      setShowGoalForm(false);
                      queryClient.invalidateQueries({ queryKey: ["shared-goals"] });
                    }}
                    onCancel={() => setShowGoalForm(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {sharedGoals.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
                <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-sm mb-4">No shared goals yet</p>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowGoalForm(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Create First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedGoals.map((goal, i) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <SharedGoalCard goal={goal} onRefresh={() => queryClient.invalidateQueries({ queryKey: ["shared-goals"] })} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Moods Tab */}
          <TabsContent value="moods">
            <SyncedMoodCalendar journalEntries={journalEntries} />
          </TabsContent>

          {/* Appreciation Notes Tab */}
          <TabsContent value="appreciation" className="space-y-4">
            <Button
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => setShowNoteForm(true)}
            >
              <Send className="w-4 h-4" /> Send Note
            </Button>

            <AnimatePresence>
              {showNoteForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  <AppreciationNoteForm
                    syncSpaceId={activeSpace.id}
                    partnerEmail={activeSpace.partner_email}
                    userEmail={user?.email}
                    onSave={() => {
                      setShowNoteForm(false);
                      queryClient.invalidateQueries({ queryKey: ["appreciation-notes"] });
                    }}
                    onCancel={() => setShowNoteForm(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AppreciationNoteList notes={notes} currentUserEmail={user?.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}