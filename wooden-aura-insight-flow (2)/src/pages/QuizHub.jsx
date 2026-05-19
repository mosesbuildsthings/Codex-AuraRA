import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Sparkles, Plus, Play, Trash2, BarChart3,
  Brain, Heart, ChevronRight, Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function QuizHub() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => base44.entities.Quiz.list("-created_date", 100),
    initialData: []
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["quiz-responses"],
    queryFn: () => base44.entities.QuizResponse.list("-completed_date", 500),
    initialData: []
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleDelete = async (quizId) => {
    await base44.entities.Quiz.delete(quizId);
    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
  };

  // Group responses by quiz
  const responsesByQuiz = {};
  responses.forEach(r => {
    if (!responsesByQuiz[r.quiz_id]) {
      responsesByQuiz[r.quiz_id] = [];
    }
    responsesByQuiz[r.quiz_id].push(r);
  });

  const typeConfig = {
    how_well_do_you_know_me: { icon: Brain, label: "How Well Do You Know Me?", color: "text-primary" },
    compatibility: { icon: Heart, label: "Compatibility Quiz", color: "text-destructive" }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Quiz Hub</span>
          </div>
        </div>
        <Link to="/quiz/create">
          <Button className="rounded-full gap-1.5">
            <Plus className="w-4 h-4" /> New Quiz
          </Button>
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {quizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
          >
            <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No quizzes yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create a quiz to test knowledge with your partner.</p>
            <Link to="/quiz/create">
              <Button variant="outline" className="rounded-full">
                <Plus className="w-4 h-4 mr-1.5" /> Create First Quiz
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz, i) => {
              const TypeIcon = typeConfig[quiz.type]?.icon || Brain;
              const quizResponses = responsesByQuiz[quiz.id] || [];
              const avgScore = quizResponses.length
                ? (quizResponses.reduce((s, r) => s + r.score, 0) / quizResponses.length).toFixed(1)
                : null;

              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-5 rounded-xl bg-card border border-border/60 hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <TypeIcon className={`w-5 h-5 ${typeConfig[quiz.type]?.color || "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-heading font-semibold text-sm mb-1">{quiz.title}</p>
                        {quiz.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{quiz.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs rounded-full">
                            {quiz.questions?.length || 0} questions
                          </Badge>
                          {avgScore && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              <Trophy className="w-3 h-3" />
                              Avg: {avgScore}%
                            </div>
                          )}
                          {quizResponses.length > 0 && (
                            <Badge variant="outline" className="text-xs rounded-full">
                              {quizResponses.length} taken
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/quiz/${quiz.id}/take`}>
                        <Button size="sm" variant="default" className="rounded-full gap-1.5">
                          <Play className="w-3.5 h-3.5" /> Take
                        </Button>
                      </Link>
                      <Link to={`/quiz/${quiz.id}/results`}>
                        <Button size="sm" variant="outline" className="rounded-full gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5" /> Results
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}