
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

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./User/Card";
import { Button } from "./User/Button";
import { logoutUser } from "../store/slices/userSlice";
import { useLogoutMutation } from "../hooks/auth/auth";
import { ROUTES } from "../config/env";
import type { RootState } from "../store/store";
import toast from "react-hot-toast";

export function UserHome() {
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
        dispatch(logoutUser());
        navigate(ROUTES.LOGIN);
      },
    });
  };

  if (!user) return null;

  // ✅ FIX PROFILE IMAGE URL
  const API_URL = "http://localhost:3000";

  const profileImage =
    user.profileImage?.startsWith("http")
      ? user.profileImage
      : user.profileImage
      ? `${API_URL}${user.profileImage}`
      : "/default-avatar.png";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <Card className="w-full max-w-2xl border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">
            Welcome, {user.firstName} {user.lastName}!
          </CardTitle>
          <CardDescription className="text-lg">
            You are logged in as a {user.role}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="space-y-2 text-center">
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mx-auto border shadow"
            />

            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {user.email}
            </p>

            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {user.role}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t space-y-3">
            <Button
              onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
              variant="outline"
              className="w-full"
            >
              View Profile
            </Button>

            <Button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full"
              variant="destructive"
            >
              {isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




