import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackgroundThemeProvider, useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { NavigationTrackerProvider } from "@/contexts/NavigationTrackerContext";
import { GrainyBackground } from "@/components/GrainyBackground";
import { PageTransition } from "@/components/PageTransition";
import { Suspense } from "react";
import { Loader } from "@/components/Loader";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { SwipeIndicator } from "@/components/SwipeIndicator";
import { ScrollToTop } from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Statistics from "./pages/Statistics";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail";
import ProgramDetail from "./pages/ProgramDetail";
// MasterStructure removed - content now embedded in ProgramDetail
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import TeacherDetail from "./pages/TeacherDetail";
import Labs from "./pages/Labs";
import LabDetail from "./pages/LabDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import LearningAgreementDetail from "./pages/LearningAgreementDetail";
import Workbench from "./pages/Workbench";
import Diary from "./pages/Diary";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import HelpCenter from "./pages/HelpCenter";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const { palette, modeConfig } = useBackgroundTheme();
  
  // Enable swipe navigation on mobile
  useSwipeNavigation();

  return (
    <GrainyBackground palette={palette} modeConfig={modeConfig}>
      <div className="flex flex-col min-h-screen" style={{ color: modeConfig.textColor }}>
        <Header />
        <main className="flex-1">
          <Suspense fallback={<Loader fullScreen />}>
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/universities" element={<Universities />} />
                <Route path="/universities/:slug" element={<UniversityDetail />} />
                <Route path="/programs/:slug" element={<ProgramDetail />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/teachers/:id" element={<TeacherDetail />} />
                <Route path="/labs" element={<Labs />} />
                <Route path="/labs/:slug" element={<LabDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/learning-agreements/:id" element={<LearningAgreementDetail />} />
                <Route path="/workbench" element={<Workbench />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </main>
        <SwipeIndicator />
        <Footer />
      </div>
    </GrainyBackground>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <BackgroundThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <NavigationTrackerProvider>
                  <ScrollToTop />
                  <ErrorBoundary>
                    <AppContent />
                  </ErrorBoundary>
                </NavigationTrackerProvider>
              </BrowserRouter>
            </TooltipProvider>
          </BackgroundThemeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
