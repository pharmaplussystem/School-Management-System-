import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { printContent } from '../../utils/printAndDownload';

interface StudentIDCardModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentIDCardModal: React.FC<StudentIDCardModalProps> = ({ student, onClose }) => {
  const { schoolProfile } = useApp();

  if (!student) return null;

  const handlePrint = () => {
    printContent('printable-id-card', `StudentID_${student.admission_number}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Student Identity Card
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ID</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable ID Card Body */}
        <div className="p-6 flex justify-center bg-slate-100 dark:bg-slate-950">
          <div
            id="printable-id-card"
            className="w-80 h-[480px] rounded-2xl bg-white text-slate-900 shadow-xl border-2 border-blue-900 relative overflow-hidden flex flex-col justify-between"
          >
            {/* ID Header with School Color Gradient */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white p-3.5 text-center relative">
              <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-amber-400/20 p-1 border border-amber-400 flex items-center justify-center">
                <img src="icon.svg" alt="Crest" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider leading-tight">
                {schoolProfile.name}
              </h2>
              <p className="text-[9px] text-amber-300 font-semibold tracking-wide">
                STUDENT IDENTIFICATION CARD
              </p>
              <p className="text-[8px] text-blue-200">
                {schoolProfile.address}, {schoolProfile.district} • {schoolProfile.phone}
              </p>
            </div>

            {/* Student Photo & Identity Details */}
            <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
              {/* Photo Frame */}
              <div className="w-24 h-24 rounded-xl border-2 border-amber-500 bg-slate-100 shadow-md overflow-hidden mb-3 flex items-center justify-center">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.first_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl font-black text-blue-900">
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                )}
              </div>

              {/* Student Name */}
              <h3 className="font-extrabold text-sm text-slate-950 tracking-tight">
                {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
              </h3>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mt-1 border border-blue-200">
                CLASS: {student.class_name} {student.stream_name ? `(${student.stream_name})` : ''}
              </span>

              {/* Data Grid */}
              <div className="w-full mt-3 space-y-1 text-left text-[10px] border-t border-b border-slate-200 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Admission No:</span>
                  <span className="font-mono font-bold text-slate-900">{student.admission_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">House:</span>
                  <span className="font-bold text-slate-900">{student.house || 'Nile House'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Emergency Tel:</span>
                  <span className="font-bold text-slate-900">{student.emergency_contact || student.parent_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">District:</span>
                  <span className="font-bold text-slate-900">{student.district}</span>
                </div>
              </div>
            </div>

            {/* Card Footer with Signatory & Barcode placeholder */}
            <div className="bg-slate-50 p-2.5 border-t border-slate-200 text-center">
              <div className="flex items-center justify-between text-[8px] text-slate-500 mb-1 px-2">
                <span>Authorized Signatory</span>
                <span className="font-serif italic font-bold text-blue-900">Head Teacher</span>
              </div>
              <div className="w-full h-5 bg-slate-900 text-white font-mono text-[8px] tracking-widest flex items-center justify-center rounded">
                * {student.admission_number} *
              </div>
              <p className="text-[7px] text-slate-400 mt-1">
                This card remains the property of the school. If found, please return to {schoolProfile.name}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
