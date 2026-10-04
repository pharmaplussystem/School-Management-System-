import React, { useState } from 'react';
import {
  Inbox,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  FileText,
  Upload,
  Download,
  Printer,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  LogOut,
  Send,
  Eye,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StaffApplication, ApplicationType, ApplicationStatus, LeaveType } from '../../types';
import { downloadCSV, printContent } from '../../utils/printAndDownload';

const LEAVE_TYPES: LeaveType[] = [
  'Annual Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Sick / Medical Leave',
  'Study Leave',
  'Compassionate Leave',
  'Emergency Leave',
  'Unpaid Leave',
];

export const ApplicationsView: React.FC = () => {
  const {
    staffApplications,
    submitStaffApplication,
    reviewStaffApplication,
    staff,
    currentUser,
    activeRole,
    schoolProfile,
    showToast,
  } = useApp();

  // Active view tab: 'browse' (Staff/Admin review center) or 'new' (New Application submission)
  const [activeTab, setActiveTab] = useState<'browse' | 'new'>('browse');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ApplicationType>('ALL');

  // Review Modal state (for Administrators / Approvers)
  const [selectedApplicationForReview, setSelectedApplicationForReview] = useState<StaffApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<ApplicationStatus>('Approved');
  const [adminComment, setAdminComment] = useState('');
  const [adminReply, setAdminReply] = useState('');

  // New Application Form State
  const [appType, setAppType] = useState<ApplicationType>('Leave Application');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [daysRequested, setDaysRequested] = useState(5);
  const [handoverStaffId, setHandoverStaffId] = useState('');
  const [noticePeriodWeeks, setNoticePeriodWeeks] = useState(4);
  const [effectiveDate, setEffectiveDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // Calculate days difference
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    const start = new Date(val);
    const end = new Date(endDate);
    if (end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysRequested(diffDays);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    const start = new Date(startDate);
    const end = new Date(val);
    if (end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysRequested(diffDays);
    }
  };

  // Mock upload handler for file attachments
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    // Create local object URL for preview and simulated download
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    showToast(`Attached file: ${file.name}`, 'info');
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const applicant = staff.find((s) => s.id === selectedStaffId) || {
      id: 'stf-curr',
      staff_id: currentUser.id || 'STF-001',
      full_name: currentUser.full_name || 'Staff Member',
      department: 'Academics',
    };

    const handoverStaff = staff.find((s) => s.id === handoverStaffId);

    const payload: Omit<StaffApplication, 'id' | 'application_number' | 'submitted_at' | 'status' | 'sync_status'> = {
      staff_id: applicant.id,
      staff_name: applicant.full_name,
      staff_code: applicant.staff_id,
      department: applicant.department || 'Academics',
      application_type: appType,
      leave_type: appType === 'Leave Application' ? leaveType : undefined,
      start_date: appType === 'Leave Application' ? startDate : undefined,
      end_date: appType === 'Leave Application' ? endDate : undefined,
      days_requested: appType === 'Leave Application' ? daysRequested : undefined,
      handover_staff_name: handoverStaff?.full_name,
      notice_period_weeks: appType === 'Resignation' ? noticePeriodWeeks : undefined,
      effective_resignation_date: appType === 'Resignation' ? effectiveDate : undefined,
      subject_title: subjectTitle || `${appType} - ${applicant.full_name}`,
      reason: reason,
      uploaded_document_name: fileName || undefined,
      uploaded_document_url: fileUrl || undefined,
    };

    await submitStaffApplication(payload);
    // Reset form
    setReason('');
    setSubjectTitle('');
    setFileName('');
    setFileUrl('');
    setActiveTab('browse');
  };

  const handleOpenReview = (app: StaffApplication) => {
    setSelectedApplicationForReview(app);
    setReviewAction(app.status === 'Pending' ? 'Approved' : app.status);
    setAdminComment(app.admin_comment || '');
    setAdminReply(app.admin_reply || '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicationForReview) return;

    await reviewStaffApplication(selectedApplicationForReview.id, {
      status: reviewAction,
      admin_comment: adminComment,
      admin_reply: adminReply,
    });

    setSelectedApplicationForReview(null);
  };

  // Filter applications
  const filteredApplications = staffApplications.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || app.application_type === typeFilter;
    const matchesQuery =
      app.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.subject_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesQuery;
  });

  // KPI Metrics
  const pendingCount = staffApplications.filter((a) => a.status === 'Pending').length;
  const approvedCount = staffApplications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = staffApplications.filter((a) => a.status === 'Rejected').length;
  const totalCount = staffApplications.length;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Ref No',
      'Staff Code',
      'Staff Name',
      'Department',
      'Application Type',
      'Leave Type / Particulars',
      'Start Date',
      'End Date',
      'Days Requested',
      'Status',
      'Submitted Date',
      'Reviewed By',
      'Review Date',
      'Admin Comment / Decision',
      'Admin Reply',
    ];

    const rows = filteredApplications.map((a) => [
      a.application_number,
      a.staff_code,
      a.staff_name,
      a.department,
      a.application_type,
      a.leave_type || a.subject_title || 'N/A',
      a.start_date || 'N/A',
      a.end_date || 'N/A',
      a.days_requested ? `${a.days_requested}` : 'N/A',
      a.status,
      a.submitted_at.split('T')[0],
      a.reviewed_by || 'Pending Review',
      a.reviewed_at ? a.reviewed_at.split('T')[0] : 'Pending',
      a.admin_comment || 'N/A',
      a.admin_reply || 'N/A',
    ]);

    downloadCSV(`Staff_Applications_Register_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast(`Exported ${filteredApplications.length} applications to CSV!`, 'success');
  };

  const handlePrintRegister = () => {
    printContent('printable-applications-register', `Staff Applications & Grievances Register`);
  };

  const handlePrintSingle = (app: StaffApplication) => {
    const printDocId = `printable-single-${app.id}`;
    printContent(printDocId, `Application ${app.application_number} - ${app.staff_name}`);
  };

  const canReview = ['Administrator', 'Head Teacher', 'Deputy Head Teacher', 'Secretary', 'Admin'].includes(activeRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>APPLICATIONS & GRIEVANCES</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Leave Requests • Formal Complaints • Notice of Resignation • Administrative Reviews & Approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-blue-700 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>All Requests ({staffApplications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'new'
                ? 'bg-blue-700 text-white shadow-md'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Submit Application / Tender Complaint</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Submissions</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending Review</span>
            <span className="text-xl font-extrabold text-amber-600">{pendingCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Approved</span>
            <span className="text-xl font-extrabold text-emerald-600">{approvedCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-red-600 block">Rejected / Disallowed</span>
            <span className="text-xl font-extrabold text-red-600">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUBMIT NEW APPLICATION / TENDER COMPLAINT                          */}
      {/* ========================================================================= */}
      {activeTab === 'new' && (
        <div className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Staff Application & Grievance Lodging
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official electronic submission channel for school faculty and non-teaching personnel.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('browse')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
            {/* 1. Type Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase">
                Application Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { type: 'Leave Application', label: 'Apply for Leave', icon: Calendar },
                    { type: 'Complaint / Grievance', label: 'Tender Complaint', icon: AlertCircle },
                    { type: 'Resignation', label: 'Resignation Notice', icon: LogOut },
                    { type: 'Query / Request', label: 'Query / Request', icon: HelpCircle },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setAppType(item.type)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                      appType === item.type
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-blue-600" />
                    <span className="font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Applicant Staff Member */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Applicant (Staff Member) *
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.staff_id}) — {s.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Subject / Summary Title *
                </label>
                <input
                  type="text"
                  required
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  placeholder={
                    appType === 'Leave Application'
                      ? 'e.g. Request for 5 Days Annual Leave to Attend Family Function'
                      : appType === 'Complaint / Grievance'
                      ? 'e.g. Workstation Allocation Issue / Classroom Noise Concern'
                      : appType === 'Resignation'
                      ? 'e.g. Notice of Resignation - End of Term 3'
                      : 'e.g. Request for Advance Salary / Payslip Enquiry'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>
            </div>

            {/* Condition 1: LEAVE APPLICATION FIELDS */}
            {appType === 'Leave Application' && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <span className="font-bold text-amber-800 dark:text-amber-300 text-xs block">
                  Leave Specific Details (Uganda Statutory Regulations)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Leave Type *
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      {LEAVE_TYPES.map((lt) => (
                        <option key={lt} value={lt}>
                          {lt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Resumption Date (End Date) *
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Total Days Requested
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={daysRequested}
                      className="w-full px-3 py-2 rounded-xl bg-amber-100/60 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800 font-extrabold text-amber-900 dark:text-amber-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Handover / Relief Colleague (Covering Classes)
                    </label>
                    <select
                      value={handoverStaffId}
                      onChange={(e) => setHandoverStaffId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="">None / Not Required</option>
                      {staff
                        .filter((s) => s.id !== selectedStaffId)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} ({s.department})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Condition 2: RESIGNATION FIELDS */}
            {appType === 'Resignation' && (
              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
                <span className="font-bold text-red-800 dark:text-red-300 text-xs block">
                  Resignation Notice Particulars (Employment Act 2006)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Notice Period (Weeks) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={noticePeriodWeeks}
                      onChange={(e) => setNoticePeriodWeeks(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Effective Last Working Day *
                    </label>
                    <input
                      type="date"
                      required
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Reason / Narrative */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase">
                Detailed Statement / Grounds / Circumstances *
              </label>
              <textarea
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Kindly provide full comprehensive particulars, dates, reasons, and any mitigating factors..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-normal leading-relaxed text-xs"
              />
            </div>

            {/* Document Attachment Upload */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                Supporting Document / Medical Certificate / Formal Letter Upload
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 text-xs shadow-xs cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose Supporting File</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx"
                  />
                </label>
                {fileName ? (
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {fileName}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    Optional (attach medical letter, official handover, petition document)
                  </span>
                )}
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Back to Registry
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit to Administration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPLICATIONS REGISTRY & APPROVAL CENTER                            */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search applicant name, reference number, or particulars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Under Review">Under Review</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="ALL">All Application Types</option>
                <option value="Leave Application">Leave Applications</option>
                <option value="Complaint / Grievance">Complaints & Grievances</option>
                <option value="Resignation">Resignation Notices</option>
                <option value="Query / Request">Queries & Requests</option>
              </select>
            </div>

            {/* Print & Export */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition cursor-pointer"
                title="Download Applications Register as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handlePrintRegister}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition cursor-pointer"
                title="Print Applications Register"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Register</span>
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Reference No</th>
                    <th className="px-4 py-3">Applicant (Staff)</th>
                    <th className="px-4 py-3">Category & Subject</th>
                    <th className="px-4 py-3">Particulars / Dates</th>
                    <th className="px-4 py-3">Attachment</th>
                    <th className="px-4 py-3">Decision Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No applications or complaints found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                          {app.application_number}
                        </td>

                        <td className="px-4 py-3">
                          <strong className="text-slate-900 dark:text-white block font-bold">
                            {app.staff_name}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {app.staff_code} • {app.department}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {app.subject_title || app.application_type}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {app.application_type}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {app.application_type === 'Leave Application' ? (
                            <div>
                              <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">
                                {app.leave_type} ({app.days_requested} days)
                              </strong>
                              <span className="text-[10px] text-slate-400">
                                {app.start_date} to {app.end_date}
                              </span>
                            </div>
                          ) : app.application_type === 'Resignation' ? (
                            <div>
                              <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">
                                Notice: {app.notice_period_weeks} weeks
                              </strong>
                              <span className="text-[10px] text-slate-400">
                                Effective: {app.effective_resignation_date}
                              </span>
                            </div>
                          ) : (
                            <p className="line-clamp-2 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs">
                              {app.reason}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {app.uploaded_document_name ? (
                            app.uploaded_document_url ? (
                              <a
                                href={app.uploaded_document_url}
                                download={app.uploaded_document_name}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold text-[10px] transition"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{app.uploaded_document_name}</span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 text-[10px]">
                                <Paperclip className="w-3 h-3" />
                                {app.uploaded_document_name}
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-[10px]">No attachment</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : app.status === 'Rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : app.status === 'Under Review'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {app.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                            {app.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                            {app.status === 'Pending' && <Clock className="w-3 h-3" />}
                            <span>{app.status}</span>
                          </span>
                          {app.reviewed_by && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              by {app.reviewed_by}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePrintSingle(app)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                              title="Print Application Docket"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {canReview && (
                              <button
                                onClick={() => handleOpenReview(app)}
                                className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition cursor-pointer"
                              >
                                Review / Decide
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW & APPROVAL MODAL (FOR ADMINISTRATORS)                              */}
      {/* ========================================================================= */}
      {selectedApplicationForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Administrative Review & Determination
                </h3>
                <span className="font-mono text-xs text-blue-600">
                  Ref: {selectedApplicationForReview.application_number}
                </span>
              </div>
              <button
                onClick={() => setSelectedApplicationForReview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-4 sm:p-6 space-y-4 text-xs">
              {/* Application Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-sm text-slate-900 dark:text-white block font-bold">
                      {selectedApplicationForReview.staff_name}
                    </strong>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {selectedApplicationForReview.staff_code} • {selectedApplicationForReview.department}
                    </span>
                  </div>
                  <span className="font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px]">
                    {selectedApplicationForReview.application_type}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <span className="font-bold block mb-1">
                    {selectedApplicationForReview.subject_title || 'Application Particulars'}:
                  </span>
                  <p className="text-[11px] leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedApplicationForReview.reason}
                  </p>
                </div>

                {selectedApplicationForReview.uploaded_document_name && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">Attachment:</span>
                    {selectedApplicationForReview.uploaded_document_url ? (
                      <a
                        href={selectedApplicationForReview.uploaded_document_url}
                        download={selectedApplicationForReview.uploaded_document_name}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download {selectedApplicationForReview.uploaded_document_name}
                      </a>
                    ) : (
                      <span className="font-mono text-slate-600">
                        {selectedApplicationForReview.uploaded_document_name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Decision Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Administrative Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { val: 'Approved', label: 'Approve', color: 'emerald' },
                      { val: 'Under Review', label: 'Under Review', color: 'blue' },
                      { val: 'Rejected', label: 'Reject / Decline', color: 'red' },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setReviewAction(btn.val)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                        reviewAction === btn.val
                          ? btn.color === 'emerald'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                            : btn.color === 'red'
                            ? 'border-red-600 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200'
                            : 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Administrative Comment / Minute */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Official Endorsement / Administrative Minute *
                </label>
                <textarea
                  rows={2}
                  required
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. Approved as requested. Duties to be covered by Mr. Okello. Leave captured in staff profile."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              {/* Reply to Applicant (for queries & complaints) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Written Response / Explanation to Applicant
                </label>
                <textarea
                  rows={2}
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Provide reply, clarification or directives for the applicant..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedApplicationForReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer transition"
                >
                  Save Decision & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden printable elements for isolated clean printing */}
      <div className="hidden">
        {/* Printable Register */}
        <div id="printable-applications-register" className="p-8 space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold uppercase">{schoolProfile.school_name}</h1>
            <p className="text-sm">{schoolProfile.school_address} • Tel: {schoolProfile.phone_contact}</p>
            <h2 className="text-lg font-bold mt-2 uppercase">Official Staff Applications & Grievance Register</h2>
            <p className="text-xs text-slate-500">Date Generated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="py-2">Ref No</th>
                <th className="py-2">Staff Name</th>
                <th className="py-2">Department</th>
                <th className="py-2">Application Type</th>
                <th className="py-2">Particulars / Dates</th>
                <th className="py-2">Status</th>
                <th className="py-2">Reviewed By</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((a) => (
                <tr key={a.id} className="border-b border-slate-200">
                  <td className="py-2 font-mono">{a.application_number}</td>
                  <td className="py-2 font-bold">{a.staff_name}</td>
                  <td className="py-2">{a.department}</td>
                  <td className="py-2">{a.application_type}</td>
                  <td className="py-2">{a.leave_type || a.subject_title || a.reason}</td>
                  <td className="py-2 font-bold">{a.status}</td>
                  <td className="py-2">{a.reviewed_by || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Individual Docket */}
        {filteredApplications.map((app) => (
          <div key={app.id} id={`printable-single-${app.id}`} className="p-8 space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold uppercase">{schoolProfile.school_name}</h1>
              <p className="text-sm">{schoolProfile.school_address} • Tel: {schoolProfile.phone_contact}</p>
              <h2 className="text-lg font-bold mt-2 uppercase">
                Staff Application Docket — Ref: {app.application_number}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border p-4 rounded-xl">
              <div>
                <strong>Applicant Name:</strong> {app.staff_name}
              </div>
              <div>
                <strong>Staff Code:</strong> {app.staff_code}
              </div>
              <div>
                <strong>Department:</strong> {app.department}
              </div>
              <div>
                <strong>Submission Date:</strong> {app.submitted_at.split('T')[0]}
              </div>
              <div>
                <strong>Category:</strong> {app.application_type}
              </div>
              <div>
                <strong>Current Status:</strong> {app.status}
              </div>
            </div>

            <div className="border p-4 rounded-xl text-xs space-y-2">
              <h3 className="font-bold uppercase">Statement of Grounds / Reason</h3>
              <p className="leading-relaxed whitespace-pre-wrap">{app.reason}</p>
            </div>

            <div className="border p-4 rounded-xl text-xs space-y-2">
              <h3 className="font-bold uppercase">Administrative Determination & Minute</h3>
              <p><strong>Decision:</strong> {app.status}</p>
              <p><strong>Endorsement:</strong> {app.admin_comment || 'Under evaluation'}</p>
              <p><strong>Response to Applicant:</strong> {app.admin_reply || 'N/A'}</p>
              <p><strong>Reviewed By:</strong> {app.reviewed_by || 'Pending'} on {app.reviewed_at?.split('T')[0] || 'N/A'}</p>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t pt-2">
                <span>Applicant Signature & Date</span>
              </div>
              <div className="border-t pt-2">
                <span>Head Teacher / Administrator Signature & Stamp</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
