import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

interface ShellProps {
  children: ReactNode;
}

const navLinks = [
  { to: "/dashboard", label: "Home" },
  { to: "/new-analysis", label: "New Analysis" },
  { to: "/sessions", label: "Sessions" },
  { to: "/relationships", label: "Relationship Manager" },
  { to: "/profile", label: "Profile" },
  { to: "/premium", label: "Premium" },
  { to: "/advice-types", label: "Future Advice Types" },
  { to: "/feedback", label: "Feedback" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms" },
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
      Session: {minutes}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

export function AppShell({ children }: ShellProps): ReactNode {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, dispatch } = useAppState();
  const location = useLocation();

  const activeLabel = useMemo(() => {
    const match = navLinks.find((link) => link.to === location.pathname);
    return match?.label ?? "Aura";
  }, [location.pathname]);

  const isLoggedIn = Boolean(data.session);

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          type="button"
          className="menu-trigger"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div>
          <p className="brand-kicker">Aura Rebuild</p>
          <h1>{activeLabel}</h1>
        </div>

        <div className="header-right">
          <span className={`plan-chip ${data.plan}`}>{data.plan === "premium" ? "Premium" : "Free"}</span>
          {data.session ? <SessionCountdown expiresAt={data.session.expiresAt} /> : null}
          {isLoggedIn ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => dispatch({ type: "logout" })}
            >
              Log out
            </button>
          ) : null}
        </div>
      </header>

      <aside className={`app-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-head">
          <h2>Navigate</h2>
          <button type="button" className="ghost-button" onClick={() => setMenuOpen(false)}>
            Close
          </button>
        </div>

        <nav>
          {navLinks.map((link) => (
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
      </aside>

      {menuOpen ? <button type="button" className="menu-overlay" onClick={() => setMenuOpen(false)} /> : null}

      <main className="app-content">{children}</main>
    </div>
  );
}

