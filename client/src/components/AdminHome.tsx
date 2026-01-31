
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar,{ SidebarItem } from "./User/Sidebar";
import { Button } from "./User/Button";
import { logoutUser } from "../store/slices/userSlice";
import { useLogoutMutation } from "../hooks/auth/auth";
import { ROUTES } from "../config/env";
import type { RootState } from "../store/store";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Calendar,
  Timer,
  MessageCircle,
  Trophy,
  BarChart3,
  UserSearch,
  CheckSquare,
} from "lucide-react";




export function AdminHome() {
    const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutate: logout, isPending } = useLogoutMutation();

 const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        dispatch(logoutUser());
        toast.success("Logged out successfully");
        navigate(ROUTES.LOGIN);
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Logout failed";
        toast.error(errorMessage);
        // Even if API fails, clear local state
        dispatch(logoutUser());
        navigate(ROUTES.LOGIN);
      },
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard />} text="Dashboard" active />
        <SidebarItem icon={<UserSearch/>} text="User Management"  onClick={() => navigate(ROUTES.ADMIN_USERS)}/>
         <SidebarItem icon={<CheckSquare />} text="Meeting Management" />
        <SidebarItem icon={<Calendar />} text="Skills Management" />
        <SidebarItem icon={<Timer />} text="Subscription Plan" />
        <SidebarItem icon={<MessageCircle />} text="Revenue Dashboard" />
        <SidebarItem icon={<BarChart3 />} text="User Report" />
        <SidebarItem icon={<Trophy />} text="Gamification Mangement" />

      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black">
        <section className="flex items-center justify-between bg-[#1C1C21] p-6 rounded-xl shadow-md m-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {user.firstName}{user.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              {user.email}
            </p>
          </div>

            <Button 
              onClick={handleLogout}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? "Logging out..." : "Logout"}
            </Button>
        </section>
      </main>
    </div>
  );
}


