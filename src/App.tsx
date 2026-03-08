import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";

// Lazy-loaded routes
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const VIPOffer = lazy(() => import("./pages/VIPOffer"));
const Downsell = lazy(() => import("./pages/Downsell"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DayMission = lazy(() => import("./pages/DayMission"));
const Graduation = lazy(() => import("./pages/Graduation"));
const ProfilePage = lazy(() => import("./pages/dashboard/Profile"));
const SettingsPage = lazy(() => import("./pages/dashboard/Settings"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const AdminOverview = lazy(() => import("./pages/admin/Overview"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminCohorts = lazy(() => import("./pages/admin/Cohorts"));
const AdminRevenue = lazy(() => import("./pages/admin/Revenue"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminTestimonials = lazy(() => import("./pages/admin/Testimonials"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const WebhooksAdmin = lazy(() => import("./pages/admin/Webhooks"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/vip-offer" element={<VIPOffer />} />
              <Route path="/downsell" element={<Downsell />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/cohorts" element={<AdminCohorts />} />
              <Route path="/admin/revenue" element={<AdminRevenue />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/testimonials" element={<AdminTestimonials />} />
              <Route path="/admin/webhooks" element={<WebhooksAdmin />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/day/:dayNumber"
                element={
                  <ProtectedRoute>
                    <DayMission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/graduation"
                element={
                  <ProtectedRoute>
                    <Graduation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
