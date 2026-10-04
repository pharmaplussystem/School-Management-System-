import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Send,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommunicationView: React.FC = () => {
  const { notifications, addNotification, currentUser } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_role: 'All',
    is_urgent: false,
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    await addNotification({
      title: formData.title,
      message: formData.message,
      target_role: formData.target_role,
      sender_name: currentUser.full_name,
      is_urgent: formData.is_urgent,
    });

    setIsAddModalOpen(false);
    setFormData({ title: '', message: '', target_role: 'All', is_urgent: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            School Communications & Bulletins
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Instant School Broadcasts • Mobile Notifications & SMS Drafts • Offline Local Storage
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Bulletins Feed */}
      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-2xl border transition ${
              n.is_urgent
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 shadow-xs'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Target: {n.target_role}
                </span>
                {n.is_urgent && (
                  <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    HIGH PRIORITY
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(n.created_at).toLocaleDateString('en-UG')}
              </span>
            </div>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              {n.title}
            </h3>

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
              {n.message}
            </p>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Author: <strong className="text-slate-600 dark:text-slate-300">{n.sender_name}</strong></span>
              <span className="text-emerald-600 font-semibold text-[10px]">Saved to Local Cache</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Publish School Announcement
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-4 sm:p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. End of Term Visitation Day & Mid-Term Circular"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Audience
                  </label>
                  <select
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="All">All School (General)</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Teachers">Teaching Staff Only</option>
                    <option value="Students">Learners / Students</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="urgent-check"
                    checked={formData.is_urgent}
                    onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="urgent-check" className="font-bold text-amber-600 cursor-pointer">
                    Mark as Urgent Notice
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Announcement Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type the full circular or notice details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-700 text-white font-bold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
