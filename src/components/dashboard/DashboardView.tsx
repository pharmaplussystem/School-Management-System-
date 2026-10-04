import React from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC<{ onOpenSyncCenter: () => void }> = ({ onOpenSyncCenter }) => {
  const {
    schoolProfile,
    students,
    teachers,
    classes,
    attendance,
    payments,
    feeStructures,
    notifications,
    syncState,
    setActiveView,
    activeRole,
  } = useApp();

  // Metrics
  const totalStudents = students.length;
  const maleStudents = students.filter((s) => s.gender === 'Male').length;
  const femaleStudents = students.filter((s) => s.gender === 'Female').length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  // Attendance today
  const todayStr = '2026-10-01';
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 95;

  // Finances
  const totalCollectedUgx = payments.reduce((sum, p) => sum + p.amount_ugx, 0);
  const expectedTotalUgx = 4250000;
  const outstandingUgx = Math.max(0, expectedTotalUgx - totalCollectedUgx);
  const studentsWithBalance = 2; // e.g. Namubiru and Okello

  // Class enrollment distribution
  const classCounts: { [key: string]: number } = {};
  classes.forEach((c) => {
    classCounts[c.name] = students.filter((s) => s.class_name === c.name).length;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & School Identity Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase">
                {schoolProfile.current_academic_year} • {schoolProfile.current_term}
              </span>
              <span className="text-xs text-blue-200">
                {schoolProfile.district}, {schoolProfile.country}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {schoolProfile.name}
            </h1>
            <p className="text-sm text-blue-200 mt-1 max-w-xl italic">
              "{schoolProfile.motto}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveView('students')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Admit Student</span>
            </button>
            <button
              onClick={() => setActiveView('attendance')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-xs transition"
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => setActiveView('fees')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-xs transition"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Record Fees</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => setActiveView('students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500">enrolled</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span>👦 Boys: <strong className="text-slate-700 dark:text-slate-200">{maleStudents}</strong></span>
            <span>👧 Girls: <strong className="text-slate-700 dark:text-slate-200">{femaleStudents}</strong></span>
          </div>
        </div>

        {/* Fees Collected in UGX */}
        <div
          onClick={() => setActiveView('fees')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fees Collected (UGX)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate block">
              UGX {totalCollectedUgx.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span>Outstanding:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              UGX {outstandingUgx.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div
          onClick={() => setActiveView('attendance')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {attendanceRate}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Good Turnout</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span>Marked Today:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{todayAttendance.length} learners</span>
          </div>
        </div>

        {/* Teaching Staff & Classes */}
        <div
          onClick={() => setActiveView('classes')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Teachers & Classes
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalTeachers}
            </span>
            <span className="text-xs text-slate-500">Teachers / {totalClasses} Classes</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span>Ugandan Curriculum:</span>
            <span className="text-blue-600 font-bold">P.1–P.7 & S.1–S.4</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Enrollment Breakdown */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Learner Enrollment Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primary and Secondary classes active at EduCore
              </p>
            </div>
            <button
              onClick={() => setActiveView('classes')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Manage Classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Bars for classes */}
          <div className="space-y-3">
            {classes.slice(0, 7).map((cls) => {
              const count = classCounts[cls.name] || 0;
              const maxVal = Math.max(...Object.values(classCounts), 4);
              const percentage = Math.round((count / maxVal) * 100);

              return (
                <div key={cls.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {cls.name} — {cls.description}
                    </span>
                    <span className="font-semibold text-slate-500">
                      {count} {count === 1 ? 'student' : 'students'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync & Offline Resilience Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Offline-First Data Engine
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Designed specifically for Ugandan network conditions. Take attendance, record marks, and accept fee payments anytime—without waiting for network connectivity.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Local Queue:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {syncState.pendingCount} pending actions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Storage Layer:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">IndexedDB Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cloud Sync:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Supabase Connected</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={onOpenSyncCenter}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Open Sync Center & Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Payments (UGX) & Urgent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Payments */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Fees & Payments (UGX)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official receipts issued by Bursar
              </p>
            </div>
            <button
              onClick={() => setActiveView('fees')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {payments.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {p.student_name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {p.receipt_number} • {p.payment_method} • {p.payment_date}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                    UGX {p.amount_ugx.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    {p.class_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Announcements */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                School Bulletins & Notices
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cached offline for parents, staff, and learners
              </p>
            </div>
            <button
              onClick={() => setActiveView('communication')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>All Notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 2).map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs ${
                  n.is_urgent
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  {n.is_urgent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                      URGENT
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {n.message}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-medium">
                  {n.sender_name} • {new Date(n.created_at).toLocaleDateString('en-UG')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
