import {
  Archive,
  BarChart3,
  BookOpen,
  Crown,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

interface ShellProps {
  children: ReactNode;
}

interface NavLinkItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const primaryNavLinks: NavLinkItem[] = [
  { to: "/dashboard", label: "Home", icon: Home, badge: "01" },
  { to: "/health", label: "Insights", icon: BarChart3, badge: "02" },
  { to: "/journal", label: "Sessions", icon: BookOpen, badge: "03" },
  { to: "/exercise-library", label: "Tools", icon: Wrench, badge: "04" },
  { to: "/profile", label: "Profile", icon: User, badge: "05" },
];

const utilityNavLinks: NavLinkItem[] = [
  { to: "/new-analysis", label: "New Analysis", icon: Sparkles },
  { to: "/archive", label: "Session Archive", icon: Archive },
  { to: "/relationship-manager", label: "Relationship Manager", icon: Users },
  { to: "/analysis-management", label: "Analysis Management", icon: FileText },
  { to: "/premium", label: "Premium", icon: Crown },
  { to: "/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/privacy-settings", label: "Privacy Settings", icon: Shield },
  { to: "/advice-types", label: "Future Advice Types", icon: Settings },
  { to: "/privacy-policy", label: "Privacy Policy", icon: FileText },
  { to: "/terms", label: "Terms", icon: FileText },
];

const labelByPrefix: Array<{ prefix: string; label: string }> = [
  { prefix: "/report/", label: "Report View" },
  { prefix: "/analyzing/", label: "Analyzing" },
  { prefix: "/quiz/", label: "Quiz Hub" },
  { prefix: "/dashboard", label: "Dashboard" },
  { prefix: "/onboarding", label: "Onboarding" },
  { prefix: "/new-analysis", label: "Relationship Analysis" },
  { prefix: "/archive", label: "Session Archive" },
  { prefix: "/health", label: "Health Dashboard" },
  { prefix: "/mood-map", label: "Mood Map" },
  { prefix: "/monthly-report", label: "Monthly Report" },
  { prefix: "/sentiment-trends", label: "Sentiment Trends" },
  { prefix: "/health-report", label: "Relationship Health Report" },
  { prefix: "/journal", label: "Journal" },
  { prefix: "/partner", label: "Partner Connect" },
  { prefix: "/cool-down", label: "Cool Down" },
  { prefix: "/daily-check-in", label: "Daily Check-In" },
  { prefix: "/sync-space", label: "Sync Space" },
  { prefix: "/vision-board", label: "Vision Board" },
  { prefix: "/exercise-library", label: "Exercise Library" },
  { prefix: "/challenges", label: "Challenges" },
  { prefix: "/weekly-challenge", label: "Weekly Challenge" },
  { prefix: "/goals", label: "Relationship Goals" },
  { prefix: "/wisdom", label: "Wisdom Library" },
  { prefix: "/coach", label: "Coach" },
  { prefix: "/profile", label: "Profile" },
  { prefix: "/relationship-manager", label: "Relationship Manager" },
  { prefix: "/feedback", label: "Feedback" },
  { prefix: "/premium", label: "Premium" },
  { prefix: "/analysis-management", label: "Analysis Management" },
  { prefix: "/privacy-settings", label: "Privacy Settings" },
];

function SessionCountdown({ expiresAt }: { expiresAt: string }): ReactNode {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now()),
  );

  useEffect(() => {
    function tick() {
      setRemainingMs(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.max(0, Math.floor(remainingMs / 60_000));
  const seconds = Math.max(0, Math.floor((remainingMs % 60_000) / 1000));
  return (
    <span className="session-timer">
      Session {minutes}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

export function AppShell({ children }: ShellProps): ReactNode {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 980);
  const { data, dispatch } = useAppState();
  const location = useLocation();

  const activeLabel = useMemo(() => {
    const match = labelByPrefix.find((item) => location.pathname.startsWith(item.prefix));
    return match?.label ?? "Aura";
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const mobileTabs = primaryNavLinks;

  return (
    <div className="aura-shell">
      <aside className={`aura-sidebar ${menuOpen ? "open" : ""}`}>
        <Link to="/dashboard" className="aura-brand">
          <img src="/brand/aura-logo-reverse-transparent.svg" alt="Aura" />
        </Link>

        <nav className="aura-primary-nav" aria-label="Primary">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname.startsWith(link.to) ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              <link.icon className="nav-icon" />
              <span className="nav-badge">{link.badge}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <nav className="aura-utility-nav" aria-label="Utility">
          {utilityNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname.startsWith(link.to) ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              <link.icon className="nav-icon" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-foot">
          <Link className="premium-cta" to="/premium" onClick={() => setMenuOpen(false)}>
            Upgrade to Premium
          </Link>
          {data.session ? <SessionCountdown expiresAt={data.session.expiresAt} /> : null}
          <button type="button" className="ghost-button logout-button" onClick={() => dispatch({ type: "logout" })}>
            Log Out
          </button>
        </div>
      </aside>

      {menuOpen ? <button type="button" className="menu-overlay" onClick={() => setMenuOpen(false)} /> : null}

      <section className="aura-workspace">
        <header className="aura-topbar">
          <button
            type="button"
            className="menu-trigger"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div>
            <p className="brand-kicker">Aura Relationship Intelligence</p>
            <h1>{activeLabel}</h1>
          </div>

          <div className="topbar-right">
            <Link className="primary-button compact" to="/new-analysis">
              New Session
            </Link>
            <span className={`plan-chip ${data.plan}`}>{data.plan === "premium" ? "Premium" : "Free Plan"}</span>
          </div>
        </header>

        <main className="app-content">{children}</main>

        {isMobile ? (
          <nav className="mobile-tabbar" aria-label="Main tabs">
            {mobileTabs.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={location.pathname.startsWith(item.to) ? "active" : ""}
              >
                <item.icon className="mobile-tab-icon" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        ) : null}
      </section>
    </div>
  );
}

