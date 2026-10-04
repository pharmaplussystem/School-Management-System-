import React, { useState } from 'react';
import {
  CalendarCheck,
  Check,
  Clock,
  Shield,
  Download,
  Save,
  CheckCircle2,
  Users,
  Printer,
  UserCheck,
  Filter,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, StaffAttendanceRecord } from '../../types';
import { downloadCSV, printContent } from '../../utils/printAndDownload';

export const AttendanceView: React.FC = () => {
  const {
    students,
    classes,
    streams,
    attendance,
    staff,
    staffAttendance,
    saveAttendanceBatch,
    saveStaffAttendanceBatch,
    currentUser,
    schoolProfile,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'staff'>('students');

  // ==========================================
  // STUDENT ATTENDANCE STATE
  // ==========================================
  const [selectedDate, setSelectedDate] = useState('2026-10-01');
  const [selectedClass, setSelectedClass] = useState('P.7');
  const [selectedStream, setSelectedStream] = useState('ALL');

  const classStudents = students.filter((s) => {
    const matchesClass = s.class_name === selectedClass;
    const matchesStream = selectedStream === 'ALL' || s.stream_name === selectedStream;
    return matchesClass && matchesStream && s.status === 'Active';
  });

  const [localStatuses, setLocalStatuses] = useState<{
    [studentId: string]: { status: 'Present' | 'Absent' | 'Late' | 'Excused'; reason: string };
  }>(() => {
    const map: any = {};
    classStudents.forEach((st) => {
      const existing = attendance.find((a) => a.student_id === st.id && a.date === '2026-10-01');
      map[st.id] = {
        status: existing ? existing.status : 'Present',
        reason: existing?.reason || '',
      };
    });
    return map;
  });

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    const newStudents = students.filter((s) => s.class_name === newClass && s.status === 'Active');
    const map: any = {};
    newStudents.forEach((st) => {
      const existing = attendance.find((a) => a.student_id === st.id && a.date === selectedDate);
      map[st.id] = {
        status: existing ? existing.status : 'Present',
        reason: existing?.reason || '',
      };
    });
    setLocalStatuses(map);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const map: any = {};
    classStudents.forEach((st) => {
      const existing = attendance.find((a) => a.student_id === st.id && a.date === newDate);
      map[st.id] = {
        status: existing ? existing.status : 'Present',
        reason: existing?.reason || '',
      };
    });
    setLocalStatuses(map);
  };

  const setStatus = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setLocalStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const setReason = (studentId: string, reason: string) => {
    setLocalStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
  };

  const markAllStudents = (status: 'Present' | 'Absent') => {
    const map: any = {};
    classStudents.forEach((st) => {
      map[st.id] = {
        status,
        reason: localStatuses[st.id]?.reason || '',
      };
    });
    setLocalStatuses(map);
  };

  const [isSavingStudents, setIsSavingStudents] = useState(false);
  const handleSaveStudentBatch = async () => {
    setIsSavingStudents(true);
    try {
      const recordsToSave: AttendanceRecord[] = classStudents.map((st) => {
        const current = localStatuses[st.id] || { status: 'Present', reason: '' };
        return {
          id: `att-${selectedDate}-${st.id}`,
          date: selectedDate,
          student_id: st.id,
          student_name: `${st.first_name} ${st.last_name}`,
          admission_number: st.admission_number,
          class_name: st.class_name,
          stream_name: st.stream_name,
          status: current.status,
          reason: current.reason,
          recorded_by: currentUser.full_name,
          sync_status: 'pending',
        };
      });

      await saveAttendanceBatch(recordsToSave);
    } finally {
      setIsSavingStudents(false);
    }
  };

  const handleExportStudentCSV = () => {
    const headers = ['Date', 'Admission No', 'Student Name', 'Class', 'Stream', 'Status', 'Reason', 'Recorded By'];
    const rows = classStudents.map((st) => {
      const curr = localStatuses[st.id] || { status: 'Present', reason: '' };
      return [
        selectedDate,
        st.admission_number,
        `${st.first_name} ${st.last_name}`,
        st.class_name,
        st.stream_name || 'N/A',
        curr.status,
        curr.reason || '',
        currentUser.full_name,
      ];
    });
    downloadCSV(`Learner_Attendance_${selectedClass}_${selectedDate}`, headers, rows);
    showToast(`Exported ${classStudents.length} learner attendance records!`, 'success');
  };

  // Student summary metrics
  const totalStudentsCount = classStudents.length;
  const presentStudentsCount = classStudents.filter((st) => (localStatuses[st.id]?.status || 'Present') === 'Present').length;
  const lateStudentsCount = classStudents.filter((st) => localStatuses[st.id]?.status === 'Late').length;
  const absentStudentsCount = classStudents.filter((st) => localStatuses[st.id]?.status === 'Absent').length;
  const studentTurnout = totalStudentsCount > 0 ? Math.round(((presentStudentsCount + lateStudentsCount) / totalStudentsCount) * 100) : 0;

  // ==========================================
  // STAFF ATTENDANCE STATE
  // ==========================================
  const [staffDate, setStaffDate] = useState('2026-10-01');
  const [staffCategoryFilter, setStaffCategoryFilter] = useState<'ALL' | 'Teaching' | 'Non-Teaching'>('ALL');
  const [staffDepartmentFilter, setStaffDepartmentFilter] = useState<string>('ALL');

  const filteredStaffMembers = staff.filter((s) => {
    const matchCategory = staffCategoryFilter === 'ALL' || s.category === staffCategoryFilter;
    const matchDept = staffDepartmentFilter === 'ALL' || s.department.toLowerCase() === staffDepartmentFilter.toLowerCase();
    return matchCategory && matchDept;
  });

  const [staffStatuses, setStaffStatuses] = useState<{
    [staffId: string]: {
      status: 'Present' | 'Absent' | 'On Leave' | 'Late' | 'Off-Duty';
      clockIn: string;
      reason: string;
    };
  }>(() => {
    const map: any = {};
    staff.forEach((stf) => {
      const existing = staffAttendance.find((a) => a.staff_id === stf.id && a.date === '2026-10-01');
      map[stf.id] = {
        status: existing ? existing.status : stf.employment_status === 'On Leave' ? 'On Leave' : 'Present',
        clockIn: existing?.clock_in_time || '07:45 AM',
        reason: existing?.reason || '',
      };
    });
    return map;
  });

  const handleStaffDateChange = (newDate: string) => {
    setStaffDate(newDate);
    const map: any = {};
    staff.forEach((stf) => {
      const existing = staffAttendance.find((a) => a.staff_id === stf.id && a.date === newDate);
      map[stf.id] = {
        status: existing ? existing.status : stf.employment_status === 'On Leave' ? 'On Leave' : 'Present',
        clockIn: existing?.clock_in_time || '07:45 AM',
        reason: existing?.reason || '',
      };
    });
    setStaffStatuses(map);
  };

  const setStaffStatus = (
    staffId: string,
    status: 'Present' | 'Absent' | 'On Leave' | 'Late' | 'Off-Duty'
  ) => {
    setStaffStatuses((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        status,
      },
    }));
  };

  const setStaffClockIn = (staffId: string, clockIn: string) => {
    setStaffStatuses((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        clockIn,
      },
    }));
  };

  const setStaffReason = (staffId: string, reason: string) => {
    setStaffStatuses((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        reason,
      },
    }));
  };

  const markAllStaff = (status: 'Present' | 'Absent') => {
    const map: any = {};
    filteredStaffMembers.forEach((stf) => {
      map[stf.id] = {
        status,
        clockIn: status === 'Present' ? '07:45 AM' : '',
        reason: staffStatuses[stf.id]?.reason || '',
      };
    });
    setStaffStatuses((prev) => ({ ...prev, ...map }));
  };

  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const handleSaveStaffBatch = async () => {
    setIsSavingStaff(true);
    try {
      const recordsToSave: StaffAttendanceRecord[] = filteredStaffMembers.map((stf) => {
        const current = staffStatuses[stf.id] || { status: 'Present', clockIn: '07:45 AM', reason: '' };
        return {
          id: `satt-${staffDate}-${stf.id}`,
          date: staffDate,
          staff_id: stf.id,
          staff_name: stf.full_name,
          staff_code: stf.staff_id,
          category: stf.category,
          department: stf.department,
          status: current.status,
          clock_in_time: current.clockIn,
          reason: current.reason,
          recorded_by: currentUser.full_name,
          sync_status: 'pending',
        };
      });

      await saveStaffAttendanceBatch(recordsToSave);
    } finally {
      setIsSavingStaff(false);
    }
  };

  const handleExportStaffCSV = () => {
    const headers = [
      'Date',
      'Staff ID',
      'Staff Name',
      'Category',
      'Department',
      'Designation',
      'Attendance Status',
      'Clock-In Time',
      'Remarks / Reason',
      'Recorded By',
    ];
    const rows = filteredStaffMembers.map((stf) => {
      const curr = staffStatuses[stf.id] || { status: 'Present', clockIn: '', reason: '' };
      return [
        staffDate,
        stf.staff_id,
        stf.full_name,
        stf.category,
        stf.department,
        stf.designation,
        curr.status,
        curr.clockIn || 'N/A',
        curr.reason || '',
        currentUser.full_name,
      ];
    });
    downloadCSV(`Staff_Attendance_Register_${staffCategoryFilter}_${staffDate}`, headers, rows);
    showToast(`Exported ${filteredStaffMembers.length} staff attendance records!`, 'success');
  };

  const handlePrintStaff = () => {
    printContent('printable-staff-attendance-register', `Staff Attendance Register - ${staffDate}`);
  };

  const handlePrintStudents = () => {
    printContent('printable-student-attendance-register', `Learner Attendance Register - ${selectedClass}`);
  };

  // Staff summary metrics
  const totalStaffCount = filteredStaffMembers.length;
  const presentStaffCount = filteredStaffMembers.filter((stf) => (staffStatuses[stf.id]?.status || 'Present') === 'Present').length;
  const lateStaffCount = filteredStaffMembers.filter((stf) => staffStatuses[stf.id]?.status === 'Late').length;
  const absentStaffCount = filteredStaffMembers.filter((stf) => staffStatuses[stf.id]?.status === 'Absent').length;
  const onLeaveStaffCount = filteredStaffMembers.filter((stf) => staffStatuses[stf.id]?.status === 'On Leave').length;
  const staffTurnout = totalStaffCount > 0 ? Math.round(((presentStaffCount + lateStaffCount) / totalStaffCount) * 100) : 0;

  const staffDepartments = Array.from(new Set(staff.map((s) => s.department).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            ATTENDANCE MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Learner Registers • Faculty & Non-Teaching Clock-In • Turnout Metrics & Downloads
          </p>
        </div>

        {/* Top View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl text-xs font-bold self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Learner Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Staff Attendance ({staff.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LEARNER ATTENDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Picker */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stream Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Stream
                </label>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="ALL">All Streams</option>
                  {streams.map((st) => (
                    <option key={st.id} value={st.name}>
                      Stream {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Actions & Export */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => markAllStudents('Present')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold transition cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAllStudents('Absent')}
                className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300 text-xs font-semibold transition cursor-pointer"
              >
                Mark All Absent
              </button>

              <button
                type="button"
                onClick={handleExportStudentCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintStudents}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Register</span>
              </button>

              <button
                type="button"
                onClick={handleSaveStudentBatch}
                disabled={isSavingStudents}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingStudents ? 'Saving...' : 'Save Register'}</span>
              </button>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Enrolled</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{totalStudentsCount} learners</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">Present</span>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{presentStudentsCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
              <span className="text-[10px] text-amber-600 font-bold uppercase">Late</span>
              <div className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">{lateStudentsCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
              <span className="text-[10px] text-red-600 font-bold uppercase">Absent</span>
              <div className="text-lg font-black text-red-700 dark:text-red-400 mt-0.5">{absentStudentsCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
              <span className="text-[10px] text-blue-600 font-bold uppercase">Turnout Rate</span>
              <div className="text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">{studentTurnout}%</div>
            </div>
          </div>

          {/* Learner Attendance Table */}
          <div
            id="printable-student-attendance-register"
            className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
          >
            <div className="hidden print:block p-4 border-b border-slate-300 text-center">
              <h2 className="text-lg font-bold text-slate-900">{schoolProfile.name}</h2>
              <h3 className="text-sm font-bold uppercase text-slate-800">
                CLASS ATTENDANCE REGISTER: {selectedClass} {selectedStream !== 'ALL' ? `(${selectedStream})` : ''}
              </h3>
              <p className="text-xs text-slate-500">Date: {selectedDate}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Learner Name</th>
                    <th className="px-4 py-3">Adm. No</th>
                    <th className="px-4 py-3">Stream</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Reason / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No active learners enrolled in {selectedClass} {selectedStream !== 'ALL' ? `(Stream ${selectedStream})` : ''}.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((st, idx) => {
                      const current = localStatuses[st.id] || { status: 'Present', reason: '' };
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {st.first_name} {st.last_name}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{st.admission_number}</td>
                          <td className="px-4 py-3 text-slate-500">{st.stream_name || 'General'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setStatus(st.id, 'Present')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  current.status === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(st.id, 'Late')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  current.status === 'Late'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-100'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(st.id, 'Absent')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  current.status === 'Absent'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(st.id, 'Excused')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                  current.status === 'Excused'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100'
                                }`}
                              >
                                Excused
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder={current.status === 'Present' ? 'Optional remark' : 'Reason for lateness/absence...'}
                              value={current.reason}
                              onChange={(e) => setReason(st.id, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STAFF ATTENDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Picker */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={staffDate}
                  onChange={(e) => handleStaffDateChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              {/* Staff Category Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Staff Category
                </label>
                <select
                  value={staffCategoryFilter}
                  onChange={(e) => setStaffCategoryFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="ALL">All Staff Members</option>
                  <option value="Teaching">Teaching Faculty</option>
                  <option value="Non-Teaching">Non-Teaching Staff</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Department
                </label>
                <select
                  value={staffDepartmentFilter}
                  onChange={(e) => setStaffDepartmentFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="ALL">All Departments</option>
                  {staffDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Actions & Export */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => markAllStaff('Present')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold transition cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAllStaff('Absent')}
                className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300 text-xs font-semibold transition cursor-pointer"
              >
                Mark All Absent
              </button>

              <button
                type="button"
                onClick={handleExportStaffCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintStaff}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Register</span>
              </button>

              <button
                type="button"
                onClick={handleSaveStaffBatch}
                disabled={isSavingStaff}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingStaff ? 'Saving...' : 'Save Staff Register'}</span>
              </button>
            </div>
          </div>

          {/* Staff Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Staff</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{totalStaffCount} staff</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">Present Today</span>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{presentStaffCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
              <span className="text-[10px] text-amber-600 font-bold uppercase">Late</span>
              <div className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">{lateStaffCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
              <span className="text-[10px] text-blue-600 font-bold uppercase">On Approved Leave</span>
              <div className="text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">{onLeaveStaffCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
              <span className="text-[10px] text-red-600 font-bold uppercase">Absent</span>
              <div className="text-lg font-black text-red-700 dark:text-red-400 mt-0.5">{absentStaffCount}</div>
            </div>
          </div>

          {/* Staff Attendance Register Table */}
          <div
            id="printable-staff-attendance-register"
            className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
          >
            <div className="hidden print:block p-4 border-b border-slate-300 text-center">
              <h2 className="text-lg font-bold text-slate-900">{schoolProfile.name}</h2>
              <h3 className="text-sm font-bold uppercase text-slate-800">
                STAFF ATTENDANCE REGISTER — {staffCategoryFilter === 'ALL' ? 'ALL STAFF' : staffCategoryFilter}
              </h3>
              <p className="text-xs text-slate-500">Date: {staffDate}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Staff Member</th>
                    <th className="px-4 py-3.5">ID Code</th>
                    <th className="px-4 py-3.5">Category & Dept</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Arrival / Clock-In</th>
                    <th className="px-4 py-3.5">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredStaffMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No staff members found matching the selected category or department.
                      </td>
                    </tr>
                  ) : (
                    filteredStaffMembers.map((stf) => {
                      const current = staffStatuses[stf.id] || {
                        status: 'Present',
                        clockIn: '07:45 AM',
                        reason: '',
                      };
                      return (
                        <tr key={stf.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3">
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {stf.full_name}
                            </div>
                            <div className="text-[10px] text-slate-400">{stf.designation}</div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                            {stf.staff_id}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stf.category}
                            </span>
                            <div className="text-[10px] text-slate-400">{stf.department}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setStaffStatus(stf.id, 'Present')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  current.status === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => setStaffStatus(stf.id, 'Late')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  current.status === 'Late'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-100'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => setStaffStatus(stf.id, 'On Leave')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  current.status === 'On Leave'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100'
                                }`}
                              >
                                On Leave
                              </button>
                              <button
                                type="button"
                                onClick={() => setStaffStatus(stf.id, 'Absent')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  current.status === 'Absent'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => setStaffStatus(stf.id, 'Off-Duty')}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                  current.status === 'Off-Duty'
                                    ? 'bg-slate-800 text-white dark:bg-slate-600'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                Off
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <input
                                type="text"
                                value={current.clockIn}
                                onChange={(e) => setStaffClockIn(stf.id, e.target.value)}
                                placeholder="07:45 AM"
                                className="w-24 px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-center"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder={
                                current.status === 'On Leave'
                                  ? 'Approved leave'
                                  : current.status === 'Present'
                                  ? 'On duty'
                                  : 'Reason for absence/lateness'
                              }
                              value={current.reason}
                              onChange={(e) => setStaffReason(stf.id, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
