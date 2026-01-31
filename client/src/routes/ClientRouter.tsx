import { Route, Routes } from "react-router-dom";
import { UserSignupForm } from "../components/UserSignUp";
import { LoginForm } from "../components/UserLogin";
import { UserHome } from "../components/UserHome";
import { ResetPassword } from "../components/ResetPassword";
import { ProtectedRoute } from "../protected/ProtectedRoute";
import { NoAuthRoute } from "../protected/NoAuthRoute";
import { ROLES,ROUTES } from "../config/env";
import { UserProfile } from "../components/UserProfile";


export const ClientRouter = () => {
  return (
    <div className="bg-[#7140be]">
<Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={<NoAuthRoute element={<LoginForm />} />}
      />
      <Route
        path="/signup"
        element={<NoAuthRoute element={<UserSignupForm />} />}
      />
      <Route
        path="/reset-password"
        element={<NoAuthRoute element={<ResetPassword />} />}
      />

      {/* Protected Client Routes */}
      <Route
        path={ROUTES.CLIENT_DASHBOARD}
        element={
          <ProtectedRoute
            element={<UserHome />}
            allowedRoles={[ROLES.CLIENT]}
          />
        }
      />
          <Route path={ROUTES.CLIENT_PROFILE} element={<UserProfile />} />
    </Routes>

    </div>
    
  );
};