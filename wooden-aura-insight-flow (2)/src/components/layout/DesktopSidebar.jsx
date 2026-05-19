import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, PenLine, BarChart3, Wrench, User, Crown,
  Heart, MessageCircle, Dumbbell, Trophy, Brain, Image, Archive,
  TrendingUp, CalendarDays, ChevronRight, Send, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import AuraLogo from "@/components/ui/AuraLogo";
import { base44 } from "@/api/base44Client";

const NAV = [
  {
    label: "Home",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Sessions",
    path: "/journal",
    icon: PenLine,
    children: [
      { path: "/journal", label: "Journal" },
      { path: "/partner", label: "Partner" },
      { path: "/cool-down", label: "Cool Down" },
      { path: "/vision-board", label: "Vision Board" },
      { path: "/daily-check-in", label: "Daily Check-in" },
    ],
  },
  {
    label: "Insights",
    path: "/health",
    icon: BarChart3,
    children: [
      { path: "/health", label: "Health Dashboard" },
      { path: "/mood-map", label: "Mood Map" },
      { path: "/health-report", label: "Health Report" },
      { path: "/monthly-report", label: "Monthly Report" },
      { path: "/sentiment-trends", label: "Sentiment Trends" },
    ],
  },
  {
    label: "Tools",
    path: "/exercise-library",
    icon: Wrench,
    children: [
      { path: "/exercise-library", label: "Exercises" },
      { path: "/challenges", label: "Challenges" },
      { path: "/quiz", label: "Quizzes" },
      { path: "/wisdom", label: "Wisdom Library" },
      { path: "/goals", label: "Goals" },
      { path: "/archive", label: "Archive" },
    ],
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
    children: [
      { path: "/profile", label: "My Profile" },
      { path: "/relationship-manager", label: "Relationships" },
      { path: "/coach", label: "AI Coach" },
      { path: "/feedback", label: "Feedback" },
    ],
  },
];

function getActiveSection(pathname) {
  for (const item of NAV) {
    if (pathname === item.path) return item.path;
    if (item.children?.some(c => pathname.startsWith(c.path))) return item.path;
  }
  return "/dashboard";
}

export default function DesktopSidebar() {
  const location = useLocation();
  const activeSection = getActiveSection(location.pathname);

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-card border-r border-border/60 py-6 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 mb-8">
        <AuraLogo variant="full" theme="light" size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.path;
          const isChildActive = item.children?.some(c => location.pathname.startsWith(c.path));

          return (
            <div key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.children && isActive && (
                  <ChevronRight className="w-3 h-3 opacity-50" />
                )}
              </Link>

              {/* Secondary nav — shown only when this section is active */}
              {item.children && isActive && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border/60 pl-3 pb-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={cn(
                        "block px-2 py-1.5 rounded-lg text-xs transition-colors",
                        location.pathname === child.path
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-3 mt-4 space-y-1">
        <Link
          to="/premium"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-chart-3/10 text-chart-3 hover:bg-chart-3/20 transition-colors"
        >
          <Crown className="w-4 h-4" />
          Upgrade to Premium
        </Link>
        <button
          onClick={() => base44.auth.logout("/")}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}