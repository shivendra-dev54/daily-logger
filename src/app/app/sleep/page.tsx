"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { sleepAPI } from "@/lib/axios";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";

// --- Interfaces ---
export interface SleepRecord {
  id: number;
  start_time: string;
  end_time: string;
}

// --- Icons ---
const Icons = {
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Alert: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
};

export default function SleepPage() {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);

  // --- State ---
  const [sleeps, setSleeps] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSleep, setEditingSleep] = useState<SleepRecord | null>(null);

  // Delete Confirmation State
  const [sleepToDelete, setSleepToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    start_time: "",
    end_time: "",
  });

  // --- Effects ---
  useEffect(() => {
    fetchSleeps();
  }, []);

  // --- Handlers ---
  const fetchSleeps = async () => {
    setLoading(true);
    try {
      const res = await sleepAPI.getAll();
      if (res.data.status) {
        // Sort by start_time (newest first)
        const sorted = res.data.data.sort((a: SleepRecord, b: SleepRecord) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        setSleeps(sorted);
      }
    } catch (error) {
      toast.error("Failed to fetch sleep records");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record?: SleepRecord) => {
    if (record) {
      setEditingSleep(record);
      setFormData({
        start_time: formatForInput(record.start_time),
        end_time: formatForInput(record.end_time),
      });
    } else {
      setEditingSleep(null);
      // Default: Start yesterday 11PM, End today 7AM
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(23, 0, 0, 0);

      const end = new Date();
      end.setHours(7, 0, 0, 0);

      setFormData({
        start_time: formatForInput(start.toISOString()),
        end_time: formatForInput(end.toISOString()),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSleep(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    const now = new Date();

    // 1. Basic Timeline Check
    if (start >= end) {
      toast.error("End time must be after start time.");
      return;
    }

    // 2. 5 Days Past Limit
    // Create a date object for 5 days ago
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(now.getDate() - 5);
    // Reset hours to ensure full day comparison isn't affected by current time
    fiveDaysAgo.setHours(0, 0, 0, 0);

    if (start < fiveDaysAgo) {
      toast.error("Cannot log sleep records older than 5 days.");
      return;
    }

    // 3. 12 Hour Duration Cap
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 12) {
      toast.error("Sleep duration cannot exceed 12 hours.");
      return;
    }

    // 4. "Next Day" Constraint
    // Ensure end date is not more than 1 day ahead of start date
    // (This is mostly redundant due to 12h cap, but good for explicit date sanity)
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);
    const dayDifference = (endDay.getTime() - startDay.getTime()) / (1000 * 3600 * 24);

    if (dayDifference > 1) {
      toast.error("End time cannot be beyond the next day.");
      return;
    }

    try {
      const payload = {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      };

      if (editingSleep) {
        await sleepAPI.update(editingSleep.id, payload);
        toast.success("Sleep record updated");
      } else {
        await sleepAPI.create(payload);
        toast.success("Sleep record added");
      }
      fetchSleeps();
      handleCloseModal();
    } catch (error) {
      console.log(error);
      toast.error("Sleep times overlap with an existing record.");
    }
  };

  // Delete Handlers
  const confirmDelete = (id: number) => setSleepToDelete(id);
  const cancelDelete = () => setSleepToDelete(null);
  const executeDelete = async () => {
    if (!sleepToDelete) return;
    try {
      await sleepAPI.delete(sleepToDelete);
      toast.success("Record deleted");
      setSleeps(sleeps.filter(s => s.id !== sleepToDelete));
      setSleepToDelete(null);
    } catch (error) {
      toast.error("Failed to delete record");
      console.log(error);
    }
  };

  // --- Helpers ---
  const formatForInput = (isoString: string) => {
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffMs = e - s;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDisplayTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDisplayDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      style={{ backgroundColor: colors.colors.bg.primary }}
      className="min-h-screen p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1
              style={{ color: colors.colors.text.primary }}
              className="text-3xl font-bold tracking-tight"
            >
              Sleep Tracker
            </h1>
            <p style={{ color: colors.colors.text.secondary }} className="mt-1">
              Monitor your rest patterns and sleep quality.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            style={{ backgroundColor: colors.colors.accent.primary }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Icons.Plus />
            Log Sleep
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div style={{ color: colors.colors.accent.primary }} className="animate-spin">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            </div>
          </div>
        ) : sleeps.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary
            }}
            className="rounded-xl border border-dashed p-12 text-center"
          >
            <p style={{ color: colors.colors.text.secondary }}>No sleep records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sleeps.map((sleep) => (
              <div
                key={sleep.id}
                style={{
                  backgroundColor: colors.colors.bg.card,
                  borderColor: colors.colors.border.primary,
                }}
                className="group relative flex flex-col justify-between rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Header: Date & Duration */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        backgroundColor: colors.colors.bg.elevated,
                        color: colors.colors.accent.primary
                      }}
                      className="p-2.5 rounded-lg"
                    >
                      <Icons.Moon />
                    </div>
                    <div>
                      <p style={{ color: colors.colors.text.primary }} className="font-bold text-sm">
                        {formatDisplayDate(sleep.end_time)}
                      </p>
                      <p style={{ color: colors.colors.text.secondary }} className="text-xs">
                        Duration: <span style={{ color: colors.colors.accent.primary, fontWeight: 600 }}>
                          {calculateDuration(sleep.start_time, sleep.end_time)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(sleep)}
                      style={{ color: colors.colors.text.secondary }}
                      className="p-1.5 rounded-md hover:bg-gray-100/10 transition-colors"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => confirmDelete(sleep.id)}
                      style={{ color: colors.colors.status.error }}
                      className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>

                {/* Timeline Visual */}
                <div
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary
                  }}
                  className="flex items-center justify-between p-3 rounded-lg border text-sm"
                >
                  <div className="text-center">
                    <p style={{ color: colors.colors.text.tertiary }} className="text-xs mb-1">Bedtime</p>
                    <p style={{ color: colors.colors.text.primary }} className="font-mono font-medium">
                      {formatDisplayTime(sleep.start_time)}
                    </p>
                  </div>

                  <div style={{ color: colors.colors.border.secondary }} className="flex-1 px-3 flex items-center">
                    <div className="h-px w-full bg-current relative">
                      <div className="absolute right-0 -top-1 w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-current border-b-4 border-b-transparent"></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p style={{ color: colors.colors.text.tertiary }} className="text-xs mb-1">Wake Up</p>
                    <p style={{ color: colors.colors.text.primary }} className="font-mono font-medium">
                      {formatDisplayTime(sleep.end_time)}
                    </p>
                  </div>
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
            className="w-full max-w-md rounded-2xl border shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div
              style={{ borderBottomColor: colors.colors.border.primary }}
              className="p-6 border-b flex justify-between items-center"
            >
              <h2 style={{ color: colors.colors.text.primary }} className="text-xl font-bold">
                {editingSleep ? "Edit Sleep Record" : "Log Sleep"}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ color: colors.colors.text.secondary }}
                className="p-2 hover:bg-gray-100/10 rounded-full transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                  Sleep Start Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm font-mono"
                />
              </div>

              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                  Sleep End Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm font-mono"
                />
              </div>

              {/* Dynamic Duration Preview in Modal */}
              {formData.start_time && formData.end_time && (
                <div
                  style={{
                    backgroundColor: colors.colors.bg.primary,
                    borderColor: colors.colors.border.primary
                  }}
                  className="p-3 rounded-lg border text-center"
                >
                  <p style={{ color: colors.colors.text.secondary }} className="text-xs">Calculated Duration</p>
                  {/* Visual Feedback for validity */}
                  {(() => {
                    const s = new Date(formData.start_time);
                    const e = new Date(formData.end_time);
                    if (s >= e) return <p className="text-red-500 font-bold text-sm">Invalid Time Range</p>;

                    const diffHours = (e.getTime() - s.getTime()) / (1000 * 3600);
                    const isTooLong = diffHours > 12;

                    return (
                      <p style={{ color: isTooLong ? colors.colors.status.error : colors.colors.accent.primary }} className="font-bold text-lg">
                        {calculateDuration(formData.start_time, formData.end_time)}
                        {isTooLong && <span className="text-xs font-normal block text-red-500">Exceeds 12h limit</span>}
                      </p>
                    );
                  })()}
                </div>
              )}

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
                  {editingSleep ? "Save Changes" : "Log Sleep"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {sleepToDelete !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary,
            }}
            className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 animate-in fade-in zoom-in duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div
                style={{ color: colors.colors.status.error }}
                className="mb-4 p-3 bg-red-100 rounded-full"
              >
                <Icons.Alert />
              </div>
              <h3
                style={{ color: colors.colors.text.primary }}
                className="text-xl font-bold mb-2"
              >
                Delete Record?
              </h3>
              <p style={{ color: colors.colors.text.secondary }} className="text-sm mb-6">
                Are you sure you want to delete this sleep record?
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelDelete}
                  style={{
                    color: colors.colors.text.secondary,
                    borderColor: colors.colors.border.secondary
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border font-medium text-sm hover:bg-gray-100/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium text-sm bg-red-500 hover:bg-red-600 shadow-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}