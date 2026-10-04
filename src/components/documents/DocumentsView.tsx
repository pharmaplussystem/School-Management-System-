import React, { useState } from 'react';
import {
  FileCheck,
  FileText,
  Upload,
  Download,
  Printer,
  Search,
  Filter,
  Plus,
  X,
  Eye,
  CheckCircle2,
  FolderOpen,
  Calendar,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadFile, printContent } from '../../utils/printAndDownload';

export interface SchoolFormTemplate {
  id: string;
  form_code: string;
  title: string;
  category:
    | 'Admissions & Enrollment'
    | 'Examinations & Academics'
    | 'Bursary & Finance'
    | 'Staff & Human Resources'
    | 'Administration & Safety';
  description: string;
  file_format: 'PDF' | 'DOCX' | 'XLSX';
  file_size: string;
  uploaded_at: string;
  uploaded_by: string;
  download_count: number;
  template_html: string;
}

const INITIAL_SCHOOL_FORMS: SchoolFormTemplate[] = [
  {
    id: 'frm-01',
    form_code: 'ADM-F01',
    title: 'Learner Official Admission & Registration Form',
    category: 'Admissions & Enrollment',
    description: 'Comprehensive learner biodata, parent/guardian particulars, emergency contacts, medical disclosures, and previous school history.',
    file_format: 'PDF',
    file_size: '240 KB',
    uploaded_at: '2026-01-10',
    uploaded_by: 'School Registrar',
    download_count: 142,
    template_html: `
      <h2>LEARNER OFFICIAL ADMISSION & REGISTRATION FORM</h2>
      <p><strong>Section A: Learner Biodata</strong></p>
      <p>Full Name: ____________________________________ Sex: [ ] Male [ ] Female</p>
      <p>Date of Birth: _____/_____/_________ National ID / LIN: _______________________</p>
      <p>Class Applied For: __________________ Stream Preference: ____________________</p>
      <p>Previous School Attended: ______________________ Last PLE/UNEB Aggregate: ______</p>
      <hr />
      <p><strong>Section B: Parent / Guardian Undertaking</strong></p>
      <p>Primary Guardian Name: ___________________________ Relationship: ______________</p>
      <p>Telephone: ______________________ Alt Telephone: ___________________________</p>
      <p>Physical Address / District / Village: _________________________________________</p>
      <p>I commit to abiding by all school regulations and paying fees on schedule.</p>
      <p>Signature: ___________________________ Date: _____/_____/_________</p>
    `,
  },
  {
    id: 'frm-02',
    form_code: 'MED-F02',
    title: 'Learner Medical Examination & Health Disclosure Form',
    category: 'Admissions & Enrollment',
    description: 'Statutory health declaration, immunization records, chronic condition disclosure, allergies, and emergency medical treatment consent.',
    file_format: 'PDF',
    file_size: '185 KB',
    uploaded_at: '2026-01-12',
    uploaded_by: 'School Health Nurse',
    download_count: 98,
    template_html: `
      <h2>LEARNER MEDICAL EXAMINATION & HEALTH DISCLOSURE</h2>
      <p>Learner Name: _________________________________ Class: _____________________</p>
      <p>Blood Group: __________ Known Allergies: ____________________________________</p>
      <p>Chronic Medical Conditions (Asthma, Sickle Cell, Epilepsy, etc.): ________________</p>
      <p>Immunization Status: [ ] Complete [ ] Incomplete</p>
      <p>Registered Medical Doctor Signature: __________________ Clinic Stamp: _________</p>
    `,
  },
  {
    id: 'frm-03',
    form_code: 'EXM-F03',
    title: 'Termly Marks & Continuous Assessment Score Sheet',
    category: 'Examinations & Academics',
    description: 'Teacher grade book template for entering beginning of term, mid-term, and end-of-term marks with competence remarks.',
    file_format: 'XLSX',
    file_size: '310 KB',
    uploaded_at: '2026-01-18',
    uploaded_by: 'Director of Studies (DOS)',
    download_count: 215,
    template_html: `
      <h2>CONTINUOUS ASSESSMENT & EXAM SCORE SHEET</h2>
      <p>Academic Year: 2026 | Term: Term 1 | Subject: ________________ Class: _________</p>
      <p>Subject Teacher: ___________________________________________________________</p>
      <table border="1" style="width:100%; border-collapse: collapse; text-align: left;">
        <tr>
          <th>No</th><th>Adm No</th><th>Learner Name</th><th>BOT (30%)</th><th>EOT (70%)</th><th>Total</th><th>Grade</th><th>Remarks</th>
        </tr>
        <tr><td>1</td><td>ADM-001</td><td>Sample Student</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>2</td><td>ADM-002</td><td>Sample Student</td><td></td><td></td><td></td><td></td><td></td></tr>
      </table>
    `,
  },
  {
    id: 'frm-04',
    form_code: 'FIN-F04',
    title: 'School Fees Payment Commitment & Installment Agreement',
    category: 'Bursary & Finance',
    description: 'Legal agreement between parent/guardian and bursar for phased payment of school dues with milestone dates.',
    file_format: 'PDF',
    file_size: '190 KB',
    uploaded_at: '2026-01-20',
    uploaded_by: 'Bursar',
    download_count: 84,
    template_html: `
      <h2>FEES PAYMENT COMMITMENT & INSTALLMENT PLAN</h2>
      <p>Learner: _______________________________ Adm No: _____________ Class: _______</p>
      <p>Total Billed Fees: UGX _____________________ Initial Deposit: UGX ______________</p>
      <p>Balance Outstanding: UGX __________________</p>
      <p>Installment 1: UGX ________________ Due Date: _____/_____/_________</p>
      <p>Installment 2: UGX ________________ Due Date: _____/_____/_________</p>
      <p>Parent Signature: _________________________ Bursar Signature: ________________</p>
    `,
  },
  {
    id: 'frm-05',
    form_code: 'STF-F05',
    title: 'Staff Leave Application & Relief Undertaking Form',
    category: 'Staff & Human Resources',
    description: 'Official application for Annual, Sick, Maternity, Paternity, Study or Compassionate leave with relief staff handover section.',
    file_format: 'DOCX',
    file_size: '220 KB',
    uploaded_at: '2026-02-01',
    uploaded_by: 'Human Resources / Secretary',
    download_count: 176,
    template_html: `
      <h2>STAFF OFFICIAL LEAVE APPLICATION & HANDOVER FORM</h2>
      <p>Staff Name: __________________________________ Staff ID: ___________________</p>
      <p>Department: _________________________________ Designation: _________________</p>
      <p>Leave Category: [ ] Annual [ ] Sick [ ] Maternity [ ] Paternity [ ] Other</p>
      <p>Leave Duration: From: _____/_____/_________ To: _____/_____/_________ (_____ Days)</p>
      <p>Relief Colleague Undertaking Classes: ________________________________________</p>
      <p>Relief Colleague Signature: _________________________________________________</p>
      <p>Head Teacher Approval: [ ] Recommended [ ] Approved [ ] Declined</p>
      <p>Administrative Minute: _____________________________________________________</p>
    `,
  },
  {
    id: 'frm-06',
    form_code: 'STF-F06',
    title: 'Staff Grievance & Formal Complaint Lodging Form',
    category: 'Staff & Human Resources',
    description: 'Confidential form for staff to submit workplace grievances, complaints, queries or suggestions to management.',
    file_format: 'PDF',
    file_size: '175 KB',
    uploaded_at: '2026-02-05',
    uploaded_by: 'Human Resources',
    download_count: 53,
    template_html: `
      <h2>STAFF GRIEVANCE & WORKPLACE QUERY FORM</h2>
      <p>Name of Complainant / Staff: ________________________________________________</p>
      <p>Designation: __________________________ Department: _________________________</p>
      <p>Nature of Complaint: [ ] Workplace Safety [ ] Disciplinary Query [ ] Administrative</p>
      <p>Detailed Summary of Incident / Query:</p>
      <p>__________________________________________________________________________</p>
      <p>__________________________________________________________________________</p>
      <p>Remedy / Resolution Desired: _________________________________________________</p>
    `,
  },
  {
    id: 'frm-07',
    form_code: 'OPS-F07',
    title: 'Learner School Gate Pass / Official Exit Permission Slip',
    category: 'Administration & Safety',
    description: 'Security clearance pass for students leaving school premises during school hours, signed by Class Teacher and Gate Guard.',
    file_format: 'PDF',
    file_size: '130 KB',
    uploaded_at: '2026-02-10',
    uploaded_by: 'Dean of Students',
    download_count: 320,
    template_html: `
      <h2>OFFICIAL LEARNER EXIT & GATE PASS SLIP</h2>
      <p>Learner Name: ________________________________ Class: ______________________</p>
      <p>Departure Time: __________:__________ Expected Return: __________:__________</p>
      <p>Reason for Exit: ___________________________________________________________</p>
      <p>Accompanying Person: ______________________ Relationship: ___________________</p>
      <p>Authorized By (Teacher on Duty): _________________ Security Gate Check: ________</p>
    `,
  },
  {
    id: 'frm-08',
    form_code: 'OPS-F08',
    title: 'Parental Consent & Indemnity Form for School Excursions',
    category: 'Administration & Safety',
    description: 'Parental permission slip and medical clearance for field trips, sports tours, science exhibitions, and study visits.',
    file_format: 'PDF',
    file_size: '195 KB',
    uploaded_at: '2026-02-14',
    uploaded_by: 'Dean of Students',
    download_count: 145,
    template_html: `
      <h2>EXCURSION / EDUCATIONAL TOUR PARENTAL CONSENT & INDEMNITY</h2>
      <p>Learner Name: ________________________________ Class: ______________________</p>
      <p>Destination: ________________________________ Date of Trip: _____/_____/______</p>
      <p>I consent to my child participating in the above educational activity.</p>
      <p>Parent Name: _______________________________ Signature: ___________________</p>
      <p>Emergency Contact: __________________________ Medical Notes: ________________</p>
    `,
  },
];

export const DocumentsView: React.FC = () => {
  const { schoolProfile, showToast, activeRole } = useApp();

  const [formsList, setFormsList] = useState<SchoolFormTemplate[]>(INITIAL_SCHOOL_FORMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Preview / Print Modal
  const [previewForm, setPreviewForm] = useState<SchoolFormTemplate | null>(null);

  // Upload Form Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<SchoolFormTemplate['category']>('Admissions & Enrollment');
  const [newDescription, setNewDescription] = useState('');
  const [newFormat, setNewFormat] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF');
  const [newTemplateBody, setNewTemplateBody] = useState('');

  // Categories list
  const categories = [
    'ALL',
    'Admissions & Enrollment',
    'Examinations & Academics',
    'Bursary & Finance',
    'Staff & Human Resources',
    'Administration & Safety',
  ];

  // Filtering
  const filteredForms = formsList.filter((f) => {
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchesQuery =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.form_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Download Handler (generates clean text or printable file)
  const handleDownloadForm = (form: SchoolFormTemplate) => {
    // Generate clean template text for the user
    const textContent = `
================================================================================
${schoolProfile.school_name.toUpperCase()}
${schoolProfile.school_address} • Tel: ${schoolProfile.phone_contact} • Email: ${schoolProfile.email_contact}
OFFICIAL SCHOOL FORM: ${form.title.toUpperCase()}
Form Code: ${form.form_code} | Category: ${form.category}
Generated: ${new Date().toLocaleDateString('en-GB')}
================================================================================

${form.description}

--------------------------------------------------------------------------------
FORM BODY & FIELDS:
--------------------------------------------------------------------------------
${form.template_html
  .replace(/<p>/gi, '')
  .replace(/<\/p>/gi, '\n')
  .replace(/<h2>/gi, '\n=== ')
  .replace(/<\/h2>/gi, ' ===\n')
  .replace(/<hr \/>/gi, '\n--------------------------------------------------------------------------------\n')
  .replace(/<[^>]+>/g, '')}

================================================================================
Official School Stamp & Registrar Signature:
Date: ________________________  Stamp: [                          ]
================================================================================
    `.trim();

    downloadFile(
      `${form.form_code}_${form.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      textContent,
      'text/plain;charset=utf-8'
    );

    // Update download count
    setFormsList((prev) =>
      prev.map((item) => (item.id === form.id ? { ...item, download_count: item.download_count + 1 } : item))
    );

    showToast(`Downloaded "${form.title}" successfully!`, 'success');
  };

  // Print Handler
  const handlePrintForm = (form: SchoolFormTemplate) => {
    const printDocId = `printable-form-${form.id}`;
    printContent(printDocId, `${form.form_code} - ${form.title}`);
    showToast(`Opening print dialog for "${form.title}"...`, 'info');
  };

  // Handle New Form Submission
  const handleUploadNewForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const nextCode = newCode || `SCH-F0${formsList.length + 1}`;
    const newFormItem: SchoolFormTemplate = {
      id: `frm-${Date.now()}`,
      form_code: nextCode,
      title: newTitle,
      category: newCategory,
      description: newDescription || `Official ${newCategory} form template for school use.`,
      file_format: newFormat,
      file_size: '150 KB',
      uploaded_at: new Date().toISOString().split('T')[0],
      uploaded_by: `${activeRole} (${schoolProfile.school_name})`,
      download_count: 1,
      template_html:
        newTemplateBody ||
        `
        <h2>${newTitle.toUpperCase()}</h2>
        <p>Form Code: ${nextCode} | Category: ${newCategory}</p>
        <p>Instructions: Please complete all required sections legibly and submit to the office.</p>
        <hr />
        <p>Full Name: _________________________________________________________________</p>
        <p>Class / Department: _________________________ Date: _____/_____/_________</p>
        <p>Particulars / Details: _____________________________________________________</p>
        <p>__________________________________________________________________________</p>
        <p>Signature: ________________________________ Official Stamp: _______________</p>
      `,
    };

    setFormsList([newFormItem, ...formsList]);
    setIsUploadOpen(false);
    setNewTitle('');
    setNewCode('');
    setNewDescription('');
    setNewTemplateBody('');
    showToast(`Form "${newTitle}" uploaded and available for use!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>SCHOOL FORMS & TEMPLATES REPOSITORY</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Downloadable & Printable Admission Forms, Exam Marksheets, Fees Agreements, Leave Forms & Gate Passes
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Form / Template</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat === 'ALL' ? `All School Forms (${formsList.length})` : cat}
          </button>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search forms by title, form code (e.g. ADM-F01), or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          />
        </div>

        <span className="text-slate-400 font-medium">
          Showing {filteredForms.length} of {formsList.length} official forms
        </span>
      </div>

      {/* Forms Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {form.form_code}
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {form.file_format} • {form.file_size}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 transition">
                {form.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                {form.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400">
                Uploaded: {form.uploaded_at} • {form.download_count} downloads
              </span>

              <div className="flex items-center gap-1.5">
                {/* Preview Button */}
                <button
                  onClick={() => setPreviewForm(form)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
                  title="Preview Form Structure"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                {/* Print Button */}
                <button
                  onClick={() => handlePrintForm(form)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
                  title="Print Clean Official Form"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {/* Download Button */}
                <button
                  onClick={() => handleDownloadForm(form)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition cursor-pointer"
                  title="Download Editable Form Template"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* FORM PREVIEW MODAL                                                        */}
      {/* ========================================================================= */}
      {previewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div>
                <span className="font-mono text-[10px] font-bold text-blue-600 block">
                  {previewForm.form_code} • {previewForm.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {previewForm.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewForm(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed bg-slate-50/50 dark:bg-slate-950/40">
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700 font-sans">
                <h2 className="text-lg font-bold uppercase">{schoolProfile.school_name}</h2>
                <p className="text-xs text-slate-500">{schoolProfile.school_address} • Tel: {schoolProfile.phone_contact}</p>
                <span className="text-[11px] font-mono font-bold text-blue-600 mt-1 block">
                  REF: {previewForm.form_code}
                </span>
              </div>

              <div
                className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: previewForm.template_html }}
              />

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 font-sans text-[11px] grid grid-cols-2 gap-6 text-center">
                <div className="border-t pt-2">
                  <span>Applicant / Parent Signature & Date</span>
                </div>
                <div className="border-t pt-2">
                  <span>Authorized School Officer Signature & Stamp</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setPreviewForm(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handlePrintForm(previewForm);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>

                <button
                  onClick={() => {
                    handleDownloadForm(previewForm);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD NEW FORM MODAL                                                     */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload New Official Form / Template
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadNewForm} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Form Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Laboratory Equipment Breakage & Liability Form"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Form Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. LAB-F09"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Admissions & Enrollment">Admissions & Enrollment</option>
                    <option value="Examinations & Academics">Examinations & Academics</option>
                    <option value="Bursary & Finance">Bursary & Finance</option>
                    <option value="Staff & Human Resources">Staff & Human Resources</option>
                    <option value="Administration & Safety">Administration & Safety</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Form Description & Purpose
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of how this form is utilized and who completes it..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Form Template Body & Fields (Optional text structure)
                </label>
                <textarea
                  rows={4}
                  value={newTemplateBody}
                  onChange={(e) => setNewTemplateBody(e.target.value)}
                  placeholder="Enter sections, fields or questions (e.g. Section 1: Learner Name, Class, Equipment Description, Date...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer transition"
                >
                  Upload & Register Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Clean Printable Containers for isolated printing */}
      <div className="hidden">
        {formsList.map((form) => (
          <div key={form.id} id={`printable-form-${form.id}`} className="p-8 space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold uppercase">{schoolProfile.school_name}</h1>
              <p className="text-sm">{schoolProfile.school_address} • Tel: {schoolProfile.phone_contact}</p>
              <h2 className="text-lg font-bold mt-2 uppercase">{form.title}</h2>
              <p className="text-xs text-slate-500 font-mono">Official Reference: {form.form_code} | {form.category}</p>
            </div>

            <div
              className="text-xs space-y-4"
              dangerouslySetInnerHTML={{ __html: form.template_html }}
            />

            <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
              <div className="border-t pt-2">
                <span>Applicant / Parent Signature & Date</span>
              </div>
              <div className="border-t pt-2">
                <span>Authorized School Officer Signature & Stamp</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
