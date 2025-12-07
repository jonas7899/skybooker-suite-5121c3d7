import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import PublicLayout from "@/components/layouts/PublicLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

// User Dashboard Pages
import UserDashboard from "./pages/dashboard/UserDashboard";
import UserBookings from "./pages/dashboard/UserBookings";
import UserFavorites from "./pages/dashboard/UserFavorites";
import UserSettings from "./pages/dashboard/UserSettings";

// Operator Dashboard Pages
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import OperatorFlights from "./pages/operator/OperatorFlights";
import OperatorBookings from "./pages/operator/OperatorBookings";
import OperatorStaff from "./pages/operator/OperatorStaff";
import OperatorAnalytics from "./pages/operator/OperatorAnalytics";
import OperatorSettings from "./pages/operator/OperatorSettings";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOperators from "./pages/admin/AdminOperators";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

// Demo Component
import RoleSwitcher from "./components/RoleSwitcher";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/experiences" element={<Index />} />
              <Route path="/operators" element={<Index />} />
              <Route path="/about" element={<Index />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="bookings" element={<UserBookings />} />
              <Route path="favorites" element={<UserFavorites />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>

            {/* Operator Dashboard Routes */}
            <Route path="/operator" element={<DashboardLayout />}>
              <Route index element={<OperatorDashboard />} />
              <Route path="flights" element={<OperatorFlights />} />
              <Route path="bookings" element={<OperatorBookings />} />
              <Route path="staff" element={<OperatorStaff />} />
              <Route path="analytics" element={<OperatorAnalytics />} />
              <Route path="settings" element={<OperatorSettings />} />
            </Route>

            {/* Super Admin Dashboard Routes */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="operators" element={<AdminOperators />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Demo Role Switcher - Remove in production */}
          <RoleSwitcher />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
