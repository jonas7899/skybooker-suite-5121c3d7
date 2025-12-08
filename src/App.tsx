import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import PublicLayout from "@/components/layouts/PublicLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import Index from "./pages/Index";
import Rolam from "./pages/Rolam";
import Hirek from "./pages/Hirek";
import { Kapcsolat, Arckepcsarnok, Forum } from "./pages/ProtectedPages";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOperators from "./pages/admin/AdminOperators";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

import OperatorCalendar from "./pages/operator/OperatorCalendar";
import AvailabilityCalendar from "./pages/public/AvailabilityCalendar";

import RoleSwitcher from "./components/RoleSwitcher";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/hirek" element={<Hirek />} />
                <Route path="/rolam" element={<Rolam />} />
                <Route path="/kapcsolat" element={<Kapcsolat />} />
                <Route path="/arckepcsarnok" element={<Arckepcsarnok />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/idopontok" element={<AvailabilityCalendar />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/belepes" element={<Login />} />
              <Route path="/regisztracio" element={<Register />} />

              {/* Admin Routes (no menu link, only URL access) */}
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="operators" element={<AdminOperators />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Operator Routes */}
              <Route path="/operator" element={<DashboardLayout />}>
                <Route path="calendar" element={<OperatorCalendar />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <RoleSwitcher />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
