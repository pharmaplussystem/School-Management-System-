import React from 'react';
import { X, Printer, ShieldCheck, Download } from 'lucide-react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { printContent } from '../../utils/printAndDownload';

interface StudentAdmissionPrintModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentAdmissionPrintModal: React.FC<StudentAdmissionPrintModalProps> = ({
  student,
  onClose,
}) => {
  const { schoolProfile, payments } = useApp();

  if (!student) return null;

  const handlePrint = () => {
    printContent('printable-admission-dossier', `Admission_Dossier_${student.admission_number}`);
  };

  const studentPayments = payments.filter((p) => p.student_id === student.id);
  const totalPaid = studentPayments.reduce((acc, p) => acc + p.amount_ugx, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Controls Toolbar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Official Student Admission Dossier</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Record</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="printable-admission-dossier"
          className="p-8 sm:p-10 overflow-y-auto print:p-0 print:overflow-visible space-y-6 text-xs text-slate-800 font-sans bg-white"
        >
          {/* Official Letterhead */}
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
                <p className="text-[10px] text-slate-400 font-mono">
                  UNEB Registration Centre • Ministry of Education & Sports Compliant
                </p>
              </div>
            </div>

            <div className="inline-block bg-slate-900 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider mt-2">
              Official Learner Admission & Permanent Record
            </div>
          </div>

          {/* Learner Summary Row */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="col-span-2 space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Learner Full Name</div>
              <div className="text-base font-black text-slate-950">
                {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-1">
                <span>Admission No: <strong className="font-mono text-slate-950">{student.admission_number}</strong></span>
                <span>Student ID: <strong className="font-mono text-slate-950">{student.student_id_number || student.id}</strong></span>
                <span>National LIN/NIN: <strong className="font-mono text-slate-950">{student.national_id || 'N/A'}</strong></span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center">
              <div className="w-20 h-24 rounded-xl border border-slate-300 bg-white overflow-hidden flex items-center justify-center text-slate-400 text-[10px] text-center p-1 font-mono">
                {student.photo_url ? (
                  <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>Passport Photo</span>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Status: {student.status}
              </span>
            </div>
          </div>

          {/* Section 1: Academic & Demographic Details */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              1. Academic Enrollment & Bio-Data
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Class & Stream</span>
                <strong className="text-slate-900">{student.class_name} {student.stream_name ? `(${student.stream_name})` : ''}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth / Age</span>
                <strong className="text-slate-900">{student.dob} ({student.age} years)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sex</span>
                <strong className="text-slate-900">{student.gender}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nationality</span>
                <strong className="text-slate-900">{student.nationality}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Religion</span>
                <strong className="text-slate-900">{student.religion || 'Not specified'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">House</span>
                <strong className="text-slate-900">{student.house || 'Nile House'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Admission Date</span>
                <strong className="text-slate-900">{student.admission_date}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Mobile Money Code</span>
                <strong className="text-slate-900 font-mono">{student.mobile_money_code || 'None'}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Residential Details */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              2. Residential & Physical Location
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">District of Residence</span>
                <strong className="text-slate-900">{student.district}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Village / Town</span>
                <strong className="text-slate-900">{student.village || 'N/A'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Street / Physical Address</span>
                <strong className="text-slate-900">{student.address}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Parent / Guardian Information */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              3. Parent / Guardian Particulars
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Guardian Full Name</span>
                <strong className="text-slate-900">{student.parent_name || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Relationship</span>
                <strong className="text-slate-900">{student.parent_relationship || 'Guardian'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Primary Telephone</span>
                <strong className="text-slate-900 font-mono">{student.parent_phone || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Alternative Phone</span>
                <strong className="text-slate-900 font-mono">{student.parent_alt_phone || 'None'}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">National ID (NIN)</span>
                <strong className="text-slate-900 font-mono">{student.parent_nin || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <strong className="text-slate-900">{student.parent_email || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Occupation</span>
                <strong className="text-slate-900">{student.parent_occupation || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                <strong className="text-slate-900 font-mono">{student.emergency_contact || student.parent_phone}</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Supporting Documents & Medical */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              4. Verified Documents & Medical Notes
            </h4>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Medical Notes & Allergies:</span>
                <p className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                  {student.medical_notes || 'No chronic health issues or allergies reported upon admission.'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Submitted Admission Documents ({student.documents?.length || 0}):</span>
                <ul className="list-disc list-inside text-slate-700 mt-1 space-y-0.5">
                  {student.documents && student.documents.length > 0 ? (
                    student.documents.map((d) => (
                      <li key={d.id} className="truncate">
                        {d.document_category} ({d.file_name})
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic">Standard bio-data verified at bursary</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Financial Clearance Summary */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              5. Financial Summary to Date
            </h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
              <span>Cumulative Fees Paid to Date: <strong className="font-mono text-emerald-700">UGX {totalPaid.toLocaleString()}</strong> ({studentPayments.length} receipts)</span>
              <span>Account Status: <strong className="text-blue-700">Enrolled & Active</strong></span>
            </div>
          </div>

          {/* Signatures & Stamps */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-600">
            <div>
              <div className="border-b border-slate-400 h-10 mb-1"></div>
              <p className="font-bold text-slate-900">Head Teacher Signature & Date</p>
              <p className="text-slate-400">{schoolProfile.name}</p>
            </div>
            <div>
              <div className="border-b border-slate-400 h-10 mb-1 flex items-end justify-center pb-1">
                <span className="text-slate-400 uppercase tracking-widest font-mono text-[9px]">OFFICIAL STAMP</span>
              </div>
              <p className="font-bold text-slate-900">Official School Seal</p>
              <p className="text-slate-400">Kampala, Uganda</p>
            </div>
            <div>
              <div className="border-b border-slate-400 h-10 mb-1"></div>
              <p className="font-bold text-slate-900">Parent / Guardian Signature</p>
              <p className="text-slate-400">Acknowledgment of School Rules</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs print:hidden">
          <span className="text-slate-500">EduCore Ugandan School Management System • Offline & Supabase Synchronized</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
