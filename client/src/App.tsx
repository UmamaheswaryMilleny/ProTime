import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./config/env";

// Route Guards
import { ProtectedRoute } from "./shared/components/Protected.route"; // file: Protected.route.tsx
import { PublicRoute } from "./shared/components/Public.route";       // file: Public.route.tsx

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
import { FindBuddyPage } from "./features/dashboard/pages/FindBuddyPage";
import { HelpPage } from "./features/dashboard/pages/HelpPage";
import { LevelsPage } from "./features/dashboard/pages/LevelsPage";
import { SubscriptionPage } from "./features/dashboard/pages/SubscriptionPage";

// const ComingSoon = ({ page }: { page: string }) => (
//   <div className="min-h-screen bg-black flex items-center justify-center">
//     <div className="text-center">
//       <h1 className="text-4xl font-bold text-white mb-4">{page}</h1>
//       <p className="text-zinc-400">Coming soon...</p>
//     </div>
//   </div>
// );

function App() {
  return (
    <BrowserRouter>
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

          {/* <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} /> */}
        </Route>

        {/* ─── User Dashboard (nested under DashboardLayout) ────────────── */}
        <Route element={<ProtectedRoute allowedRole="CLIENT" />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.USER_PROFILE} element={<ProfilePage />} />          {/* /dashboard/profile */}
            <Route path={ROUTES.DASHBOARD_TODO_LIST} element={<TodoPage />} />
            <Route path={ROUTES.DASHBOARD_FIND_BUDDY} element={<FindBuddyPage />} />
            <Route path={ROUTES.DASHBOARD_HELP} element={<HelpPage />} />
            <Route path={ROUTES.DASHBOARD_LEVELS} element={<LevelsPage />} />
            <Route path={ROUTES.DASHBOARD_SUBSCRIPTION} element={<SubscriptionPage />} />
          </Route>
        </Route>

      
        {/* ─── 404 Fallback ─────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;