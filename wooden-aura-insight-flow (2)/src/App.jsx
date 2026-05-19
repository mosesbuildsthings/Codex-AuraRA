import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MobileLayout from '@/components/layout/MobileLayout';
import { TabStackProvider } from '@/lib/TabStackContext';

// Lazy-loaded pages — split into separate chunks for faster initial load
const Landing              = lazy(() => import('./pages/Landing'));
const Onboarding           = lazy(() => import('./pages/Onboarding'));
const RelationshipAnalysis = lazy(() => import('./pages/RelationshipAnalysis'));
const Analyzing            = lazy(() => import('./pages/Analyzing'));
const ReportView           = lazy(() => import('./pages/ReportView'));
const Dashboard            = lazy(() => import('./pages/Dashboard'));
const WisdomLibrary        = lazy(() => import('./pages/WisdomLibrary'));
const RelationshipGoals    = lazy(() => import('./pages/RelationshipGoals'));
const Profile              = lazy(() => import('./pages/Profile'));
const SessionArchive       = lazy(() => import('./pages/SessionArchive'));
const Journal              = lazy(() => import('./pages/Journal'));
const PartnerConnect       = lazy(() => import('./pages/PartnerConnect'));
const MonthlyReport        = lazy(() => import('./pages/MonthlyReport'));
const ExerciseLibrary      = lazy(() => import('./pages/ExerciseLibrary'));
const QuizHub              = lazy(() => import('./pages/QuizHub'));
const QuizCreate           = lazy(() => import('./pages/QuizCreate'));
const QuizTake             = lazy(() => import('./pages/QuizTake'));
const QuizResults          = lazy(() => import('./pages/QuizResults'));
const MoodMap              = lazy(() => import('./pages/MoodMap'));
const CoolDown             = lazy(() => import('./pages/CoolDown'));
const VisionBoard          = lazy(() => import('./pages/VisionBoard'));
const HealthDashboard      = lazy(() => import('./pages/HealthDashboard'));
const Challenges           = lazy(() => import('./pages/Challenges'));
const SyncSpace            = lazy(() => import('./pages/SyncSpace'));
const Coach                = lazy(() => import('./pages/Coach'));
const DailyCheckIn         = lazy(() => import('./pages/DailyCheckIn'));
const SentimentTrends      = lazy(() => import('./pages/SentimentTrends'));
const AnalysisManagement   = lazy(() => import('./pages/AnalysisManagement'));
const RelationshipHealthReport = lazy(() => import('./pages/RelationshipHealthReport'));
const WeeklyChallenge      = lazy(() => import('./pages/WeeklyChallenge'));
const Premium              = lazy(() => import('./pages/Premium'));
const RelationshipManager  = lazy(() => import('./pages/RelationshipManager'));
const Feedback             = lazy(() => import('./pages/Feedback'));
const PrivacyPolicy        = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService       = lazy(() => import('./pages/TermsOfService.jsx'));
const Goodbye              = lazy(() => import('./pages/Goodbye'));
const PrivacySettings      = lazy(() => import('./pages/PrivacySettings'));

// Minimal spinner shown while a lazy chunk is loading
const PageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
  </div>
);

const RouteAnimationWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Suspense fallback={<PageSpinner />}>
      <RouteAnimationWrapper>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/onboarding" element={<MobileLayout title="Welcome"><Onboarding /></MobileLayout>} />
          <Route path="/new-analysis" element={<MobileLayout title="New Reflection"><RelationshipAnalysis /></MobileLayout>} />
          <Route path="/analyzing/:id" element={<MobileLayout title="Analyzing"><Analyzing /></MobileLayout>} />
          <Route path="/report/:id" element={<MobileLayout title="Your Report"><ReportView /></MobileLayout>} />

          {/* Home tab */}
          <Route path="/dashboard" element={<MobileLayout><Dashboard /></MobileLayout>} />
          <Route path="/archive" element={<MobileLayout showBack><SessionArchive /></MobileLayout>} />

          {/* Insights tab */}
          <Route path="/health" element={<MobileLayout><HealthDashboard /></MobileLayout>} />
          <Route path="/mood-map" element={<MobileLayout showBack><MoodMap /></MobileLayout>} />
          <Route path="/monthly-report" element={<MobileLayout showBack><MonthlyReport /></MobileLayout>} />
          <Route path="/sentiment-trends" element={<MobileLayout showBack><SentimentTrends /></MobileLayout>} />
          <Route path="/health-report" element={<MobileLayout showBack><RelationshipHealthReport /></MobileLayout>} />

          {/* Sessions tab */}
          <Route path="/journal" element={<MobileLayout><Journal /></MobileLayout>} />
          <Route path="/partner" element={<MobileLayout showBack><PartnerConnect /></MobileLayout>} />
          <Route path="/cool-down" element={<MobileLayout showBack><CoolDown /></MobileLayout>} />
          <Route path="/daily-check-in" element={<MobileLayout title="Daily Check-in"><DailyCheckIn /></MobileLayout>} />
          <Route path="/sync-space" element={<MobileLayout showBack><SyncSpace /></MobileLayout>} />
          <Route path="/vision-board" element={<MobileLayout showBack><VisionBoard /></MobileLayout>} />

          {/* Tools tab */}
          <Route path="/exercise-library" element={<MobileLayout><ExerciseLibrary /></MobileLayout>} />
          <Route path="/challenges" element={<MobileLayout showBack><Challenges /></MobileLayout>} />
          <Route path="/quiz" element={<MobileLayout showBack><QuizHub /></MobileLayout>} />
          <Route path="/quiz/create" element={<MobileLayout showBack><QuizCreate /></MobileLayout>} />
          <Route path="/quiz/:quizId/take" element={<MobileLayout showBack><QuizTake /></MobileLayout>} />
          <Route path="/quiz/:quizId/results" element={<MobileLayout showBack><QuizResults /></MobileLayout>} />
          <Route path="/weekly-challenge" element={<MobileLayout showBack><WeeklyChallenge /></MobileLayout>} />
          <Route path="/goals" element={<MobileLayout showBack><RelationshipGoals /></MobileLayout>} />
          <Route path="/wisdom" element={<MobileLayout showBack><WisdomLibrary /></MobileLayout>} />
          <Route path="/coach" element={<MobileLayout showBack><Coach /></MobileLayout>} />

          {/* Profile tab */}
          <Route path="/profile" element={<MobileLayout><Profile /></MobileLayout>} />
          <Route path="/relationship-manager" element={<MobileLayout showBack title="Relationships"><RelationshipManager /></MobileLayout>} />
          <Route path="/feedback" element={<MobileLayout showBack title="Feedback"><Feedback /></MobileLayout>} />
          <Route path="/premium" element={<MobileLayout showBack title="Premium"><Premium /></MobileLayout>} />
          <Route path="/analysis-management" element={<MobileLayout showBack><AnalysisManagement /></MobileLayout>} />
          <Route path="/privacy-settings" element={<MobileLayout showBack title="Privacy Settings"><PrivacySettings /></MobileLayout>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/goodbye" element={<Goodbye />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </RouteAnimationWrapper>
    </Suspense>
  );
};

function App() {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    let isDark = storedTheme === "dark"
      ? true
      : storedTheme === "light"
        ? false
        : window.matchMedia("(prefers-color-scheme: dark)").matches;

    document.documentElement.classList.toggle("dark", isDark);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <TabStackProvider>
            <AuthenticatedApp />
          </TabStackProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;