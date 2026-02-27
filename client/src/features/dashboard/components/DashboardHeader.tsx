import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { logoutUser } from '../../auth/store/authSlice';
import { ProTimeBackend } from '../../../api/instance';
import { ROUTES, API_ROUTES } from '../../../config/env';

export const DashboardHeader: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  // Calls backend first to delete refresh token from Redis,
  // then clears local Redux state regardless of backend response.
  const handleLogout = async () => {
    try {
      await ProTimeBackend.post(API_ROUTES.LOGOUT);
    } catch {
      // Backend logout failed (token already expired, network error, etc.)
      // Still clear local state — user should always be able to log out
    } finally {
      dispatch(logoutUser());
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Welcome to ProTime, {user?.fullName || 'User'}{' '}
          <span className="animate-wave">👋</span>
        </h1>
        <p className="text-zinc-400 mt-1">
          Let's Set You Up For Your First Focused Study Session.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to={ROUTES.DASHBOARD_HELP}
          className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          <HelpCircle size={20} />
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            className="cursor-pointer relative"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
              }
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-zinc-700 hover:border-[blueviolet] transition-colors"
            />
          </button>

          {/* Profile Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 overflow-hidden z-50">
              <div className="p-4 border-b border-zinc-800">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link
                  to={ROUTES.USER_PROFILE}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserIcon size={16} />
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};