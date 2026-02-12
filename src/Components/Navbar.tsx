"use client";

import { useState } from "react";
import { authAPI } from "@/lib/axios";
import { useAuthStore } from "@/Store/Authstore";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Internal Icons for Navbar
const Icons = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Task: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
  Log: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
  Sleep: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Wave: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h.01" /><path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5h5" /><path d="M7 12a5 5 0 0 0-5 5" /><path d="M17 12a5 5 0 0 0 5-5" /></svg>,
  Sun: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const colors = getThemeColors(theme);

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      setIsMobileMenuOpen(false); // Close menu on logout
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
      console.log(error);
    }
  };

  const isActive = (path: string) => pathname === path;

  // Helper to close menu when clicking a link
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      style={{
        backgroundColor: colors.colors.bg.card,
        borderBottomColor: colors.colors.border.primary,
      }}
      className="border-b sticky top-0 z-50 backdrop-blur-md bg-opacity-95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href={user ? "/app" : "/"} onClick={closeMenu} className="flex items-center space-x-2 group">
            <div style={{ color: colors.colors.accent.primary }} className="transform group-hover:rotate-12 transition-transform">
              <Icons.Wave />
            </div>
            <span
              style={{ color: colors.colors.text.primary }}
              className="text-lg font-bold tracking-tight"
            >
              Daily Logger
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!user ? (
              <>
                <Link
                  href="/"
                  style={{
                    color: isActive("/")
                      ? colors.colors.accent.primary
                      : colors.colors.text.secondary,
                  }}
                  className="px-4 py-2 rounded-lg transition-all text-sm font-medium hover:bg-gray-100/5"
                >
                  Home
                </Link>
                <Link
                  href="/auth/signin"
                  style={{
                    color: isActive("/auth/signin")
                      ? colors.colors.accent.primary
                      : colors.colors.text.secondary,
                  }}
                  className="px-4 py-2 rounded-lg transition-all text-sm font-medium hover:bg-gray-100/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  style={{
                    backgroundColor: colors.colors.accent.primary,
                    color: colors.colors.bg.tertiary,
                  }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-opacity-90 ml-2"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/app"
                  style={{
                    color: isActive("/app")
                      ? colors.colors.accent.primary
                      : colors.colors.text.secondary,
                    backgroundColor: isActive("/app")
                      ? colors.colors.accent.light + "20"
                      : "transparent",
                  }}
                  className="px-3 py-2 rounded-md transition-all flex items-center space-x-2 text-sm font-medium"
                >
                  <Icons.Home />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/app/tasks"
                  style={{
                    color: isActive("/app/tasks")
                      ? colors.colors.accent.primary
                      : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/tasks")
                      ? colors.colors.accent.light + "20"
                      : "transparent",
                  }}
                  className="px-3 py-2 rounded-md transition-all flex items-center space-x-2 text-sm font-medium"
                >
                  <Icons.Task />
                  <span>Tasks</span>
                </Link>
                <Link
                  href="/app/logs"
                  style={{
                    color: isActive("/app/logs")
                      ? colors.colors.accent.primary
                      : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/logs")
                      ? colors.colors.accent.light + "20"
                      : "transparent",
                  }}
                  className="px-3 py-2 rounded-md transition-all flex items-center space-x-2 text-sm font-medium"
                >
                  <Icons.Log />
                  <span>Logs</span>
                </Link>
                <Link
                  href="/app/sleep"
                  style={{
                    color: isActive("/app/sleep")
                      ? colors.colors.accent.primary
                      : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/sleep")
                      ? colors.colors.accent.light + "20"
                      : "transparent",
                  }}
                  className="px-3 py-2 rounded-md transition-all flex items-center space-x-2 text-sm font-medium"
                >
                  <Icons.Sleep />
                  <span>Sleep</span>
                </Link>
                <Link
                  href="/app/profile"
                  style={{
                    color: isActive("/app/profile")
                      ? colors.colors.accent.primary
                      : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/profile")
                      ? colors.colors.accent.light + "20"
                      : "transparent",
                  }}
                  className="px-3 py-2 rounded-md transition-all flex items-center space-x-2 text-sm font-medium"
                >
                  <Icons.User />
                  <span>Profile</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={closeMenu}
                  style={{
                    color: isActive("/admin") ? colors.colors.accent.primary : colors.colors.text.secondary,
                    backgroundColor: isActive("/admin") ? colors.colors.accent.light + "20" : "transparent"
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                >
                  <Icons.User /> Admin
                </Link>

                <div className="h-4 w-px bg-gray-300 mx-2 opacity-50"></div>

                <button
                  onClick={handleLogout}
                  style={{
                    color: colors.colors.status.error,
                  }}
                  className="px-3 py-2 rounded-md transition-all hover:bg-red-50 hover:bg-opacity-10 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Theme Toggle Desktop */}
            <button
              onClick={toggleTheme}
              style={{
                borderColor: colors.colors.border.secondary,
                color: colors.colors.text.secondary,
              }}
              className="ml-4 p-2 rounded-full border transition-all hover:text-opacity-80"
              title={`Switch to ${theme === 'ocean-light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'ocean-light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>
          </div>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              style={{
                color: colors.colors.text.secondary,
              }}
              className="p-2 rounded-lg transition-all"
            >
              {theme === 'ocean-light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                color: colors.colors.text.primary,
                backgroundColor: colors.colors.bg.elevated
              }}
              className="p-2 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: colors.colors.bg.card,
            borderTopColor: colors.colors.border.primary
          }}
          className="md:hidden border-t py-4 px-4 space-y-2 animate-in slide-in-from-top-2 duration-200"
        >
          {!user ? (
            <>
              <Link
                href="/"
                onClick={closeMenu}
                style={{
                  color: isActive("/")
                    ? colors.colors.accent.primary
                    : colors.colors.text.secondary,
                  backgroundColor: isActive("/")
                    ? colors.colors.accent.light + "20"
                    : "transparent"
                }}
                className="block px-4 py-3 rounded-lg font-medium"
              >
                Home
              </Link>
              <Link
                href="/auth/signin"
                onClick={closeMenu}
                style={{
                  color: isActive("/auth/signin")
                    ? colors.colors.accent.primary
                    : colors.colors.text.secondary,
                  backgroundColor: isActive("/auth/signin")
                    ? colors.colors.accent.light + "20"
                    : "transparent"
                }}
                className="block px-4 py-3 rounded-lg font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={closeMenu}
                style={{
                  backgroundColor: colors.colors.accent.primary,
                  color: colors.colors.bg.tertiary,
                }}
                className="block px-4 py-3 rounded-lg font-bold text-center mt-4"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Link
                  href="/app"
                  onClick={closeMenu}
                  style={{
                    color: isActive("/app") ? colors.colors.accent.primary : colors.colors.text.secondary,
                    backgroundColor: isActive("/app") ? colors.colors.accent.light + "20" : "transparent"
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                >
                  <Icons.Home /> Dashboard
                </Link>
                <Link
                  href="/app/tasks"
                  onClick={closeMenu}
                  style={{
                    color: isActive("/app/tasks") ? colors.colors.accent.primary : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/tasks") ? colors.colors.accent.light + "20" : "transparent"
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                >
                  <Icons.Task /> Tasks
                </Link>
                <Link
                  href="/app/logs"
                  onClick={closeMenu}
                  style={{
                    color: isActive("/app/logs") ? colors.colors.accent.primary : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/logs") ? colors.colors.accent.light + "20" : "transparent"
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                >
                  <Icons.Log /> Logs
                </Link>
                <Link
                  href="/app/sleep"
                  onClick={closeMenu}
                  style={{
                    color: isActive("/app/sleep") ? colors.colors.accent.primary : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/sleep") ? colors.colors.accent.light + "20" : "transparent"
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                >
                  <Icons.Sleep /> Sleep
                </Link>
                <Link
                  href="/app/profile"
                  onClick={closeMenu}
                  style={{
                    color: isActive("/app/profile") ? colors.colors.accent.primary : colors.colors.text.secondary,
                    backgroundColor: isActive("/app/profile") ? colors.colors.accent.light + "20" : "transparent"
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                >
                  <Icons.User /> Profile
                </Link>
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  style={{
                    color: isActive("/admin") ? colors.colors.accent.primary : colors.colors.text.secondary,
                    backgroundColor: isActive("/admin") ? colors.colors.accent.light + "20" : "transparent"
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                >
                  <Icons.User /> Admin
                </Link>
              </div>

              <div style={{ borderColor: colors.colors.border.primary }} className="border-t my-2 pt-2">
                <button
                  onClick={handleLogout}
                  style={{ color: colors.colors.status.error }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium hover:bg-red-50 hover:bg-opacity-10"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}