import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./config/env";

 // file: Protected.route.tsx
import { PublicRoute } from "./shared/components/Public.route";       // file: Public.route.tsx

// // Landing
// import { LandingPage } from "./features/landing/pages/LandingPage";

// Auth Pages
import { SigninPage } from "./features/auth/pages/SigninPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { OtpVerificationPage } from "./features/auth/pages/OtpVerificationPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";


// Admin Pages — to be built
// import { AdminDashboardPage } from "./features/admin/pages/AdminDashboardPage";
// import { AdminUsersPage } from "./features/admin/pages/AdminUsersPage";

  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4"></h1>
      <p className="text-zinc-400">Coming soon...</p>
    </div>
  </div>


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ─── Public Landing ───────────────────────────────────────────── */}
        {/* <Route path={ROUTES.HOME} element={<LandingPage />} /> */}

        {/* ─── Auth Routes (redirect to dashboard if already logged in) ─── */}
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<SigninPage />} />
          <Route path={ROUTES.REGISTER} element={<SignupPage />} />
          <Route path={ROUTES.VERIFY_OTP} element={<OtpVerificationPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>

      


      </Routes>
    </BrowserRouter>
  );
}

export default App;