import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Flame, CheckCircle2, Lock, Unlock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, endOfWeek } from "date-fns";

const CHALLENGES = [
  {
    id: "date-night",
    title: "Date Night",
    category: "quality_time",
    description: "Plan and complete a date night together. Share a meal, activity, or moment of undistracted time.",
    difficulty: "easy",
    duration_days: 7,
    points: 15
  },
  {
    id: "communication-game",
    title: "36 Questions",
    category: "communication",
    description: "Answer 36 progressive questions together to deepen emotional connection and understanding.",
    difficulty: "medium",
    duration_days: 7,
    points: 20
  },
  {
    id: "gratitude-exchange",
    title: "Gratitude Exchange",
    category: "intimacy",
    description: "Each share 3 specific things you appreciate about your partner and why.",
    difficulty: "easy",
    duration_days: 7,
    points: 10
  },
  {
    id: "adventure-date",
    title: "Try Something New",
    category: "adventure",
    description: "Do an activity neither of you has tried before. Be spontaneous and open-minded.",
    difficulty: "hard",
    duration_days: 7,
    points: 25
  },
  {
    id: "conflict-resolution",
    title: "Resolve One Issue",
    category: "conflict_resolution",
    description: "Pick one recurring issue and work through it using active listening and empathy.",
    difficulty: "hard",
    duration_days: 7,
    points: 30
  },
  {
    id: "wellness-together",
    title: "Wellness Together",
    category: "wellness",
    description: "Exercise, meditate, or do yoga together. Prioritize your physical and mental health as a couple.",
    difficulty: "medium",
    duration_days: 7,
    points: 20
  }
];

function ChallengeCard({ challenge, onAccept, partnerConnected }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-heading font-semibold text-lg">{challenge.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
        </div>
        <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 text-xs gap-1">
          <Flame className="w-3 h-3" /> {challenge.points} pts
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="outline" className="text-xs rounded-full">
          {challenge.category.replace(/_/g, " ")}
        </Badge>
        <Badge variant="outline" className="text-xs rounded-full">
          {challenge.difficulty}
        </Badge>
        <Badge variant="outline" className="text-xs rounded-full">
          {challenge.duration_days} days
        </Badge>
      </div>

      <Button
        onClick={() => onAccept(challenge)}
        disabled={!partnerConnected}
        className="w-full rounded-full gap-2"
        variant={partnerConnected ? "default" : "outline"}
      >
        {partnerConnected ? (
          <>
            <Sparkles className="w-4 h-4" /> Start Challenge
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" /> Connect Partner First
          </>
        )}
      </Button>
    </motion.div>
  );
}

function ActiveChallenge({ challenge, onComplete, onCancel }) {
  const [experience, setExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!experience.trim()) return;

    setSubmitting(true);
    await onComplete(challenge, experience);
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 mb-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <Badge className="rounded-full bg-primary text-primary-foreground gap-1 mb-3">
            <Flame className="w-3 h-3" /> Active Challenge
          </Badge>
          <h3 className="font-heading text-2xl font-bold">{challenge.title}</h3>
          <p className="text-muted-foreground mt-1">{challenge.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">How did it go? Log your experience:</label>
          <Textarea
            placeholder="Share what you did together, how it felt, and what you learned about each other..."
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="min-h-[120px] resize-none rounded-xl"
            required
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-full"
            disabled={submitting || !experience.trim()}
          >
            {submitting ? "Logging..." : "Log Experience"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default function WeeklyChallenge() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [partnerEmail, setPartnerEmail] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
    }).catch(() => {});
  }, []);

  const { data: connections = [] } = useQuery({
    queryKey: ["partner-connections"],
    queryFn: () => base44.entities.PartnerConnection.filter({ status: "accepted" }, "-created_date", 10),
    initialData: []
  });

  const completeChallengeMutation = useMutation({
    mutationFn: async ({ challenge, experience }) => {
      // Log to journal
      const journalEntry = {
        date: format(new Date(), "yyyy-MM-dd"),
        content: `Completed challenge: ${challenge.title}\n\n${experience}`,
        sentiment: "good",
        sentiment_score: 4,
        tags: ["Challenge", challenge.category.replace(/_/g, " ")],
        is_private: false
      };
      await base44.entities.JournalEntry.create(journalEntry);

      // Create challenge record
      const challengeRecord = {
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        duration_days: challenge.duration_days,
        points: challenge.points,
        creator_email: user.email,
        participants: [user.email, partnerEmail].filter(Boolean),
        status: "completed",
        started_date: new Date().toISOString(),
        completed_date: new Date().toISOString(),
        completion_proof: experience,
        votes_count: 0
      };
      return base44.entities.Challenge.create(challengeRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      setActiveChallenge(null);
    }
  });

  const handleCompleteChallenge = async (challenge, experience) => {
    completeChallengeMutation.mutate({ challenge, experience });
  };

  const partnerConnected = connections.length > 0;
  if (partnerConnected && !partnerEmail) {
    const conn = connections[0];
    setPartnerEmail(conn.partner_email);
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Weekly Challenges</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold mb-2">
            Week of {format(startOfWeek(new Date()), "MMM d")} - {format(endOfWeek(new Date()), "MMM d")}
          </h2>
          <p className="text-muted-foreground">
            {partnerConnected ? "Complete challenges together to strengthen your connection and earn points!" : "Connect with your partner to unlock shared challenges."}
          </p>
        </div>

        {/* Active Challenge */}
        <AnimatePresence>
          {activeChallenge && (
            <ActiveChallenge
              challenge={activeChallenge}
              onComplete={handleCompleteChallenge}
              onCancel={() => setActiveChallenge(null)}
            />
          )}
        </AnimatePresence>

        {/* Partner Connection Status */}
        {!partnerConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3"
          >
            <Lock className="w-5 h-5 text-accent-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Partner account required</p>
              <p className="text-xs text-muted-foreground mt-0.5">Connect with your partner to unlock shared challenges and track your progress together.</p>
            </div>
            <Link to="/partner" className="shrink-0">
              <Button size="sm" variant="outline" className="rounded-full">
                <Unlock className="w-3 h-3 mr-1.5" /> Connect
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {CHALLENGES.map((challenge, i) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              partnerConnected={partnerConnected}
              onAccept={(c) => setActiveChallenge(c)}
            />
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 rounded-2xl bg-card border border-border/60"
        >
          <h3 className="font-heading font-semibold mb-3">How It Works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>✓ Pick a challenge and complete it with your partner</p>
            <p>✓ Log your experience and what you learned</p>
            <p>✓ Your entry automatically saves to your journal</p>
            <p>✓ Earn points and strengthen your connection</p>
            <p>✓ Your partner can see the shared experience</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}