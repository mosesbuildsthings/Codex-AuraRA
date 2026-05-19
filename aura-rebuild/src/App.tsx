import "./index.css";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AdviceTypesPage } from "./pages/AdviceTypesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { LoginPage } from "./pages/LoginPage";
import { NewAnalysisPage } from "./pages/NewAnalysisPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PremiumPage } from "./pages/PremiumPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RelationshipManagerPage } from "./pages/RelationshipManagerPage";
import { ReportPage } from "./pages/ReportPage";
import { SessionsPage } from "./pages/SessionsPage";
import { TermsPage } from "./pages/TermsPage";
import { AppStateProvider, useAppState } from "./state/AppStateContext";

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-page">
      <main className="public-content">{children}</main>
    </div>
  );
}

function RootRoute() {
  const { data } = useAppState();
  if (data.session) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data } = useAppState();
  if (!data.session) {
    return <Navigate to="/" replace />;
  }
  return <AppShell>{children}</AppShell>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />

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
        path="/report/:reportId"
        element={
          <ProtectedRoute>
            <ReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <SessionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/relationships"
        element={
          <ProtectedRoute>
            <RelationshipManagerPage />
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
        path="/advice-types"
        element={
          <ProtectedRoute>
            <AdviceTypesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/privacy-policy"
        element={
          <PublicLayout>
            <PrivacyPolicyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <PublicLayout>
            <TermsPage />
          </PublicLayout>
        }
      />

      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFoundPage />
          </PublicLayout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AppRoutes />
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;

