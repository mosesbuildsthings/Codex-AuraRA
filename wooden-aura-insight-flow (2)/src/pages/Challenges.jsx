import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Plus, Trophy, Flame, CheckCircle2, Clock, Award, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, parseISO } from "date-fns";

const CHALLENGE_TEMPLATES = [
  { title: "Cook a New Dish Together", description: "Choose a recipe and cook dinner as a team", category: "adventure", difficulty: "easy", duration: 2, points: 15, emoji: "🍳" },
  { title: "Phone-Free Dinner", description: "Have a meal together with zero distractions", category: "communication", difficulty: "easy", duration: 1, points: 10, emoji: "📵" },
  { title: "Sunrise Walk", description: "Wake up early and take a walk together", category: "wellness", difficulty: "medium", duration: 1, points: 20, emoji: "🌅" },
  { title: "Date Night Challenge", description: "Plan and execute a creative date", category: "intimacy", difficulty: "medium", duration: 3, points: 25, emoji: "💕" },
  { title: "Future Visioning", description: "Share your dreams and goals for the next 5 years", category: "communication", difficulty: "medium", duration: 2, points: 20, emoji: "🎯" },
  { title: "Massage Exchange", description: "Give each other relaxing massages", category: "intimacy", difficulty: "easy", duration: 1, points: 15, emoji: "💆" },
  { title: "Art Project", description: "Create something creative together", category: "creativity", difficulty: "medium", duration: 5, points: 30, emoji: "🎨" },
  { title: "Adventure Day", description: "Explore a new place you've never been", category: "adventure", difficulty: "hard", duration: 4, points: 50, emoji: "🚀" }
];

const CATEGORY_COLORS = {
  communication: "bg-primary/10",
  adventure: "bg-chart-3/10",
  intimacy: "bg-destructive/10",
  wellness: "bg-chart-2/10",
  creativity: "bg-chart-4/10",
  fun: "bg-accent/40"
};

export default function Challenges() {
  const [user, setUser] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-started_date", 100),
    initialData: []
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.PartnerConnection.list("-created_date", 50),
    initialData: []
  });

  const activeConnection = connections.find(c =>
    (c.inviter_email === user?.email || c.partner_email === user?.email) &&
    c.status === "accepted"
  );

  // Calculate total points
  const totalPoints = useMemo(() => {
    return challenges
      .filter(c => c.status === "completed")
      .reduce((sum, c) => sum + (c.points || 0), 0);
  }, [challenges]);

  // Leaderboard
  const leaderboard = useMemo(() => {
    if (!activeConnection || !user) return [];

    const creator = user.email;
    const partner = user.email === activeConnection.inviter_email
      ? activeConnection.partner_email
      : activeConnection.inviter_email;

    const creatorPoints = challenges
      .filter(c => c.creator_email === creator && c.status === "completed")
      .reduce((sum, c) => sum + (c.points || 0), 0);

    const partnerPoints = challenges
      .filter(c => c.creator_email === partner && c.status === "completed")
      .reduce((sum, c) => sum + (c.points || 0), 0);

    return [
      { email: creator, name: user.full_name || creator, points: creatorPoints },
      { email: partner, name: partner, points: partnerPoints }
    ].sort((a, b) => b.points - a.points);
  }, [challenges, user, activeConnection]);

  const activeChallenges = challenges.filter(c => c.status === "active");
  const completedChallenges = challenges.filter(c => c.status === "completed");

  const handleCreateChallenge = async (template) => {
    await base44.entities.Challenge.create({
      ...template,
      creator_email: user?.email,
      participants: [user?.email, activeConnection?.partner_email || user?.email],
      started_date: new Date().toISOString(),
      status: "active"
    });
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
    setShowTemplates(false);
  };

  const handleCompleteChallenge = async (id) => {
    setCompletingId(id);
    await base44.entities.Challenge.update(id, {
      status: "completed",
      completed_date: new Date().toISOString(),
      votes_count: 1
    });
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
    setCompletingId(null);
  };

  const handleAbandonChallenge = async (id) => {
    await base44.entities.Challenge.update(id, {
      status: "abandoned"
    });
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-chart-3" />
            <span className="font-heading text-xl font-bold">Challenges</span>
          </div>
        </div>
        {activeConnection && (
          <Button
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Plus className="w-4 h-4" /> New Challenge
          </Button>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {!activeConnection ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Flame className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No partner connected</h3>
            <p className="text-sm text-muted-foreground mb-6">Connect with your partner to start challenges together.</p>
            <Link to="/partner">
              <Button variant="outline" className="rounded-full">Go to Partner Settings</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Points & Leaderboard */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-chart-3/10 to-primary/10 border border-chart-3/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Points</p>
                    <p className="text-4xl font-bold text-chart-3">{totalPoints}</p>
                  </div>
                  <Award className="w-12 h-12 text-chart-3/40" />
                </div>
              </div>

              <div className="md:col-span-2 p-6 rounded-2xl bg-card border border-border/60">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-chart-3" /> Leaderboard
                </p>
                <div className="space-y-2">
                  {leaderboard.map((player, i) => (
                    <div key={player.email} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                        <span className="text-sm font-medium">{player.name.split(" ")[0]}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{player.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates */}
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 grid sm:grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {CHALLENGE_TEMPLATES.map((template) => (
                    <motion.button
                      key={template.title}
                      onClick={() => handleCreateChallenge(template)}
                      className={`p-4 rounded-xl border-2 border-dashed border-border hover:border-primary transition-all text-left ${CATEGORY_COLORS[template.category]}`}
                    >
                      <p className="text-2xl mb-2">{template.emoji}</p>
                      <p className="font-medium text-sm mb-1">{template.title}</p>
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="text-xs bg-opacity-60">{template.points} pts</Badge>
                        <Badge variant="outline" className="text-xs">{template.duration}d</Badge>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Challenges */}
            {activeChallenges.length === 0 && !showTemplates ? (
              <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border mb-8">
                <Flame className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">No active challenges</h3>
                <p className="text-sm text-muted-foreground mb-6">Start a challenge to build your connection and earn points!</p>
                <Button variant="outline" className="rounded-full" onClick={() => setShowTemplates(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Pick a Challenge
                </Button>
              </div>
            ) : (
              <div className="mb-8">
                <p className="font-heading text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> In Progress ({activeChallenges.length})
                </p>
                <div className="space-y-3">
                  {activeChallenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${CATEGORY_COLORS[challenge.category]} border-opacity-40`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{challenge.title}</h4>
                            <Badge className="text-xs bg-opacity-60">{challenge.difficulty}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>⏱️ {challenge.duration_days} days</span>
                            <span>⭐ {challenge.points} points</span>
                            {challenge.started_date && (
                              <span>Started {formatDistanceToNow(parseISO(challenge.started_date), { addSuffix: true })}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="rounded-full gap-1.5"
                            onClick={() => handleCompleteChallenge(challenge.id)}
                            disabled={completingId === challenge.id}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => handleAbandonChallenge(challenge.id)}
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-muted-foreground uppercase tracking-wider list-none flex items-center gap-2 hover:text-foreground transition-colors">
                  <span className="group-open:hidden">▶</span>
                  <span className="hidden group-open:inline">▼</span>
                  <Zap className="w-4 h-4 text-chart-3" /> Completed ({completedChallenges.length})
                </summary>
                <div className="mt-4 space-y-3">
                  {completedChallenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 rounded-xl border opacity-60 ${CATEGORY_COLORS[challenge.category]} border-opacity-40`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm line-through">{challenge.title}</h4>
                            <CheckCircle2 className="w-4 h-4 text-chart-2" />
                          </div>
                          {challenge.completed_date && (
                            <p className="text-xs text-muted-foreground">
                              Completed {formatDistanceToNow(parseISO(challenge.completed_date), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-chart-2 text-white">{challenge.points} pts</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
}