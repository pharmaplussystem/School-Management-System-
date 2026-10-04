import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Lock,
  X,
  AlertTriangle,
  User,
  Users,
  Eye,
  Printer,
  ChevronRight,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DisciplineRecord } from '../../types';

export const DisciplineView: React.FC = () => {
  const { disciplineRecords, addDisciplineRecord, updateDisciplineRecord, students, staff, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [personTypeFilter, setPersonTypeFilter] = useState<'ALL' | 'Student' | 'Staff'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Under Review' | 'Resolved' | 'Action Taken'>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState<DisciplineRecord | null>(null);

  // Form State for Recording Incident
  const [formPersonType, setFormPersonType] = useState<'Student' | 'Staff'>('Student');
  const [formPersonId, setFormPersonId] = useState(students[0]?.id || '');
  const [formIncidentDate, setFormIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState('Lateness');
  const [formDescription, setFormDescription] = useState('');
  const [formActionTaken, setFormActionTaken] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('');
  const [formStatus, setFormStatus] = useState<'Under Review' | 'Warning Issued' | 'Suspended' | 'Resolved'>('Under Review');

  const handleOpenAddModal = (initialType: 'Student' | 'Staff' = 'Student') => {
    setFormPersonType(initialType);
    if (initialType === 'Student') {
      setFormPersonId(students[0]?.id || '');
    } else {
      setFormPersonId(staff[0]?.id || '');
    }
    setFormIncidentDate(new Date().toISOString().split('T')[0]);
    setFormCategory('Lateness');
    setFormDescription('');
    setFormActionTaken('');
    setFormFollowUp('');
    setFormStatus('Under Review');
    setIsAddModalOpen(true);
  };

  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPersonId || !formDescription.trim()) {
      alert('Please select a person and enter the incident description.');
      return;
    }

    let personName = '';
    let identifier = '';
    let classOrDept = '';

    if (formPersonType === 'Student') {
      const st = students.find((s) => s.id === formPersonId);
      if (!st) return;
      personName = `${st.first_name} ${st.last_name}`;
      identifier = st.admission_number;
      classOrDept = st.class_name;
    } else {
      const tf = staff.find((t) => t.id === formPersonId);
      if (!tf) return;
      personName = tf.full_name;
      identifier = tf.staff_id;
      classOrDept = tf.department || tf.designation;
    }

    await addDisciplineRecord({
      person_type: formPersonType,
      person_id: formPersonId,
      person_name: personName,
      identifier,
      student_id: formPersonType === 'Student' ? formPersonId : undefined,
      student_name: formPersonType === 'Student' ? personName : undefined,
      admission_number: formPersonType === 'Student' ? identifier : undefined,
      incident_date: formIncidentDate,
      category: formCategory,
      incident_type: formCategory,
      description: formDescription,
      action_taken: formActionTaken,
      reported_by: currentUser.full_name,
      staff_name: currentUser.full_name,
      recorded_by: currentUser.full_name,
      follow_up: formFollowUp,
      status: formStatus,
    });

    setIsAddModalOpen(false);
  };

  const handleUpdateStatus = async (record: DisciplineRecord, newStatus: string) => {
    const updated = {
      ...record,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    await updateDisciplineRecord(updated);
    if (selectedIncidentDetails?.id === record.id) {
      setSelectedIncidentDetails(updated);
    }
  };

  // Filtered Records
  const filtered = disciplineRecords.filter((d) => {
    const personName = d.person_name || d.student_name || '';
    const ident = d.identifier || d.admission_number || '';
    const matchesSearch =
      personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ident.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.action_taken && d.action_taken.toLowerCase().includes(searchQuery.toLowerCase()));

    const isStudent = d.person_type === 'Student' || !!d.student_id;
    const isStaff = d.person_type === 'Staff' || d.person_type === 'Teacher';

    const matchesType =
      personTypeFilter === 'ALL'
        ? true
        : personTypeFilter === 'Student'
        ? isStudent
        : isStaff;

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'Under Review'
        ? d.status === 'Under Review'
        : statusFilter === 'Resolved'
        ? d.status === 'Resolved'
        : d.status !== 'Under Review' && d.status !== 'Resolved';

    return matchesSearch && matchesType && matchesStatus;
  });

  const studentCasesCount = disciplineRecords.filter((d) => d.person_type === 'Student' || !!d.student_id).length;
  const staffCasesCount = disciplineRecords.filter((d) => d.person_type === 'Staff' || d.person_type === 'Teacher').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
            Confidential Disciplinary Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student Cases ({studentCasesCount}) • Staff Inquiries ({staffCasesCount}) • Disciplinary Committee Oversight
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Records</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('Student')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Disciplinary Incident</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-900 dark:text-red-200">
        <Lock className="w-4 h-4 text-red-600 shrink-0" />
        <span>
          Confidential disciplinary records governed by the Uganda Ministry of Education school code of conduct.
        </span>
      </div>

      {/* Filter Drawer / Selection Tabs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Person Type Drawer: All, Student, Staff */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
            <button
              onClick={() => setPersonTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                personTypeFilter === 'ALL'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Records ({disciplineRecords.length})
            </button>
            <button
              onClick={() => setPersonTypeFilter('Student')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                personTypeFilter === 'Student'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Students ({studentCasesCount})
            </button>
            <button
              onClick={() => setPersonTypeFilter('Staff')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                personTypeFilter === 'Staff'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Staff Members ({staffCasesCount})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Action Taken">Action Taken</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative pt-2 border-t border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4.5" />
          <input
            type="text"
            placeholder="Search incident by person name, ID, category or action taken..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
          />
        </div>
      </div>

      {/* LIST FORMAT TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Person Involved</th>
              <th className="px-4 py-3">Category / Role</th>
              <th className="px-4 py-3">Incident Category</th>
              <th className="px-4 py-3">Description & Summary</th>
              <th className="px-4 py-3">Action Taken</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  No disciplinary records found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const isStudent = d.person_type === 'Student' || !!d.student_id;
                const personName = d.person_name || d.student_name || 'Anonymous';
                const identifier = d.identifier || d.admission_number || 'N/A';

                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedIncidentDetails(d)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {d.incident_date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{personName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{identifier}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isStudent
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {isStudent ? 'Student' : 'Staff Member'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                      {d.category || d.incident_type}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {d.description}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {d.action_taken || 'Pending Committee Review'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'Resolved' || d.status === 'Cleared'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : d.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncidentDetails(d);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-[10px] transition cursor-pointer"
                      >
                        Full Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* FULL DETAILS MODAL */}
      {/* ============================================================== */}
      {selectedIncidentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-red-900 via-rose-950 to-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-rose-400 font-bold">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Disciplinary Dossier: {selectedIncidentDetails.category}</h3>
                  <p className="text-xs text-rose-200">
                    {selectedIncidentDetails.person_type || 'Subject'}: <strong className="text-white">{selectedIncidentDetails.person_name || selectedIncidentDetails.student_name}</strong> • ID: {selectedIncidentDetails.identifier || selectedIncidentDetails.admission_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                >
                  <Printer className="w-3.5 h-3.5 inline mr-1" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedIncidentDetails(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1 text-slate-700 dark:text-slate-300">
              {/* Quick Particulars Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Person Involved</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedIncidentDetails.person_name || selectedIncidentDetails.student_name}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Role / Category</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">
                    {selectedIncidentDetails.person_type || 'Student'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">ID / Admission</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {selectedIncidentDetails.identifier || selectedIncidentDetails.admission_number || 'N/A'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Incident Date</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {selectedIncidentDetails.incident_date}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Reported By</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedIncidentDetails.reported_by || selectedIncidentDetails.recorded_by || 'Discipline Master'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Status</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {selectedIncidentDetails.status}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Official Incident Statement & Summary
                </h4>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {selectedIncidentDetails.description}
                </div>
              </div>

              {/* Action Taken & Sanctions */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Sanctions & Corrective Action Taken
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200">
                  {selectedIncidentDetails.action_taken || 'No corrective action recorded yet.'}
                </div>
              </div>

              {/* Follow Up */}
              {selectedIncidentDetails.follow_up && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Committee Follow-Up & Monitoring
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {selectedIncidentDetails.follow_up}
                  </div>
                </div>
              )}

              {/* Update Status Bar */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">Update Case Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedIncidentDetails, 'Resolved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIncidentDetails, 'Under Review')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer"
                  >
                    Keep Under Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RECORD INCIDENT MODAL (Select Student or Staff!) */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Record Disciplinary Incident
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Category Selector: Student or Staff */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                  Select Whether for Student or Staff *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormPersonType('Student');
                      setFormPersonId(students[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      formPersonType === 'Student'
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Student / Learner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormPersonType('Staff');
                      setFormPersonId(staff[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      formPersonType === 'Staff'
                        ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Teacher / Staff Member</span>
                  </button>
                </div>
              </div>

              {/* Select Specific Person */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                  Select {formPersonType === 'Student' ? 'Student' : 'Staff Member'} *
                </label>
                <select
                  value={formPersonId}
                  onChange={(e) => setFormPersonId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  {formPersonType === 'Student' ? (
                    students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.admission_number}) — {s.class_name} {s.stream_name || ''}
                      </option>
                    ))
                  ) : (
                    staff.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.staff_id}) — {t.designation} ({t.category})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Incident Date & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formIncidentDate}
                    onChange={(e) => setFormIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                    Incident Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Lateness">Lateness / Chronic Punctuality Issue</option>
                    <option value="Uniform Infraction">Improper Attire / Uniform Infraction</option>
                    <option value="Absenteeism">Truancy / Unauthorized Absence</option>
                    <option value="Fighting">Fighting / Violent Conduct</option>
                    <option value="Property Damage">Vandalism / School Property Damage</option>
                    <option value="Insubordination">Insubordination / Disrespect to Staff</option>
                    <option value="Academic Dishonesty">Cheating / Examination Malpractice</option>
                    <option value="Gross Misconduct">Gross Misconduct</option>
                    <option value="Other">Other Disciplinary Issue</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                  Incident Description & Statements *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the circumstances, location, witnesses and nature of the incident..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                ></textarea>
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                  Action Taken / Sanctions / Penalty
                </label>
                <input
                  type="text"
                  value={formActionTaken}
                  onChange={(e) => setFormActionTaken(e.target.value)}
                  placeholder="e.g. Verbal warning, detention, parent summoned, manual work..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              {/* Follow-up & Initial Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                    Follow-Up Notes
                  </label>
                  <input
                    type="text"
                    value={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.value)}
                    placeholder="e.g. Follow-up meeting scheduled"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Warning Issued">Warning Issued</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Incident Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
