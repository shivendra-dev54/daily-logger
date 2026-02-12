"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";
import { authAPI } from "@/lib/axios";

// Icons
const Icons = {
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  IdCard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="14" x="3" y="5" rx="2" ry="2" /><line x1="7" y1="15" x2="7" y2="15.01" /><line x1="10" y1="15" x2="17" y2="15" /></svg>,
  Wave: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h.01" /><path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5h5" /><path d="M7 12a5 5 0 0 0-5 5" /><path d="M17 12a5 5 0 0 0 5-5" /></svg>,
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Loader: () => <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
};

export default function SignUpPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authAPI.signup(formData);

      if (res.data.status) {
        toast.success("Account created successfully!");
        router.push("/auth/signin");
      }
    } catch (error) {
      toast.error("Registration failed");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{ backgroundColor: colors.colors.bg.primary }}
      className="min-h-screen flex flex-col justify-center items-center p-4"
    >
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div style={{ color: colors.colors.accent.primary }} className="transform group-hover:rotate-12 transition-transform">
            <Icons.Wave />
          </div>
          <span style={{ color: colors.colors.text.primary }} className="text-xl font-bold">
            Daily Logger
          </span>
        </Link>
      </div>

      <div
        style={{
          backgroundColor: colors.colors.bg.card,
          borderColor: colors.colors.border.primary,
        }}
        className="w-full max-w-md rounded-2xl border shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2
            style={{ color: colors.colors.text.primary }}
            className="text-2xl font-bold mb-2"
          >
            Create an account
          </h2>
          <p style={{ color: colors.colors.text.secondary }} className="text-sm">
            Start your journey to better productivity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label
              style={{ color: colors.colors.text.secondary }}
              className="block text-xs font-medium mb-1.5 ml-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div
                style={{ color: colors.colors.text.tertiary }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <Icons.User />
              </div>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                style={{
                  backgroundColor: colors.colors.bg.elevated,
                  borderColor: colors.colors.border.secondary,
                  color: colors.colors.text.primary,
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              style={{ color: colors.colors.text.secondary }}
              className="block text-xs font-medium mb-1.5 ml-1"
            >
              Username
            </label>
            <div className="relative">
              <div
                style={{ color: colors.colors.text.tertiary }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <Icons.IdCard />
              </div>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                style={{
                  backgroundColor: colors.colors.bg.elevated,
                  borderColor: colors.colors.border.secondary,
                  color: colors.colors.text.primary,
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                placeholder="johndoe123"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              style={{ color: colors.colors.text.secondary }}
              className="block text-xs font-medium mb-1.5 ml-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div
                style={{ color: colors.colors.text.tertiary }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <Icons.Mail />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                style={{
                  backgroundColor: colors.colors.bg.elevated,
                  borderColor: colors.colors.border.secondary,
                  color: colors.colors.text.primary,
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              style={{ color: colors.colors.text.secondary }}
              className="block text-xs font-medium mb-1.5 ml-1"
            >
              Password
            </label>
            <div className="relative">
              <div
                style={{ color: colors.colors.text.tertiary }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <Icons.Lock />
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                style={{
                  backgroundColor: colors.colors.bg.elevated,
                  borderColor: colors.colors.border.secondary,
                  color: colors.colors.text.primary,
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: colors.colors.accent.primary,
            }}
            className="w-full py-3 rounded-lg font-bold text-white text-sm shadow-lg hover:bg-opacity-90 transition-all flex justify-center items-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Icons.Loader />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <Icons.ArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p style={{ color: colors.colors.text.secondary }}>
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              style={{ color: colors.colors.accent.primary }}
              className="font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}