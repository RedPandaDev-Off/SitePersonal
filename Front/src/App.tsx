
// import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";

import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import CGU from "./pages/CGU";
import CGV from "./pages/CGV";
import Confidentialite from "./pages/Confidentialite";
import CookieBanner from "./components/CookieBanner";
import { AuthProvider, useAuth } from "./lib/auth";
import { useAnalytics } from "./lib/useAnalytics";
import type { JSX } from "react/jsx-runtime";


import { useEffect } from "react";

const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  if (!user) {
    return null;
  }
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    } else if (user.role?.toLowerCase() !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (user.role?.toLowerCase() !== "admin") {
    return null;
  }

  return children;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          {/* Pages légales */}
          <Route path="/cgu" element={<CGU />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieBanner />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
