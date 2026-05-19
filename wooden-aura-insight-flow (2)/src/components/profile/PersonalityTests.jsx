import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Brain, Star, Sparkles, ChevronRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const PremiumBadge = () => (
  <Badge className="bg-chart-3/20 text-chart-3 border border-chart-3/30 rounded-full text-xs gap-1">
    <Crown className="w-2.5 h-2.5" /> Premium
  </Badge>
);

const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"
];

const ZODIAC_SIGNS = [
  { sign: "Aries", dates: "Mar 21 – Apr 19", emoji: "♈" },
  { sign: "Taurus", dates: "Apr 20 – May 20", emoji: "♉" },
  { sign: "Gemini", dates: "May 21 – Jun 20", emoji: "♊" },
  { sign: "Cancer", dates: "Jun 21 – Jul 22", emoji: "♋" },
  { sign: "Leo", dates: "Jul 23 – Aug 22", emoji: "♌" },
  { sign: "Virgo", dates: "Aug 23 – Sep 22", emoji: "♍" },
  { sign: "Libra", dates: "Sep 23 – Oct 22", emoji: "♎" },
  { sign: "Scorpio", dates: "Oct 23 – Nov 21", emoji: "♏" },
  { sign: "Sagittarius", dates: "Nov 22 – Dec 21", emoji: "♐" },
  { sign: "Capricorn", dates: "Dec 22 – Jan 19", emoji: "♑" },
  { sign: "Aquarius", dates: "Jan 20 – Feb 18", emoji: "♒" },
  { sign: "Pisces", dates: "Feb 19 – Mar 20", emoji: "♓" }
];

const ENNEAGRAM_TYPES = [
  { num: "1", name: "The Reformer", desc: "Principled, purposeful, self-controlled" },
  { num: "2", name: "The Helper", desc: "Generous, warm, possessive" },
  { num: "3", name: "The Achiever", desc: "Adaptable, excelling, driven" },
  { num: "4", name: "The Individualist", desc: "Expressive, dramatic, self-absorbed" },
  { num: "5", name: "The Investigator", desc: "Perceptive, innovative, secretive" },
  { num: "6", name: "The Loyalist", desc: "Engaging, responsible, anxious" },
  { num: "7", name: "The Enthusiast", desc: "Spontaneous, versatile, scattered" },
  { num: "8", name: "The Challenger", desc: "Decisive, domineering, confrontational" },
  { num: "9", name: "The Peacemaker", desc: "Receptive, reassuring, complacent" }
];

function getZodiacFromBirthday(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return ZODIAC_SIGNS[0];
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return ZODIAC_SIGNS[1];
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return ZODIAC_SIGNS[2];
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return ZODIAC_SIGNS[3];
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return ZODIAC_SIGNS[4];
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return ZODIAC_SIGNS[5];
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return ZODIAC_SIGNS[6];
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return ZODIAC_SIGNS[7];
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return ZODIAC_SIGNS[8];
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return ZODIAC_SIGNS[9];
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return ZODIAC_SIGNS[10];
  return ZODIAC_SIGNS[11];
}

export default function PersonalityTests({ form, onUpdate }) {
  const { toast } = useToast();
  const [expandedTest, setExpandedTest] = useState(null);
  const [birthdayInput, setBirthdayInput] = useState(form.birthday || "");
  const [loadingInsight, setLoadingInsight] = useState(null);

  const showPremiumToast = () => {
    toast({ title: "Premium Feature", description: "Upgrade to Aura Premium ($15/month) to unlock personality insights." });
  };

  const handleBirthdayChange = (val) => {
    setBirthdayInput(val);
    const zodiac = getZodiacFromBirthday(val);
    if (zodiac) {
      onUpdate({ birthday: val, zodiac_sign: zodiac.sign });
    }
  };

  const handleGetMBTIInsight = async (type) => {
    setLoadingInsight("mbti");
    onUpdate({ mbti_type: type });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `In 2 sentences, how does an ${type} personality type typically communicate in romantic relationships? What's their main strength and challenge?`
    });
    onUpdate({ mbti_type: type, mbti_insight: result });
    setLoadingInsight(null);
    setExpandedTest(null);
    toast({ title: `${type} saved!`, description: "Your MBTI type has been saved to your profile." });
  };

  const handleSetEnneagram = async (num) => {
    setLoadingInsight("enneagram");
    onUpdate({ enneagram_type: num });
    const type = ENNEAGRAM_TYPES.find(t => t.num === num);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `In 2 sentences, how does an Enneagram Type ${num} (${type?.name}) typically behave in romantic relationships? What's their core need and communication style?`
    });
    onUpdate({ enneagram_type: num, enneagram_insight: result });
    setLoadingInsight(null);
    setExpandedTest(null);
    toast({ title: `Type ${num} saved!`, description: "Your Enneagram type has been saved." });
  };

  const zodiac = form.zodiac_sign ? ZODIAC_SIGNS.find(z => z.sign === form.zodiac_sign) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-heading text-base font-semibold">Personality & Identity</h3>
        <PremiumBadge />
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Helps Aura understand your communication style and tailor advice more precisely.
      </p>

      {/* MBTI */}
      <div className="border border-border/60 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
          onClick={() => setExpandedTest(expandedTest === "mbti" ? null : "mbti")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">MBTI Personality Type</p>
              {form.mbti_type ? (
                <p className="text-xs text-primary font-semibold">{form.mbti_type}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Not set</p>
              )}
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedTest === "mbti" ? "rotate-90" : ""}`} />
        </button>
        <AnimatePresence>
          {expandedTest === "mbti" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-3">Select your 4-letter MBTI type:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {MBTI_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => handleGetMBTIInsight(type)}
                      disabled={loadingInsight === "mbti"}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        form.mbti_type === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-muted hover:border-primary/40"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {loadingInsight === "mbti" && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-primary">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating insight…
                  </div>
                )}
                {form.mbti_insight && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-foreground leading-relaxed">{form.mbti_insight}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zodiac */}
      <div className="border border-border/60 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
          onClick={() => setExpandedTest(expandedTest === "zodiac" ? null : "zodiac")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center text-lg">
              {zodiac ? zodiac.emoji : <Star className="w-4 h-4 text-chart-3" />}
            </div>
            <div>
              <p className="text-sm font-medium">Zodiac Sign</p>
              {zodiac ? (
                <p className="text-xs text-chart-3 font-semibold">{zodiac.sign}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Enter birthday to auto-detect</p>
              )}
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedTest === "zodiac" ? "rotate-90" : ""}`} />
        </button>
        <AnimatePresence>
          {expandedTest === "zodiac" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-border/40">
                <Label className="text-xs text-muted-foreground mb-2 block">Your birthday</Label>
                <Input
                  type="date"
                  value={birthdayInput}
                  onChange={e => handleBirthdayChange(e.target.value)}
                  className="mb-3"
                />
                {zodiac && (
                  <div className="p-3 rounded-lg bg-chart-3/5 border border-chart-3/20 flex items-center gap-3">
                    <span className="text-2xl">{zodiac.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold">{zodiac.sign}</p>
                      <p className="text-xs text-muted-foreground">{zodiac.dates}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enneagram */}
      <div className="border border-border/60 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
          onClick={() => setExpandedTest(expandedTest === "enneagram" ? null : "enneagram")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Enneagram Type</p>
              {form.enneagram_type ? (
                <p className="text-xs text-primary font-semibold">
                  Type {form.enneagram_type} — {ENNEAGRAM_TYPES.find(t => t.num === form.enneagram_type)?.name}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Not set</p>
              )}
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedTest === "enneagram" ? "rotate-90" : ""}`} />
        </button>
        <AnimatePresence>
          {expandedTest === "enneagram" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-border/40 space-y-1.5">
                {ENNEAGRAM_TYPES.map(type => (
                  <button
                    key={type.num}
                    onClick={() => handleSetEnneagram(type.num)}
                    disabled={loadingInsight === "enneagram"}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      form.enneagram_type === type.num
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="font-bold">Type {type.num}</span> — {type.name}
                    <span className="text-xs opacity-70 block">{type.desc}</span>
                  </button>
                ))}
                {loadingInsight === "enneagram" && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating insight…
                  </div>
                )}
                {form.enneagram_insight && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mt-2">
                    <p className="text-xs text-foreground leading-relaxed">{form.enneagram_insight}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}