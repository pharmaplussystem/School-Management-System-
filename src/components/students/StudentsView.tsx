import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  CreditCard,
  Printer,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Users,
  MapPin,
  X,
  Upload,
  FileText,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, StudentDocumentItem } from '../../types';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentIDCardModal } from './StudentIDCardModal';
import { StudentFeePaymentModal } from './StudentFeePaymentModal';
import { StudentAdmissionPrintModal } from './StudentAdmissionPrintModal';
import { uploadDocument } from '../../services/documentStorage';
import { printContent, downloadCSV } from '../../utils/printAndDownload';

export const StudentsView: React.FC = () => {
  const { students, classes, addStudent, updateStudent, deleteStudent, schoolProfile, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');

  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedStudentForID, setSelectedStudentForID] = useState<Student | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Helper to compute age from DOB
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  // Form State
  const [formData, setFormData] = useState<{
    first_name: string;
    middle_name: string;
    last_name: string;
    admission_number: string;
    student_id_number: string;
    dob: string;
    age: number;
    gender: 'Male' | 'Female';
    nationality: string;
    religion: string;
    blood_group: string;
    class_id: string;
    class_name: string;
    stream_name: string;
    house: string;
    admission_date: string;
    status: Student['status'];
    phone: string;
    email: string;
    address: string;
    district: string;
    village: string;
    // Parent/guardian info
    parent_name: string;
    parent_relationship: string;
    parent_sex: 'Male' | 'Female';
    parent_dob: string;
    parent_phone: string;
    parent_alt_phone: string;
    parent_email: string;
    parent_address: string;
    parent_occupation: string;
    parent_religion: string;
    parent_nin: string;
    parent_photo_url: string;
    // Mobile Money separate registered code
    mobile_money_code: string;
    // Medical & emergency
    emergency_contact: string;
    medical_notes: string;
    previous_school: string;
    photo_url: string;
    national_id: string;
    documents: StudentDocumentItem[];
  }>({
    first_name: '',
    middle_name: '',
    last_name: '',
    admission_number: '',
    student_id_number: '',
    dob: '2014-06-12',
    age: 12,
    gender: 'Male',
    nationality: 'Ugandan',
    religion: 'Anglican',
    blood_group: 'O+',
    class_id: 'cls-p7',
    class_name: 'P.7',
    stream_name: 'Gold',
    house: 'Nile House (Blue)',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    phone: '',
    email: '',
    address: 'Nakasero Road',
    district: 'Kampala',
    village: 'Civic Centre',
    parent_name: '',
    parent_relationship: 'Father',
    parent_sex: 'Male',
    parent_dob: '1980-04-15',
    parent_phone: '+256 7',
    parent_alt_phone: '+256 7',
    parent_email: '',
    parent_address: 'Nakasero Road, Kampala',
    parent_occupation: 'Business Professional',
    parent_religion: 'Anglican',
    parent_nin: '',
    parent_photo_url: '',
    mobile_money_code: '',
    emergency_contact: '+256 7',
    medical_notes: '',
    previous_school: '',
    photo_url: '',
    national_id: '',
    documents: [],
  });

  const [uploadCategory, setUploadCategory] = useState<StudentDocumentItem['document_category']>('Student Passport Photo');
  const [isUploading, setIsUploading] = useState(false);

  const handleDobChange = (dobVal: string) => {
    const ageVal = calculateAge(dobVal);
    setFormData((prev) => ({ ...prev, dob: dobVal, age: ageVal }));
  };

  const handleOpenAddModal = (studentToEdit?: Student) => {
    if (studentToEdit) {
      setEditingStudent(studentToEdit);
      setFormData({
        first_name: studentToEdit.first_name,
        middle_name: studentToEdit.middle_name || '',
        last_name: studentToEdit.last_name,
        admission_number: studentToEdit.admission_number,
        student_id_number: studentToEdit.student_id_number || studentToEdit.id,
        dob: studentToEdit.dob,
        age: studentToEdit.age || calculateAge(studentToEdit.dob),
        gender: studentToEdit.gender,
        nationality: studentToEdit.nationality || 'Ugandan',
        religion: studentToEdit.religion || 'Anglican',
        blood_group: studentToEdit.blood_group || 'O+',
        class_id: studentToEdit.class_id,
        class_name: studentToEdit.class_name,
        stream_name: studentToEdit.stream_name || 'Gold',
        house: studentToEdit.house || 'Nile House (Blue)',
        admission_date: studentToEdit.admission_date,
        status: studentToEdit.status,
        phone: studentToEdit.phone || '',
        email: studentToEdit.email || '',
        address: studentToEdit.address,
        district: studentToEdit.district,
        village: studentToEdit.village || '',
        parent_name: studentToEdit.parent_name || '',
        parent_relationship: studentToEdit.parent_relationship || 'Guardian',
        parent_sex: studentToEdit.parent_sex || 'Male',
        parent_dob: studentToEdit.parent_dob || '1980-01-01',
        parent_phone: studentToEdit.parent_phone || '',
        parent_alt_phone: studentToEdit.parent_alt_phone || '',
        parent_email: studentToEdit.parent_email || '',
        parent_address: studentToEdit.parent_address || studentToEdit.address,
        parent_occupation: studentToEdit.parent_occupation || '',
        parent_religion: studentToEdit.parent_religion || 'Anglican',
        parent_nin: studentToEdit.parent_nin || '',
        parent_photo_url: studentToEdit.parent_photo_url || '',
        mobile_money_code: studentToEdit.mobile_money_code || '',
        emergency_contact: studentToEdit.emergency_contact || '',
        medical_notes: studentToEdit.medical_notes || '',
        previous_school: studentToEdit.previous_school || '',
        photo_url: studentToEdit.photo_url || '',
        national_id: studentToEdit.national_id || '',
        documents: studentToEdit.documents || [],
      });
    } else {
      setEditingStudent(null);
      const nextNum = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        admission_number: `EMA/${year}/${nextNum}`,
        student_id_number: `STU-${year}-${nextNum}`,
        dob: '2014-06-12',
        age: 12,
        gender: 'Male',
        nationality: 'Ugandan',
        religion: 'Anglican',
        blood_group: 'O+',
        class_id: 'cls-p7',
        class_name: 'P.7',
        stream_name: 'Gold',
        house: 'Nile House (Blue)',
        admission_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        phone: '',
        email: '',
        address: 'Nakasero Road',
        district: 'Kampala',
        village: 'Civic Centre',
        parent_name: '',
        parent_relationship: 'Father',
        parent_sex: 'Male',
        parent_dob: '1982-03-20',
        parent_phone: '+256 7',
        parent_alt_phone: '+256 7',
        parent_email: '',
        parent_address: 'Kampala',
        parent_occupation: 'Trader / Civil Servant',
        parent_religion: 'Anglican',
        parent_nin: '',
        parent_photo_url: '',
        mobile_money_code: `MM-UG-${nextNum}`,
        emergency_contact: '+256 7',
        medical_notes: '',
        previous_school: '',
        photo_url: '',
        national_id: '',
        documents: [],
      });
    }
    setIsAddModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stored = await uploadDocument(file, 'student_documents');
        const docItem: StudentDocumentItem = {
          id: 'sdoc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          student_id: editingStudent?.id || 'new',
          file_name: stored.fileName,
          file_type: stored.fileType,
          storage_path: stored.storagePath,
          upload_date: new Date().toISOString().split('T')[0],
          uploaded_by: 'Registrar',
          document_category: uploadCategory,
          file_size: stored.fileSize,
          file_url: stored.fileUrl,
        };

        setFormData((prev) => {
          let updatedPhoto = prev.photo_url;
          let updatedParentPhoto = prev.parent_photo_url;
          if (uploadCategory === 'Student Passport Photo') {
            updatedPhoto = stored.fileUrl;
          } else if (uploadCategory === 'Parent Passport Photo') {
            updatedParentPhoto = stored.fileUrl;
          }
          return {
            ...prev,
            photo_url: updatedPhoto,
            parent_photo_url: updatedParentPhoto,
            documents: [...prev.documents, docItem],
          };
        });
      }
    } catch (err: any) {
      alert('Error uploading document: ' + (err?.message || 'Error occurred'));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.admission_number) {
      alert('Please provide student first name, last name, and admission number');
      return;
    }

    if (editingStudent) {
      await updateStudent({
        ...editingStudent,
        ...formData,
      });
    } else {
      await addStudent({
        ...formData,
      });
    }

    setIsAddModalOpen(false);
  };

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.student_id_number && s.student_id_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.mobile_money_code && s.mobile_money_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = classFilter === 'ALL' || s.class_name === classFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;

    return matchesSearch && matchesClass && matchesStatus && matchesGender;
  });

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'Admission Number',
      'Student ID',
      'First Name',
      'Middle Name',
      'Last Name',
      'Gender',
      'Date of Birth',
      'Age',
      'Class',
      'Stream',
      'House',
      'District',
      'Village',
      'Parent Name',
      'Parent Phone',
      'Mobile Money Code',
      'Status',
    ];

    const rows = filteredStudents.map((s) => [
      s.admission_number,
      s.student_id_number || s.id,
      s.first_name,
      s.middle_name || '',
      s.last_name,
      s.gender,
      s.dob,
      `${s.age}`,
      s.class_name,
      s.stream_name || '',
      s.house || '',
      s.district,
      s.village || '',
      s.parent_name || '',
      s.parent_phone || '',
      s.mobile_money_code || '',
      s.status,
    ]);

    downloadCSV(`EduCore_Students_Register_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast(`Exported ${filteredStudents.length} learners to CSV!`, 'success');
  };

  const handlePrintStudentList = () => {
    printContent('printable-students-directory', `Learners_Directory_${new Date().toISOString().split('T')[0]}`);
    showToast('Opening print dialog for learners register...', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>Students & Admissions</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total Enrolled: <strong>{students.length} Learners</strong> • Uganda National Curriculum Records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Student Directory Action */}
          <button
            onClick={handlePrintStudentList}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Print Student Directory"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Student List</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search learner by name, admission no, MoMo code, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Class Filter */}
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
        >
          <option value="ALL">All Classes (P.1–S.4)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Gender Filter */}
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
        >
          <option value="ALL">All Genders</option>
          <option value="Male">Boys (Male)</option>
          <option value="Female">Girls (Female)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Graduated">Graduated</option>
          <option value="Transferred">Transferred</option>
          <option value="Suspended">Suspended</option>
          <option value="Left school">Left School</option>
        </select>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Learner Name</th>
                <th className="px-4 py-3">Adm No / ID</th>
                <th className="px-4 py-3">Class & Stream</th>
                <th className="px-4 py-3">Sex / Age</th>
                <th className="px-4 py-3">Parent / Guardian</th>
                <th className="px-4 py-3">MoMo Payment Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No learners match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                        {st.photo_url ? (
                          <img src={st.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{st.first_name[0]}{st.last_name[0]}</span>
                        )}
                      </div>
                      <div>
                        <span>
                          {st.first_name} {st.middle_name ? st.middle_name + ' ' : ''}{st.last_name}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {st.house || 'Nile House'} • {st.district}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-blue-700 dark:text-blue-400">{st.admission_number}</div>
                      <div className="text-[10px] text-slate-400">{st.student_id_number || st.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white">{st.class_name}</span>
                      {st.stream_name && (
                        <span className="text-slate-400 ml-1">({st.stream_name})</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {st.gender} • <span className="font-semibold">{st.age} yrs</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{st.parent_name || 'Guardian'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.parent_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {st.mobile_money_code ? (
                        <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                          {st.mobile_money_code}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* RECORD PAYMENT ACTION BUTTON */}
                        <button
                          onClick={() => setSelectedStudentForPayment(st)}
                          title="Record Payment for this Student"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>

                        {/* View Complete Dossier */}
                        <button
                          onClick={() => setSelectedStudentForProfile(st)}
                          title="View Complete Profile Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Print Student Admission Dossier */}
                        <button
                          onClick={() => setSelectedStudentForPrint(st)}
                          title="Print Student Record"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit Student */}
                        <button
                          onClick={() => handleOpenAddModal(st)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          <Users className="w-4 h-4" />
                        </button>

                        {/* Archive / Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Archive student ${st.first_name} ${st.last_name}?`)) {
                              deleteStudent(st.id);
                            }
                          }}
                          title="Archive / Remove"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL WITH ALL SPECIFIED FIELDS & SUPABASE STORAGE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            <div className="p-5 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">
                  {editingStudent ? `Edit Learner: ${editingStudent.first_name} ${editingStudent.last_name}` : 'Student Admission Form'}
                </h3>
                <p className="text-xs text-blue-200">
                  Comprehensive bio-data, parent details, Mobile Money reference, and Supabase document storage.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* 1. PERSONAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  1. Personal & Admission Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Admission Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.admission_number}
                      onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Student ID Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.student_id_number}
                      onChange={(e) => setFormData({ ...formData, student_id_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Admission Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.admission_date}
                      onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Sex *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Age (Calculated)
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={formData.age}
                      className="w-full px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-bold text-blue-700 dark:text-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Religion
                    </label>
                    <select
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Anglican">Anglican (Church of Uganda)</option>
                      <option value="Catholic">Roman Catholic</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Pentecostal / Born Again">Pentecostal / Born Again</option>
                      <option value="Seventh Day Adventist">Seventh Day Adventist</option>
                      <option value="Orthodox">Orthodox</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Class *
                    </label>
                    <select
                      value={formData.class_name}
                      onChange={(e) => {
                        const selectedCls = classes.find((c) => c.name === e.target.value);
                        setFormData({
                          ...formData,
                          class_name: e.target.value,
                          class_id: selectedCls?.id || 'cls-p7',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Stream
                    </label>
                    <input
                      type="text"
                      value={formData.stream_name}
                      onChange={(e) => setFormData({ ...formData, stream_name: e.target.value })}
                      placeholder="e.g. Gold, Blue, Red"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      House
                    </label>
                    <select
                      value={formData.house}
                      onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Nile House (Blue)">Nile House (Blue)</option>
                      <option value="Rwenzori House (Red)">Rwenzori House (Red)</option>
                      <option value="Victoria House (Green)">Victoria House (Green)</option>
                      <option value="Elgon House (Yellow)">Elgon House (Yellow)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Student Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Active">Active</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Transferred">Transferred</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Left school">Left School</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      National LIN / NIN (Learner Identification Number)
                    </label>
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      placeholder="e.g. 14-digit LIN"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. CONTACT & ADDRESS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  2. Contact & Address Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Kampala, Wakiso, Mukono"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Village / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="e.g. Kisenyi, Bukoto, Najjanankumbi"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Physical Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Plot 14, Sir Apollo Kaggwa Rd"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Student Phone (where applicable)
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +256 7..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Student Email (where applicable)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PARENT / GUARDIAN INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  3. Parent / Guardian Particulars
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Parent / Guardian Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Relationship *
                    </label>
                    <select
                      value={formData.parent_relationship}
                      onChange={(e) => setFormData({ ...formData, parent_relationship: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Aunt">Aunt</option>
                      <option value="Grandparent">Grandparent</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Sex
                    </label>
                    <select
                      value={formData.parent_sex}
                      onChange={(e) => setFormData({ ...formData, parent_sex: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Primary Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      placeholder="+256 7..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Alternative Phone
                    </label>
                    <input
                      type="text"
                      value={formData.parent_alt_phone}
                      onChange={(e) => setFormData({ ...formData, parent_alt_phone: e.target.value })}
                      placeholder="+256 7..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.parent_occupation}
                      onChange={(e) => setFormData({ ...formData, parent_occupation: e.target.value })}
                      placeholder="e.g. Farmer, Merchant, Nurse"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Parent National ID Number (NIN)
                    </label>
                    <input
                      type="text"
                      value={formData.parent_nin}
                      onChange={(e) => setFormData({ ...formData, parent_nin: e.target.value })}
                      placeholder="e.g. CM800..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Parent Religion
                    </label>
                    <input
                      type="text"
                      value={formData.parent_religion}
                      onChange={(e) => setFormData({ ...formData, parent_religion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* 4. MOBILE MONEY REGISTERED PAYMENT CODE (SEPARATE FIELD) */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    4. Student Mobile Money Payment Code / Identifier
                  </h4>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                  Enter the student's registered mobile-money payment code or reference identifier (not a transaction ID). This is stored separately and used to auto-reconcile school fee payments from MTN MoMo / Airtel Money.
                </p>
                <div className="max-w-md">
                  <input
                    type="text"
                    value={formData.mobile_money_code}
                    onChange={(e) => setFormData({ ...formData, mobile_money_code: e.target.value })}
                    placeholder="e.g. MM-UG-94821 or Parent MTN MoMo code"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 font-mono font-bold text-amber-900 dark:text-amber-200"
                  />
                </div>
              </div>

              {/* 5. MEDICAL & PREVIOUS SCHOOL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Previous School (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.previous_school}
                    onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                    placeholder="e.g. City Nursery and Primary School"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Emergency Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="+256 7..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Student Medical Notes & Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.medical_notes}
                    onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                    placeholder="e.g. Asthmatic, allergic to penicillin, wears spectacles"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* 6. DOCUMENT & PHOTO UPLOADS (SUPABASE STORAGE) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      5. Document & Photo Uploads (Supabase Storage)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Select document category then upload. Files are persisted to Supabase Storage with offline resilience.
                    </p>
                  </div>
                  {isUploading && (
                    <span className="text-xs font-bold text-blue-600 animate-pulse">
                      Uploading to Supabase Storage...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-xs"
                  >
                    <option value="Student Passport Photo">1. Student Passport Photo</option>
                    <option value="Parent Passport Photo">2. Parent / Guardian Passport Photo</option>
                    <option value="Student National ID / LIN">3. Student National ID / LIN</option>
                    <option value="Parent National ID / NIN">4. Parent / Guardian National ID / NIN</option>
                    <option value="Student Medical Report">5. Student Medical Report</option>
                    <option value="Previous School Report">6. Previous School Report (Optional)</option>
                    <option value="Other Admission Documents">7. Other Admission Documents</option>
                  </select>

                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,application/pdf"
                    />
                  </label>
                </div>

                {/* List of uploaded documents in form */}
                {formData.documents && formData.documents.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Attached Documents ({formData.documents.length}):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.documents.map((doc, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                          <div className="truncate mr-2">
                            <span className="font-bold text-blue-600 block">{doc.document_category}</span>
                            <span className="truncate text-slate-600 dark:text-slate-400">{doc.file_name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                documents: prev.documents.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md transition"
                >
                  {editingStudent ? 'Save Changes' : 'Confirm Admission & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE STUDENT PROFILE MODAL */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onPrintID={() => {
            setSelectedStudentForID(selectedStudentForProfile);
          }}
        />
      )}

      {/* STUDENT ID CARD MODAL */}
      {selectedStudentForID && (
        <StudentIDCardModal
          student={selectedStudentForID}
          onClose={() => setSelectedStudentForID(null)}
        />
      )}

      {/* DEDICATED STUDENT FEE ACCOUNT & RECORD PAYMENT MODAL */}
      {selectedStudentForPayment && (
        <StudentFeePaymentModal
          student={selectedStudentForPayment}
          onClose={() => setSelectedStudentForPayment(null)}
        />
      )}

      {/* PRINT ADMISSION DOSSIER MODAL */}
      {selectedStudentForPrint && (
        <StudentAdmissionPrintModal
          student={selectedStudentForPrint}
          onClose={() => setSelectedStudentForPrint(null)}
        />
      )}

      {/* Hidden Clean Printable Students Directory */}
      <div className="hidden">
        <div id="printable-students-directory" className="p-8 space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold uppercase">{schoolProfile.name}</h1>
            <p className="text-sm">{schoolProfile.address} • Tel: {schoolProfile.phone}</p>
            <h2 className="text-lg font-bold mt-2 uppercase">Official Learners Enrollment Directory</h2>
            <p className="text-xs text-slate-500 font-mono">Date: {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="py-2">Adm No</th>
                <th className="py-2">Learner Name</th>
                <th className="py-2">Class</th>
                <th className="py-2">Stream</th>
                <th className="py-2">Gender</th>
                <th className="py-2">Age</th>
                <th className="py-2">Parent / Contact</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-b border-slate-200">
                  <td className="py-2 font-mono font-bold">{s.admission_number}</td>
                  <td className="py-2 font-bold">{s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}</td>
                  <td className="py-2">{s.class_name}</td>
                  <td className="py-2">{s.stream_name || 'General'}</td>
                  <td className="py-2">{s.gender}</td>
                  <td className="py-2">{s.age}</td>
                  <td className="py-2">{s.parent_name || 'N/A'} ({s.parent_phone || 'N/A'})</td>
                  <td className="py-2 font-bold">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
