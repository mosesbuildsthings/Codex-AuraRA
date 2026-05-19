import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen } from "lucide-react";
import VoiceInput from "@/components/ui/VoiceInput";

const prompts = [
  "Please describe the situation that has led you to seek advice today. What are the key events and feelings involved?",
  "What were the core issues that caused the initial conflict?",
  "What are your biggest fears or worries about the relationship right now?",
  "What do you need to see or hear from your partner to feel understood and secure?"
];

export default function NarrativeModule({ value, onChange }) {
  const valueRef = useRef(value);
  valueRef.current = value;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">Your Narrative</h3>
          <p className="text-sm text-muted-foreground">Tell your story in your own words</p>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <p className="text-sm text-muted-foreground italic">Guiding prompts to help you reflect:</p>
        <ul className="space-y-1.5">
          {prompts.map((p, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary/60 mt-0.5">•</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Take your time. Share as much or as little as you feel comfortable with..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] text-base leading-relaxed resize-y pr-12"
        />
        <div className="absolute bottom-3 right-3">
          <VoiceInput onTranscript={(text) => onChange(valueRef.current + text)} />
        </div>
      </div>
    </div>
  );
}