import React from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg p-2 shadow text-xs">
      <p className="font-medium">{payload[0].payload.label}</p>
      <p className="text-primary font-semibold">{payload[0].value}%</p>
    </div>
  );
};

export default function QuizResults() {
  const { quizId } = useParams();

  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const q = await base44.entities.Quiz.filter({ id: quizId });
      return q[0] || null;
    }
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["quiz-responses", quizId],
    queryFn: () => base44.entities.QuizResponse.filter({ quiz_id: quizId }, "-completed_date", 100),
    initialData: []
  });

  if (!quiz) return <div className="min-h-screen flex items-center justify-center">Quiz not found</div>;

  const sortedResponses = [...responses].sort((a, b) => new Date(a.completed_date) - new Date(b.completed_date));
  const avgScore = responses.length ? (responses.reduce((s, r) => s + r.score, 0) / responses.length).toFixed(1) : 0;
  const highScore = responses.length ? Math.max(...responses.map(r => r.score)) : 0;
  const improvementTrend = responses.length > 1 ? responses[responses.length - 1].score - responses[0].score : 0;

  const chartData = sortedResponses.map((r, i) => ({
    label: format(parseISO(r.completed_date), "MMM d"),
    score: r.score
  }));

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/quiz" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Results & History</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
          <p className="font-heading font-semibold text-lg mb-4">{quiz.title}</p>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
              <p className="text-3xl font-bold text-primary">{avgScore}</p>
              <p className="text-xs text-muted-foreground mt-1">Average Score</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
              <p className="text-3xl font-bold text-chart-2">{highScore}</p>
              <p className="text-xs text-muted-foreground mt-1">Best Score</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {improvementTrend > 0 && <TrendingUp className="w-4 h-4 text-chart-2" />}
                <p className="text-3xl font-bold" style={{ color: improvementTrend > 0 ? "hsl(var(--chart-2))" : improvementTrend < 0 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}>
                  {improvementTrend > 0 ? "+" : ""}{improvementTrend}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total Growth</p>
            </div>
          </div>
        </div>

        {/* Trend chart */}
        {responses.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-6 rounded-2xl bg-card border border-border/60">
            <p className="font-heading font-semibold text-sm mb-4">Score Progression</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Recent attempts */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="font-heading font-semibold text-sm">Attempts ({responses.length})</p>
          {responses.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-card border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No attempts yet</p>
            </div>
          ) : (
            responses.map((r, i) => (
              <div key={r.id} className="p-4 rounded-xl bg-card border border-border/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{format(parseISO(r.completed_date), "MMMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{r.taker_email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`rounded-full px-4 py-1.5 gap-1.5 ${r.score >= 80 ? "bg-chart-2/10 text-chart-2" : r.score >= 60 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                      <Trophy className="w-3 h-3" />
                      {r.score}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>

        <Link to="/quiz" className="block mt-8">
          <Button variant="outline" className="w-full rounded-full">← Back to Quiz Hub</Button>
        </Link>
      </div>
    </div>
  );
}