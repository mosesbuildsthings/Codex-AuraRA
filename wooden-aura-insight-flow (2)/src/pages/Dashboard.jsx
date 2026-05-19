import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
// Navigation handled by DesktopSidebar on desktop
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import {
  Sparkles, Plus, FileText, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Award, BookOpen, Star, Activity, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import MilestoneTimeline from "@/components/milestones/MilestoneTimeline";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import TooltipHint from "@/components/ui/tooltip-hint";
import ActiveGrowthModule from "@/components/growth/ActiveGrowthModule";
import EmotionalPulse from "@/components/dashboard/EmotionalPulse";
import ActionPlanWidget from "@/components/dashboard/ActionPlanWidget";
import RelationshipJourney from "@/components/dashboard/RelationshipJourney";
import ScheduleOptimizer from "@/components/dashboard/ScheduleOptimizer";
import PremiumWelcomeModal from "@/components/premium/PremiumWelcomeModal";
import PremiumBadge from "@/components/premium/PremiumBadge";

const statusConfig = {
  draft: { label: "Draft", icon: Clock, className: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", icon: Clock, className: "bg-accent text-accent-foreground" },
  analyzing: { label: "Analyzing", icon: Clock, className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-chart-2/10 text-chart-2" },
  error: { label: "Error", icon: AlertCircle, className: "bg-destructive/10 text-destructive" }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [milestonesKey, setMilestonesKey] = useState(0);
  const [exercisesKey, setExercisesKey] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { containerRef, isRefreshing } = usePullToRefresh(async () => {
    queryClient.invalidateQueries({ queryKey: ["cases"] });
    queryClient.invalidateQueries({ queryKey: ["milestones"] });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
  });

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["cases", user?.email],
    queryFn: () => user ? base44.entities.AnalysisCase.filter({ created_by: user.email }, "-created_date", 50) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: milestones = [], refetch: refetchMilestones } = useQuery({
    queryKey: ["milestones", milestonesKey, user?.email],
    queryFn: () => user ? base44.entities.Milestone.filter({ created_by: user.email }, "date", 100) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: exercises = [], refetch: refetchExercises } = useQuery({
    queryKey: ["exercises", exercisesKey, user?.email],
    queryFn: () => user ? base44.entities.GrowthExercise.filter({ created_by: user.email }, "-created_date", 100) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports", user?.email],
    queryFn: () => user ? base44.entities.Report.filter({ created_by: user.email }, "-created_date", 5) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal-entries", user?.email],
    queryFn: () => user ? base44.entities.JournalEntry.filter({ created_by: user.email }, "-date", 200) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", user?.email],
    queryFn: () => user ? base44.entities.RelationshipGoal.filter({ created_by: user.email }, "-created_date", 50) : [],
    enabled: !!user,
    initialData: []
  });

  const onMilestonesRefresh = useCallback(() => setMilestonesKey(k => k + 1), []);
  const onExercisesRefresh = useCallback(() => setExercisesKey(k => k + 1), []);

  const completedCount = cases.filter(c => c.status === "completed").length;
  const milestonesCount = milestones.length;
  const exercisesDone = exercises.filter(e => e.status === "completed").length;
  const latestReport = reports[0] || null;

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative">
      <OnboardingTour />
      <PremiumWelcomeModal user={user} />
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Desktop page header — sidebar handles navigation */}
      <div className="hidden sm:flex items-center justify-between px-8 py-6 border-b border-border/40">
        <div>
          <h1 className="font-heading text-2xl font-bold">Home</h1>
          <p className="text-sm text-muted-foreground">Your relationship overview</p>
        </div>
        <Link to="/onboarding">
          <Button className="rounded-full px-6 gap-2">
            <Plus className="w-4 h-4" /> New Session
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 pt-4 sm:pt-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold mb-1 sm:hidden flex items-center gap-2 flex-wrap">
                Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
                {(user?.role === "premium" || user?.role === "admin") && <PremiumBadge size="md" />}
              </h1>
              <p className="text-muted-foreground text-sm">Your private space for relationship reflection and growth.</p>
            </div>
            {/* Mobile-only quick action */}
            <TooltipHint text="Start a new relationship reflection to get AI-powered guidance" side="left">
              <Link to="/onboarding" className="sm:hidden shrink-0">
                <Button size="sm" className="rounded-full gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> New
                </Button>
              </Link>
            </TooltipHint>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{cases.length}</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">Reflections</p>
                  <TooltipHint text="Total relationship reflections you've submitted for AI analysis" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-chart-3" />
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{milestonesCount}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Milestones</p>
                  <TooltipHint text="Important relationship moments you've logged on your timeline" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-chart-2" />
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{exercisesDone}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Exercises Done</p>
                  <TooltipHint text="Growth exercises completed from your personalized exercise library" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <Award className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {completedCount >= 5 ? "Explorer" : completedCount >= 1 ? "Seeker" : "Newcomer"}
                </p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emotional Pulse widget */}
        <div className="mb-6">
          <EmotionalPulse />
        </div>

        {/* Relationship Journey */}
        <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-card border border-border/60">
          <RelationshipJourney
            journalEntries={journalEntries}
            exercises={exercises}
            goals={goals}
            milestones={milestones}
            user={user}
          />
        </div>

        {/* Schedule Optimizer */}
        <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-card border border-border/60">
          <ScheduleOptimizer journalEntries={journalEntries} exercises={exercises} connections={[]} />
        </div>

        {/* Action Plan widget */}
        <div className="mb-6">
          <ActionPlanWidget journalEntries={journalEntries} goals={goals} />
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue="reflections">
          <TabsList className="bg-muted rounded-xl mb-6 h-10 p-1">
            <TabsTrigger value="reflections" className="rounded-lg text-sm gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Reflections
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg text-sm gap-1.5">
              <Star className="w-3.5 h-3.5" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="growth" className="rounded-lg text-sm gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Active Growth
            </TabsTrigger>
          </TabsList>

          {/* ── Reflections Tab ── */}
          <TabsContent value="reflections">
            {casesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : cases.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
              >
                <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">No reflections yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Start your first analysis to receive personalized guidance.</p>
                <Link to="/onboarding">
                  <Button className="rounded-full px-8 gap-2">
                    <Plus className="w-4 h-4" /> Begin Your First Reflection
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {cases.map((c, i) => {
                  const config = statusConfig[c.status] || statusConfig.draft;
                  const StatusIcon = config.icon;
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          if (c.status === "completed") navigate("/report/" + c.id);
                          else if (c.status === "analyzing") navigate("/analyzing/" + c.id);
                        }}
                        className="w-full text-left p-5 rounded-xl bg-card border border-border/60 hover:shadow-md hover:border-primary/20 transition-all group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {c.core_question || c.narrative?.substring(0, 60) || "Untitled reflection"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {format(new Date(c.created_date), "MMM d, yyyy")}
                                {c.relationship_status && ` • ${c.relationship_status.replace(/_/g, " ")}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge className={`${config.className} rounded-full gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                            {c.status === "completed" && (
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Timeline Tab ── */}
          <TabsContent value="timeline">
            <MilestoneTimeline
              milestones={milestones}
              cases={cases}
              onRefresh={onMilestonesRefresh}
            />
          </TabsContent>

          {/* ── Active Growth Tab ── */}
          <TabsContent value="growth">
            <ActiveGrowthModule
              exercises={exercises}
              latestReport={latestReport}
              onRefresh={onExercisesRefresh}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 max-w-4xl mx-auto px-4 sm:px-8">
        <p className="text-xs text-muted-foreground text-center">
          Aura is an AI-powered informational tool, not a substitute for professional psychological,
          medical, or legal counsel.
        </p>
      </footer>
    </div>
  );
}