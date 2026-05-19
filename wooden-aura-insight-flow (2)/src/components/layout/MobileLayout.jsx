import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Home, PenLine, BarChart3, Wrench, User,
  ChevronLeft, Menu, X, Heart, Crown,
  Users, MessageCircle, Send, Dumbbell, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import { useTabStack, getTabForPath } from "@/lib/TabStackContext";
import AuraLogo from "@/components/ui/AuraLogo";
import { base44 } from "@/api/base44Client";
import PremiumBadge from "@/components/premium/PremiumBadge";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home",     icon: Home },
  { path: "/journal",   label: "Sessions", icon: PenLine },
  { path: "/health",    label: "Insights", icon: BarChart3 },
  { path: "/exercise-library", label: "Tools", icon: Wrench },
  { path: "/profile",   label: "Profile",  icon: User },
];

const ROOT_SCREENS = NAV_ITEMS.map(i => i.path);

const MENU_SECTIONS = [
  {
    label: "Sessions",
    items: [
      { path: "/journal",      label: "Journal",      icon: PenLine },
      { path: "/partner",      label: "Partner",      icon: Heart },
      { path: "/cool-down",    label: "Cool Down",    icon: MessageCircle },
      { path: "/vision-board", label: "Vision Board", icon: Home },
    ],
  },
  {
    label: "Insights",
    items: [
      { path: "/health",         label: "Health Dashboard", icon: BarChart3 },
      { path: "/mood-map",       label: "Mood Map",         icon: BarChart3 },
      { path: "/health-report",  label: "Health Report",    icon: BarChart3 },
      { path: "/monthly-report", label: "Monthly Report",   icon: BarChart3 },
    ],
  },
  {
    label: "Tools",
    items: [
      { path: "/exercise-library", label: "Exercises",  icon: Dumbbell },
      { path: "/challenges",       label: "Challenges", icon: Wrench },
      { path: "/quiz",             label: "Quizzes",    icon: Wrench },
      { path: "/archive",          label: "Archive",    icon: Wrench },
    ],
  },
  {
    label: "Profile",
    items: [
      { path: "/profile",              label: "My Profile",          icon: User },
      { path: "/relationship-manager", label: "Relationships",       icon: Users },
      { path: "/feedback",             label: "Feedback",            icon: Send },
      { path: "/premium",              label: "Upgrade to Premium",  icon: Crown, highlight: true },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MobileLayout({ children, title, showBack }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const tabStack = useTabStack();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const isPremium = currentUser?.role === "premium" || currentUser?.role === "admin";

  const scrollPositions = useRef({});
  const prevTabRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const activeTab = getTabForPath(location.pathname);
  const isRootScreen = ROOT_SCREENS.includes(location.pathname);
  const shouldShowBack = showBack !== undefined ? showBack : !isRootScreen;
  const currentNav = NAV_ITEMS.find(item => location.pathname === item.path);

  // Push every navigation onto its tab stack
  useEffect(() => {
    tabStack?.pushPath(location.pathname);
  }, [location.pathname]);

  // Save/restore scroll position per tab
  useEffect(() => {
    const main = document.getElementById("mobile-main");
    if (!main) return;
    if (prevTabRef.current && prevTabRef.current !== activeTab) {
      scrollPositions.current[prevTabRef.current] = main.scrollTop;
    }
    prevTabRef.current = activeTab;
    main.scrollTop = scrollPositions.current[activeTab] || 0;
  }, [activeTab]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Stack-aware back: go to previous page within same tab, or tab root
  const handleBack = () => {
    if (tabStack) {
      const prev = tabStack.popPath(activeTab);
      navigate(prev, { replace: true });
    } else {
      navigate(activeTab);
    }
  };

  // ── Desktop ──
  if (!isMobile) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <DesktopSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // ── Mobile ──
  return (
    <div className="flex flex-col h-screen bg-background pl-safe pr-safe">

      {/* ── Fixed Top Header ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/60 pt-safe">
        <div className="flex items-center justify-between px-2 h-14">

          {shouldShowBack ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-11" />
          )}

          <div className="flex-1 flex justify-center">
            {(!title && !currentNav?.label) ? (
              <AuraLogo variant="wordmark" size="sm" />
            ) : (
              <h1 className="font-heading font-semibold text-base text-center truncate px-2">
                {title || currentNav?.label}
              </h1>
            )}
          </div>

          <div ref={menuRef} className="flex items-center gap-1">
            {isPremium && (
              <PremiumBadge size="sm" />
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Slide-down Sectioned Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/30"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="fixed top-14 left-0 right-0 z-40 bg-card border-b border-border shadow-xl max-h-[75vh] overflow-y-auto"
            >
              <div className="px-4 py-3 space-y-4">
                {MENU_SECTIONS.map((section) => (
                  <div key={section.label}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 px-1">
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map(({ path, label, icon: Icon, highlight }) => {
                        const resolvedLabel = highlight && isPremium ? "Premium Member ✦" : label;
                        return (
                          <Link
                            key={path}
                            to={path}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-colors",
                              highlight
                                ? "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20"
                                : location.pathname === path
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium flex-1">{resolvedLabel}</span>
                            {highlight && !isPremium && (
                              <span className="text-xs bg-chart-3/20 text-chart-3 px-2 py-0.5 rounded-full font-medium">
                                Premium
                              </span>
                            )}
                            {highlight && isPremium && (
                              <Crown className="w-3.5 h-3.5 text-chart-3" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="border-t border-border/60 pt-3 mt-1">
                  <button
                    onClick={() => { setMenuOpen(false); base44.auth.logout("/"); }}
                    className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main
        id="mobile-main"
        className="flex-1 overflow-y-auto mt-14 mb-[64px] pb-safe"
      >
        {children}
      </main>

      {/* ── Bottom Tab Bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border/60 pb-safe"
        aria-label="Main navigation"
      >
        <div className="flex h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.path;

            return (
              <button
                key={item.path}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (isActive && location.pathname === item.path) {
                    document.getElementById("mobile-main")?.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (isActive) {
                    tabStack?.resetStack(item.path);
                    navigate(item.path);
                  } else {
                    navigate(item.path);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 gap-0.5 relative transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}