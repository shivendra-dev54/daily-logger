"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";
import { useAuthStore } from "@/Store/Authstore";

// --- Interfaces ---
interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

// --- Icons ---
const Icons = {
  Shield: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Alert: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
};

export default function AdminPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const { user } = useAuthStore();

  // --- State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [adminSecret, setAdminSecret] = useState("");

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteSecret, setDeleteSecret] = useState("");

  // Loading States
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdminLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const response = await axios.post("/api/admin", {
        secret: adminSecret
      }, { withCredentials: true });

      const resData = response.data.data;;

      if (response.data.statusCode === 201) {
        const otherUsers = resData.filter((u: User) => u.username !== user?.username);
        setUsers(otherUsers);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        toast.success("Admin access granted.");
      } 
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;

      if (err.response) {
        if (err.response.status === 403) {
          toast.error("Invalid Secret.");
        } else if (err.response.status === 401) {
          toast.error("Unauthorized. Redirecting...");
          router.push("/app");
        } else {
          toast.error(err.response.data?.message || "Login failed.");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDeleteUser = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      const response = await axios.delete(`/api/admin/${userToDelete.id}?secret=${deleteSecret}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        toast.success(`User ${userToDelete.username} deleted.`);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
        setDeleteSecret("");
      }
    } catch (error) {
      toast.error("Delete failed. Check secret.");
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: colors.colors.bg.primary }}
      className="min-h-screen p-6"
    >
      {isAuthenticated ? (
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div style={{ color: colors.colors.status.error }} className="p-3 bg-red-500/10 rounded-xl">
              <Icons.Shield />
            </div>
            <div>
              <h1 style={{ color: colors.colors.text.primary }} className="text-3xl font-bold">Admin Dashboard</h1>
              <p style={{ color: colors.colors.text.secondary }}>Manage users and system data.</p>
            </div>
          </div>

          {/* User List */}
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary
            }}
            className="rounded-xl border overflow-hidden shadow-sm"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: colors.colors.bg.elevated, color: colors.colors.text.secondary }}>
                  <th className="p-4 text-sm font-semibold">ID</th>
                  <th className="p-4 text-sm font-semibold">User</th>
                  <th className="p-4 text-sm font-semibold">Email</th>
                  <th className="p-4 text-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => (
                  <tr key={user.id} className="group hover:bg-black/5 transition-colors">
                    <td className="p-4 text-sm font-mono" style={{ color: colors.colors.text.tertiary }}>#{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div style={{ backgroundColor: colors.colors.accent.light, color: colors.colors.accent.primary }} className="p-1.5 rounded-full">
                          <Icons.User />
                        </div>
                        <div>
                          <p style={{ color: colors.colors.text.primary }} className="font-medium text-sm">{user.full_name}</p>
                          <p style={{ color: colors.colors.text.secondary }} className="text-xs">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm" style={{ color: colors.colors.text.secondary }}>{user.email}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition-all active:scale-95"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="p-8 text-center" style={{ color: colors.colors.text.secondary }}>
                No users found.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen opacity-50">
          <h1 style={{ color: colors.colors.text.primary }} className="text-2xl font-bold">Restricted Area</h1>
        </div>
      )}

      {/* --- Login Modal --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary
            }}
            className="w-full max-w-md rounded-2xl border shadow-2xl p-8"
          >
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-4">
                <Icons.Shield />
              </div>
              <h2 style={{ color: colors.colors.text.primary }} className="text-2xl font-bold">Admin Access</h2>
              <p style={{ color: colors.colors.text.secondary }} className="text-sm mt-1">Enter the secure secret to continue.</p>
            </div>

            <form onSubmit={handleAdminLogin}>
              <div className="mb-6">
                <label style={{ color: colors.colors.text.secondary }} className="block text-xs font-bold uppercase mb-2">Secret Key</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icons.Lock />
                  </div>
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus:border-red-500 focus:ring-0 transition-all"
                    placeholder=""
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
              >
                {isLoggingIn ? "Verifying..." : "Access Dashboard"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/app")}
                style={{ color: colors.colors.text.tertiary }}
                className="w-full mt-4 text-sm hover:underline"
              >
                Go back to App
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary
            }}
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in duration-200"
          >
            <div className="p-6 text-center">
              <div style={{ color: colors.colors.status.error }} className="mx-auto w-12 h-12 mb-4">
                <Icons.Alert />
              </div>
              <h3 style={{ color: colors.colors.text.primary }} className="text-xl font-bold mb-2">
                Delete User?
              </h3>
              <p style={{ color: colors.colors.text.secondary }} className="text-sm mb-6">
                You are about to delete <strong>{userToDelete.full_name}</strong> and all their data (Tasks, Logs, Sleep). This action is <span className="text-red-500 font-bold">irreversible</span>.
              </p>

              <form onSubmit={handleDeleteUser}>
                <div className="mb-4 text-left">
                  <label style={{ color: colors.colors.text.secondary }} className="block text-xs font-bold uppercase mb-2">Confirm Admin Secret</label>
                  <input
                    type="password"
                    value={deleteSecret}
                    onChange={(e) => setDeleteSecret(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-red-500 outline-none"
                    style={{
                      borderColor: colors.colors.border.secondary,
                      color: colors.colors.text.primary
                    }}
                    placeholder="Enter secret to confirm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setUserToDelete(null); setDeleteSecret(""); }}
                    style={{ borderColor: colors.colors.border.secondary, color: colors.colors.text.secondary }}
                    className="flex-1 py-2 rounded-lg border font-medium hover:bg-gray-100/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !deleteSecret}
                    className="flex-1 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}