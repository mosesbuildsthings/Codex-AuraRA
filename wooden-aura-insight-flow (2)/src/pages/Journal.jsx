import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useOfflineCache } from "@/hooks/useOfflineCache";
import SmartCheckInBanner from "@/components/checkin/SmartCheckInBanner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, BookOpen, Plus, Trash2, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import VoiceInput from "@/components/ui/VoiceInput";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isToday } from "date-fns";

const SENTIMENTS = [
  { value: "great", label: "Great", emoji: "😊", score: 5, color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  { value: "good", label: "Good", emoji: "🙂", score: 4, color: "bg-primary/10 text-primary border-primary/20" },
  { value: "neutral", label: "Neutral", emoji: "😐", score: 3, color: "bg-muted text-muted-foreground border-border" },
  { value: "difficult", label: "Difficult", emoji: "😔", score: 2, color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  { value: "tough", label: "Tough", emoji: "😢", score: 1, color: "bg-destructive/10 text-destructive border-destructive/20" }
];

const SENTIMENT_DOT = {
  great: "bg-chart-2",
  good: "bg-primary",
  neutral: "bg-muted-foreground",
  difficult: "bg-chart-3",
  tough: "bg-destructive"
};

const TAGS = ["Quality time", "Argument", "Affection", "Communication", "Intimacy", "Support", "Fun", "Stress", "Growth"];

function JournalForm({ onSave, onCancel, queryClient }) {
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !sentiment) return;
    setSaving(true);
    const s = SENTIMENTS.find(s => s.value === sentiment);
    const newEntry = {
      date: format(new Date(), "yyyy-MM-dd"),
      content,
      sentiment,
      sentiment_score: s?.score || 3,
      tags,
      is_private: true,
      id: "temp-" + Date.now(),
      created_date: new Date().toISOString()
    };
    // Optimistic update
    queryClient.setQueryData(["journal-entries"], (old) => [newEntry, ...(old || [])]);
    await base44.entities.JournalEntry.create(newEntry);
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/60 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">This entry is private and only visible to you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">How did your relationship feel today?</p>
          <div className="flex gap-2 flex-wrap">
            {SENTIMENTS.map(s => (
              <button key={s.value} type="button" onClick={() => setSentiment(s.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all gap-1.5 flex items-center ${
                  sentiment === s.value ? s.color + " font-semibold" : "border-border text-muted-foreground hover:border-primary/30"
                }`}>
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="What happened today? A small moment, a conversation, how you felt..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[120px] resize-none pr-12"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput onTranscript={(text) => setContent(prev => prev + text)} />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Tags (optional)</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                  tags.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="flex-1 rounded-full" disabled={saving || !content || !sentiment}>
            {saving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

function CalendarHeatmap({ entries, viewMonth, onMonthChange, onSelectDay, selectedDay }) {
  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const firstDayOfWeek = startOfMonth(viewMonth).getDay();

  const getEntryForDay = (day) => entries.find(e => isSameDay(parseISO(e.date), day));

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onMonthChange(subMonths(viewMonth, 1))} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-heading font-semibold">{format(viewMonth, "MMMM yyyy")}</p>
        <button onClick={() => onMonthChange(addMonths(viewMonth, 1))} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <p key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const entry = getEntryForDay(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isT = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(entry ? day : null)}
              className={`aspect-square rounded-lg flex items-center justify-center relative transition-all text-xs ${
                isSelected ? "ring-2 ring-primary" : ""
              } ${isT ? "font-bold" : ""} ${entry ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
            >
              {entry ? (
                <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                  entry.sentiment === "great" ? "bg-chart-2/30" :
                  entry.sentiment === "good" ? "bg-primary/20" :
                  entry.sentiment === "neutral" ? "bg-muted" :
                  entry.sentiment === "difficult" ? "bg-chart-3/20" :
                  "bg-destructive/20"
                }`}>
                  <span className="text-base leading-none">
                    {SENTIMENTS.find(s => s.value === entry.sentiment)?.emoji}
                  </span>
                </div>
              ) : (
                <span className={`text-xs ${isT ? "text-primary" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap mt-4 pt-4 border-t border-border/40">
        {SENTIMENTS.map(s => (
          <div key={s.value} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${SENTIMENT_DOT[s.value]}`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Journal() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: entries = [], isLoading, isOffline, refetch } = useOfflineCache(
    "journal-entries",
    () => currentUser ? base44.entities.JournalEntry.filter({ created_by: currentUser.email }, "-date", 365) : [],
    [currentUser?.email]
  );

  const { containerRef, isRefreshing } = usePullToRefresh(async () => {
    queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["journal-entries"] });

  const deleteJournalMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onMutate: (id) => {
      // Optimistically remove from cache
      queryClient.setQueryData(["journal-entries"], (old) =>
        old?.filter((e) => e.id !== id) || []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: () => {
      refresh();
    },
  });

  const handleDelete = useCallback((id) => {
    deleteJournalMutation.mutate(id);
  }, [deleteJournalMutation]);

  const selectedEntry = selectedDay ? entries.find(e => isSameDay(parseISO(e.date), selectedDay)) : null;

  const todayEntry = entries.find(e => e.date === format(new Date(), "yyyy-MM-dd"));
  const recentEntries = entries.slice(0, 10);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-y-auto relative">
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Relationship Journal</span>
          </div>
        </div>
        {!todayEntry && (
          <Button size="sm" className="rounded-full gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Today's Entry
          </Button>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* AI-powered check-in time suggestion */}
        <SmartCheckInBanner journalEntries={entries} />

        {/* Offline banner */}
        {isOffline && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-chart-3/10 border border-chart-3/20 flex items-center gap-2 text-xs text-chart-3">
            <span>📴</span> Showing cached entries — you're offline.
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <JournalForm
              queryClient={queryClient}
              onSave={() => { setShowForm(false); refresh(); }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        {todayEntry && !showForm && (
          <div className="mb-4 p-4 rounded-xl bg-chart-2/5 border border-chart-2/20 flex items-center gap-3">
            <span className="text-2xl">{SENTIMENTS.find(s => s.value === todayEntry.sentiment)?.emoji}</span>
            <div>
              <p className="text-sm font-medium">Today's entry logged</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{todayEntry.content}</p>
            </div>
          </div>
        )}

        <CalendarHeatmap
          entries={entries}
          viewMonth={viewMonth}
          onMonthChange={setViewMonth}
          onSelectDay={setSelectedDay}
          selectedDay={selectedDay}
        />

        {/* Selected day detail */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-5 rounded-xl bg-card border border-primary/20">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">{format(parseISO(selectedEntry.date), "MMMM d, yyyy")}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{SENTIMENTS.find(s => s.value === selectedEntry.sentiment)?.emoji}</span>
                    <Badge className={`text-xs rounded-full border ${SENTIMENTS.find(s => s.value === selectedEntry.sentiment)?.color}`}>
                      {SENTIMENTS.find(s => s.value === selectedEntry.sentiment)?.label}
                    </Badge>
                  </div>
                </div>
                <button onClick={() => { handleDelete(selectedEntry.id); setSelectedDay(null); }}
                  className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">{selectedEntry.content}</p>
              {selectedEntry.tags?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedEntry.tags.map(t => (
                    <Badge key={t} variant="outline" className="text-xs rounded-full">{t}</Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent entries */}
        <h3 className="font-heading font-semibold mb-4">Recent Entries</h3>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : recentEntries.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-heading text-lg font-semibold mb-2">Start your journal</p>
            <p className="text-sm text-muted-foreground mb-5">Log how your relationship feels each day to track emotional trends over time.</p>
            <Button variant="outline" className="rounded-full" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Write First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry, i) => {
              const s = SENTIMENTS.find(x => x.value === entry.sentiment);
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-xl bg-card border border-border/60 hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xl shrink-0">{s?.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "MMM d, yyyy")}</p>
                          <Badge className={`text-xs rounded-full border ${s?.color}`}>{s?.label}</Badge>
                        </div>
                        <p className="text-sm text-foreground/85 line-clamp-2">{entry.content}</p>
                        {entry.tags?.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {entry.tags.map(t => <Badge key={t} variant="outline" className="text-xs rounded-full">{t}</Badge>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
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