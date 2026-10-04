import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  X,
  Upload,
  Download,
  Printer,
  Eye,
  Trash2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
  UserCheck,
  Library,
  Book,
  ShieldAlert,
  CreditCard,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StaffMember, StaffDocumentItem } from '../../types';
import { uploadDocument } from '../../services/documentStorage';
import { UGANDA_BANKS } from '../../utils/ugandaBanks';
import { downloadCSV, printContent } from '../../utils/printAndDownload';

export const StaffView: React.FC = () => {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    activeRole,
    schoolProfile,
    libraryIssues,
    disciplineRecords,
    staffApplications,
    showToast,
  } = useApp();

  // Filter drawer / tabs state: 'ALL' | 'Teaching' | 'Non-Teaching'
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Teaching' | 'Non-Teaching'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState<StaffMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Document upload state within Add/Edit modal
  const [docCategory, setDocCategory] = useState<StaffDocumentItem['document_category']>('National ID');
  const [isUploading, setIsUploading] = useState(false);

  // Age calculation helper
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

  // Add / Edit Staff Form Data
  const [formData, setFormData] = useState<{
    staff_id: string;
    full_name: string;
    gender: 'Male' | 'Female';
    dob: string;
    age: number;
    qualification: string;
    religion: string;
    phone: string;
    email: string;
    address: string;
    marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
    designation: string;
    department: string;
    date_of_appointment: string;
    category: 'Teaching' | 'Non-Teaching';
    employment_status: 'Active' | 'On Leave' | 'Resigned' | 'Retired';
    salary_ugx: number;
    photo_url: string;
    national_id: string;
    bank_name: string;
    bank_branch: string;
    bank_account_number: string;
    bank_account_name: string;
    subjects: string[];
    classes: string[];
    documents: StaffDocumentItem[];
  }>({
    staff_id: '',
    full_name: '',
    gender: 'Male',
    dob: '1988-05-15',
    age: 38,
    qualification: 'Bachelor of Education',
    religion: 'Anglican',
    phone: '+256 7',
    email: '',
    address: 'Kampala',
    marital_status: 'Married',
    designation: 'Senior Teacher',
    department: 'Languages',
    date_of_appointment: new Date().toISOString().split('T')[0],
    category: 'Teaching',
    employment_status: 'Active',
    salary_ugx: 1650000,
    photo_url: '',
    national_id: '',
    bank_name: 'Stanbic Bank Uganda',
    bank_branch: 'Main Branch (Crested Towers)',
    bank_account_number: '',
    bank_account_name: '',
    subjects: [],
    classes: [],
    documents: [],
  });

  const [bankFilterQuery, setBankFilterQuery] = useState('');
  const filteredUgandaBanks = UGANDA_BANKS.filter(
    (b) =>
      b.name.toLowerCase().includes(bankFilterQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(bankFilterQuery.toLowerCase())
  );

  const handleDobChange = (dobVal: string) => {
    const ageVal = calculateAge(dobVal);
    setFormData((prev) => ({ ...prev, dob: dobVal, age: ageVal }));
  };

  const handleOpenAddModal = (staffToEdit?: StaffMember) => {
    setBankFilterQuery('');
    if (staffToEdit) {
      setEditingStaff(staffToEdit);
      setFormData({
        staff_id: staffToEdit.staff_id,
        full_name: staffToEdit.full_name,
        gender: staffToEdit.gender,
        dob: staffToEdit.dob,
        age: staffToEdit.age || calculateAge(staffToEdit.dob),
        qualification: staffToEdit.qualification,
        religion: staffToEdit.religion || 'Anglican',
        phone: staffToEdit.phone,
        email: staffToEdit.email,
        address: staffToEdit.address,
        marital_status: staffToEdit.marital_status || 'Married',
        designation: staffToEdit.designation,
        department: staffToEdit.department,
        date_of_appointment: staffToEdit.date_of_appointment,
        category: staffToEdit.category,
        employment_status: staffToEdit.employment_status,
        salary_ugx: staffToEdit.salary_ugx || 1500000,
        photo_url: staffToEdit.photo_url || '',
        national_id: staffToEdit.national_id || '',
        bank_name: staffToEdit.bank_name || 'Stanbic Bank Uganda',
        bank_branch: staffToEdit.bank_branch || 'Main Branch (Crested Towers)',
        bank_account_number: staffToEdit.bank_account_number || '',
        bank_account_name: staffToEdit.bank_account_name || staffToEdit.full_name,
        subjects: staffToEdit.subjects || [],
        classes: staffToEdit.classes || [],
        documents: staffToEdit.documents || [],
      });
    } else {
      setEditingStaff(null);
      const nextNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        staff_id: `STF-KLA-${nextNum}`,
        full_name: '',
        gender: 'Male',
        dob: '1988-05-15',
        age: 38,
        qualification: 'Bachelor of Education (Makerere University)',
        religion: 'Anglican',
        phone: '+256 7',
        email: '',
        address: 'Kampala',
        marital_status: 'Married',
        designation: 'Senior Teacher',
        department: 'Sciences',
        date_of_appointment: new Date().toISOString().split('T')[0],
        category: 'Teaching',
        employment_status: 'Active',
        salary_ugx: 1750000,
        photo_url: '',
        national_id: '',
        bank_name: 'Stanbic Bank Uganda',
        bank_branch: 'Main Branch (Crested Towers)',
        bank_account_number: '',
        bank_account_name: '',
        subjects: ['Mathematics'],
        classes: ['P.7'],
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
        const stored = await uploadDocument(file, 'staff_documents');
        const docItem: StaffDocumentItem = {
          id: 'stfdoc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          staff_id: editingStaff?.id || 'new',
          file_name: stored.fileName,
          file_type: stored.fileType,
          storage_path: stored.storagePath,
          upload_date: new Date().toISOString().split('T')[0],
          uploaded_by: 'Bursary / HR',
          document_category: docCategory,
          file_size: stored.fileSize,
          file_url: stored.fileUrl,
        };

        setFormData((prev) => {
          let updatedPhoto = prev.photo_url;
          if (docCategory === 'Other Document' && file.type.startsWith('image/')) {
            updatedPhoto = stored.fileUrl;
          }
          return {
            ...prev,
            photo_url: updatedPhoto,
            documents: [...prev.documents, docItem],
          };
        });
      }
    } catch (err: any) {
      showToast('Error uploading document: ' + (err?.message || 'Error occurred'), 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.staff_id) {
      showToast('Please fill in Staff Full Name and Staff ID', 'warning');
      return;
    }

    if (editingStaff) {
      await updateStaff({
        ...editingStaff,
        ...formData,
      });
      showToast(`Updated staff details for ${formData.full_name}`, 'success');
    } else {
      await addStaff({
        ...formData,
      });
      showToast(`Successfully registered staff member ${formData.full_name}`, 'success');
    }

    setIsAddModalOpen(false);
  };

  // CSV Export for Staff Directory
  const handleExportCSV = () => {
    const headers = [
      'Staff ID',
      'Full Name',
      'Gender',
      'Designation',
      'Department',
      'Category',
      'Telephone',
      'Email',
      'Bank Name',
      'Bank Branch',
      'Account Number',
      'Account Name',
      'Employment Status',
      'Salary (UGX)',
    ];

    const rows = filteredStaff.map((s) => [
      s.staff_id,
      s.full_name,
      s.gender,
      s.designation,
      s.department,
      s.category,
      s.phone,
      s.email,
      s.bank_name || 'N/A',
      s.bank_branch || 'N/A',
      s.bank_account_number || 'N/A',
      s.bank_account_name || 'N/A',
      s.employment_status,
      s.salary_ugx || 0,
    ]);

    const filename = `Staff_Directory_${categoryFilter}_${new Date().toISOString().split('T')[0]}`;
    downloadCSV(filename, headers, rows);
    showToast(`Downloaded Staff Register (${filteredStaff.length} employees) as CSV!`, 'success');
  };

  const handlePrintStaff = () => {
    printContent('printable-staff-roster', 'Staff Directory');
  };

  // Filter staff without reload
  const filteredStaff = staff.filter((s) => {
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || s.employment_status === statusFilter;
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staff_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.national_id && s.national_id.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const teachingCount = staff.filter((s) => s.category === 'Teaching').length;
  const nonTeachingCount = staff.filter((s) => s.category === 'Non-Teaching').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            STAFF MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Teaching Faculty ({teachingCount}) • Non-Teaching Staff ({nonTeachingCount}) • Profiles & Contracts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download CSV */}
          <button
            onClick={handleExportCSV}
            title="Download CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          {/* Print Staff Directory */}
          <button
            onClick={handlePrintStaff}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Staff Directory</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Category Filter Drawer & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Category Pills (All Staff, Teaching Staff, Non-Teaching Staff) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Staff ({staff.length})
            </button>
            <button
              onClick={() => setCategoryFilter('Teaching')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                categoryFilter === 'Teaching'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Teaching Staff ({teachingCount})
            </button>
            <button
              onClick={() => setCategoryFilter('Non-Teaching')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                categoryFilter === 'Non-Teaching'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Non-Teaching Staff ({nonTeachingCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
              <option value="Retired">Retired</option>
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-xs font-bold' : 'text-slate-500'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-xs font-bold' : 'text-slate-500'}`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff by full name, staff ID, department, designation, NIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* STAFF LIST: TABLE VIEW */}
      {viewMode === 'table' ? (
        <div id="printable-staff-roster" className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Staff ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Designation / Department</th>
                  <th className="px-4 py-3">Sex / Age</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No staff members match the selected category or filter.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {st.photo_url ? (
                            <img src={st.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{st.full_name[0]}</span>
                          )}
                        </div>
                        <div>
                          <span>{st.full_name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {st.qualification}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {st.staff_id}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            st.category === 'Teaching'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {st.category} Staff
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{st.designation}</div>
                        <div className="text-[10px] text-slate-400">{st.department}</div>
                      </td>

                      <td className="px-4 py-3">
                        {st.gender} • <span className="font-semibold">{st.age} yrs</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-slate-900 dark:text-white">{st.phone}</div>
                        <div className="text-[10px] text-slate-400">{st.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.employment_status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {st.employment_status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Profile */}
                          <button
                            onClick={() => setSelectedStaffForProfile(st)}
                            title="View Full Staff Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Staff */}
                          <button
                            onClick={() => handleOpenAddModal(st)}
                            title="Edit Staff Member"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                          >
                            <Briefcase className="w-4 h-4" />
                          </button>

                          {/* Archive */}
                          <button
                            onClick={() => {
                              if (confirm(`Archive record for ${st.full_name}?`)) {
                                deleteStaff(st.id);
                              }
                            }}
                            title="Archive Staff Member"
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
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((st) => (
            <div
              key={st.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    {st.staff_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.category === 'Teaching'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}
                  >
                    {st.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center shrink-0 overflow-hidden">
                    {st.photo_url ? (
                      <img src={st.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{st.full_name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {st.full_name}
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {st.designation}
                    </p>
                    <p className="text-[10px] text-slate-400">{st.department}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div>Phone: <strong className="font-mono">{st.phone}</strong></div>
                  <div>Qualification: <strong>{st.qualification}</strong></div>
                  <div>Sex / Age: <strong>{st.gender} • {st.age} yrs</strong></div>
                  <div>Documents: <strong>{st.documents?.length || 0} attached</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedStaffForProfile(st)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => handleOpenAddModal(st)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLETE STAFF PROFILE MODAL */}
      {selectedStaffForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-amber-400 bg-white/10 flex items-center justify-center text-xl font-black text-amber-400 shrink-0 overflow-hidden shadow-md">
                  {selectedStaffForProfile.photo_url ? (
                    <img src={selectedStaffForProfile.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedStaffForProfile.full_name[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black">{selectedStaffForProfile.full_name}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      {selectedStaffForProfile.employment_status}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Staff ID: <strong className="font-mono text-white">{selectedStaffForProfile.staff_id}</strong> • <strong className="text-amber-300">{selectedStaffForProfile.category} Staff</strong>
                  </p>
                  <p className="text-[11px] text-blue-300">
                    {selectedStaffForProfile.designation} • Dept: {selectedStaffForProfile.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printContent('printable-staff-dossier', `Staff Dossier - ${selectedStaffForProfile.full_name}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => setSelectedStaffForProfile(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Body */}
            <div id="printable-staff-dossier" className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
              {/* Section 1: Bio-Data & Personal Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1">
                  1. Particulars & Demographics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Full Name</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Staff ID</span>
                    <strong className="font-mono text-blue-700 dark:text-blue-400">{selectedStaffForProfile.staff_id}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Sex</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.gender}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Date of Birth & Age</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.dob} ({selectedStaffForProfile.age} years)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Marital Status</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.marital_status || 'Married'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Religion</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.religion || 'Anglican'}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">National ID (NIN)</span>
                    <strong className="font-mono text-slate-900 dark:text-white">{selectedStaffForProfile.national_id || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Contact Phone</span>
                    <strong className="font-mono text-slate-900 dark:text-white">{selectedStaffForProfile.phone}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Address</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.email}</strong>
                  </div>

                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Residential Address</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.address}</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: Professional & Appointment Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1">
                  2. Professional Credentials & Employment
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Staff Category</span>
                    <strong className="text-blue-700 dark:text-blue-400 font-bold">{selectedStaffForProfile.category} Staff</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Designation</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.designation}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Department</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.department}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Date of Appointment</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.date_of_appointment}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Employment Status</span>
                    <strong className="text-emerald-600 font-bold">{selectedStaffForProfile.employment_status}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Monthly Remuneration</span>
                    <strong className="font-mono text-emerald-600 font-bold">UGX {selectedStaffForProfile.salary_ugx?.toLocaleString() || '1,650,000'}</strong>
                  </div>

                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Academic & Professional Qualifications</span>
                    <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.qualification}</strong>
                  </div>

                  {/* Bank & Remuneration Details */}
                  <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 block mb-2 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5" />
                      <span>Bank & Remuneration Details (Payroll)</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Bank Name</span>
                        <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.bank_name || 'Stanbic Bank Uganda'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Branch</span>
                        <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.bank_branch || 'Main Branch (Crested Towers)'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Account Number</span>
                        <strong className="font-mono text-blue-700 dark:text-blue-400">{selectedStaffForProfile.bank_account_number || '9030018829410'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Account Name</span>
                        <strong className="text-slate-900 dark:text-white">{selectedStaffForProfile.bank_account_name || selectedStaffForProfile.full_name}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Uploaded Staff Documents (Supabase Storage) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    3. Uploaded Staff Documents & Certificates ({selectedStaffForProfile.documents?.length || 0})
                  </h4>
                  <span className="text-[10px] text-slate-400">Stored via Supabase Storage</span>
                </div>

                {(!selectedStaffForProfile.documents || selectedStaffForProfile.documents.length === 0) ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No documents uploaded yet for this staff member. Edit staff to upload certificates, appointment letters, or contract documents.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedStaffForProfile.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between hover:border-blue-400 transition"
                      >
                        <div className="overflow-hidden mr-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 block w-fit mb-1">
                            {doc.document_category}
                          </span>
                          <strong className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {doc.file_name}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {doc.file_size} • Uploaded {doc.upload_date}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {doc.file_url && doc.file_url !== '#' ? (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              download={doc.file_name}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <button
                              onClick={() => showToast(`Document verified: ${doc.document_category} — ${doc.file_name}`, 'info')}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Library Books Borrowed / History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Library className="w-4 h-4" />
                    4. Library Circulation & Issued Books
                  </h4>
                  <span className="text-[10px] text-slate-400">Resource Centre Records</span>
                </div>

                {(() => {
                  const staffIssues = libraryIssues.filter(
                    (iss) =>
                      iss.person_id === selectedStaffForProfile.id ||
                      iss.identifier === selectedStaffForProfile.staff_id ||
                      iss.person_name === selectedStaffForProfile.full_name
                  );

                  if (staffIssues.length === 0) {
                    return (
                      <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        No books currently issued or borrowed by this staff member.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {staffIssues.map((iss) => (
                        <div
                          key={iss.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs"
                        >
                          <div>
                            <strong className="text-slate-900 dark:text-white block">
                              {iss.items.map((i) => `${i.book_title} (x${i.copies_issued})`).join(', ')}
                            </strong>
                            <span className="text-[10px] text-slate-400">
                              Ref: <span className="font-mono">{iss.issue_code}</span> • Issued: {iss.date_issued} • Due: {iss.expected_return_date}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              iss.status === 'Returned'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {iss.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Section 5: Disciplinary Incidents & Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    5. Disciplinary Records & Status
                  </h4>
                  <span className="text-[10px] text-slate-400">Confidential Administration File</span>
                </div>

                {(() => {
                  const staffDiscipline = disciplineRecords.filter(
                    (disc) =>
                      disc.person_id === selectedStaffForProfile.id ||
                      disc.identifier === selectedStaffForProfile.staff_id ||
                      disc.person_name === selectedStaffForProfile.full_name
                  );

                  if (staffDiscipline.length === 0) {
                    return (
                      <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        Exemplary Professional Record — No disciplinary incidents on file for this staff member.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {staffDiscipline.map((disc) => (
                        <div
                          key={disc.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {disc.category || disc.incident_type}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                disc.status === 'Resolved' || disc.status === 'Cleared'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {disc.status}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px]">{disc.description}</p>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                            <span>Date: {disc.incident_date}</span>
                            <span>Action: {disc.action_taken || 'Under Review'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Section 6: Leave History & Entitlements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>6. Staff Leave History & Applications</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Uganda Statutory Annual Leave: 21 Days</span>
                </div>

                {(() => {
                  const recordedLeaves = selectedStaffForProfile.leave_history || [];
                  const applicationLeaves = staffApplications
                    .filter(
                      (app) =>
                        (app.staff_id === selectedStaffForProfile.id ||
                          app.staff_id === selectedStaffForProfile.staff_id ||
                          app.staff_name.toLowerCase() === selectedStaffForProfile.full_name.toLowerCase()) &&
                        app.application_type === 'Leave Application'
                    )
                    .map((app) => ({
                      id: app.id,
                      application_number: app.application_number,
                      leave_type: app.leave_type || 'Annual Leave',
                      start_date: app.start_date || app.submitted_at.split('T')[0],
                      end_date: app.end_date || app.submitted_at.split('T')[0],
                      days_count: app.days_requested || 1,
                      reason: app.reason,
                      approved_by: app.reviewed_by || 'School Administration',
                      approved_date: app.reviewed_at ? app.reviewed_at.split('T')[0] : app.submitted_at.split('T')[0],
                      status: app.status === 'Approved' ? ('Approved' as const) : app.status === 'Rejected' ? ('Cancelled' as const) : ('Approved' as const),
                      notes: app.admin_comment || app.admin_reply,
                      document_url: app.uploaded_document_url,
                    }));

                  const allLeavesMap = new Map();
                  recordedLeaves.forEach((l) => allLeavesMap.set(l.application_number || l.id, l));
                  applicationLeaves.forEach((l) => allLeavesMap.set(l.application_number || l.id, l));
                  const combinedLeaves = Array.from(allLeavesMap.values());

                  const totalDaysTaken = combinedLeaves
                    .filter((l) => l.status === 'Approved' || l.status === 'Completed')
                    .reduce((sum, l) => sum + (l.days_count || 0), 0);

                  const remainingDays = Math.max(0, 21 - totalDaysTaken);

                  return (
                    <div className="space-y-3">
                      {/* Leave Balances KPI strip */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs">
                        <div className="text-center p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Allowance</span>
                          <span className="text-base font-black text-slate-900 dark:text-white">21 Days</span>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Days Taken</span>
                          <span className="text-base font-black text-amber-600">{totalDaysTaken} Days</span>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Leave Balance</span>
                          <span className="text-base font-black text-emerald-600">{remainingDays} Days</span>
                        </div>
                      </div>

                      {combinedLeaves.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                          No leave records on file for this staff member. Approved leave requests will automatically appear here.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {combinedLeaves.map((l, idx) => (
                            <div
                              key={l.id || idx}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {l.leave_type}
                                  </span>
                                  {l.application_number && (
                                    <span className="font-mono text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                                      {l.application_number}
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    l.status === 'Approved' || l.status === 'Completed'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  {l.status}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px]">{l.reason}</p>
                              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  Period: <span className="font-bold text-slate-700 dark:text-slate-300">{l.start_date} to {l.end_date}</span> ({l.days_count} days)
                                </div>
                                <div>
                                  Approved by: <span className="font-bold text-slate-700 dark:text-slate-300">{l.approved_by}</span> on {l.approved_date}
                                </div>
                              </div>
                              {l.notes && (
                                <div className="text-[10px] text-blue-600 dark:text-blue-400 italic">
                                  Remark: {l.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">EduCore Ugandan School Management System</span>
              <button
                onClick={() => setSelectedStaffForProfile(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            <div className="p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">
                  {editingStaff ? `Edit Staff Member: ${editingStaff.full_name}` : 'Add Staff Member'}
                </h3>
                <p className="text-xs text-blue-200">
                  Teaching and Non-Teaching Staff Registration • Supabase Document Storage
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Category & Status */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-blue-900 dark:text-blue-300 block mb-1">
                    Staff Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 font-bold text-blue-700 dark:text-blue-300"
                  >
                    <option value="Teaching">Teaching Staff</option>
                    <option value="Non-Teaching">Non-Teaching Staff</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Staff ID Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Employment Status *
                  </label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              {/* Bio & Demographics */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  1. Personal Bio-Data & Demographics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Tumuhimbise Emmanuel"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Age (Calculated Automatically)
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
                      Marital Status *
                    </label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Religion
                    </label>
                    <select
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Anglican">Anglican</option>
                      <option value="Catholic">Roman Catholic</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Pentecostal">Pentecostal</option>
                      <option value="Seventh Day Adventist">Seventh Day Adventist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Telephone Contact *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+256 7..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="staff@educore.ac.ug"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      National ID (NIN)
                    </label>
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      placeholder="e.g. CM84..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Residential Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Plot 8, Kyebando Central, Kampala"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Designation & Appointment */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  2. Designation, Department & Appointment
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Designation / Role Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Senior Mathematics Teacher / Bursar / Nurse"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Sciences, Languages, Administration, Library"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Date of Appointment *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_of_appointment}
                      onChange={(e) => setFormData({ ...formData, date_of_appointment: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Academic & Professional Qualifications *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. Bachelor of Science with Education (Makerere University)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Staff Documents Upload (Supabase Storage) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      3. Multiple Staff Documents Upload (Supabase Storage)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Attach National ID, Academic Certificates, Appointment Letter, Contract, and supporting credentials.
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
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-xs"
                  >
                    <option value="National ID">1. National ID (NIN)</option>
                    <option value="Academic Certificate">2. Academic Certificate</option>
                    <option value="Appointment Letter">3. Appointment Letter</option>
                    <option value="Professional Certificate">4. Professional Certificate</option>
                    <option value="Contract">5. Employment Contract</option>
                    <option value="Other Document">6. Other Supporting Document / Passport Photo</option>
                  </select>

                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,application/pdf"
                    />
                  </label>
                </div>

                {/* Uploaded Documents List */}
                {formData.documents && formData.documents.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Uploaded Documents ({formData.documents.length}):</span>
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
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Bank Account Details (Uganda Regulated Financial Institutions) */}
              <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4" />
                    <span>4. Remuneration & Banking Information (Uganda Banks)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bank of Uganda licensed commercial banks, credit institutions, and microfinance accounts for payroll processing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Bank Name (Search Selection — All Licensed Banks in Uganda) *
                    </label>
                    <div className="space-y-1.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Type to search bank (e.g. Stanbic, Centenary, Absa, Equity, PostBank, DFCU...)"
                          value={bankFilterQuery}
                          onChange={(e) => setBankFilterQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <select
                        value={formData.bank_name}
                        onChange={(e) => {
                          const chosen = e.target.value;
                          const bankObj = UGANDA_BANKS.find((b) => b.name === chosen);
                          setFormData({
                            ...formData,
                            bank_name: chosen,
                            bank_branch: bankObj?.popularBranches[0] || formData.bank_branch,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        {filteredUgandaBanks.map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name} ({b.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Bank Branch *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bank_branch}
                      onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                      placeholder="e.g. Crested Towers, Kampala Road, Lugogo"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      placeholder="e.g. 9030018829410"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Account Name (As appears on Bank Passbook / Statement) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bank_account_name}
                      onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                      placeholder="e.g. Christine Kigozi"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
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
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md transition cursor-pointer"
                >
                  {editingStaff ? 'Save Changes' : 'Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
