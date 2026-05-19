import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus, X } from "lucide-react";

export default function CoreQuestion({ questions = [""], onChange }) {
  const updateQuestion = (idx, val) => {
    const updated = [...questions];
    updated[idx] = val;
    onChange(updated);
  };

  const addQuestion = () => {
    onChange([...questions, ""]);
  };

  const removeQuestion = (idx) => {
    const updated = questions.filter((_, i) => i !== idx);
    onChange(updated.length ? updated : [""]);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">Your Core Questions</h3>
          <p className="text-sm text-muted-foreground">Focus Aura's analysis on what matters most</p>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        Aura has suggested questions based on your narrative. Edit them, remove any that don't fit, 
        or add your own.
      </p>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={idx} className="relative group">
            <Textarea
              placeholder={idx === 0
                ? "E.g., 'Is there still hope for this relationship?'"
                : "Add another question…"
              }
              value={q}
              onChange={(e) => updateQuestion(idx, e.target.value)}
              className="min-h-[80px] text-base leading-relaxed resize-y pr-10"
            />
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(idx)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {questions.length < 5 && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 rounded-full gap-1.5 text-muted-foreground"
          onClick={addQuestion}
        >
          <Plus className="w-3.5 h-3.5" /> Add another question
        </Button>
      )}
    </div>
  );
}