"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { logsAPI } from "@/lib/axios";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";

// --- Interfaces ---
export interface Log {
  id: number;
  summary: string;
  rating: number; // 1-5
  date: string; // ISO String
}

// --- Icons ---
const Icons = {
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  StarFilled: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  StarEmpty: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
};

export default function LogsPage() {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);

  // --- State ---
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    summary: "",
    rating: 3,
    date: new Date().toISOString().split("T")[0], // Default to today
  });

  // --- Effects ---
  useEffect(() => {
    fetchLogs();
  }, []);

  // --- Handlers ---
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getAll();
      if (res.data.status) {
        // Sort logs by date (newest first)
        const sortedLogs = res.data.data.sort((a: Log, b: Log) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLogs(sortedLogs);
      }
    } catch (error) {
      toast.error("Failed to fetch logs");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (log?: Log) => {
    if (log) {
      setEditingLog(log);
      // Format date for input YYYY-MM-DD
      const dateStr = new Date(log.date).toISOString().split("T")[0];
      setFormData({
        summary: log.summary,
        rating: log.rating,
        date: dateStr,
      });
    } else {
      setEditingLog(null);
      setFormData({
        summary: "",
        rating: 3,
        date: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLog(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safety check for future dates
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      toast.error("You cannot log for future dates.");
      return;
    }

    try {
      if (editingLog) {
        const payload = {
          summary: formData.summary,
          rating: formData.rating
        };
        await logsAPI.update(editingLog.id, payload);
        toast.success("Log updated successfully");
      } else {
        // Create
        await logsAPI.create(formData);
        toast.success("Log created successfully");
      }
      fetchLogs();
      handleCloseModal();
    } catch (error) {
      toast.error("Operation failed");
      console.log(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to render stars
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
            style={{
              color: star <= rating ? "#F59E0B" : colors.colors.text.tertiary
            }}
          >
            {star <= rating ? <Icons.StarFilled /> : <Icons.StarEmpty />}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{ backgroundColor: colors.colors.bg.primary }}
      className="min-h-screen p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1
              style={{ color: colors.colors.text.primary }}
              className="text-3xl font-bold tracking-tight"
            >
              Daily Journal
            </h1>
            <p style={{ color: colors.colors.text.secondary }} className="mt-1">
              Reflect on your days and track your mood.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            style={{ backgroundColor: colors.colors.accent.primary }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Icons.Plus />
            New Entry
          </button>
        </div>

        {/* Logs Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div style={{ color: colors.colors.accent.primary }} className="animate-spin">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary
            }}
            className="rounded-xl border border-dashed p-12 text-center"
          >
            <p style={{ color: colors.colors.text.secondary }}>No logs found. Start journaling today!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  backgroundColor: colors.colors.bg.card,
                  borderColor: colors.colors.border.primary,
                }}
                className="group relative flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        backgroundColor: colors.colors.bg.elevated,
                        color: colors.colors.text.primary
                      }}
                      className="p-2 rounded-lg"
                    >
                      <Icons.Calendar />
                    </div>
                    <div>
                      <p style={{ color: colors.colors.text.primary }} className="text-sm font-bold">
                        {formatDate(log.date)}
                      </p>
                      <div className="mt-0.5">
                        {renderStars(log.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Edit Button - Fixed for Mobile */}
                  <button
                    onClick={() => handleOpenModal(log)}
                    style={{ color: colors.colors.text.secondary }}
                    // CHANGED: opacity-100 by default (mobile), and lg:opacity-0 (hidden on desktop until hover)
                    className="p-2 rounded-md hover:bg-gray-100/10 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    title="Edit Log"
                  >
                    <Icons.Edit />
                  </button>
                </div>

                {/* Card Content */}
                <div
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                  }}
                  className="flex-1 p-4 rounded-lg"
                >
                  <p
                    style={{ color: colors.colors.text.secondary }}
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                  >
                    {log.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Create/Edit Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            {/* Modal Header */}
            <div
              style={{ borderBottomColor: colors.colors.border.primary }}
              className="p-6 border-b flex justify-between items-center"
            >
              <h2 style={{ color: colors.colors.text.primary }} className="text-xl font-bold">
                {editingLog ? "Edit Journal Entry" : "New Journal Entry"}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ color: colors.colors.text.secondary }}
                className="p-2 hover:bg-gray-100/10 rounded-full transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              <div className="grid grid-cols-2 gap-6">
                {/* Date Input */}
                <div>
                  <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    disabled={!!editingLog}
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      backgroundColor: editingLog ? colors.colors.bg.primary : colors.colors.bg.elevated,
                      borderColor: colors.colors.border.secondary,
                      color: colors.colors.text.primary,
                      opacity: editingLog ? 0.7 : 1
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                  />
                  {editingLog && (
                    <p className="text-[10px] mt-1 text-gray-500">Date cannot be changed.</p>
                  )}
                </div>

                {/* Rating Input */}
                <div>
                  <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                    Rating (1-5)
                  </label>
                  <div
                    style={{
                      backgroundColor: colors.colors.bg.elevated,
                      borderColor: colors.colors.border.secondary
                    }}
                    className="flex items-center justify-center px-4 py-2.5 rounded-lg border"
                  >
                    {renderStars(formData.rating, true)}
                  </div>
                </div>
              </div>

              {/* Summary Input */}
              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                  How was your day?
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm resize-none leading-relaxed"
                  placeholder="Write your thoughts here..."
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {editingLog ? "Save Changes" : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}