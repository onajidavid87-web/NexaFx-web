"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Megaphone, X } from "lucide-react";
import { getAnnouncements, createAnnouncement, toggleAnnouncement, deleteAnnouncement, type Announcement, type AnnouncementType } from "@/lib/api/admin";
import { getRequestErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const typeColors: Record<AnnouncementType, { bg: string; text: string; dot: string }> = {
  info: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  success: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  error: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<AnnouncementType>("info");
  const [formStartAt, setFormStartAt] = useState("");
  const [formEndAt, setFormEndAt] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(getRequestErrorMessage(err, { fallback: "Failed to load announcements" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formMessage.trim() || !formStartAt || !formEndAt) return;
    try {
      await createAnnouncement({
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
        isActive: true,
        startAt: formStartAt,
        endAt: formEndAt,
      });
      setShowCreate(false);
      setFormTitle("");
      setFormMessage("");
      setFormType("info");
      setFormStartAt("");
      setFormEndAt("");
      await fetchData();
    } catch (err) {
      alert(getRequestErrorMessage(err, { fallback: "Failed to create announcement" }));
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const updated = await toggleAnnouncement(id, isActive);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? updated : a)),
      );
    } catch (err) {
      alert(getRequestErrorMessage(err, { fallback: "Failed to update announcement" }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(getRequestErrorMessage(err, { fallback: "Failed to delete announcement" }));
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto mt-8">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="md:p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2 ps-3 py-1 bg-[#f5f5f5] text-[#595959] rounded-md min-w-64 w-full md:max-w-70">
          <Search />
          <input
            type="text"
            placeholder="Search announcements..."
            className="outline-0 py-2 h-full bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex gap-2 items-center px-4 py-2 rounded-md bg-[#FFD552] text-black text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Create Announcement</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              placeholder="Title"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
            <textarea
              placeholder="Message"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
            />
            <div className="flex gap-2">
              {(["info", "warning", "success", "error"] as AnnouncementType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFormType(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium capitalize border",
                    formType === t
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formStartAt}
                  onChange={(e) => setFormStartAt(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formEndAt}
                  onChange={(e) => setFormEndAt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formTitle.trim() || !formMessage.trim() || !formStartAt || !formEndAt}
                className="px-4 py-2 text-sm rounded-lg bg-[#FFD552] text-black font-semibold disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <Megaphone className="w-8 h-8 text-gray-300" />
            <p>No announcements found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((a) => {
              const colors = typeColors[a.type];
              return (
                <div key={a.id} className="p-4 md:p-6 flex items-start gap-4">
                  <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", colors.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                        {a.type}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                          a.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500",
                        )}
                      >
                        {a.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.startAt).toLocaleDateString()} - {new Date(a.endAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(a.id, !a.isActive)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                        a.isActive
                          ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                          : "border-green-200 text-green-700 hover:bg-green-50",
                      )}
                    >
                      {a.isActive ? "Deactivate" : "Activate"}
                    </button>
                    {deleteConfirm === a.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(a.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
