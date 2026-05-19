import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * VoiceInput — Web Speech API dictation button.
 * Props:
 *   onTranscript(text)  — called with the final transcript to append
 *   className           — extra classes for the button
 *   disabled            — disable the button
 */
export default function VoiceInput({ onTranscript, className, disabled }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (final && onTranscript) {
        onTranscript(final);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
      setListening(false);
      setInterimText("");
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [onTranscript]);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setInterimText("");
    } else {
      setInterimText("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) return null;

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        title={listening ? "Stop dictation" : "Dictate with voice"}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200",
          listening
            ? "bg-destructive border-destructive text-white shadow-lg shadow-destructive/30 animate-pulse"
            : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          className
        )}
      >
        {listening ? <Square className="w-3.5 h-3.5" fill="currentColor" /> : <Mic className="w-4 h-4" />}
      </button>

      {listening && interimText && (
        <span className="text-xs text-muted-foreground italic max-w-[140px] truncate">
          {interimText}
        </span>
      )}
    </div>
  );
}