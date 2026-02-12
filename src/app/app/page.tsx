"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { tasksAPI, logsAPI, ratingAPI } from "@/lib/axios";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";

// --- Interfaces ---
export interface Task {
  id: number;
  title: string;
  body: string;
  status: string;
  due_date: string;
}

interface DayRating {
  date: string;
  rating: number;
}

// --- Icons ---
const Icons = {
  CheckCircle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  FileText: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  Star: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ArrowRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  List: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Trend: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Loader: () => <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
};

export default function MainPage() {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [ratings, setRatings] = useState<DayRating[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    totalLogs: 0,
    avgRating: "0.0"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [tasksRes, logsRes, ratingsRes] = await Promise.all([
        tasksAPI.getAll(),
        logsAPI.getAll(),
        ratingAPI.getDayRatings(),
      ]);

      // Process Tasks
      let pendingTasks: Task[] = [];
      if (tasksRes.data.status) {
        pendingTasks = tasksRes.data.data.filter((task: Task) => task.status === "P");
        // Sort by due date (closest first)
        pendingTasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        setTasks(pendingTasks.slice(0, 5)); // Only show top 5
      }

      // Process Ratings
      let currentRatings: DayRating[] = [];
      let avg = "0.0";
      if (ratingsRes.data.status) {
        currentRatings = ratingsRes.data.data;
        // Take last 7 days
        setRatings(currentRatings.slice(-7));
        
        if (currentRatings.length > 0) {
          const sum = currentRatings.reduce((acc: number, r: DayRating) => acc + r.rating, 0);
          avg = (sum / currentRatings.length).toFixed(1);
        }
      }

      // Set Stats
      setStats({
        pendingCount: pendingTasks.length,
        totalLogs: logsRes.data.status ? logsRes.data.data.length : 0,
        avgRating: avg
      });

    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) return "Today";
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div 
        style={{ backgroundColor: colors.colors.bg.primary }}
        className="flex items-center justify-center h-screen"
      >
        <div style={{ color: colors.colors.accent.primary }}>
          <Icons.Loader />
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
        
        {/* Header */}
        <div>
          <h1 
            style={{ color: colors.colors.text.primary }}
            className="text-3xl font-bold tracking-tight"
          >
            Dashboard
          </h1>
          <p style={{ color: colors.colors.text.secondary }} className="mt-2">
            Here`s an overview of your productivity.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Tasks Stat */}
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="rounded-xl p-6 border shadow-sm flex items-center justify-between"
          >
            <div>
              <p style={{ color: colors.colors.text.secondary }} className="text-sm font-medium">
                Pending Tasks
              </p>
              <p style={{ color: colors.colors.text.primary }} className="text-3xl font-bold mt-2">
                {stats.pendingCount}
              </p>
            </div>
            <div 
              style={{ 
                backgroundColor: colors.colors.accent.light + "20", 
                color: colors.colors.accent.primary 
              }} 
              className="p-3 rounded-full"
            >
              <Icons.CheckCircle />
            </div>
          </div>

          {/* Total Logs Stat */}
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="rounded-xl p-6 border shadow-sm flex items-center justify-between"
          >
            <div>
              <p style={{ color: colors.colors.text.secondary }} className="text-sm font-medium">
                Total Logs
              </p>
              <p style={{ color: colors.colors.text.primary }} className="text-3xl font-bold mt-2">
                {stats.totalLogs}
              </p>
            </div>
            <div 
              style={{ 
                backgroundColor: colors.colors.accent.light + "20", 
                color: colors.colors.accent.primary 
              }} 
              className="p-3 rounded-full"
            >
              <Icons.FileText />
            </div>
          </div>

          {/* Avg Rating Stat */}
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="rounded-xl p-6 border shadow-sm flex items-center justify-between"
          >
            <div>
              <p style={{ color: colors.colors.text.secondary }} className="text-sm font-medium">
                Avg Rating
              </p>
              <div className="flex items-baseline gap-1 mt-2">
                 <p style={{ color: colors.colors.text.primary }} className="text-3xl font-bold">
                  {stats.avgRating}
                </p>
                <p style={{ color: colors.colors.text.tertiary }} className="text-sm">/ 5.0</p>
              </div>
            </div>
            <div 
              style={{ 
                backgroundColor: colors.colors.accent.light + "20", 
                color: colors.colors.accent.primary 
              }} 
              className="p-3 rounded-full"
            >
              <Icons.Star />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Pending Tasks List */}
          <div className="lg:col-span-2">
            <div
              style={{
                backgroundColor: colors.colors.bg.card,
                borderColor: colors.colors.border.primary,
              }}
              className="rounded-xl border shadow-sm overflow-hidden"
            >
              <div 
                style={{ borderBottomColor: colors.colors.border.primary }}
                className="p-6 border-b flex justify-between items-center"
              >
                <h2 style={{ color: colors.colors.text.primary }} className="text-xl font-bold flex items-center gap-2">
                  <Icons.List />
                  Priority Tasks
                </h2>
                <Link
                  href="/app/tasks"
                  style={{ color: colors.colors.accent.primary }}
                  className="text-sm font-medium hover:underline flex items-center gap-1"
                >
                  View All <Icons.ArrowRight />
                </Link>
              </div>

              <div className="p-2">
                {tasks.length === 0 ? (
                  <div className="py-12 text-center">
                    <p style={{ color: colors.colors.text.muted }}>No pending tasks. Great job!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {tasks.map((task) => (
                      <div 
                        key={task.id} 
                        style={{ backgroundColor: colors.colors.bg.elevated }}
                        className="p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-opacity-80 transition-all"
                      >
                        <div className="flex-1">
                          <h3 style={{ color: colors.colors.text.primary }} className="font-semibold text-base">
                            {task.title}
                          </h3>
                          <p style={{ color: colors.colors.text.secondary }} className="text-sm mt-1 line-clamp-1">
                            {task.body}
                          </p>
                        </div>
                        
                        <div 
                           style={{ 
                             backgroundColor: colors.colors.bg.primary,
                             color: colors.colors.status.warning,
                             borderColor: colors.colors.border.secondary
                           }}
                           className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap self-start sm:self-center"
                        >
                          <Icons.Clock />
                          Due: {formatDate(task.due_date)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Weekly Chart */}
          <div className="space-y-8">
            
            {/* Quick Actions Navigation */}
            <div
              style={{
                backgroundColor: colors.colors.bg.card,
                borderColor: colors.colors.border.primary,
              }}
              className="rounded-xl border shadow-sm p-6"
            >
              <h2 style={{ color: colors.colors.text.primary }} className="text-lg font-bold mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/app/tasks"
                  style={{ 
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary
                  }}
                  className="flex items-center p-3 rounded-lg border hover:scale-[1.02] transition-transform group"
                >
                  <div style={{ color: colors.colors.accent.primary }} className="p-2 bg-blue-500/10 rounded-lg mr-3">
                    <Icons.CheckCircle />
                  </div>
                  <div>
                    <p style={{ color: colors.colors.text.primary }} className="font-medium text-sm">Manage Tasks</p>
                    <p style={{ color: colors.colors.text.secondary }} className="text-xs">Add or complete to-dos</p>
                  </div>
                  <div style={{ color: colors.colors.text.muted }} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icons.ArrowRight />
                  </div>
                </Link>

                <Link
                  href="/app/logs"
                  style={{ 
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary
                  }}
                  className="flex items-center p-3 rounded-lg border hover:scale-[1.02] transition-transform group"
                >
                  <div style={{ color: colors.colors.accent.primary }} className="p-2 bg-blue-500/10 rounded-lg mr-3">
                    <Icons.FileText />
                  </div>
                  <div>
                    <p style={{ color: colors.colors.text.primary }} className="font-medium text-sm">Daily Journal</p>
                    <p style={{ color: colors.colors.text.secondary }} className="text-xs">Log your thoughts</p>
                  </div>
                  <div style={{ color: colors.colors.text.muted }} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icons.ArrowRight />
                  </div>
                </Link>

                <Link
                  href="/app/sleep"
                  style={{ 
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary
                  }}
                  className="flex items-center p-3 rounded-lg border hover:scale-[1.02] transition-transform group"
                >
                  <div style={{ color: colors.colors.accent.primary }} className="p-2 bg-blue-500/10 rounded-lg mr-3">
                    <Icons.Moon />
                  </div>
                  <div>
                    <p style={{ color: colors.colors.text.primary }} className="font-medium text-sm">Sleep Tracker</p>
                    <p style={{ color: colors.colors.text.secondary }} className="text-xs">Monitor rest patterns</p>
                  </div>
                  <div style={{ color: colors.colors.text.muted }} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icons.ArrowRight />
                  </div>
                </Link>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div
              style={{
                backgroundColor: colors.colors.bg.card,
                borderColor: colors.colors.border.primary,
              }}
              className="rounded-xl border shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ color: colors.colors.text.primary }} className="text-lg font-bold flex items-center gap-2">
                  <Icons.Trend />
                  Mood Trend
                </h2>
              </div>
              
              {ratings.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-40">
                  {ratings.map((rating, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div 
                        style={{ 
                          height: `${(rating.rating / 5) * 100}%`,
                          backgroundColor: colors.colors.accent.primary,
                        }}
                        className="w-full rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity relative"
                      >
                         {/* Tooltip on hover */}
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {rating.rating}/5
                         </div>
                      </div>
                      <p style={{ color: colors.colors.text.secondary }} className="text-[10px] mt-2 font-medium">
                        {new Date(rating.date).toLocaleDateString("en-US", { weekday: "narrow" })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p style={{ color: colors.colors.text.muted }} className="text-sm">No ratings yet</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}