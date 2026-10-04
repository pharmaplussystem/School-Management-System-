import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Download,
  Printer,
  Filter,
  X,
  Check,
  ChevronRight,
  Eye,
  MessageSquare,
  Building,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Parent } from '../../types';
import { downloadCSV, printContent } from '../../utils/printAndDownload';

export const ParentsView: React.FC = () => {
  const { parents, students, classes, streams, schoolProfile, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('ALL');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);

  // Link parents to student records to know their classes and streams
  const enrichedParents = parents.map((parent) => {
    // Find associated students
    const associatedStudents = students.filter(
      (st) =>
        parent.student_names?.some(
          (name) =>
            `${st.first_name} ${st.last_name}`.toLowerCase() === name.toLowerCase() ||
            name.toLowerCase().includes(st.last_name.toLowerCase())
        ) ||
        st.parent_names?.some(
          (pName) =>
            pName.toLowerCase().includes(parent.full_name.toLowerCase()) ||
            parent.full_name.toLowerCase().includes(pName.toLowerCase())
        ) ||
        st.parent_phone === parent.phone
    );

    const studentClasses = Array.from(new Set(associatedStudents.map((s) => s.class_name).filter(Boolean)));
    const studentStreams = Array.from(new Set(associatedStudents.map((s) => s.stream_name).filter(Boolean)));

    return {
      ...parent,
      associatedStudents,
      studentClasses,
      studentStreams,
    };
  });

  // Filter logic
  const filteredParents = enrichedParents.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.parent_id_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.student_names?.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass =
      selectedClass === 'ALL' ||
      p.studentClasses.includes(selectedClass) ||
      (p.associatedStudents.length === 0 && selectedClass === 'ALL');

    const matchesStream =
      selectedStream === 'ALL' ||
      p.studentStreams.includes(selectedStream) ||
      (p.associatedStudents.length === 0 && selectedStream === 'ALL');

    const matchesRelationship =
      selectedRelationship === 'ALL' || p.relationship.toLowerCase() === selectedRelationship.toLowerCase();

    return matchesSearch && matchesClass && matchesStream && matchesRelationship;
  });

  const activeFilterCount =
    (selectedClass !== 'ALL' ? 1 : 0) +
    (selectedStream !== 'ALL' ? 1 : 0) +
    (selectedRelationship !== 'ALL' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedClass('ALL');
    setSelectedStream('ALL');
    setSelectedRelationship('ALL');
    setSearchQuery('');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Parent ID Code',
      'Full Name',
      'Relationship',
      'Phone Number',
      'Occupation',
      'Residential Address',
      'District',
      'Associated Learners',
      'Learner Classes',
    ];

    const rows = filteredParents.map((p) => [
      p.parent_id_code || 'N/A',
      p.full_name,
      p.relationship,
      p.phone,
      p.occupation || 'N/A',
      p.address || 'N/A',
      p.district || 'N/A',
      p.student_names?.join(', ') || 'N/A',
      p.studentClasses.join(', ') || 'N/A',
    ]);

    const filename = `Parents_Guardians_Register_${selectedClass === 'ALL' ? 'All_Classes' : selectedClass}_${new Date().toISOString().split('T')[0]}`;
    downloadCSV(filename, headers, rows);
    showToast(`Downloaded Parents Register (${filteredParents.length} records) as CSV!`, 'success');
  };

  // Print Register
  const handlePrint = () => {
    printContent('printable-parents-directory', 'Parents and Guardians Directory');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            Parents & Guardians Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Emergency Contacts • Family Linkage • SMS Dispatch • Class Filtering & Downloads
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Class Filter Drawer Toggle Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter by Class</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Download CSV Button */}
          <button
            onClick={handleExportCSV}
            title="Download CSV Spreadsheet"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          {/* Print Directory Button */}
          <button
            onClick={handlePrint}
            title="Print Parent Register"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search parent by name, phone (+256), learner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
          />
        </div>

        {/* Active Filter Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs w-full sm:w-auto">
          {selectedClass !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[11px]">
              Class: {selectedClass}
              <button onClick={() => setSelectedClass('ALL')} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStream !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[11px]">
              Stream: {selectedStream}
              <button onClick={() => setSelectedStream('ALL')} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedRelationship !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[11px]">
              Role: {selectedRelationship}
              <button onClick={() => setSelectedRelationship('ALL')} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
          <span className="text-slate-400 font-mono text-[11px] ml-auto">
            Showing {filteredParents.length} of {parents.length} parents
          </span>
        </div>
      </div>

      {/* Main List Format Table */}
      <div
        id="printable-parents-directory"
        className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
      >
        {/* Printable School Header (Only appears on print) */}
        <div className="hidden print:block p-4 border-b border-slate-300 mb-4 text-center">
          <h2 className="text-lg font-bold text-slate-900">{schoolProfile.name}</h2>
          <p className="text-xs text-slate-600">
            {schoolProfile.address} • Phone: {schoolProfile.phone} • Email: {schoolProfile.email}
          </p>
          <h3 className="text-sm font-bold uppercase mt-2 text-slate-800 tracking-wide">
            PARENTS & GUARDIANS REGISTER — {selectedClass === 'ALL' ? 'ALL CLASSES' : `CLASS: ${selectedClass}`}
          </h3>
          <p className="text-[10px] text-slate-500">Generated on {new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID / Code</th>
                <th className="px-4 py-3.5">Parent / Guardian Name</th>
                <th className="px-4 py-3.5">Relationship</th>
                <th className="px-4 py-3.5">Telephone (+256)</th>
                <th className="px-4 py-3.5">Occupation</th>
                <th className="px-4 py-3.5">Residence & District</th>
                <th className="px-4 py-3.5">Associated Learner(s) & Class</th>
                <th className="px-4 py-3.5 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No parents found matching the selected class or criteria.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 text-blue-600 hover:underline font-bold text-xs cursor-pointer"
                    >
                      Reset Class Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredParents.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedParent(p)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {p.parent_id_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {p.full_name}
                      </div>
                      {p.email && <div className="text-[10px] text-slate-400">{p.email}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {p.relationship}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                        <span>{p.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {p.occupation || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 print:hidden" />
                        <span>
                          {p.address ? `${p.address}, ` : ''}
                          {p.district || 'Uganda'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {p.associatedStudents.length > 0 ? (
                          p.associatedStudents.map((st) => (
                            <div key={st.id} className="flex items-center gap-1 text-slate-900 dark:text-white">
                              <GraduationCap className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="font-semibold">
                                {st.first_name} {st.last_name}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                                {st.class_name} {st.stream_name ? `(${st.stream_name})` : ''}
                              </span>
                            </div>
                          ))
                        ) : p.student_names && p.student_names.length > 0 ? (
                          p.student_names.map((name) => (
                            <div key={name} className="flex items-center gap-1 text-slate-900 dark:text-white">
                              <GraduationCap className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="font-semibold">{name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">No learners linked</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right print:hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedParent(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`tel:${p.phone}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
                          title={`Call ${p.full_name}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer for Selection according to Class */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Select by Class & Stream
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Filter parents and guardians by learner enrollment
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* Class Selection */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-2">
                    Learner Class
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClass('ALL')}
                      className={`p-2.5 rounded-xl border text-left font-bold flex items-center justify-between transition cursor-pointer ${
                        selectedClass === 'ALL'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>All Classes</span>
                      {selectedClass === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
                    </button>

                    {classes.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClass(c.name)}
                        className={`p-2.5 rounded-xl border text-left font-bold flex items-center justify-between transition cursor-pointer ${
                          selectedClass === c.name
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div>{c.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {c.level || c.section || 'General'}
                          </span>
                        </div>
                        {selectedClass === c.name && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stream Selection */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-2">
                    Class Stream
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStream('ALL')}
                      className={`p-2 rounded-xl border text-left font-bold flex items-center justify-between transition cursor-pointer ${
                        selectedStream === 'ALL'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>All Streams</span>
                      {selectedStream === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    {streams.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStream(st.name)}
                        className={`p-2 rounded-xl border text-left font-bold flex items-center justify-between transition cursor-pointer ${
                          selectedStream === st.name
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>Stream {st.name}</span>
                        {selectedStream === st.name && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relationship Filter */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-2">
                    Guardian Relationship
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['ALL', 'Father', 'Mother', 'Guardian', 'Sponsor', 'Uncle'].map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setSelectedRelationship(rel)}
                        className={`p-2 rounded-xl border text-left font-bold flex items-center justify-between transition cursor-pointer ${
                          selectedRelationship === rel
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{rel === 'ALL' ? 'All Roles' : rel}</span>
                        {selectedRelationship === rel && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Summary in Drawer */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Current Selection:
                  </span>
                  <div className="text-slate-500 space-y-0.5">
                    <div>Class: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedClass}</span></div>
                    <div>Stream: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStream}</span></div>
                    <div>Matching Parents: <span className="font-bold text-blue-700 dark:text-blue-400">{filteredParents.length}</span></div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Apply Filter ({filteredParents.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parent Details Modal */}
      {selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                  {selectedParent.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedParent.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-blue-600">{selectedParent.parent_id_code}</span>
                    <span>•</span>
                    <span className="font-semibold">{selectedParent.relationship}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedParent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Contact & Bio Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Telephone</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedParent.phone}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Alternative Phone / Email</span>
                  <div className="text-slate-700 dark:text-slate-300">{selectedParent.alt_phone || selectedParent.email || 'None on file'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Occupation & Workplace</span>
                  <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedParent.occupation || 'Self-Employed'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Residential Location</span>
                  <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedParent.address}, {selectedParent.district}</span>
                  </div>
                </div>
              </div>

              {/* Linked Students & Class Enrollment */}
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Associated Learner(s) in School
                </h4>
                <div className="space-y-2">
                  {students
                    .filter(
                      (st) =>
                        selectedParent.student_names?.some(
                          (name) =>
                            `${st.first_name} ${st.last_name}`.toLowerCase() === name.toLowerCase() ||
                            name.toLowerCase().includes(st.last_name.toLowerCase())
                        ) ||
                        st.parent_names?.some(
                          (pName) =>
                            pName.toLowerCase().includes(selectedParent.full_name.toLowerCase()) ||
                            selectedParent.full_name.toLowerCase().includes(pName.toLowerCase())
                        ) ||
                        st.parent_phone === selectedParent.phone
                    )
                    .map((st) => (
                      <div
                        key={st.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {st.first_name} {st.last_name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Adm: <span className="font-mono">{st.admission_number}</span> • Class: {st.class_name} {st.stream_name ? `(${st.stream_name})` : ''}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {st.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/40">
              <a
                href={`tel:${selectedParent.phone}`}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Guardian</span>
              </a>
              <button
                onClick={() => setSelectedParent(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
