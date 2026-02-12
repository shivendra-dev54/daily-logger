"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";
import { api, tasksAPI, logsAPI, sleepAPI } from "@/lib/axios"; // Assuming you expose the generic 'api' or added userAPI
import { Task } from "../page";
import { SleepRecord } from "../sleep/page";
import { Log } from "../logs/page";
import QuoteCard from "@/Components/QuoteCard";

// --- Icons ---
const Icons = {
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
};

// --- Interfaces ---
interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

export default function ProfilePage() {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);

  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Data for Graphs
  const [taskStats, setTaskStats] = useState({ pending: 0, completed: 0 });
  const [logTrends, setLogTrends] = useState<{ date: string; rating: number }[]>([]);
  const [sleepTrends, setSleepTrends] = useState<{ date: string; duration: number }[]>([]);

  // Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
  });

  // --- Effects ---
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Info
      const userRes = await api.get("/api/user");
      if (userRes.data.status) {
        setUser(userRes.data.data);
        setFormData({
          full_name: userRes.data.data.full_name,
          username: userRes.data.data.username,
          email: userRes.data.data.email
        });
      }

      // 2. Fetch Tasks (For Pie Chart)
      const taskRes = await tasksAPI.getAll();
      if (taskRes.data.status) {
        const tasks = taskRes.data.data;
        const pending = tasks.filter((t: Task) => t.status === "P").length;
        const completed = tasks.filter((t: Task) => t.status === "C").length;
        setTaskStats({ pending, completed });
      }

      // 3. Fetch Logs (For Line Chart)
      const logsRes = await logsAPI.getAll();
      if (logsRes.data.status) {
        const sortedLogs = logsRes.data.data
          .sort((a: Log, b: Log) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7); // Last 7 entries
        setLogTrends(sortedLogs);
      }

      // 4. Fetch Sleep (For Bar Chart)
      const sleepRes = await sleepAPI.getAll();
      if (sleepRes.data.status) {
        const sortedSleep = sleepRes.data.data
          .sort((a: SleepRecord, b: SleepRecord) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime())
          .slice(-7) // Last 7 entries
          .map((s: SleepRecord) => {
            const diff = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60);
            return {
              date: s.end_time,
              duration: diff
            };
          });
        setSleepTrends(sortedSleep);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.patch("/api/user", formData);
      if (res.data.status) {
        setUser(res.data.data);
        toast.success("Profile updated successfully");
        setIsEditOpen(false);
      }
    } catch (error) {
      toast.error("Update failed");
      console.log(error);
    }
  };

  // --- Graph Helpers --- //

  // 1. Pie Chart Helper (CSS Conic Gradient)
  const getPieStyle = () => {
    const total = taskStats.pending + taskStats.completed;
    if (total === 0) return { background: colors.colors.bg.elevated };

    const pPercent = (taskStats.pending / total) * 100;
    return {
      background: `conic-gradient(
        ${colors.colors.accent.primary} 0% ${pPercent}%, 
        ${colors.colors.status.success} ${pPercent}% 100%
      )`
    };
  };

  // 2. Line Chart Helper (SVG Path)
  const renderLineChart = () => {
    if (logTrends.length < 2) return null;
    const width = 100;
    const height = 50;

    // Normalize points: X distributed evenly, Y mapped 1-5 to 0-height
    const points = logTrends.map((log, index) => {
      const x = (index / (logTrends.length - 1)) * width;
      const y = height - ((log.rating - 1) / 4) * height; // Map 1-5 to bottom-top
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke={colors.colors.accent.primary}
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {logTrends.map((log, index) => {
          const x = (index / (logTrends.length - 1)) * width;
          const y = height - ((log.rating - 1) / 4) * height;
          return (
            <circle key={index} cx={x} cy={y} r="3" fill={colors.colors.bg.card} stroke={colors.colors.accent.primary} strokeWidth="2" />
          )
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.colors.bg.primary }}>
        <div style={{ color: colors.colors.accent.primary }} className="animate-spin">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: colors.colors.bg.primary }}
      className="min-h-screen p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- Profile Header Card --- */}
        <div
          style={{
            backgroundColor: colors.colors.bg.card,
            borderColor: colors.colors.border.primary
          }}
          className="rounded-2xl border p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8"
        >
          {/* Avatar Placeholder */}
          <div
            style={{
              backgroundColor: colors.colors.accent.light,
              color: colors.colors.accent.primary
            }}
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 style={{ color: colors.colors.text.primary }} className="text-3xl font-bold select-text">
                {user?.full_name}
              </h1>
              <p style={{ color: colors.colors.text.secondary }} className="text-lg">
                @{user?.username}
              </p>
            </div>

            <div
              style={{ color: colors.colors.text.tertiary }}
              className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium"
            >
              <Icons.Mail />
              {user?.email}
            </div>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            style={{
              backgroundColor: colors.colors.bg.elevated,
              color: colors.colors.text.primary,
              borderColor: colors.colors.border.secondary
            }}
            className="px-5 py-2.5 rounded-lg border flex items-center gap-2 hover:bg-gray-100/5 transition-colors font-medium text-sm"
          >
            <Icons.Edit />
            Edit Profile
          </button>
        </div>

        {/* --- Metrics Grid (3 Graphs) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 1. Task Distribution (Pie) */}
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="rounded-xl border p-6 shadow-sm flex flex-col items-center"
          >
            <h3 style={{
              color: colors.colors.text.primary,
              borderColor: colors.colors.border.secondary
            }} className="font-bold mb-6 self-start w-full border-b pb-2">
              Task Completion
            </h3>

            <div className="relative w-40 h-40 rounded-full mb-6 shadow-lg" style={getPieStyle()}>
              {/* Inner Circle for Donut effect */}
              <div
                className="absolute inset-4 rounded-full"
                style={{ backgroundColor: colors.colors.bg.card }}
              />
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.colors.accent.primary }}></div>
                  <span style={{ color: colors.colors.text.secondary }}>Pending</span>
                </div>
                <span style={{ color: colors.colors.text.primary }} className="font-bold">{taskStats.pending}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.colors.status.success }}></div>
                  <span style={{ color: colors.colors.text.secondary }}>Completed</span>
                </div>
                <span style={{ color: colors.colors.text.primary }} className="font-bold">{taskStats.completed}</span>
              </div>
            </div>
          </div>

          {/* 2. Mood Trends (Line) */}
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="rounded-xl border p-6 shadow-sm flex flex-col"
          >
            <h3 style={{
              color: colors.colors.text.primary,
              borderColor: colors.colors.border.secondary
            }} className="font-bold mb-6 border-b pb-2">
              Mood Trend (Last 7 Logs)
            </h3>

            <div className="flex-1 flex items-center justify-center p-2 relative">
              {logTrends.length === 0 ? (
                <p style={{ color: colors.colors.text.muted }} className="text-sm">Not enough data</p>
              ) : (
                <div className="w-full h-32 px-2">
                  {renderLineChart()}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4 px-2">
              <span style={{ color: colors.colors.text.tertiary }} className="text-xs">Oldest</span>
              <span style={{ color: colors.colors.text.tertiary }} className="text-xs">Latest</span>
            </div>
          </div>

          {/* 3. Sleep Duration (Bar) */}
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="rounded-xl border p-6 shadow-sm flex flex-col"
          >
            <h3 style={{
              color: colors.colors.text.primary,
              borderColor: colors.colors.border.secondary
            }} className="font-bold mb-6 border-b pb-2">
              Sleep Duration (Last 7 Days)
            </h3>

            <div className="flex-1 flex items-end justify-between gap-2 h-40">
              {sleepTrends.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p style={{ color: colors.colors.text.muted }} className="text-sm">No sleep records</p>
                </div>
              ) : (
                sleepTrends.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute mb-2 bg-black text-white text-[10px] py-1 px-2 rounded transition-opacity whitespace-nowrap -translate-y-full">
                      {s.duration.toFixed(1)} hrs
                    </div>

                    <div
                      style={{
                        height: `${Math.min((s.duration / 12) * 100, 100)}%`, // Max 12h for scale
                        backgroundColor: colors.colors.accent.secondary,
                      }}
                      className="w-full rounded-t-sm opacity-80 hover:opacity-100 transition-all relative"
                    />
                    <span style={{ color: colors.colors.text.secondary }} className="text-[10px] mt-2">
                      {new Date(s.date).toLocaleDateString("en-US", { weekday: "narrow" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
        <QuoteCard />
      </div>

      {/* --- Edit Profile Modal --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            <div
              style={{ borderBottomColor: colors.colors.border.primary }}
              className="p-6 border-b flex justify-between items-center"
            >
              <h2 style={{ color: colors.colors.text.primary }} className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                style={{ color: colors.colors.text.secondary }}
                className="p-2 hover:bg-gray-100/10 rounded-full transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  style={{
                    color: colors.colors.text.secondary,
                    borderColor: colors.colors.border.secondary
                  }}
                  className="px-4 py-2 rounded-lg border font-medium text-sm hover:bg-gray-100/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: colors.colors.accent.primary }}
                  className="px-6 py-2 rounded-lg text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}