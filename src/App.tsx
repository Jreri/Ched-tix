import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import CreateEventPage from "./pages/admin/CreateEventPage";
import EditEventPage from "./pages/admin/EditEventPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import ScanAttendancePage from "./pages/admin/ScanAttendancePage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";

import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import CustomerSettingsPage from "./pages/customer/CustomerSettingsPage";
import CustomerTicketsPage from "./pages/customer/CustomerTicketsPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import PaymentPage from "./pages/PaymentPage";
import TicketConfirmationPage from "./pages/TicketConfirmationPage";

import { Footer } from "./components/Footer";

const queryClient = new QueryClient();

// Layout component
const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <div className="flex-1">
      <Outlet />
    </div>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/tickets/confirmation/:ticketId" element={<TicketConfirmationPage />} />

            {/* Customer Routes */}
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
            <Route path="/customer/settings" element={<CustomerSettingsPage />} />
            <Route path="/tickets" element={<CustomerTicketsPage />} />
            <Route path="/customer/tickets" element={<CustomerTicketsPage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/events/new" element={<CreateEventPage />} />
            <Route path="/admin/events/:id" element={<EditEventPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/scan" element={<ScanAttendancePage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Redirects */}
          <Route path="/portal" element={<Navigate to="/login" replace />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
