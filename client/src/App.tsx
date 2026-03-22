import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./shared/constants/constants.routes";

// Route Guards
import { ProtectedRoute } from "./shared/components/Protected.route";
import { PublicRoute } from "./shared/components/Public.route";

// Landing
import { LandingPage } from "./features/landing/pages/LandingPage";

// Auth Pages
import { SigninPage } from "./features/auth/pages/SigninPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { OtpVerificationPage } from "./features/auth/pages/OtpVerificationPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";

// User Dashboard
import { DashboardLayout } from "./features/dashboard/layouts/DashboardLayout";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { ProfilePage } from "./features/dashboard/pages/ProfilePage";
import { TodoPage } from "./features/todo/pages/TodoPage";
import { FindBuddyPage } from "./features/buddy-match/pages/FindBuddyPage";
import { HelpPage } from "./features/dashboard/pages/HelpPage";
import { LevelsPage } from "./features/dashboard/pages/LevelsPage";
import { SubscriptionPage } from "./features/dashboard/pages/SubscriptionPage";
import { PlanDetailPage } from "./features/dashboard/pages/PlanDetailPage";
import { PaymentPage } from "./features/dashboard/pages/PaymentPage";
import { CommunityChatPage } from "./features/community-chat/pages/CommunityChatPage";
import { ChatPage } from "./features/chat/pages/ChatPage";

// Admin
import { AdminLoginPage } from "./features/admin/pages/AdminLoginPage";
import { AdminLayout } from "./features/admin/layouts/AdminLayout";
import { AdminDashboardPage } from "./features/admin/pages/AdminDashboardPage";
import { AdminUsersPage } from "./features/admin/pages/AdminUsersPage";

import { BadgeEarnedModal } from "./features/gamification/components/BadgeEarnedModal";

function App() {
  return (
    <BrowserRouter>
      <BadgeEarnedModal />
      <Routes>

        {/* ─── Public Landing ───────────────────────────────────────────── */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />

        {/* ─── Auth Routes (redirect to dashboard if already logged in) ─── */}
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<SigninPage />} />
          <Route path={ROUTES.REGISTER} element={<SignupPage />} />
          <Route path={ROUTES.VERIFY_OTP} element={<OtpVerificationPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

          {/* Admin Login — public but admin-specific */}
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
        </Route>

        {/* ─── User Dashboard (nested under DashboardLayout) ────────────── */}
        <Route element={<ProtectedRoute allowedRole="CLIENT" />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.USER_PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.DASHBOARD_TODO_LIST} element={<TodoPage />} />
            <Route path={ROUTES.DASHBOARD_FIND_BUDDY} element={<FindBuddyPage />} />
            <Route path={ROUTES.DASHBOARD_MY_BUDDIES} element={<FindBuddyPage />} />
            <Route path={ROUTES.DASHBOARD_BUDDY_REQUESTS} element={<FindBuddyPage />} />
            <Route path={ROUTES.DASHBOARD_HELP} element={<HelpPage />} />
            <Route path={ROUTES.DASHBOARD_LEVELS} element={<LevelsPage />} />
            <Route path={ROUTES.DASHBOARD_SUBSCRIPTION} element={<SubscriptionPage />} />
            <Route path={ROUTES.DASHBOARD_SUBSCRIPTION_PLAN} element={<PlanDetailPage />} />
            <Route path={ROUTES.DASHBOARD_SUBSCRIPTION_PAYMENT} element={<PaymentPage />} />
            <Route path={ROUTES.DASHBOARD_COMMUNITY_CHAT} element={<CommunityChatPage />} />
            <Route path={ROUTES.DASHBOARD_CHAT} element={<ChatPage />} />
            <Route path={ROUTES.DASHBOARD_CHAT_CONVERSATION} element={<ChatPage />} />
          </Route>
        </Route>

        {/* ─── Admin Panel (nested under AdminLayout) ───────────────────── */}
        <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* ─── 404 Fallback ─────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
