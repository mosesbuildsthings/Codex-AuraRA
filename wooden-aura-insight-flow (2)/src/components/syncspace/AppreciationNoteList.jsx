import React from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Heart, Mail } from "lucide-react";

const themeEmojis = {
  gratitude: "🙏",
  affection: "💕",
  admiration: "⭐",
  encouragement: "💪",
  memory: "💭"
};

const themeBg = {
  gratitude: "bg-primary/10 text-primary border-primary/20",
  affection: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  admiration: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  encouragement: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  memory: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/40"
};

export default function AppreciationNoteList({ notes, currentUserEmail }) {
  const receivedNotes = notes.filter(n => n.to_email === currentUserEmail).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const sentNotes = notes.filter(n => n.from_email === currentUserEmail).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleMarkAsRead = async (note) => {
    if (!note.is_read) {
      await base44.entities.AppreciationNote.update(note.id, {
        is_read: true,
        read_date: new Date().toISOString()
      });
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
        <Mail className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="font-medium text-sm mb-2">No appreciation notes yet</p>
        <p className="text-xs text-muted-foreground">Start exchanging heartfelt messages with your partner.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Received notes */}
      {receivedNotes.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-chart-4" /> Messages for You ({receivedNotes.filter(n => !n.is_read).length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {receivedNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleMarkAsRead(note)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    note.is_read
                      ? "bg-muted/30 border-border/40"
                      : "bg-card border-primary/20 shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{themeEmojis[note.theme]}</span>
                      <Badge className={`text-xs rounded-full border ${themeBg[note.theme]}`}>
                        {note.theme}
                      </Badge>
                    </div>
                    {!note.is_read && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed mb-2">{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(note.created_date), "MMM d, yyyy")}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Sent notes */}
      {sentNotes.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Your Notes ({sentNotes.length})</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {sentNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-muted/20 border border-border/60"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{themeEmojis[note.theme]}</span>
                      <Badge className={`text-xs rounded-full border ${themeBg[note.theme]}`}>
                        {note.theme}
                      </Badge>
                    </div>
                    {note.is_read && <span className="text-xs text-chart-2">Read</span>}
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed mb-2">{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(note.created_date), "MMM d, yyyy")}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}