import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Save,
  CheckCircle2,
  Calendar,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  Filter,
  Check,
  RotateCcw,
  Printer,
  ChevronDown,
  Download,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResultRecord } from '../../types';
import { downloadCSV, printContent } from '../../utils/printAndDownload';

export const ExamsView: React.FC = () => {
  const {
    exams,
    classes,
    subjects,
    students,
    staff,
    results,
    saveResultsBatch,
    showToast,
    schoolProfile,
    currentUser,
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState('P.7');
  const [selectedStream, setSelectedStream] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [enteredByName, setEnteredByName] = useState<string>(currentUser.full_name || 'Mrs. Sarah Namubiru (Dean of Studies)');

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Subjects applicable to this class
  const classSubjects = subjects.filter(
    (s) => s.classes.includes(selectedClass) || s.classes.length === 0
  );

  // Set default subject if not set or invalid for class
  useEffect(() => {
    if (classSubjects.length > 0) {
      const exists = classSubjects.some((s) => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(classSubjects[0].id);
      }
    }
  }, [selectedClass, classSubjects, selectedSubjectId]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || classSubjects[0] || subjects[0];

  // Determine if selected class is Primary or Secondary
  const isPrimary = selectedClass.startsWith('P.');
  const isLowerSecondary = ['S.1', 'S.2', 'S.3', 'S.4'].includes(selectedClass);

  // Current Uganda Education System Grading calculation
  const calculateUgandaGrade = (
    mark: number,
    isPrim: boolean
  ): { grade: string; remarks: string; levelBadge: string; points: number } => {
    if (isPrim) {
      // Uganda UNEB Primary Leaving Examination (PLE) 9-level scale
      if (mark >= 90) return { grade: 'D1', remarks: 'Exceptional Distinction', levelBadge: 'Distinction 1', points: 1 };
      if (mark >= 80) return { grade: 'D2', remarks: 'Very Good Distinction', levelBadge: 'Distinction 2', points: 2 };
      if (mark >= 70) return { grade: 'C3', remarks: 'Good Credit Pass', levelBadge: 'Credit 3', points: 3 };
      if (mark >= 60) return { grade: 'C4', remarks: 'Solid Credit Pass', levelBadge: 'Credit 4', points: 4 };
      if (mark >= 55) return { grade: 'C5', remarks: 'Moderate Credit Pass', levelBadge: 'Credit 5', points: 5 };
      if (mark >= 50) return { grade: 'C6', remarks: 'Fair Credit Pass', levelBadge: 'Credit 6', points: 6 };
      if (mark >= 45) return { grade: 'P7', remarks: 'Pass Standard', levelBadge: 'Pass 7', points: 7 };
      if (mark >= 40) return { grade: 'P8', remarks: 'Weak Pass Standard', levelBadge: 'Pass 8', points: 8 };
      return { grade: 'F9', remarks: 'Fail — Remedial intervention required', levelBadge: 'Fail 9', points: 9 };
    } else {
      // Uganda NCDC New Lower Secondary Competency-Based Assessment System
      if (mark >= 80) return { grade: 'A', remarks: 'Exceptional — Consistently demonstrates high competency & critical creativity', levelBadge: 'Level 3 (Score 2.5-3.0)', points: 5 };
      if (mark >= 70) return { grade: 'B', remarks: 'Outstanding — High competency application and good conceptual synthesis', levelBadge: 'Level 2 (Score 1.9-2.4)', points: 4 };
      if (mark >= 60) return { grade: 'C', remarks: 'Satisfactory — Meets curriculum competency benchmarks with good independence', levelBadge: 'Level 2 (Score 1.5-1.8)', points: 3 };
      if (mark >= 50) return { grade: 'D', remarks: 'Basic — Foundational competence emerging; further reinforcement needed', levelBadge: 'Level 1 (Score 1.0-1.4)', points: 2 };
      return { grade: 'E', remarks: 'Elementary — Needs targeted teacher intervention and support', levelBadge: 'Level 1 (Score <1.0)', points: 1 };
    }
  };

  // Filter students based on selected Category (Class, Stream, Gender)
  const filteredStudents = students.filter((s) => {
    const matchClass = s.class_name === selectedClass;
    const matchStream = selectedStream === 'ALL' || s.stream_name === selectedStream;
    const matchGender = selectedGender === 'ALL' || s.gender === selectedGender;
    const matchActive = s.status === 'Active';
    return matchClass && matchStream && matchGender && matchActive;
  });

  // Local working state for marks entry
  const [marksState, setMarksState] = useState<{
    [studentId: string]: {
      examMark: number;
      projectMark?: number;
      remarks: string;
      isSaved?: boolean;
    };
  }>({});

  // Sync working state when exam, class, or subject changes
  useEffect(() => {
    const map: any = {};
    filteredStudents.forEach((st) => {
      const existing = results.find(
        (r) =>
          r.exam_id === selectedExamId &&
          r.student_id === st.id &&
          (r.subject_id === selectedSubjectId || r.subject_name === selectedSubject?.name)
      );

      const defaultMark = existing ? existing.marks_obtained : 70;
      const gradeInfo = calculateUgandaGrade(defaultMark, isPrimary);
      map[st.id] = {
        examMark: defaultMark,
        projectMark: existing?.project_score || 8,
        remarks: existing?.remarks || existing?.teacher_comment || gradeInfo.remarks,
        isSaved: Boolean(existing),
      };
    });
    setMarksState(map);
  }, [selectedExamId, selectedClass, selectedSubjectId, selectedStream, selectedGender, results, isPrimary]);

  const handleMarkChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    const gradeInfo = calculateUgandaGrade(clamped, isPrimary);
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        examMark: clamped,
        remarks: gradeInfo.remarks,
        isSaved: false,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, text: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: text,
        isSaved: false,
      },
    }));
  };

  // Save batch of marks
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveMarks = async () => {
    if (!selectedExam || !selectedSubject) return;
    setIsSaving(true);
    try {
      const batch: ResultRecord[] = filteredStudents.map((st) => {
        const current = marksState[st.id] || { examMark: 65, remarks: '' };
        const gradeInfo = calculateUgandaGrade(current.examMark, isPrimary);

        return {
          id: `res-${selectedExam.id}-${st.id}-${selectedSubject.id}`,
          exam_id: selectedExam.id,
          exam_name: selectedExam.name,
          academic_year: selectedExam.academic_year || schoolProfile.current_academic_year,
          term: selectedExam.term || schoolProfile.current_term,
          student_id: st.id,
          student_name: `${st.first_name} ${st.last_name}`,
          admission_number: st.admission_number,
          class_name: st.class_name,
          stream_name: st.stream_name,
          subject_id: selectedSubject.id,
          subject_name: selectedSubject.name,
          subject_code: selectedSubject.code,
          marks_obtained: current.examMark,
          score_percentage: current.examMark,
          project_score: current.projectMark,
          grade: gradeInfo.grade,
          achievement_level: gradeInfo.levelBadge,
          remarks: current.remarks || gradeInfo.remarks,
          teacher_comment: current.remarks || gradeInfo.remarks,
          entered_by: enteredByName,
          is_published: selectedExam.is_published,
        };
      });

      await saveResultsBatch(batch);

      // Mark all in state as saved
      setMarksState((prev) => {
        const next: any = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = { ...next[k], isSaved: true };
        });
        return next;
      });

      showToast(`Saved marks batch for ${filteredStudents.length} learners! Entered by: ${enteredByName}`, 'success');
    } catch (err: any) {
      showToast('Error saving marks: ' + (err?.message || 'Error occurred'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save single student mark
  const handleSaveSingle = async (st: any) => {
    if (!selectedExam || !selectedSubject) return;
    const current = marksState[st.id] || { examMark: 65, remarks: '' };
    const gradeInfo = calculateUgandaGrade(current.examMark, isPrimary);

    const record: ResultRecord = {
      id: `res-${selectedExam.id}-${st.id}-${selectedSubject.id}`,
      exam_id: selectedExam.id,
      exam_name: selectedExam.name,
      academic_year: selectedExam.academic_year || schoolProfile.current_academic_year,
      term: selectedExam.term || schoolProfile.current_term,
      student_id: st.id,
      student_name: `${st.first_name} ${st.last_name}`,
      admission_number: st.admission_number,
      class_name: st.class_name,
      stream_name: st.stream_name,
      subject_id: selectedSubject.id,
      subject_name: selectedSubject.name,
      subject_code: selectedSubject.code,
      marks_obtained: current.examMark,
      score_percentage: current.examMark,
      grade: gradeInfo.grade,
      achievement_level: gradeInfo.levelBadge,
      remarks: current.remarks || gradeInfo.remarks,
      teacher_comment: current.remarks || gradeInfo.remarks,
      entered_by: enteredByName,
      is_published: selectedExam.is_published,
    };

    await saveResultsBatch([record]);
    setMarksState((prev) => ({
      ...prev,
      [st.id]: { ...prev[st.id], isSaved: true },
    }));
    showToast(`Mark for ${st.first_name} saved! Entered by: ${enteredByName}`, 'success');
  };

  // Export marksheet as CSV
  const handleExportCSV = () => {
    const headers = [
      'Adm. Number',
      'Student Name',
      'Class',
      'Stream',
      'Subject',
      'Exam',
      'Exam Mark (/100)',
      'Grade',
      'Achievement Level',
      'Entered By / Teacher',
      'Remarks',
    ];
    const rows = filteredStudents.map((st) => {
      const current = marksState[st.id] || { examMark: 65, remarks: '' };
      const gradeInfo = calculateUgandaGrade(current.examMark, isPrimary);
      return [
        st.admission_number,
        `${st.first_name} ${st.last_name}`,
        st.class_name,
        st.stream_name || 'General',
        selectedSubject?.name || 'Subject',
        selectedExam?.name || 'Exam',
        current.examMark,
        gradeInfo.grade,
        gradeInfo.levelBadge,
        enteredByName,
        current.remarks || gradeInfo.remarks,
      ];
    });
    downloadCSV(`Marksheet_${selectedClass}_${selectedSubject?.name || 'Subject'}_${selectedExam?.name || 'Exam'}`, headers, rows);
    showToast(`Exported marksheet for ${filteredStudents.length} learners!`, 'success');
  };

  const handlePrintMarksheet = () => {
    printContent('printable-exam-marksheet', `Exam Marksheet - ${selectedClass} ${selectedSubject?.name}`);
  };

  // Unique streams in this class
  const classStreams = Array.from(new Set(students.filter((s) => s.class_name === selectedClass).map((s) => s.stream_name).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Exams & Marks Entry Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isPrimary
              ? 'Ugandan UNEB Primary PLE Standard 9-Point Grading (D1, D2, C3, C4, C5, C6, P7, P8, F9)'
              : 'Ugandan NCDC New Lower Secondary Competency-Based Assessment (Grade A, B, C, D, E & Descriptors)'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            title="Download CSV Marksheet"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Print Marksheet */}
          <button
            onClick={handlePrintMarksheet}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Marksheet</span>
          </button>

          <button
            onClick={handleSaveMarks}
            disabled={isSaving || filteredStudents.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : `Save All Marks (${filteredStudents.length})`}</span>
          </button>
        </div>
      </div>

      {/* Selectors & Category Filters Drawer */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          {/* Examination */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Examination *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.term})
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Class *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStream('ALL');
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
              Stream Category
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Streams ({selectedClass})</option>
              {classStreams.map((st: any) => (
                <option key={st} value={st}>
                  Stream {st}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Gender Category
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Learners</option>
              <option value="Male">Boys (Male)</option>
              <option value="Female">Girls (Female)</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Subject *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-blue-500 font-bold text-blue-700 dark:text-blue-300 focus:outline-hidden"
            >
              {classSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Provision for Entry of Name of One Entering */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-blue-600" />
              <span>Entered By (Examiner) *</span>
            </label>
            <input
              type="text"
              required
              value={enteredByName}
              onChange={(e) => setEnteredByName(e.target.value)}
              placeholder="Name of one entering"
              list="staff-examiners-list"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-blue-300 dark:border-blue-700 font-bold text-slate-900 dark:text-white text-xs focus:outline-hidden"
            />
            <datalist id="staff-examiners-list">
              {staff.map((s) => (
                <option key={s.id} value={`${s.full_name} (${s.designation})`} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Grading System Indicator Bar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Active National Grading Scale:
            </span>
            <span className="font-extrabold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded text-[11px]">
              {isPrimary ? 'UNEB PLE 9-Point Scale' : 'Uganda NCDC Competency-Based Scale'}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-500">
            <span>Enrolled: <strong>{filteredStudents.length} Learners</strong></span>
            <span>Subject: <strong className="text-slate-900 dark:text-white">{selectedSubject?.name}</strong></span>
            <span>Entered by: <strong className="text-blue-700 dark:text-blue-400">{enteredByName}</strong></span>
          </div>
        </div>
      </div>

      {/* MARKS ENTRY TABLE (Display names, category, and direct option of entering marks) */}
      <div id="printable-exam-marksheet" className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Printable Header */}
        <div className="hidden print:block p-4 border-b border-slate-300 text-center">
          <h2 className="text-lg font-bold text-slate-900">{schoolProfile.name}</h2>
          <h3 className="text-sm font-bold uppercase text-slate-800">
            EXAMINATION MARKSHEET — {selectedExam?.name} ({selectedExam?.term})
          </h3>
          <p className="text-xs text-slate-600">
            Class: {selectedClass} {selectedStream !== 'ALL' ? `• Stream: ${selectedStream}` : ''} • Subject: {selectedSubject?.name}
          </p>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Marks Entry Officer / Examiner: {enteredByName}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Learner Name</th>
                <th className="px-4 py-3">Admission No</th>
                <th className="px-4 py-3">Category (Stream / Sex / House)</th>
                <th className="px-4 py-3 w-36">Marks (/100)</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Uganda Curriculum Descriptor / Remarks</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No learners found in {selectedClass} matching the selected category.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const current = marksState[st.id] || { examMark: 70, remarks: '', isSaved: false };
                  const gradeInfo = calculateUgandaGrade(current.examMark, isPrimary);

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                          {st.first_name[0]}{st.last_name[0]}
                        </div>
                        <div>
                          <span>{st.first_name} {st.middle_name ? st.middle_name + ' ' : ''}{st.last_name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal font-mono">
                            {st.gender}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {st.admission_number}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">
                            Stream {st.stream_name || 'Gold'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {st.house || 'Nile House'}
                          </span>
                        </div>
                      </td>

                      {/* Marks Entry Input */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={current.examMark}
                            onChange={(e) => handleMarkChange(st.id, parseInt(e.target.value) || 0)}
                            className="w-20 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-black text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-slate-400 text-xs">/100</span>
                        </div>
                      </td>

                      {/* Computed Grade */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black font-mono text-xs px-2.5 py-1 rounded-lg ${
                              gradeInfo.grade.startsWith('D1') || gradeInfo.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : gradeInfo.grade.startsWith('D2') || gradeInfo.grade === 'B'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : gradeInfo.grade.startsWith('C') || gradeInfo.grade === 'C'
                                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                                : gradeInfo.grade.startsWith('P') || gradeInfo.grade === 'D'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {gradeInfo.grade}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {gradeInfo.levelBadge}
                          </span>
                        </div>
                      </td>

                      {/* Remarks / Descriptors */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={current.remarks}
                          onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
                        />
                      </td>

                      {/* Single Save Action */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSaveSingle(st)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ml-auto ${
                            current.isSaved
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                          }`}
                        >
                          {current.isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{current.isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Batch Save */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Current Uganda National Assessment System • {isPrimary ? 'Primary Leaving Examination (PLE)' : 'New Lower Secondary Competency Curriculum'}
          </span>
          <button
            onClick={handleSaveMarks}
            disabled={isSaving || filteredStudents.length === 0}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : `Save All Marks for ${selectedClass}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
