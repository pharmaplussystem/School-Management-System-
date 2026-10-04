import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Users,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassItem, SubjectItem } from '../../types';

export const ClassesView: React.FC = () => {
  const { classes, subjects, teachers, students, schoolProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');
  const [selectedClass, setSelectedClass] = useState<ClassItem>(classes[6] || classes[0]); // default P.7

  const classStudents = students.filter((s) => s.class_name === selectedClass?.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            Classes, Streams & Curriculum
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ugandan Educational Levels • Primary (P.1–P.7) & Secondary (S.1–S.4) • Subject Allocations
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'classes'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Classes & Streams ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'subjects'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Subjects & Curriculum ({subjects.length})
          </button>
        </div>
      </div>

      {activeTab === 'classes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Ugandan Academic Classes
            </h3>
            <div className="space-y-1.5">
              {classes.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                const count = students.filter((s) => s.class_name === cls.name).length;

                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-950 shadow-md dark:bg-blue-600'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm">{cls.name}</div>
                      <div className={`text-[11px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {cls.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {count} learners
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Detail Dossier */}
          {selectedClass && (
            <div className="lg:col-span-2 space-y-5">
              {/* Class Header Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 uppercase">
                      {selectedClass.level} Level
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedClass.name} — {selectedClass.description}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
                      {classStudents.length}
                    </span>
                    <span className="block text-[10px] text-slate-400">Enrolled Learners</span>
                  </div>
                </div>

                {/* Streams */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Class Streams & Stream Teachers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedClass.streams.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 dark:text-white">Stream: {st.name}</strong>
                          <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Class Teacher: <strong className="text-slate-700 dark:text-slate-200">{st.class_teacher_name || 'Assigned by Headteacher'}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learners in this class */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Enrolled Learners ({classStudents.length})</span>
                  <span className="text-[11px] font-normal text-slate-400">Academic Year {schoolProfile.current_academic_year}</span>
                </h3>

                {classStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No learners currently allocated to {selectedClass.name}.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {classStudents.map((st) => (
                      <div key={st.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                            {st.first_name[0]}{st.last_name[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {st.first_name} {st.last_name}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {st.admission_number} • Stream: {st.stream_name || 'Gold'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SUBJECTS TAB */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
            <strong>Uganda National Curriculum Assessment:</strong> Subjects conform to UNEB (Uganda National Examinations Board) and NCDC (National Curriculum Development Centre) standards for Primary and Lower Secondary.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  {sub.is_compulsory || sub.is_core ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      CORE SUBJECT
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      ELECTIVE
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{sub.name}</h4>
                <div className="text-slate-400 text-[11px]">
                  Department: <strong className="text-slate-600 dark:text-slate-300">{sub.department}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
