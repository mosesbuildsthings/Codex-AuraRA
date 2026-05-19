import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Plus, Trash2, Save } from "lucide-react";

const genId = () => Math.random().toString(36).substr(2, 9);

export default function QuizCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("how_well_do_you_know_me");
  const [questions, setQuestions] = useState([
    { id: genId(), text: "", options: ["", ""], correct_answer: "", order: 0 }
  ]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: genId(), text: "", options: ["", ""], correct_answer: "", order: questions.length }
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i })));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const addOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options = [...updated[qIdx].options, ""];
    setQuestions(updated);
  };

  const removeOption = (qIdx, oIdx) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== oIdx);
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const canSave = title.trim() && questions.length > 0 &&
    questions.every(q => q.text.trim() && q.options.length >= 2 && q.options.every(o => o.trim()) && q.correct_answer.trim());

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await base44.entities.Quiz.create({
      title,
      description,
      type,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correct_answer: q.correct_answer,
        order: q.order
      }))
    });
    setSaving(false);
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/quiz" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Create Quiz</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Header info */}
        <div className="mb-6 p-5 rounded-xl bg-card border border-border/60">
          <p className="text-sm font-medium mb-4">Quiz Details</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quiz Title</label>
              <Input
                placeholder="e.g., What do you know about me?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1.5 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
              <Textarea
                placeholder="Add context or instructions for the quiz..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1.5 rounded-lg resize-none h-20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quiz Type</label>
              <div className="flex gap-2 mt-1.5">
                {[
                  { value: "how_well_do_you_know_me", label: "How Well Do You Know Me?" },
                  { value: "compatibility", label: "Compatibility Quiz" }
                ].map(opt => (
                  <button key={opt.value} onClick={() => setType(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      type === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/40"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{questions.length} Questions</p>
            <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={addQuestion}>
              <Plus className="w-3.5 h-3.5" /> Add Question
            </Button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={q.id} className="p-5 rounded-xl bg-card border border-border/60 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-muted-foreground">Question {qIdx + 1}</p>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIdx)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Question Text</label>
                <Input
                  placeholder="Enter your question"
                  value={q.text}
                  onChange={e => updateQuestion(qIdx, "text", e.target.value)}
                  className="mt-1.5 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Answer Options</label>
                <div className="space-y-2 mt-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                        className="rounded-lg text-sm flex-1"
                      />
                      <button
                        onClick={() => q.correct_answer === opt ? updateQuestion(qIdx, "correct_answer", "") : null}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          q.correct_answer === opt
                            ? "bg-chart-2 text-chart-2 border-chart-2"
                            : "bg-background border-border text-muted-foreground hover:border-chart-2/40"
                        }`}
                        onClick={() => updateQuestion(qIdx, "correct_answer", q.correct_answer === opt ? "" : opt)}
                      >
                        {q.correct_answer === opt ? "✓ Correct" : "Mark"}
                      </button>
                      {q.options.length > 2 && (
                        <button onClick={() => removeOption(qIdx, oIdx)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => addOption(qIdx)} className="text-xs text-primary hover:text-primary/80 mt-2 font-medium">
                  + Add Option
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex gap-2 justify-end">
          <Link to="/quiz">
            <Button variant="outline" className="rounded-full">Cancel</Button>
          </Link>
          <Button className="rounded-full gap-1.5" onClick={handleSave} disabled={!canSave || saving}>
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}