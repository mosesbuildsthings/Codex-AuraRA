import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "./components/AppShell";
import { AdviceTypesPage } from "./pages/AdviceTypesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { LoginPage } from "./pages/LoginPage";
import { NewAnalysisPage } from "./pages/NewAnalysisPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PremiumPage } from "./pages/PremiumPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RelationshipManagerPage } from "./pages/RelationshipManagerPage";
import { ReportPage } from "./pages/ReportPage";
import { SessionsPage } from "./pages/SessionsPage";
import { TermsPage } from "./pages/TermsPage";
import { AppStateProvider, useAppState } from "./state/AppStateContext";

const queryClient = new QueryClient();

interface PlaceholderDefinition {
  path: string;
  title: string;
  description: string;
  highlights: string[];
}

const placeholderRoutes: PlaceholderDefinition[] = [
  {
    path: "/health",
    title: "Health Dashboard",
    description: "Relationship health overview with stats and trend widgets.",
    highlights: ["Communication score", "Conflict trend", "Mood stability"],
  },
  {
    path: "/mood-map",
    title: "Mood Map",
    description: "Visual mood tracking for relationship reflection sessions.",
    highlights: ["Daily sentiment", "Pattern zones", "Trigger markers"],
  },
  {
    path: "/monthly-report",
    title: "Monthly Report",
    description: "AI-generated monthly relationship summary and recommendations.",
    highlights: ["Wins", "Risk areas", "Next month focus"],
  },
  {
    path: "/sentiment-trends",
    title: "Sentiment Trends",
    description: "Sentiment over time with trend baselines and movement snapshots.",
    highlights: ["Weekly deltas", "Positive/negative ratio", "Narrative trend"],
  },
  {
    path: "/health-report",
    title: "Relationship Health Report",
    description: "Deep relationship health report for current active context.",
    highlights: ["Trust factors", "Communication profile", "Recovery plan"],
  },
  {
    path: "/partner",
    title: "Partner Connect",
    description: "Partner invitation and linking workflow for shared insights.",
    highlights: ["Invite flow", "Permission control", "Shared report view"],
  },
  {
    path: "/cool-down",
    title: "Cool Down",
    description: "Conflict de-escalation flow with guided prompts and reset steps.",
    highlights: ["Breathing cycle", "Reflection prompts", "Resolution checklist"],
  },
  {
    path: "/daily-check-in",
    title: "Daily Check-In",
    description: "Daily mood and relationship pulse check for consistency.",
    highlights: ["Mood quick score", "Connection meter", "Intent for tomorrow"],
  },
  {
    path: "/sync-space",
    title: "Sync Space",
    description: "Shared partner space to align on progress and goals.",
    highlights: ["Shared notes", "Progress updates", "Commitment tracking"],
  },
  {
    path: "/vision-board",
    title: "Vision Board",
    description: "Relationship vision board for long-term direction and values.",
    highlights: ["Values", "Milestones", "Future commitments"],
  },
  {
    path: "/exercise-library",
    title: "Exercise Library",
    description: "Catalog of growth exercises grouped by relationship needs.",
    highlights: ["Communication", "Conflict", "Intimacy"],
  },
  {
    path: "/challenges",
    title: "Challenges",
    description: "Relationship challenge modules to build consistency and trust.",
    highlights: ["7-day sprints", "Habit tracking", "Completion badges"],
  },
  {
    path: "/quiz",
    title: "Quiz Hub",
    description: "Browse, start, and manage relationship quizzes.",
    highlights: ["Compatibility quiz", "Communication quiz", "Attachment quiz"],
  },
  {
    path: "/quiz/create",
    title: "Quiz Create",
    description: "Build a new relationship quiz for yourself or a partner.",
    highlights: ["Question bank", "Answer logic", "Scoring rules"],
  },
  {
    path: "/weekly-challenge",
    title: "Weekly Challenge",
    description: "Featured weekly challenge to improve one relationship pattern.",
    highlights: ["Challenge brief", "Daily tasks", "Completion summary"],
  },
  {
    path: "/goals",
    title: "Relationship Goals",
    description: "Set and track relationship goals with milestones.",
    highlights: ["Goal timeline", "Completion rate", "Reflection notes"],
  },
  {
    path: "/wisdom",
    title: "Wisdom Library",
    description: "Saved advice and insight snippets from completed reports.",
    highlights: ["Saved excerpts", "Tag filtering", "Quick reuse"],
  },
  {
    path: "/coach",
    title: "Coach",
    description: "AI coaching session interface for focused guidance.",
    highlights: ["Coaching prompts", "Action steps", "Session recap"],
  },
];

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-page">
      <main className="public-content">{children}</main>
    </div>
  );
}

function RoutePlaceholderPage({
  title,
  description,
  highlights,
}: {
  title: string;
  description: string;
  highlights: string[];
}) {
  return (
    <section className="stack-lg">
      <article className="surface stack">
        <p className="eyebrow">Blueprint Route</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </article>

      <article className="surface stack">
        <h3>Planned Modules</h3>
        <ul className="summary-list">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function AnalyzingRoutePage() {
  const { analysisId } = useParams();

  return (
    <section className="stack-lg">
      <article className="surface stack">
        <p className="eyebrow">Processing</p>
        <h2>Analyzing Session {analysisId ?? "draft"}</h2>
        <p>Processing screen while AI runs through narrative, context, and guidance synthesis.</p>

        <div className="analysis-progress">
          <span className="analysis-progress-bar" />
        </div>
      </article>
    </section>
  );
}

function JournalRoutePage() {
  const { data } = useAppState();

  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>Journal</h2>
        <p>Daily journaling interface for relationship reflection.</p>
      </article>

      <article className="surface">
        {data.journal.length ? (
          <ul className="journal-list">
            {data.journal.map((entry) => (
              <li key={entry.id}>
                <small>{new Date(entry.createdAt).toLocaleString()}</small>
                <p>{entry.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-copy">No journal entries yet.</p>
        )}
      </article>
    </section>
  );
}

function AnalysisManagementRoutePage() {
  const { data } = useAppState();

  return (
    <section className="stack-lg">
      <article className="surface stack">
        <h2>Analysis Management</h2>
        <p>Manage past analyses and jump back into reports quickly.</p>
      </article>

      <article className="surface">
        {data.reports.length ? (
          <ul className="report-list stacked">
            {data.reports.map((report) => (
              <li key={report.id}>
                <div>
                  <p className="report-title">{report.title}</p>
                  <small>{new Date(report.createdAt).toLocaleString()}</small>
                </div>
                <Link className="secondary-button" to={`/report/${report.id}`}>
                  Open Report
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-copy">No analyses yet.</p>
        )}
      </article>
    </section>
  );
}

function PrivacySettingsRoutePage() {
  const [anonymizeExports, setAnonymizeExports] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);

  return (
    <section className="stack-lg">
      <article className="surface stack">
        <h2>Privacy Settings</h2>
        <p>Control privacy defaults for exports, session locking, and reflection safety.</p>
      </article>

      <article className="surface stack">
        <label className="option-pill">
          <input
            type="checkbox"
            checked={anonymizeExports}
            onChange={(event) => setAnonymizeExports(event.target.checked)}
          />
          Anonymize exported reports by default
        </label>

        <label className="option-pill">
          <input
            type="checkbox"
            checked={biometricLock}
            onChange={(event) => setBiometricLock(event.target.checked)}
          />
          Enable biometric gate on app resume
        </label>
      </article>
    </section>
  );
}

function QuizTakeRoutePage() {
  const { quizId } = useParams();
  return (
    <RoutePlaceholderPage
      title={`Quiz Take ${quizId ?? "Session"}`}
      description="Take a quiz with timed prompts and instant scoring."
      highlights={["Prompt flow", "Scoring", "Insight summary"]}
    />
  );
}

function QuizResultsRoutePage() {
  const { quizId } = useParams();
  return (
    <RoutePlaceholderPage
      title={`Quiz Results ${quizId ?? "Session"}`}
      description="Review quiz outcomes and relationship interpretation notes."
      highlights={["Result metrics", "Interpretation", "Recommended actions"]}
    />
  );
}

function GoodbyePage() {
  const { dispatch } = useAppState();
  return (
    <section className="surface stack">
      <h2>Goodbye</h2>
      <p>Account deletion confirmation screen and final data safety reminders.</p>
      <div className="button-row wrap">
        <button
          type="button"
          className="secondary-button"
          onClick={() => dispatch({ type: "logout" })}
        >
          End Session
        </button>
        <Link className="primary-button" to="/">
          Return to Landing
        </Link>
      </div>
    </section>
  );
}

function RootRoute() {
  const { data } = useAppState();
  if (data.session) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <PublicLayout>
      <PageTransition>
        <LoginPage />
      </PageTransition>
    </PublicLayout>
  );
}

function OnboardingRoute() {
  const { data } = useAppState();
  if (data.session) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <PublicLayout>
      <PageTransition>
        <OnboardingPage />
      </PageTransition>
    </PublicLayout>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data } = useAppState();
  if (!data.session) {
    return <Navigate to="/" replace />;
  }
  return (
    <AppShell>
      <PageTransition>{children}</PageTransition>
    </AppShell>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-analysis"
          element={
            <ProtectedRoute>
              <NewAnalysisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analyzing/:analysisId"
          element={
            <ProtectedRoute>
              <AnalyzingRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report/:reportId"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/sessions" element={<Navigate to="/archive" replace />} />

        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <JournalRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/relationship-manager"
          element={
            <ProtectedRoute>
              <RelationshipManagerPage />
            </ProtectedRoute>
          }
        />
        <Route path="/relationships" element={<Navigate to="/relationship-manager" replace />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <PremiumPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis-management"
          element={
            <ProtectedRoute>
              <AnalysisManagementRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/privacy-settings"
          element={
            <ProtectedRoute>
              <PrivacySettingsRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advice-types"
          element={
            <ProtectedRoute>
              <AdviceTypesPage />
            </ProtectedRoute>
          }
        />

        {placeholderRoutes.map((routeDef) => (
          <Route
            key={routeDef.path}
            path={routeDef.path}
            element={
              <ProtectedRoute>
                <RoutePlaceholderPage
                  title={routeDef.title}
                  description={routeDef.description}
                  highlights={routeDef.highlights}
                />
              </ProtectedRoute>
            }
          />
        ))}

        <Route
          path="/quiz/:quizId/take"
          element={
            <ProtectedRoute>
              <QuizTakeRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:quizId/results"
          element={
            <ProtectedRoute>
              <QuizResultsRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <PublicLayout>
              <PageTransition>
                <PrivacyPolicyPage />
              </PageTransition>
            </PublicLayout>
          }
        />

        <Route
          path="/terms"
          element={
            <PublicLayout>
              <PageTransition>
                <TermsPage />
              </PageTransition>
            </PublicLayout>
          }
        />

        <Route
          path="/goodbye"
          element={
            <PublicLayout>
              <PageTransition>
                <GoodbyePage />
              </PageTransition>
            </PublicLayout>
          }
        />

        <Route
          path="*"
          element={
            <PublicLayout>
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            </PublicLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const toastTheme = useMemo(() => "dark" as const, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppStateProvider>
          <AppRoutes />
          <Toaster theme={toastTheme} richColors position="top-right" />
        </AppStateProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
