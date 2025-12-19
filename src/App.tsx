import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import PublicLayout from "@/components/layouts/PublicLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import OperatorProtectedRoute from "@/components/auth/OperatorProtectedRoute";
import UserProtectedRoute from "@/components/auth/UserProtectedRoute";
import Index from "./pages/Index";
import Rolam from "./pages/Rolam";
import Hirek from "./pages/Hirek";
import { Kapcsolat, Arckepcsarnok, Forum } from "./pages/ProtectedPages";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOperators from "./pages/admin/AdminOperators";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

import OperatorCalendar from "./pages/operator/OperatorCalendar";
import OperatorBookings from "./pages/operator/OperatorBookings";
import OperatorPricing from "./pages/operator/OperatorPricing";
import OperatorBilling from "./pages/operator/OperatorBilling";
import OperatorSupportTiers from "./pages/operator/OperatorSupportTiers";
import OperatorBankSettings from "./pages/operator/OperatorBankSettings";
import AvailabilityCalendar from "./pages/public/AvailabilityCalendar";
import BookingCheckout from "./pages/booking/BookingCheckout";

import UserBookingsPage from "./pages/dashboard/UserBookingsPage";
import UserVouchers from "./pages/dashboard/UserVouchers";
import PurchaseVoucher from "./pages/vouchers/PurchaseVoucher";
import OperatorAnalytics from "./pages/operator/OperatorAnalytics";

import EditProfile from "./pages/user/EditProfile";
import ChangePassword from "./pages/user/ChangePassword";
import Support from "./pages/user/Support";

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
                {/* Protected public pages - require active user */}
                <Route path="/arckepcsarnok" element={<Arckepcsarnok />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/idopontok" element={<AvailabilityCalendar />} />
              </Route>

              {/* Booking Flow */}
              <Route path="/foglalas" element={<BookingCheckout />} />

              {/* Auth Routes */}
              <Route path="/belepes" element={<Login />} />
              <Route path="/regisztracio" element={<Register />} />

              {/* User Profile Routes */}
              <Route path="/profil" element={<EditProfile />} />
              <Route path="/jelszo-modositas" element={<ChangePassword />} />
              <Route path="/tamogatas" element={<Support />} />

              {/* User Dashboard Routes (protected, active users only) */}
              <Route path="/dashboard" element={<UserProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="bookings" element={<UserBookingsPage />} />
                </Route>
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes (protected, super_admin only) */}
              <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="subscribers" element={<AdminSubscribers />} />
                  <Route path="operators" element={<AdminOperators />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* Operator Routes (protected, operator_admin and operator_staff only) */}
              <Route path="/operator" element={<OperatorProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="calendar" element={<OperatorCalendar />} />
                  <Route path="bookings" element={<OperatorBookings />} />
                  <Route path="pricing" element={<OperatorPricing />} />
                  <Route path="billing" element={<OperatorBilling />} />
                  <Route path="analytics" element={<OperatorAnalytics />} />
                  <Route path="support-tiers" element={<OperatorSupportTiers />} />
                  <Route path="bank-settings" element={<OperatorBankSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
