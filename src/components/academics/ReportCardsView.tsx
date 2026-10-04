import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Eye,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  Filter,
  CheckSquare,
  Square,
  Calendar,
  Layers,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { printContent, downloadCSV } from '../../utils/printAndDownload';

export const ReportCardsView: React.FC = () => {
  const { students, schoolProfile, classes, results, showToast } = useApp();

  // Selection Drawer state
  const [selectedYear, setSelectedYear] = useState(schoolProfile.current_academic_year);
  const [selectedTerm, setSelectedTerm] = useState(schoolProfile.current_term);
  const [selectedClass, setSelectedClass] = useState('P.7');
  const [selectedStream, setSelectedStream] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected students for batch printing
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [activeStudentForSingleReport, setActiveStudentForSingleReport] = useState<Student | null>(null);
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);

  // Filter students based on category drawer
  const categoryStudents = students.filter((s) => {
    const matchClass = s.class_name === selectedClass;
    const matchStream = selectedStream === 'ALL' || s.stream_name === selectedStream;
    const matchSearch =
      s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchStream && matchSearch && s.status === 'Active';
  });

  // Select / Select All handlers
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === categoryStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(categoryStudents.map((s) => s.id));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sample UNEB Standard Subjects & results calculation for Uganda Report Cards
  const getStudentResults = (student: Student) => {
    const isPrim = student.class_name.startsWith('P.');
    if (isPrim) {
      return [
        { code: 'ENG', name: 'English Language', marks: 88, grade: 'D2', remarks: 'Very good comprehension and composition writing', teacher: 'FN' },
        { code: 'MTC', name: 'Mathematics', marks: 94, grade: 'D1', remarks: 'Exceptional algebraic and numerical aptitude', teacher: 'ET' },
        { code: 'SCI', name: 'Integrated Science', marks: 91, grade: 'D1', remarks: 'Exemplary scientific understanding and diagram work', teacher: 'DM' },
        { code: 'SST', name: 'Social Studies & R.E.', marks: 86, grade: 'D2', remarks: 'Sound knowledge of East African geography and civics', teacher: 'EN' },
      ];
    } else {
      return [
        { code: 'ENG-S', name: 'English Language', marks: 82, grade: 'A', remarks: 'High proficiency in essay composition and speech', teacher: 'FN' },
        { code: 'MTC-S', name: 'Mathematics', marks: 89, grade: 'A', remarks: 'Consistently demonstrates mastery in calculus & geometry', teacher: 'ET' },
        { code: 'PHY', name: 'Physics', marks: 78, grade: 'B', remarks: 'Good practical analysis and mechanics problem-solving', teacher: 'DM' },
        { code: 'CHM', name: 'Chemistry', marks: 74, grade: 'B', remarks: 'Solid mastery of organic reaction concepts', teacher: 'DM' },
        { code: 'BIO', name: 'Biology', marks: 85, grade: 'A', remarks: 'Exceptional biological illustration and experimental writeup', teacher: 'DM' },
        { code: 'GEO', name: 'Geography', marks: 80, grade: 'A', remarks: 'Accurate photographic interpretation and map work', teacher: 'EN' },
        { code: 'HIS', name: 'History & Political Education', marks: 76, grade: 'B', remarks: 'Clear civic understanding and analytical historical essays', teacher: 'EN' },
        { code: 'ENT', name: 'Entrepreneurship', marks: 88, grade: 'A', remarks: 'Outstanding project business plan and financial acuity', teacher: 'ET' },
      ];
    }
  };

  // Available streams for selected class
  const classStreams = Array.from(new Set(students.filter((s) => s.class_name === selectedClass).map((s) => s.stream_name).filter(Boolean)));

  const handlePrintBatch = () => {
    printContent('printable-batch-report-cards', `Report_Cards_${selectedClass}_${selectedTerm}`);
  };

  const handleExportSummaryCSV = () => {
    const headers = [
      'Adm. Number',
      'Learner Name',
      'Class',
      'Stream',
      'Gender',
      'Age',
      'Academic Year',
      'Term',
      'Aggregate',
      'Division Standing',
    ];
    const rows = categoryStudents.map((st, idx) => {
      const aggregate = 6 + (idx % 12);
      const division = aggregate <= 12 ? 'Division 1' : aggregate <= 24 ? 'Division 2' : 'Division 3';
      return [
        st.admission_number,
        `${st.first_name} ${st.last_name}`,
        st.class_name,
        st.stream_name || 'General',
        st.gender,
        `${st.age}`,
        selectedYear,
        selectedTerm,
        `${aggregate}`,
        division,
      ];
    });

    downloadCSV(`Terminal_Assessment_Summary_${selectedClass}_${selectedTerm}`, headers, rows);
    showToast(`Exported report card summary for ${categoryStudents.length} learners!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>Official Terminal Report Cards</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ugandan National Curriculum Assessment • PLE & UCE Division & Aggregate Calculations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV Summary */}
          <button
            onClick={handleExportSummaryCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Summary CSV</span>
          </button>

          {/* Batch Print Button */}
          <button
            onClick={handlePrintBatch}
            disabled={selectedStudentIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-40"
          >
            <Printer className="w-4 h-4" />
            <span>
              Print Selected Report Cards ({selectedStudentIds.length})
            </span>
          </button>
        </div>
      </div>

      {/* DRAWER: SELECT WHICH TERM REPORT TO VIEW OR PRINT */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Terminal Report Selection Drawer</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Select Year, Term & Class to generate terminal dossiers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Academic Year */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Academic Year *
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Term */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Academic Term *
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          {/* Class Category */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Class *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStream('ALL');
                setSelectedStudentIds([]);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          {/* Stream Category */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Stream
            </label>
            <select
              value={selectedStream}
              onChange={(e) => {
                setSelectedStream(e.target.value);
                setSelectedStudentIds([]);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Streams</option>
              {classStreams.map((st: any) => (
                <option key={st} value={st}>
                  Stream {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Selection Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search learner in selected category by name or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Selected: <strong className="text-blue-700 dark:text-blue-400">{selectedStudentIds.length}</strong> of {categoryStudents.length} Learners
            </span>
            <button
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition text-xs cursor-pointer"
            >
              {selectedStudentIds.length === categoryStudents.length ? 'Deselect All' : 'Select All Learners'}
            </button>
          </div>
        </div>
      </div>

      {/* DISPLAY NAMES OF SELECTED CATEGORY IN LIST FORMAT */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={categoryStudents.length > 0 && selectedStudentIds.length === categoryStudents.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Learner Name</th>
                <th className="px-4 py-3">Admission No</th>
                <th className="px-4 py-3">Class & Stream</th>
                <th className="px-4 py-3">Sex / Age</th>
                <th className="px-4 py-3">Uganda Aggregate</th>
                <th className="px-4 py-3">Division Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {categoryStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No learners found in {selectedClass} matching the selected category filter.
                  </td>
                </tr>
              ) : (
                categoryStudents.map((st, idx) => {
                  const isSelected = selectedStudentIds.includes(st.id);
                  const isPrim = st.class_name.startsWith('P.');
                  const aggregate = isPrim ? 6 + (idx % 8) : 14 + (idx % 12);
                  const division = isPrim
                    ? aggregate <= 12
                      ? 'Division 1'
                      : aggregate <= 24
                      ? 'Division 2'
                      : aggregate <= 28
                      ? 'Division 3'
                      : 'Division 4'
                    : aggregate <= 18
                    ? 'Division 1'
                    : 'Division 2';

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={() => handleToggleSelectStudent(st.id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(st.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                          {st.first_name[0]}{st.last_name[0]}
                        </div>
                        <div>
                          <span>{st.first_name} {st.middle_name ? st.middle_name + ' ' : ''}{st.last_name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {st.house || 'Nile House'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {st.admission_number}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white">{st.class_name}</span>
                        <span className="text-slate-400 ml-1">({st.stream_name || 'Gold'})</span>
                      </td>

                      <td className="px-4 py-3">
                        {st.gender} • <span className="font-semibold">{st.age} yrs</span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        Aggregate {aggregate}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            division === 'Division 1'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {division}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveStudentForSingleReport(st)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-xs transition cursor-pointer ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View / Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE REPORT CARD MODAL */}
      {activeStudentForSingleReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
            {/* Modal Control Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Official Uganda Terminal Academic Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    printContent(
                      'printable-single-report-card',
                      `ReportCard_${activeStudentForSingleReport.admission_number}_${selectedTerm}`
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report Card</span>
                </button>
                <button
                  onClick={() => setActiveStudentForSingleReport(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Sheet */}
            <div
              id="printable-single-report-card"
              className="p-8 sm:p-10 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans print:p-0 print:overflow-visible bg-white"
            >
              {/* Official School Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 relative">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-xl border-2 border-amber-400">
                    {schoolProfile.name[0]}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                      {schoolProfile.name}
                    </h1>
                    <p className="text-xs italic font-serif text-slate-600">
                      "{schoolProfile.motto}"
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {schoolProfile.address}, {schoolProfile.district}, Uganda • Phone: {schoolProfile.phone}
                    </p>
                  </div>
                </div>

                <div className="inline-block bg-slate-900 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider mt-2">
                  Official Terminal Academic Progress Report • {selectedYear} {selectedTerm}
                </div>
              </div>

              {/* Learner Particulars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Learner Name</span>
                  <strong className="text-slate-950 font-bold">{activeStudentForSingleReport.first_name} {activeStudentForSingleReport.last_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission Number</span>
                  <strong className="font-mono text-slate-950">{activeStudentForSingleReport.admission_number}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Stream</span>
                  <strong className="text-slate-950">{activeStudentForSingleReport.class_name} ({activeStudentForSingleReport.stream_name || 'Gold'})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">National Standing</span>
                  <strong className="text-emerald-700 font-bold font-mono">Division 1 (Aggregate 6)</strong>
                </div>
              </div>

              {/* Subjects Assessment Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 w-20 text-center">Marks (/100)</th>
                    <th className="p-2.5 w-16 text-center">Grade</th>
                    <th className="p-2.5">Curriculum Descriptor & Remarks</th>
                    <th className="p-2.5 w-16 text-center">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {getStudentResults(activeStudentForSingleReport).map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{sub.name}</td>
                      <td className="p-2.5 font-mono font-bold text-center">{sub.marks}</td>
                      <td className="p-2.5 font-mono font-black text-center text-blue-700">{sub.grade}</td>
                      <td className="p-2.5 text-slate-600">{sub.remarks}</td>
                      <td className="p-2.5 font-mono text-center text-slate-400">{sub.teacher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Aggregate & Division Summary Box */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Marks</span>
                  <strong className="text-sm font-black text-slate-950 font-mono">359 / 400</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">PLE / Curriculum Aggregate</span>
                  <strong className="text-sm font-black text-blue-700 font-mono">Aggregate 6</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Overall Result Division</span>
                  <strong className="text-sm font-black text-emerald-700">Division 1 (First Grade)</strong>
                </div>
              </div>

              {/* Remarks & Signatures */}
              <div className="space-y-3 pt-2 text-[11px]">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <strong>Class Teacher's Remarks:</strong> A very hardworking, disciplined, and punctual learner with excellent analytical focus.
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <strong>Head Teacher's Remarks:</strong> Outstanding academic achievement. Maintain this standard for PLE glory.
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-b border-slate-400 h-8 mb-1"></div>
                  <p className="font-bold text-slate-900">Class Teacher Signature</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-8 mb-1 flex items-end justify-center pb-1">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest">OFFICIAL SEAL</span>
                  </div>
                  <p className="font-bold text-slate-900">School Stamp</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-8 mb-1"></div>
                  <p className="font-bold text-slate-900">Head Teacher Signature</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs print:hidden">
              <span className="text-slate-500">EduCore Ugandan School Management System</span>
              <button
                onClick={() => setActiveStudentForSingleReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN BATCH PRINT TEMPLATE (Activated when printing multiple selected students) */}
      <div id="printable-batch-report-cards" className="hidden space-y-12">
        {(selectedStudentIds.length > 0 ? students.filter((s) => selectedStudentIds.includes(s.id)) : categoryStudents).map((st) => (
          <div key={st.id} className="p-8 space-y-6 page-break-after">
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h1 className="text-xl font-black uppercase text-slate-950">{schoolProfile.name}</h1>
              <p className="text-xs italic">"{schoolProfile.motto}" • {schoolProfile.address}</p>
              <div className="inline-block bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase mt-2">
                Terminal Academic Progress Report • {selectedYear} {selectedTerm}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] p-2 rounded-xl bg-slate-50 border">
              <div>Student: <strong>{st.first_name} {st.last_name}</strong></div>
              <div>Adm No: <strong className="font-mono">{st.admission_number}</strong></div>
              <div>Class: <strong>{st.class_name} ({st.stream_name || 'Gold'})</strong></div>
              <div>Standing: <strong className="text-emerald-700">Division 1 (Agg 6)</strong></div>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase">
                <tr>
                  <th className="p-2">Subject</th>
                  <th className="p-2 text-center">Marks</th>
                  <th className="p-2 text-center">Grade</th>
                  <th className="p-2">Curriculum Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {getStudentResults(st).map((sub, i) => (
                  <tr key={i}>
                    <td className="p-2 font-bold">{sub.name}</td>
                    <td className="p-2 font-mono text-center">{sub.marks}</td>
                    <td className="p-2 font-mono font-bold text-center text-blue-700">{sub.grade}</td>
                    <td className="p-2 text-slate-600">{sub.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[10px] space-y-1">
              <p><strong>Class Teacher Remark:</strong> Hardworking, disciplined, and very promising student.</p>
              <p><strong>Head Teacher Remark:</strong> Outstanding achievement. Keep it up for PLE success.</p>
            </div>

            <div className="pt-4 border-t grid grid-cols-3 gap-4 text-center text-[9px]">
              <div>Class Teacher Signature</div>
              <div>School Stamp</div>
              <div>Head Teacher Signature</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
