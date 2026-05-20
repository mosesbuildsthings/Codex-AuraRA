import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

interface ShellProps {
  children: ReactNode;
}

const primaryNavLinks = [
  { to: "/dashboard", label: "Home", badge: "01" },
  { to: "/sessions", label: "Sessions", badge: "02" },
  { to: "/new-analysis", label: "Insights", badge: "03" },
  { to: "/relationships", label: "Tools", badge: "04" },
  { to: "/profile", label: "Profile", badge: "05" },
];

const utilityNavLinks = [
  { to: "/premium", label: "Premium" },
  { to: "/feedback", label: "Feedback" },
  { to: "/advice-types", label: "Future Advice Types" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms" },
];

const allNavLinks = [...primaryNavLinks, ...utilityNavLinks];

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
  const { data, dispatch } = useAppState();
  const location = useLocation();

  const activeLabel = useMemo(() => {
    if (location.pathname.startsWith("/report/")) {
      return "Session Report";
    }
    const match = allNavLinks.find((link) => link.to === location.pathname);
    return match?.label ?? "Aura";
  }, [location.pathname]);

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
              className={location.pathname === link.to ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
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
              className={location.pathname === link.to ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
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
      </section>
    </div>
  );
}

