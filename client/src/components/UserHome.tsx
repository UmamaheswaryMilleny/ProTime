
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import Sidebar,{ SidebarItem } from "./User/Sidebar";
// import { Button } from "./User/Button";
// import { logoutUser } from "../store/slices/userSlice";
// import { useLogoutMutation } from "../hooks/auth/auth";
// import { ROUTES } from "../config/env";
// import type { RootState } from "../store/store";
// import toast from "react-hot-toast";

// import {
//   LayoutDashboard,
//   HelpCircle,
//   Settings,
//   Calendar,
//   Timer,
//   MessageCircle,
//   Trophy,
//   BarChart3,
//   LogOut,
//   UserSearch,
//   CheckSquare,
// } from "lucide-react";




// export function UserHome() {
//     const user = useSelector((state: RootState) => state.auth.user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { mutate: logout, isPending } = useLogoutMutation();

//  const handleLogout = () => {
//     logout(undefined, {
//       onSuccess: () => {
//         dispatch(logoutUser());
//         toast.success("Logged out successfully");
//         navigate(ROUTES.LOGIN);
//       },
//       onError: (error: unknown) => {
//         const errorMessage =
//           (error as { response?: { data?: { message?: string } } })?.response
//             ?.data?.message || "Logout failed";
//         toast.error(errorMessage);
//         // Even if API fails, clear local state
//         dispatch(logoutUser());
//         navigate(ROUTES.LOGIN);
//       },
//     });
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="flex h-screen bg-black">
//       {/* Sidebar */}
//       <Sidebar>
//         <SidebarItem icon={<LayoutDashboard />} text="Dashboard" active />
//         <SidebarItem icon={<UserSearch/>} text="FindBuddy" />
//          <SidebarItem icon={<CheckSquare />} text="ToDo" />
//         <SidebarItem icon={<Calendar />} text="Calendar" />
//         <SidebarItem icon={<Timer />} text="Pomodoro" />
//         <SidebarItem icon={<MessageCircle />} text="Chat" />
//         <SidebarItem icon={<Trophy />} text="Leaderboard" />
//         <SidebarItem icon={<BarChart3 />} text="Reports" />
//         <SidebarItem icon={<Settings />} text="Settings" />
//         <SidebarItem icon={<HelpCircle />} text="Help" />
//         <SidebarItem icon={<LogOut />} text="Logout" />
//       </Sidebar>

//       {/* Main Content */}
//       <main className="flex-1 overflow-y-auto bg-black">
//         <section className="flex items-center justify-between bg-[#1C1C21] p-6 rounded-xl shadow-md m-6">
//           <div>
//             <h2 className="text-xl font-semibold text-white">
//               {user.firstName}{user.lastName}
//             </h2>
//             <p className="text-sm text-gray-500">
//               {user.email}
//             </p>
//           </div>

//             <Button 
//               onClick={handleLogout}
//               disabled={isPending}
//               variant="destructive"
//             >
//               {isPending ? "Logging out..." : "Logout"}
//             </Button>
//         </section>
//       </main>
//     </div>
//   );
// }
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar, { SidebarItem } from "./User/Sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "./User/Card";
import { Button } from "./User/Button";
import { logoutUser } from "../store/slices/userSlice";
import { useLogoutMutation } from "../hooks/auth/auth";
import { ROUTES } from "../config/env";
import type { RootState } from "../store/store";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  User,
} from "lucide-react";

export function UserHome() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutate: logout, isPending } = useLogoutMutation();

  const [imageError, setImageError] = useState(false);

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
        dispatch(logoutUser());
        navigate(ROUTES.LOGIN);
      },
    });
  };

  if (!user) return null;

  const API_URL = "http://localhost:3000";
  const profileImage =
    user.profileImage?.startsWith("http")
      ? user.profileImage
      : user.profileImage
      ? `${API_URL}${user.profileImage}`
      : null;

  return (
    <div className="flex h-screen bg-[#0F0F12]">
      {/* Sidebar */}
      <Sidebar>
        <SidebarItem
          icon={<LayoutDashboard />}
          text="Home"
          active
        />
        <SidebarItem
          icon={<User />}
          text="My Profile"
          onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
        />
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <section className="flex items-center justify-between bg-[#1C1C21] p-6 rounded-xl shadow-md mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Welcome, {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          <Button
            onClick={handleLogout}
            disabled={isPending}
            variant="destructive"
          >
            {isPending ? "Logging out..." : "Logout"}
          </Button>
        </section>

        {/* Profile Card */}
        <Card className="max-w-xl bg-[#1C1C21] border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              User Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              {profileImage && !imageError ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  onError={() => setImageError(true)}
                  className="w-28 h-28 rounded-full object-cover border shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#2A2A2F] flex items-center justify-center border shadow-md">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <p className="text-gray-300 text-sm">
                <strong>Email:</strong> {user.email}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <Button
                onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                variant="outline"
                className="w-full"
              >
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
