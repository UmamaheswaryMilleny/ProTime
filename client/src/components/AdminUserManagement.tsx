import Sidebar, { SidebarItem } from "./User/Sidebar";
import { ROUTES } from "../config/env";

import {
  LayoutDashboard,
  UserSearch,
  CheckSquare,
  Calendar,
  Timer,
  MessageCircle,
  BarChart3,
  Trophy,
} from "lucide-react";


import { useState } from "react";
import { useAdminUsers,useBlockUser,useUnblockUser,useUserDetails } from "../hooks/admin/useAdminUsers";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { Button } from "./User/Button";
import { Input } from "./User/input";
import { Eye, Ban, CheckCircle, Search, Filter, ArrowUpDown } from "lucide-react";
import type { UserStatusFilter,SortOrder } from "../services/admin/adminService";

export function AdminUserManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [blockConfirmationUserId, setBlockConfirmationUserId] = useState<string | null>(null);
  const [unblockConfirmationUserId, setUnblockConfirmationUserId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, error } = useAdminUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter,
    sort: "createdAt",
    order: sortOrder,
  });

  const { data: userDetails } = useUserDetails(selectedUserId);
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const handleBlock = async (userId: string) => {
    await blockUser.mutateAsync(userId);
    setBlockConfirmationUserId(null);
  };

  const handleBlockClick = (userId: string) => {
      console.log("Block clicked", userId);
    setBlockConfirmationUserId(userId);
  };

  const handleCancelBlock = () => {
    setBlockConfirmationUserId(null);
  };

  const handleUnblock = async (userId: string) => {
    await unblockUser.mutateAsync(userId);
    setUnblockConfirmationUserId(null);
  };

  const handleUnblockClick = (userId: string) => {
    setUnblockConfirmationUserId(userId);
  };

  const handleCancelUnblock = () => {
    setUnblockConfirmationUserId(null);
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseDetails = () => {
    setSelectedUserId(null);
  };

  return (
    <div className="flex h-screen bg-black">
            <Sidebar>
              <SidebarItem icon={<LayoutDashboard />} text="Dashboard"  onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}/>
              <SidebarItem icon={<UserSearch/>} text="User Management" active onClick={() => navigate(ROUTES.ADMIN_USERS)}/>
               <SidebarItem icon={<CheckSquare />} text="Meeting Management" />
              <SidebarItem icon={<Calendar />} text="Skills Management" />
              <SidebarItem icon={<Timer />} text="Subscription Plan" />
              <SidebarItem icon={<MessageCircle />} text="Revenue Dashboard" />
              <SidebarItem icon={<BarChart3 />} text="User Report" />
              <SidebarItem icon={<Trophy />} text="Gamification Mangement" />
      
            </Sidebar>
             <main className="flex-1 overflow-y-auto bg-[#7140be] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto ">
        {/* Header Card */}
        <div 
          className="rounded-xl shadow-lg overflow-hidden"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          {/* Header */}
          <div 
            className="px-4 sm:px-6 py-5 border-b"
            style={{ borderColor: "#E5E7EB" }}
          >
            <h1 
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "#374151" }}
            >
              User Management
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: "#6B7280" }}
            >
              Manage all registered users on the platform
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                  style={{ color: "#9CA3AF" }}
                />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                  style={{
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    color: "#374151",
                  }}
                />
              </div>

              {/* Filters and Sorting */}
              <div className="flex flex-col sm:flex-row gap-4 ">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <label 
                    htmlFor="status-filter" 
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: "#374151" }}
                  >
                    Status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as UserStatusFilter);
                      setPage(1);
                    }}
                    className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #D1D5DB",
                      color: "#374151",
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="blocked">Blocked</option>
                    <option value="unblocked">Unblocked</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <label 
                    htmlFor="sort-order" 
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: "#374151" }}
                  >
                    Sort by Date:
                  </label>
                  <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value as SortOrder);
                      setPage(1);
                    }}
                    className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #D1D5DB",
                      color: "#374151",
                    }}
                  >
                    <option value="asc">Oldest First</option>
                    <option value="desc">Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Block Confirmation Modal */}
            {blockConfirmationUserId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div 
                  className="max-w-md w-full rounded-xl shadow-2xl overflow-hidden"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <div 
                    className="px-6 py-4 border-b"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: "#374151" }}
                    >
                      Confirm Block User
                    </h2>
                  </div>
                  <div className="p-6">
                    <p 
                      className="text-base mb-6"
                      style={{ color: "#4B5563" }}
                    >
                      Are you sure you want to block this user? They will not be able to access their account until unblocked.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={handleCancelBlock}
                        disabled={blockUser.isPending}
                        style={{ 
                          borderColor: "#D1D5DB",
                          color: "#374151",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleBlock(blockConfirmationUserId)}
                        disabled={blockUser.isPending}
                        style={{ 
                          backgroundColor: "#DC2626",
                          color: "#FFFFFF",
                        }}
                      >
                        {blockUser.isPending ? "Blocking..." : "Block User"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unblock Confirmation Modal */}
            {unblockConfirmationUserId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div 
                  className="max-w-md w-full rounded-xl shadow-2xl overflow-hidden"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <div 
                    className="px-6 py-4 border-b"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: "#374151" }}
                    >
                      Confirm Unblock User
                    </h2>
                  </div>
                  <div className="p-6">
                    <p 
                      className="text-base mb-6"
                      style={{ color: "#4B5563" }}
                    >
                      Are you sure you want to unblock this user? They will regain access to their account immediately.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={handleCancelUnblock}
                        disabled={unblockUser.isPending}
                        style={{ 
                          borderColor: "#D1D5DB",
                          color: "#374151",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleUnblock(unblockConfirmationUserId)}
                        disabled={unblockUser.isPending}
                        style={{ 
                          backgroundColor: "#16A34A",
                          color: "#FFFFFF",
                        }}
                      >
                        {unblockUser.isPending ? "Unblocking..." : "Unblock User"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Details Modal */}
            {selectedUserId && userDetails && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div 
                  className="max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <div 
                    className="flex justify-between items-center px-6 py-4 border-b"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: "#374151" }}
                    >
                      User Details
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={handleCloseDetails}
                      className="h-8 w-8 p-0 text-xl"
                      style={{ color: "#6B7280" }}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm" style={{ color: "#6B7280" }}>Name</p>
                        <p className="font-semibold" style={{ color: "#374151" }}>
                          {userDetails.firstName} {userDetails.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#6B7280" }}>Email</p>
                        <p className="font-semibold" style={{ color: "#374151" }}>
                          {userDetails.email}
                        </p>
                      </div>
                
                      <div>
                        <p className="text-sm" style={{ color: "#6B7280" }}>Role</p>
                        <p className="font-semibold" style={{ color: "#374151" }}>
                          {userDetails.role}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#6B7280" }}>Status</p>
                        <p
                          className="font-semibold"
                          style={{ color: userDetails.isBlocked ? "#DC2626" : "#16A34A" }}
                        >
                          {userDetails.isBlocked ? "Blocked" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <p style={{ color: "#6B7280" }}>Loading users...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500">
                  {(error as { message?: string })?.message || "Failed to load users"}
                </p>
              </div>
            )}

            {/* Users Table */}
            {data && !isLoading && (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-lg border" style={{ borderColor: "#E5E7EB" }}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: "#F3F4F6" }}>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#374151" }}>
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#6B5B4F" }}>
                          Email
                        </th>
                    
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#6B5B4F" }}>
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#6B5B4F" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#6B7280" }}>
                            No users found
                          </td>
                        </tr>
                      ) : (
                        data.users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-t transition-colors hover:bg-opacity-50"
                            style={{ borderColor: "#E5E7EB" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <td className="px-4 py-3 text-sm" style={{ color: "#374151" }}>
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "#4B5563" }}>
                              {user.email}
                            </td>
                       
                            <td className="px-4 py-3">
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: user.isBlocked ? "#FEE2E2" : "#DCFCE7",
                                  color: user.isBlocked ? "#DC2626" : "#16A34A",
                                }}
                              >
                                {user.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(user.id)}
                                  className="h-8"
                                  style={{ 
                                    borderColor: "#10B981",
                                    color: "#059669",
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                {user.isBlocked ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnblockClick(user.id)}
                                    disabled={unblockUser.isPending}
                                    className="h-8"
                                    style={{ borderColor: "#16A34A", color: "#16A34A" }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Unblock
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBlockClick(user.id)}
                                    disabled={blockUser.isPending}
                                    className="h-8"
                                    style={{ borderColor: "#DC2626", color: "#DC2626" }}
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Block
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {data.users.length === 0 ? (
                    <div className="text-center py-8" style={{ color: "#6B7280" }}>
                      No users found
                    </div>
                  ) : (
                    data.users.map((user) => (
                      <div 
                        key={user.id}
                        className="p-4 rounded-lg border"
                        style={{ 
                          backgroundColor: "#FFFFFF",
                          borderColor: "#E5E7EB",
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold" style={{ color: "#374151" }}>
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm" style={{ color: "#4B5563" }}>
                              {user.email}
                            </p>
                          </div>
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: user.isBlocked ? "#FEE2E2" : "#DCFCE7",
                              color: user.isBlocked ? "#DC2626" : "#16A34A",
                            }}
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                  
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(user.id)}
                            className="flex-1 h-9"
                            style={{ borderColor: "#10B981", color: "#059669" }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {user.isBlocked ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockClick(user.id)}
                              disabled={unblockUser.isPending}
                              className="flex-1 h-9"
                              style={{ borderColor: "#16A34A", color: "#16A34A" }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBlockClick(user.id)}
                              disabled={blockUser.isPending}
                              className="flex-1 h-9"
                              style={{ borderColor: "#DC2626", color: "#DC2626" }}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Block
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm" style={{ color: "#4B5563" }}>
                      Showing {(page - 1) * limit + 1} to{" "}
                      {Math.min(page * limit, data.total)} of {data.total} users
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ borderColor: "#10B981", color: "#059669" }}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                          .filter(
                            (p) =>
                              p === 1 ||
                              p === data.totalPages ||
                              (p >= page - 1 && p <= page + 1)
                          )
                          .map((p, idx, arr) => (
                            <div key={p} className="flex items-center gap-1">
                              {idx > 0 && arr[idx - 1] !== p - 1 && (
                                <span className="px-2" style={{ color: "#9CA3AF" }}>...</span>
                              )}
                              <Button
                                variant={page === p ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(p)}
                                className="min-w-10"
                                style={page === p ? 
                                  { backgroundColor: "#10B981", color: "#FFFFFF" } : 
                                  { borderColor: "#10B981", color: "#059669" }
                                }
                              >
                                {p}
                              </Button>
                            </div>
                          ))}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        disabled={page === data.totalPages}
                        style={{ borderColor: "#10B981", color: "#059669" }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}



