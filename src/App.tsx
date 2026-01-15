import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import VIPOffer from "./pages/VIPOffer";
import Downsell from "./pages/Downsell";
import ThankYou from "./pages/ThankYou";
import Dashboard from "./pages/Dashboard";
import DayMission from "./pages/DayMission";
import Graduation from "./pages/Graduation";
import ProfilePage from "./pages/dashboard/Profile";
import SettingsPage from "./pages/dashboard/Settings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminCohorts from "./pages/admin/Cohorts";
import AdminRevenue from "./pages/admin/Revenue";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminSettings from "./pages/admin/Settings";
import WebhooksAdmin from "./pages/admin/Webhooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
