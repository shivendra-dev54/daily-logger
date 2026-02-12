"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { tasksAPI } from "@/lib/axios";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";

// --- Interfaces ---
interface Task {
  id: number;
  title: string;
  body: string;
  status: "P" | "C"; // P = Pending, C = Completed
  due_date: string;
}

// --- Icons ---
const Icons = {
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Undo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Alert: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
};

export default function TasksPage() {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);

  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete Confirmation State
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    due_date: "",
  });

  // --- Effects ---
  useEffect(() => {
    fetchTasks();
  }, []);

  // --- Handlers ---

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksAPI.getAll();
      if (res.data.status) {
        setTasks(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch tasks");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      const date = new Date(task.due_date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      const formattedDate = date.toISOString().slice(0, 16);

      setFormData({
        title: task.title,
        body: task.body,
        due_date: formattedDate,
      });
    } else {
      setEditingTask(null);
      setFormData({ title: "", body: "", due_date: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({ title: "", body: "", due_date: "" });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const payload = { ...formData, status: editingTask.status };
        await tasksAPI.update(editingTask.id, payload);
        toast.success("Task updated successfully");
      } else {
        await tasksAPI.create(formData);
        toast.success("Task created successfully");
      }
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      toast.error("Operation failed");
      console.log(error);
    }
  };

  // -- Delete Handlers --
  const confirmDelete = (id: number) => {
    setTaskToDelete(id);
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;
    try {
      await tasksAPI.delete(taskToDelete);
      toast.success("Task deleted");
      setTasks(tasks.filter((t) => t.id !== taskToDelete));
      setTaskToDelete(null);
    } catch (error) {
      toast.error("Failed to delete task");
      console.log(error);
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "P" ? "C" : "P";
    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks as Task[]);

    try {
      await tasksAPI.update(task.id, {
        title: task.title,
        body: task.body,
        due_date: task.due_date,
        status: newStatus,
      });
      toast.success(newStatus === "C" ? "Task completed! 🎉" : "Task marked as pending");
    } catch (error) {
      setTasks(tasks); // Revert
      toast.error("Failed to update status");
      console.log(error);
    }
  };

  // --- Filtering & Sorting ---
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (filter === "pending") return task.status === "P";
      if (filter === "completed") return task.status === "C";
      return true;
    })
    .sort((a, b) => {
      // 1. Primary Sort: Status (Pending 'P' first, Completed 'C' last)
      if (a.status !== b.status) {
        return a.status === "P" ? -1 : 1;
      }
      // 2. Secondary Sort: Due Date (Earliest first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1
              style={{ color: colors.colors.text.primary }}
              className="text-3xl font-bold tracking-tight"
            >
              Task Management
            </h1>
            <p style={{ color: colors.colors.text.secondary }} className="mt-1">
              Organize your daily objectives efficiently.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            style={{ backgroundColor: colors.colors.accent.primary }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Icons.Plus />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            borderColor: colors.colors.border.primary,
            backgroundColor: colors.colors.bg.card
          }}
          className="flex p-1 rounded-lg border w-full md:w-fit mb-8 overflow-hidden"
        >
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                backgroundColor: filter === f ? colors.colors.accent.primary : "transparent",
                color: filter === f ? "#ffffff" : colors.colors.text.secondary,
              }}
              className="flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-colors capitalize"
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div style={{ color: colors.colors.accent.primary }} className="animate-spin">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            </div>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.colors.bg.card,
              borderColor: colors.colors.border.primary
            }}
            className="rounded-xl border border-dashed p-12 text-center"
          >
            <p style={{ color: colors.colors.text.secondary }}>No tasks found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  backgroundColor: colors.colors.bg.card,
                  borderColor: task.status === "C" ? colors.colors.status.success : colors.colors.border.primary,
                }}
                className={`group relative flex flex-col justify-between rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${task.status === "C" ? "opacity-60 grayscale-[0.5]" : "opacity-100"
                  }`}
              >
                {/* Card Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      style={{
                        backgroundColor: task.status === "C" ? colors.colors.status.success + "20" : colors.colors.accent.light + "20",
                        color: task.status === "C" ? colors.colors.status.success : colors.colors.accent.primary
                      }}
                      className="text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                    >
                      {task.status === "C" ? "Completed" : "Pending"}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(task)}
                        style={{ color: colors.colors.text.secondary }}
                        className="p-1.5 rounded-md hover:bg-gray-100/10 transition-colors"
                        title="Edit"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() => confirmDelete(task.id)}
                        style={{ color: colors.colors.status.error }}
                        className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>

                  <h3
                    style={{
                      color: colors.colors.text.primary,
                      textDecoration: task.status === "C" ? "line-through" : "none"
                    }}
                    className="text-lg font-bold mb-2 line-clamp-1"
                  >
                    {task.title}
                  </h3>
                  <p
                    style={{ color: colors.colors.text.secondary }}
                    className="text-sm line-clamp-3 leading-relaxed"
                  >
                    {task.body}
                  </p>
                </div>

                {/* Card Footer */}
                <div
                  style={{ borderTopColor: colors.colors.border.primary }}
                  className="pt-4 mt-auto border-t flex items-center justify-between"
                >
                  <div
                    style={{ color: colors.colors.text.tertiary }}
                    className="flex items-center text-xs font-medium"
                  >
                    <span className="mr-1.5"><Icons.Calendar /></span>
                    {formatDate(task.due_date)}
                  </div>

                  <button
                    onClick={() => toggleStatus(task)}
                    style={{
                      borderColor: task.status === "C" ? colors.colors.text.secondary : colors.colors.accent.primary,
                      color: task.status === "C" ? colors.colors.text.secondary : colors.colors.accent.primary,
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-opacity-5 transition-all"
                  >
                    {task.status === "C" ? (
                      <>
                        <Icons.Undo /> Undo
                      </>
                    ) : (
                      <>
                        <Icons.Check /> Complete
                      </>
                    )}
                  </button>
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
            <div
              style={{ borderBottomColor: colors.colors.border.primary }}
              className="p-6 border-b flex justify-between items-center"
            >
              <h2 style={{ color: colors.colors.text.primary }} className="text-xl font-bold">
                {editingTask ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ color: colors.colors.text.secondary }}
                className="p-2 hover:bg-gray-100/10 rounded-full transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  style={{
                    backgroundColor: colors.colors.bg.elevated,
                    borderColor: colors.colors.border.secondary,
                    color: colors.colors.text.primary,
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all text-sm resize-none"
                  placeholder="Add details..."
                />
              </div>

              <div>
                <label style={{ color: colors.colors.text.secondary }} className="block text-sm font-medium mb-1.5">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Custom Delete Confirmation Modal --- */}
      {taskToDelete !== null && (
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
                Delete Task?
              </h3>
              <p style={{ color: colors.colors.text.secondary }} className="text-sm mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
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