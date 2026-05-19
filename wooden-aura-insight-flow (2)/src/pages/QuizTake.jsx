import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const q = await base44.entities.Quiz.filter({ id: quizId });
      return q[0] || null;
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center"><p>Quiz not found</p></div>;

  const q = quiz.questions[currentQ];
  const answered = Object.keys(answers).length;
  const progress = ((answered / quiz.questions.length) * 100).toFixed(0);

  const handleSelectAnswer = (option) => {
    setAnswers({ ...answers, [currentQ]: option });
  };

  const handleSubmit = async () => {
    setSaving(true);
    let correct = 0;
    const answersList = quiz.questions.map((question, idx) => {
      const isCorrect = answers[idx] === question.correct_answer;
      if (isCorrect) correct++;
      return { question_id: question.id, answer: answers[idx], is_correct: isCorrect };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);

    const user = await base44.auth.me();
    await base44.entities.QuizResponse.create({
      quiz_id: quizId,
      taker_email: user.email,
      score,
      answers: answersList,
      completed_date: new Date().toISOString()
    });

    setSaving(false);
    setSubmitted(true);
    setTimeout(() => navigate(`/quiz/${quizId}/results`), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/quiz" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">{quiz.title}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        {!submitted ? (
          <>
            {/* Progress bar */}
            <div className="mb-8 p-4 rounded-xl bg-card border border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Question {currentQ + 1} of {quiz.questions.length}</span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question */}
            <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="p-6 rounded-xl bg-card border border-border/60 mb-6">
                <p className="font-heading font-semibold text-lg mb-6">{q.text}</p>

                <div className="space-y-2">
                  {q.options.map((option, idx) => {
                    const isSelected = answers[currentQ] === option;
                    return (
                      <button key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border/60 text-foreground hover:border-primary/40"
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary-foreground bg-primary-foreground/20" : "border-border"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                          </div>
                          <span className="font-medium text-sm">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex gap-3 justify-between">
              <Button variant="outline" className="rounded-full" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
                ← Back
              </Button>

              {currentQ === quiz.questions.length - 1 ? (
                <Button className="rounded-full gap-1.5" onClick={handleSubmit} disabled={answered !== quiz.questions.length || saving}>
                  <Check className="w-4 h-4" /> {saving ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <Button className="rounded-full" onClick={() => setCurrentQ(currentQ + 1)}>
                  Next →
                </Button>
              )}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-chart-2" />
            </div>
            <p className="font-heading text-lg font-semibold mb-1">Quiz Submitted!</p>
            <p className="text-sm text-muted-foreground">Redirecting to results...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}