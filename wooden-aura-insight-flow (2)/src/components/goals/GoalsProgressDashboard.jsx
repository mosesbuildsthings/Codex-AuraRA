import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, subWeeks, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import { TrendingUp, Target, CheckCircle2, Share2 } from "lucide-react";

const CATEGORY_COLORS = {
  communication: "#6366f1",
  quality_time: "#10b981",
  intimacy: "#a855f7",
  conflict_resolution: "#f59e0b",
  personal_growth: "#3b82f6",
  adventure: "#f97316",
  other: "#6b7280"
};

function RadialProgress({ value, max, color, label, sublabel }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/40" />
          <circle
            cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-center">{label}</p>
      <p className="text-xs text-muted-foreground">{value}/{max}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function GoalsProgressDashboard({ goals }) {
  if (goals.length === 0) return null;

  // ── Completion stats ──
  const personal = goals.filter(g => !g.linked_case_id);
  const shared   = goals.filter(g => !!g.linked_case_id);

  const personalDone = personal.filter(g => g.status === "completed").length;
  const sharedDone   = shared.filter(g => g.status === "completed").length;
  const totalDone    = goals.filter(g => g.status === "completed").length;

  // ── Weekly trend (last 8 weeks) ──
  // We use updated_date as a proxy for when a goal was completed
  const weeks = Array.from({ length: 8 }).map((_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 7 - i));
    const weekEnd   = endOfWeek(subWeeks(new Date(), 7 - i));
    const label     = format(weekStart, "MMM d");

    const completedInWeek = (list) =>
      list.filter(g =>
        g.status === "completed" &&
        g.updated_date &&
        isWithinInterval(parseISO(g.updated_date), { start: weekStart, end: weekEnd })
      ).length;

    // Running cumulative totals up to end of this week
    const cumulativePersonal = personal.filter(g =>
      g.status === "completed" &&
      g.updated_date &&
      parseISO(g.updated_date) <= weekEnd
    ).length;

    const cumulativeShared = shared.filter(g =>
      g.status === "completed" &&
      g.updated_date &&
      parseISO(g.updated_date) <= weekEnd
    ).length;

    return { label, personal: cumulativePersonal, shared: cumulativeShared };
  });

  // ── Category breakdown ──
  const categories = {};
  goals.forEach(g => {
    const cat = g.category || "other";
    if (!categories[cat]) categories[cat] = { total: 0, done: 0 };
    categories[cat].total++;
    if (g.status === "completed") categories[cat].done++;
  });
  const catEntries = Object.entries(categories).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-5 mb-8">
      {/* Radial completion rings */}
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">Completion Overview</h3>
        </div>
        <div className="flex justify-around">
          <RadialProgress value={totalDone}    max={goals.length}   color="hsl(var(--primary))"  label="All Goals"     />
          <RadialProgress value={personalDone} max={personal.length || 1} color="#6366f1"         label="Personal"      />
          <RadialProgress value={sharedDone}   max={shared.length || 1}   color="#10b981"         label="Shared"        />
        </div>
      </div>

      {/* Trend line chart */}
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">Completion Trend (8 weeks)</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weeks} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gPersonal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gShared" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Area type="monotone" dataKey="personal" name="Personal" stroke="#6366f1" strokeWidth={2} fill="url(#gPersonal)" dot={false} />
            <Area type="monotone" dataKey="shared"   name="Shared"   stroke="#10b981" strokeWidth={2} fill="url(#gShared)"   dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown bars */}
      {catEntries.length > 0 && (
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Progress by Category</h3>
          </div>
          <div className="space-y-3">
            {catEntries.map(([cat, data]) => {
              const pct = data.total === 0 ? 0 : Math.round((data.done / data.total) * 100);
              const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
              const label = cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{data.done}/{data.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}