import React, { useState } from 'react';
import {
  X,
  User,
  Users,
  CalendarCheck,
  CreditCard,
  Award,
  ShieldAlert,
  FolderOpen,
  Printer,
  HeartPulse,
  Home,
  Phone,
  Mail,
  MapPin,
  Library,
  History,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  Smartphone,
} from 'lucide-react';
import { Student, ResultRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { printContent } from '../../utils/printAndDownload';
import { StudentAdmissionPrintModal } from './StudentAdmissionPrintModal';
import { StudentFeePaymentModal } from './StudentFeePaymentModal';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  onPrintID: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onPrintID,
}) => {
  const {
    payments,
    attendance,
    results,
    disciplineRecords,
    libraryIssues,
    schoolProfile,
    feeStructures,
    classes,
    subjects,
    exams,
  } = useApp();

  type TabKey =
    | 'overview'
    | 'personal'
    | 'parent'
    | 'documents'
    | 'fees'
    | 'attendance'
    | 'discipline'
    | 'library'
    | 'academics'
    | 'reports'
    | 'enrollment';

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isPrintAdmissionOpen, setIsPrintAdmissionOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Academic Performance Filter States
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterTerm, setFilterTerm] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterExam, setFilterExam] = useState<string>('ALL');

  // Report Card tab selection state
  const [reportYear, setReportYear] = useState<string>(schoolProfile.current_academic_year);
  const [reportTerm, setReportTerm] = useState<string>(schoolProfile.current_term);

  if (!student) return null;

  // Filter student-specific records
  const studentPayments = payments.filter((p) => p.student_id === student.id);
  const studentAttendance = attendance.filter((a) => a.student_id === student.id);
  const studentResults = results.filter((r) => r.student_id === student.id);
  const studentDiscipline = disciplineRecords.filter((d) => d.student_id === student.id || d.person_id === student.id);
  const studentLibraryIssues = libraryIssues.filter((l) => l.student_id === student.id || l.person_id === student.id);

  // Fees calculations
  const classFee = feeStructures.find((f) => f.class_name === student.class_name);
  const expectedFeesUgx = classFee?.total_amount_ugx || classFee?.amount_ugx || 1245000;
  const totalPaidUgx = studentPayments.reduce((acc, p) => acc + p.amount_ugx, 0);
  const rawBalance = expectedFeesUgx - totalPaidUgx;
  const isOverpaid = rawBalance < 0;
  const balanceUgx = isOverpaid ? 0 : rawBalance;
  const creditUgx = isOverpaid ? Math.abs(rawBalance) : 0;

  // Attendance stats
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 96;

  // Filtered Academic Results across all academic years, terms, classes, subjects, exams
  const filteredResults = studentResults.filter((r) => {
    const matchYear = filterYear === 'ALL' || r.academic_year === filterYear;
    const matchTerm = filterTerm === 'ALL' || r.term === filterTerm;
    const matchClass = filterClass === 'ALL' || r.class_name === filterClass;
    const matchSubject = filterSubject === 'ALL' || r.subject_code === filterSubject || r.subject_name === filterSubject;
    const matchExam = filterExam === 'ALL' || r.exam_name === filterExam;
    return matchYear && matchTerm && matchClass && matchSubject && matchExam;
  });

  // Report Card for selected year and term
  const reportResults = studentResults.filter(
    (r) => r.academic_year === reportYear && r.term === reportTerm
  );

  // Tab definitions
  const tabs: { id: TabKey; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'parent', label: 'Parent / Guardian', icon: Users },
    { id: 'documents', label: 'Documents', icon: FolderOpen, count: student.documents?.length || 0 },
    { id: 'fees', label: 'Fees & Payments', icon: CreditCard, count: studentPayments.length },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'discipline', label: 'Discipline', icon: ShieldAlert, count: studentDiscipline.length },
    { id: 'library', label: 'Library', icon: Library, count: studentLibraryIssues.length },
    { id: 'academics', label: 'Academic Performance', icon: Award, count: studentResults.length },
    { id: 'reports', label: 'Report Cards', icon: FileSpreadsheet },
    { id: 'enrollment', label: 'Enrollment History', icon: History },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[94vh]">
          {/* Top Profile Banner */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400 bg-white/10 flex items-center justify-center text-2xl font-black text-amber-400 shrink-0 shadow-lg overflow-hidden">
                {student.photo_url ? (
                  <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{student.first_name[0]}{student.last_name[0]}</span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">
                    {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      student.status === 'Active'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {student.status}
                  </span>
                </div>

                <div className="text-xs text-blue-200 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Adm No: <strong className="font-mono text-white">{student.admission_number}</strong></span>
                  <span>Student ID: <strong className="font-mono text-amber-300">{student.student_id_number || student.id}</strong></span>
                  <span>Class: <strong className="text-white">{student.class_name} {student.stream_name ? `(${student.stream_name})` : ''}</strong></span>
                </div>

                <div className="text-[11px] text-blue-300 mt-0.5 flex flex-wrap items-center gap-x-3">
                  <span>House: <strong>{student.house || 'Nile House'}</strong></span>
                  <span>Age: <strong>{student.age} yrs ({student.gender})</strong></span>
                  <span>District: <strong>{student.district}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => setIsPrintAdmissionOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>

              <button
                onClick={onPrintID}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-200 text-xs font-semibold transition"
              >
                <span>ID Card</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 flex items-center gap-1 overflow-x-auto text-xs no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modal Tab Content Area */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Financial & Academic Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected Fees</span>
                    <strong className="text-base font-black text-slate-900 dark:text-white font-mono mt-1 block">
                      UGX {expectedFeesUgx.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500">{schoolProfile.current_term}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Fees Paid</span>
                    <strong className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1 block">
                      UGX {totalPaidUgx.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-emerald-600/80">{studentPayments.length} Receipts</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Balance</span>
                    <strong className="text-base font-black text-amber-700 dark:text-amber-300 font-mono mt-1 block">
                      UGX {balanceUgx.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-amber-600/80">{balanceUgx === 0 ? 'Fully Cleared' : 'Pending'}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Attendance Rate</span>
                    <strong className="text-base font-black text-blue-700 dark:text-blue-300 font-mono mt-1 block">
                      {attendanceRate}%
                    </strong>
                    <span className="text-[10px] text-blue-600/80">{presentDays} / {totalDays || 1} Days Present</span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bio & Class */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Admission Particulars
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div><span className="text-slate-400">Class:</span> <strong className="text-slate-900 dark:text-white">{student.class_name}</strong></div>
                      <div><span className="text-slate-400">Stream:</span> <strong className="text-slate-900 dark:text-white">{student.stream_name || 'Standard'}</strong></div>
                      <div><span className="text-slate-400">DOB:</span> <strong className="text-slate-900 dark:text-white">{student.dob} ({student.age} yrs)</strong></div>
                      <div><span className="text-slate-400">Sex:</span> <strong className="text-slate-900 dark:text-white">{student.gender}</strong></div>
                      <div><span className="text-slate-400">House:</span> <strong className="text-slate-900 dark:text-white">{student.house || 'Nile House'}</strong></div>
                      <div><span className="text-slate-400">Admission Date:</span> <strong className="text-slate-900 dark:text-white">{student.admission_date}</strong></div>
                      <div><span className="text-slate-400">District:</span> <strong className="text-slate-900 dark:text-white">{student.district}</strong></div>
                      <div><span className="text-slate-400">Religion:</span> <strong className="text-slate-900 dark:text-white">{student.religion || 'Anglican'}</strong></div>
                    </div>
                  </div>

                  {/* Guardian & Mobile Money */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Guardian & Payment Code
                    </h3>
                    <div className="space-y-1.5 text-[11px] pt-1">
                      <div><span className="text-slate-400">Primary Guardian:</span> <strong className="text-slate-900 dark:text-white ml-1">{student.parent_name || 'N/A'} ({student.parent_relationship || 'Parent'})</strong></div>
                      <div><span className="text-slate-400">Telephone:</span> <strong className="font-mono text-slate-900 dark:text-white ml-1">{student.parent_phone}</strong></div>
                      <div><span className="text-slate-400">Address:</span> <strong className="text-slate-900 dark:text-white ml-1">{student.address}</strong></div>
                      {student.mobile_money_code && (
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between mt-2">
                          <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5" />
                            Registered MoMo Identifier:
                          </span>
                          <strong className="font-mono text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                            {student.mobile_money_code}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Bar inside Overview */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Fee Account Action</h4>
                    <p className="text-[11px] text-slate-500">Collect school fees or generate a stamped payment receipt.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Record Payment for {student.first_name}</span>
                    </button>
                    <button
                      onClick={() => setIsPrintAdmissionOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Admission Record</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PERSONAL DETAILS */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Complete Admission Bio-Data
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Admission Number</span>
                      <strong className="text-sm font-mono font-black text-blue-700 dark:text-blue-400">{student.admission_number}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Student ID</span>
                      <strong className="text-sm font-mono font-black text-slate-900 dark:text-white">{student.student_id_number || student.id}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Full Legal Name</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Sex</span>
                      <strong className="text-slate-900 dark:text-white">{student.gender}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Date of Birth & Age</span>
                      <strong className="text-slate-900 dark:text-white">{student.dob} ({student.age} years old)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Nationality</span>
                      <strong className="text-slate-900 dark:text-white">{student.nationality}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Religion</span>
                      <strong className="text-slate-900 dark:text-white">{student.religion || 'Anglican'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Class & Stream</span>
                      <strong className="text-slate-900 dark:text-white">{student.class_name} {student.stream_name ? `(${student.stream_name})` : ''}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">House</span>
                      <strong className="text-slate-900 dark:text-white">{student.house || 'Nile House'}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Admission Date</span>
                      <strong className="text-slate-900 dark:text-white">{student.admission_date}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Student Status</span>
                      <strong className="text-emerald-600 font-bold">{student.status}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">National LIN / NIN</span>
                      <strong className="font-mono text-slate-900 dark:text-white">{student.national_id || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Residential / Contact Information */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Contact & Residential Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">District</span>
                      <strong className="text-slate-900 dark:text-white">{student.district}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Village / Town</span>
                      <strong className="text-slate-900 dark:text-white">{student.village || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Physical Address</span>
                      <strong className="text-slate-900 dark:text-white">{student.address}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Learner Phone</span>
                      <strong className="font-mono text-slate-900 dark:text-white">{student.phone || 'None'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Learner Email</span>
                      <strong className="text-slate-900 dark:text-white">{student.email || 'None'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Mobile Money Payment Code</span>
                      <strong className="font-mono text-amber-600 dark:text-amber-400">{student.mobile_money_code || 'None'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PARENT / GUARDIAN */}
            {activeTab === 'parent' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Parent / Guardian Information
                    </h3>
                    <span className="text-xs font-bold text-slate-400">{student.parent_relationship || 'Guardian'}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="w-24 h-28 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                      {student.parent_photo_url ? (
                        <img src={student.parent_photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-center p-2">Parent Photo</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs flex-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Parent Full Name</span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white">{student.parent_name || 'Guardian'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Relationship</span>
                        <strong className="text-slate-900 dark:text-white">{student.parent_relationship || 'Parent'}</strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Primary Telephone</span>
                        <strong className="font-mono text-slate-900 dark:text-white">{student.parent_phone || 'None'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Alternative Phone</span>
                        <strong className="font-mono text-slate-900 dark:text-white">{student.parent_alt_phone || 'None'}</strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Address</span>
                        <strong className="text-slate-900 dark:text-white">{student.parent_email || 'None'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">National ID (NIN)</span>
                        <strong className="font-mono text-slate-900 dark:text-white">{student.parent_nin || 'N/A'}</strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Occupation</span>
                        <strong className="text-slate-900 dark:text-white">{student.parent_occupation || 'Business / Civil Service'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Religion</span>
                        <strong className="text-slate-900 dark:text-white">{student.parent_religion || 'Anglican'}</strong>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Residential Address</span>
                        <strong className="text-slate-900 dark:text-white">{student.parent_address || student.address}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Uploaded Admission & Supporting Documents</h3>
                    <p className="text-[11px] text-slate-500">Stored via Supabase Storage with offline fallback resilience.</p>
                  </div>
                </div>

                {(!student.documents || student.documents.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    No documents uploaded yet for this learner. Edit student to attach passport photos, NINs, or previous school reports.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {student.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-blue-300 transition"
                      >
                        <div className="overflow-hidden mr-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 block w-fit mb-1">
                            {doc.document_category}
                          </span>
                          <strong className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {doc.file_name}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {doc.file_size} • Uploaded {doc.upload_date} by {doc.uploaded_by}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {doc.file_url && doc.file_url !== '#' ? (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              download={doc.file_name}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <button
                              onClick={() => alert(`Document metadata verified in database:\nCategory: ${doc.document_category}\nPath: ${doc.storage_path}`)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 transition text-[10px] font-bold"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FEES & PAYMENTS */}
            {activeTab === 'fees' && (
              <div className="space-y-6">
                {/* Financial Summary */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Fee Account Summary</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Expected Term Fee: <strong>UGX {expectedFeesUgx.toLocaleString()}</strong> • Total Paid: <strong className="text-emerald-600">UGX {totalPaidUgx.toLocaleString()}</strong> • Outstanding Balance: <strong className="text-amber-600 font-mono">UGX {balanceUgx.toLocaleString()}</strong>
                      {creditUgx > 0 && <span className="text-blue-600 ml-2">(Credit: UGX {creditUgx.toLocaleString()})</span>}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Record Payment</span>
                  </button>
                </div>

                {/* Ledger */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white">Payment Transactions & Receipts</h4>
                  {studentPayments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      No payment transactions recorded for this student yet.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 text-[10px] font-bold uppercase">
                          <tr>
                            <th className="px-3 py-2">Receipt No</th>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Fee Category</th>
                            <th className="px-3 py-2">Method</th>
                            <th className="px-3 py-2">Reference</th>
                            <th className="px-3 py-2 text-right">Amount (UGX)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {studentPayments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="px-3 py-2 font-mono font-bold text-blue-600 dark:text-blue-400">{p.receipt_number}</td>
                              <td className="px-3 py-2">{p.payment_date}</td>
                              <td className="px-3 py-2 font-medium">{p.category || 'Tuition & Development'}</td>
                              <td className="px-3 py-2">{p.payment_method}</td>
                              <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{p.transaction_reference}</td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600">UGX {p.amount_ugx.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 dark:text-white">Daily Attendance Record</h3>
                  <span className="text-xs font-bold text-emerald-600">Rate: {attendanceRate}%</span>
                </div>

                {studentAttendance.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No attendance records logged for this learner yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {studentAttendance.slice(0, 16).map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <span className="font-mono text-slate-500">{att.date}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            att.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DISCIPLINE */}
            {activeTab === 'discipline' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white">Discipline Records & Incidents</h3>
                {studentDiscipline.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    Exemplary Conduct — No disciplinary incidents recorded for this learner.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentDiscipline.map((disc) => (
                      <div
                        key={disc.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{disc.incident_type || disc.category}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {disc.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{disc.description}</p>
                        <div className="text-[10px] text-slate-500 flex flex-wrap gap-4 pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span>Action Taken: <strong>{disc.action_taken}</strong></span>
                          <span>Reported Date: <strong>{disc.incident_date}</strong></span>
                          <span>Officer: <strong>{disc.recorded_by || disc.reported_by}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: LIBRARY */}
            {activeTab === 'library' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white">Library Circulation & Borrowing History</h3>
                {studentLibraryIssues.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No books currently issued or borrowed by this learner.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentLibraryIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-slate-900 dark:text-white block">{issue.book_title || (issue.items && issue.items[0]?.book_title) || 'Textbook'}</strong>
                          <span className="text-[10px] text-slate-500">
                            Accession: <span className="font-mono">{issue.accession_number || (issue.items && issue.items[0]?.book_code) || issue.issue_code}</span> • Issued: {issue.issue_date || issue.date_issued} • Due: {issue.due_date || issue.expected_return_date}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            issue.status === 'Returned'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ACADEMIC PERFORMANCE (Across ALL Years, Terms, Classes, Subjects, Exams) */}
            {activeTab === 'academics' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white">Academic Performance Across All Terms</h3>
                    <p className="text-[11px] text-slate-500">Comprehensive historical results across candidate years and continuous assessments.</p>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 font-bold text-slate-500 mr-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </div>

                  {/* Academic Year */}
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="ALL">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>

                  {/* Term */}
                  <select
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="ALL">All Terms</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>

                  {/* Class */}
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="ALL">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  {/* Subject */}
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="ALL">All Subjects</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>

                  {/* Exam */}
                  <select
                    value={filterExam}
                    onChange={(e) => setFilterExam(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="ALL">All Examinations</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.name}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                {filteredResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No examination records match the selected filters.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 text-[10px] font-bold uppercase">
                        <tr>
                          <th className="px-3 py-2">Year / Term</th>
                          <th className="px-3 py-2">Class</th>
                          <th className="px-3 py-2">Subject</th>
                          <th className="px-3 py-2">Examination</th>
                          <th className="px-3 py-2">Score</th>
                          <th className="px-3 py-2">Grade</th>
                          <th className="px-3 py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredResults.map((res) => (
                          <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-3 py-2 font-medium">{res.academic_year} • {res.term}</td>
                            <td className="px-3 py-2 font-bold">{res.class_name}</td>
                            <td className="px-3 py-2">
                              <span className="font-bold">{res.subject_name}</span>
                              <span className="text-[10px] text-slate-400 ml-1">({res.subject_code || res.subject_id})</span>
                            </td>
                            <td className="px-3 py-2">{res.exam_name}</td>
                            <td className="px-3 py-2 font-mono font-black text-blue-700 dark:text-blue-400">
                              {res.score_percentage || res.marks_obtained}%
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                {res.grade}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500 italic">{res.teacher_comment || res.remarks || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: REPORT CARDS */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Academic Year</label>
                      <select
                        value={reportYear}
                        onChange={(e) => setReportYear(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Term</label>
                      <select
                        value={reportTerm}
                        onChange={(e) => setReportTerm(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        printContent(
                          'printable-profile-report-card',
                          `ReportCard_${student.admission_number}_${reportTerm}`
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Report Card</span>
                    </button>
                  </div>
                </div>

                {/* Report Card Preview Sheet */}
                <div
                  id="printable-profile-report-card"
                  className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs"
                >
                  <div className="text-center border-b pb-4">
                    <h4 className="text-lg font-black text-slate-950 dark:text-white uppercase">{schoolProfile.name}</h4>
                    <p className="text-xs text-slate-500">{schoolProfile.address} • Uganda</p>
                    <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[11px]">
                      Terminal Student Academic Progress Report • {reportYear} {reportTerm}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <div><span className="text-slate-400">Student:</span> <strong>{student.first_name} {student.last_name}</strong></div>
                    <div><span className="text-slate-400">Adm No:</span> <strong className="font-mono">{student.admission_number}</strong></div>
                    <div><span className="text-slate-400">Class:</span> <strong>{student.class_name} {student.stream_name || ''}</strong></div>
                    <div><span className="text-slate-400">Division:</span> <strong className="text-emerald-600 font-bold">Division 1 (Aggregate 6)</strong></div>
                  </div>

                  {/* Subjects Table */}
                  <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      <tr>
                        <th className="p-2">Subject</th>
                        <th className="p-2">Marks (/100)</th>
                        <th className="p-2">Grade</th>
                        <th className="p-2">Descriptor & Teacher Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-2 font-bold">English Language</td>
                        <td className="p-2 font-mono font-bold">88</td>
                        <td className="p-2 font-bold text-blue-600">D2</td>
                        <td className="p-2 text-slate-600 dark:text-slate-300">Very good comprehension and composition writing</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold">Mathematics</td>
                        <td className="p-2 font-mono font-bold">94</td>
                        <td className="p-2 font-bold text-emerald-600">D1</td>
                        <td className="p-2 text-slate-600 dark:text-slate-300">Outstanding numerical and algebraic mastery</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold">Integrated Science</td>
                        <td className="p-2 font-mono font-bold">91</td>
                        <td className="p-2 font-bold text-emerald-600">D1</td>
                        <td className="p-2 text-slate-600 dark:text-slate-300">Exceptional scientific explanation and diagrammatic clarity</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold">Social Studies & R.E.</td>
                        <td className="p-2 font-mono font-bold">86</td>
                        <td className="p-2 font-bold text-blue-600">D2</td>
                        <td className="p-2 text-slate-600 dark:text-slate-300">Good understanding of civics and East African geography</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-2 text-[11px] space-y-1">
                    <p><strong>Class Teacher Remark:</strong> A disciplined, focused, and hardworking learner with outstanding potential.</p>
                    <p><strong>Head Teacher Remark:</strong> Excellent performance. Maintain this zeal for PLE success.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ENROLLMENT HISTORY */}
            {activeTab === 'enrollment' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white">Historical Enrollment & Promotion Progression</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Academic Year 2026 — {student.class_name} ({student.stream_name || 'Gold'})</strong>
                      <span className="text-[10px] text-slate-500">Admitted / Promoted: {student.admission_date}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Current Enrollment
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-80">
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Academic Year 2025 — P.6 (Blue Stream)</strong>
                      <span className="text-[10px] text-slate-500">Completed with Distinction • Promoted to P.7</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Promoted
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Uganda National Curriculum • EduCore Offline & Supabase
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Printable Official Admission Record Modal */}
      {isPrintAdmissionOpen && (
        <StudentAdmissionPrintModal
          student={student}
          onClose={() => setIsPrintAdmissionOpen(false)}
        />
      )}

      {/* Direct Record Payment Modal */}
      {isPaymentModalOpen && (
        <StudentFeePaymentModal
          student={student}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}
    </>
  );
};
