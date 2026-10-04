import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Layers,
  X,
  Edit3,
  User,
  PackageCheck,
  Check,
  ChevronDown,
  Sparkles,
  ClipboardList,
  Tag,
  Coins,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord, FeeStructure, Student } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { downloadCSV, printContent } from '../../utils/printAndDownload';

export const FeesView: React.FC = () => {
  const {
    payments,
    students,
    feeStructures,
    addFeeStructure,
    updateFeeStructure,
    classes,
    recordPayment,
    currentUser,
    schoolProfile,
    activeRole,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'payments' | 'balances' | 'structure'>('payments');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Student search & selection state in Payment Box
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Fee Structure Editing State
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [feeFormData, setFeeFormData] = useState({
    category: 'Tuition',
    class_name: 'P.7',
    term: schoolProfile.current_term,
    academic_year: schoolProfile.current_academic_year,
    amount_ugx: 750000,
    description: '',
    is_mandatory: true,
    requirement_type: 'Fee' as 'Fee' | 'School Requirement / Material',
    requirement_status: 'Required' as 'Required' | 'Optional' | 'Adjustable / Waivable' | 'Supplied in Kind',
    monetized_value_ugx: 0,
    can_adjust_in_fees: true,
  });

  // Helper to compute a student's total expected fee, paid, and balance
  const computeStudentBalance = (student: Student) => {
    const applicableFees = feeStructures.filter(
      (f) => f.class_name === student.class_name || f.class_name === 'All Classes'
    );
    const expected =
      applicableFees.length > 0
        ? applicableFees.reduce((sum, f) => sum + (Number(f.amount_ugx) || 0), 0)
        : 1250000;

    const studentPayments = payments.filter(
      (p) => p.student_id === student.id || p.admission_number === student.admission_number
    );
    const paid = studentPayments.reduce((acc, p) => acc + (Number(p.amount_ugx) || 0), 0);
    const balance = Math.max(0, expected - paid);
    const status: 'CLEARED' | 'PARTIAL' | 'PENDING' =
      balance === 0 ? 'CLEARED' : paid > 0 ? 'PARTIAL' : 'PENDING';

    return { applicableFees, expected, paid, balance, status, studentPayments };
  };

  // Form State for new payment
  const [formData, setFormData] = useState({
    student_id: students[0]?.id || '',
    amount_ugx: 500000,
    payment_method: 'Mobile Money' as 'Cash' | 'Mobile Money' | 'Bank' | 'Card' | 'Other',
    transaction_reference: 'MTN-UG-' + Math.floor(10000000 + Math.random() * 90000000),
    payment_date: new Date().toISOString().split('T')[0],
    term: schoolProfile.current_term,
    academic_year: schoolProfile.current_academic_year,
    notes: 'Tuition installment and Midday Meals',
  });

  // Selected student for recording payment
  const selectedStudentForPayment = useMemo(() => {
    return students.find((s) => s.id === formData.student_id) || students[0] || null;
  }, [students, formData.student_id]);

  // Selected student fee computation
  const selectedStudentFeeDetails = useMemo(() => {
    if (!selectedStudentForPayment) return null;
    return computeStudentBalance(selectedStudentForPayment);
  }, [selectedStudentForPayment, feeStructures, payments]);

  // Filter students for search & select in payment modal
  const filteredStudentsForPayment = useMemo(() => {
    if (!studentSearchTerm.trim()) {
      return students.slice(0, 15);
    }
    const q = studentSearchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.admission_number.toLowerCase().includes(q) ||
        s.class_name.toLowerCase().includes(q) ||
        (s.stream_name && s.stream_name.toLowerCase().includes(q))
    );
  }, [students, studentSearchTerm]);

  const handleOpenRecordModal = (preselectedStudentId?: string) => {
    const studentToSelect = preselectedStudentId || students[0]?.id || '';
    setStudentSearchTerm('');
    setIsStudentDropdownOpen(false);

    if (studentToSelect) {
      const studentObj = students.find((s) => s.id === studentToSelect);
      const balanceDetails = studentObj ? computeStudentBalance(studentObj) : null;
      const initialAmount = balanceDetails?.balance && balanceDetails.balance > 0 ? balanceDetails.balance : 500000;

      setFormData((prev) => ({
        ...prev,
        student_id: studentToSelect,
        amount_ugx: initialAmount,
        transaction_reference: 'MTN-UG-' + Math.floor(10000000 + Math.random() * 90000000),
      }));
    }
    setIsRecordModalOpen(true);
  };

  const handleSelectStudentInModal = (student: Student) => {
    const balanceDetails = computeStudentBalance(student);
    const initialAmount = balanceDetails.balance > 0 ? balanceDetails.balance : 300000;

    setFormData((prev) => ({
      ...prev,
      student_id: student.id,
      amount_ugx: initialAmount,
    }));
    setStudentSearchTerm(`${student.first_name} ${student.last_name} (${student.admission_number})`);
    setIsStudentDropdownOpen(false);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formData.student_id);
    if (!student) {
      showToast('Please select a student / learner first', 'error');
      return;
    }

    if (formData.amount_ugx <= 0) {
      showToast('Payment amount must be greater than zero UGX', 'error');
      return;
    }

    const nextReceiptNum = 'REC-2026-' + Math.floor(1000 + Math.random() * 9000);

    const saved = await recordPayment({
      receipt_number: nextReceiptNum,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      admission_number: student.admission_number,
      class_name: student.class_name,
      amount_ugx: Number(formData.amount_ugx),
      payment_date: formData.payment_date,
      payment_method: formData.payment_method,
      transaction_reference: formData.transaction_reference,
      received_by: currentUser.full_name,
      academic_year: formData.academic_year,
      term: formData.term,
      notes: formData.notes,
    });

    setIsRecordModalOpen(false);
    setSelectedReceipt(saved);
    showToast(`Payment of UGX ${Number(formData.amount_ugx).toLocaleString()} recorded! Receipt: ${nextReceiptNum}`, 'success');
  };

  // Fee Structure Modals
  const handleOpenFeeModal = (fee?: FeeStructure) => {
    if (fee) {
      setEditingFee(fee);
      setFeeFormData({
        category: fee.category,
        class_name: fee.class_name,
        term: fee.term,
        academic_year: fee.academic_year,
        amount_ugx: fee.amount_ugx,
        description: fee.description || '',
        is_mandatory: fee.is_mandatory ?? true,
        requirement_type: fee.requirement_type || 'Fee',
        requirement_status: fee.requirement_status || 'Required',
        monetized_value_ugx: fee.amount_ugx,
        can_adjust_in_fees: true,
      });
    } else {
      setEditingFee(null);
      setFeeFormData({
        category: 'Tuition',
        class_name: classes[0]?.name || 'P.7',
        term: schoolProfile.current_term,
        academic_year: schoolProfile.current_academic_year,
        amount_ugx: 500000,
        description: '',
        is_mandatory: true,
        requirement_type: 'Fee',
        requirement_status: 'Required',
        monetized_value_ugx: 500000,
        can_adjust_in_fees: true,
      });
    }
    setIsFeeModalOpen(true);
  };

  const handleSaveFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFee) {
      await updateFeeStructure({
        ...editingFee,
        category: feeFormData.category,
        class_name: feeFormData.class_name,
        term: feeFormData.term,
        academic_year: feeFormData.academic_year,
        amount_ugx: Number(feeFormData.amount_ugx),
        total_amount_ugx: Number(feeFormData.amount_ugx),
        description: feeFormData.description,
        is_mandatory: feeFormData.is_mandatory,
        requirement_type: feeFormData.requirement_type,
        requirement_status: feeFormData.requirement_status,
      });
      showToast('Fee structure & requirement updated successfully!', 'success');
    } else {
      await addFeeStructure({
        class_id: classes.find((c) => c.name === feeFormData.class_name)?.id || 'cls-gen',
        class_name: feeFormData.class_name,
        category: feeFormData.category,
        term: feeFormData.term,
        academic_year: feeFormData.academic_year,
        amount_ugx: Number(feeFormData.amount_ugx),
        total_amount_ugx: Number(feeFormData.amount_ugx),
        description: feeFormData.description,
        is_mandatory: feeFormData.is_mandatory,
        requirement_type: feeFormData.requirement_type,
        requirement_status: feeFormData.requirement_status,
      });
      showToast('New fee structure item registered!', 'success');
    }
    setIsFeeModalOpen(false);
  };

  // Metrics
  const totalCollectedUgx = payments.reduce((sum, p) => sum + (Number(p.amount_ugx) || 0), 0);
  const totalExpectedUgx = students.reduce((sum, s) => sum + computeStudentBalance(s).expected, 0);
  const outstandingUgx = Math.max(0, totalExpectedUgx - totalCollectedUgx);
  const collectionRate = totalExpectedUgx > 0 ? Math.round((totalCollectedUgx / totalExpectedUgx) * 100) : 0;

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.transaction_reference && p.transaction_reference.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMethod = methodFilter === 'ALL' || p.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  // Export payments CSV
  const exportPaymentsCSV = () => {
    const headers = [
      'Receipt Number',
      'Student Name',
      'Admission Number',
      'Class',
      'Amount (UGX)',
      'Payment Date',
      'Payment Method',
      'Transaction Ref',
      'Received By',
      'Notes',
    ];
    const rows = filteredPayments.map((p) => [
      p.receipt_number,
      p.student_name,
      p.admission_number,
      p.class_name,
      `${p.amount_ugx}`,
      p.payment_date,
      p.payment_method,
      p.transaction_reference || '',
      p.received_by,
      p.notes || '',
    ]);

    downloadCSV(`EduCore_Payments_Register_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast(`Exported ${filteredPayments.length} payment records!`, 'success');
  };

  const exportBalancesCSV = () => {
    const headers = [
      'Admission No',
      'Student Full Name',
      'Class',
      'Stream',
      'Total Expected Dues (UGX)',
      'Total Paid (UGX)',
      'Fees Balance (UGX)',
      'Payment Status',
    ];
    const rows = students.map((st) => {
      const b = computeStudentBalance(st);
      return [
        st.admission_number,
        `${st.first_name} ${st.last_name}`,
        st.class_name,
        st.stream_name || 'N/A',
        `${b.expected}`,
        `${b.paid}`,
        `${b.balance}`,
        b.status,
      ];
    });

    downloadCSV(`Student_Fee_Balances_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast(`Exported balances for ${students.length} students!`, 'success');
  };

  const handlePrintPaymentsRegister = () => {
    printContent('printable-payments-register', `Fees & Payment Ledger`);
  };

  const handlePrintBalancesRegister = () => {
    printContent('printable-balances-register', `Student Fee Balances Ledger`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>FEES & BURSARY MANAGEMENT (UGX)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student Ledger • Fee Balance Verification • Physical Requirements Adjustment • Receipts & Bank Reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={activeTab === 'balances' ? exportBalancesCSV : exportPaymentsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Download CSV Ledger"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={activeTab === 'balances' ? handlePrintBalancesRegister : handlePrintPaymentsRegister}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Print Official Ledger"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>

          <button
            onClick={() => handleOpenRecordModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards (All in UGX) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Fees Collected (UGX)
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            UGX {totalCollectedUgx.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Current Academic Term Revenue
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Outstanding Balances
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 truncate">
            UGX {outstandingUgx.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total Learner Arrears
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Recovery Rate
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {collectionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Termly Collection Target: 85%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Receipts Issued
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {payments.length} receipts
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            All offline & online payments logged
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Payment Transactions & Receipts ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'balances'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Student Fee Balances ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'structure'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Fee Structures & Physical Requirements ({feeStructures.length})
        </button>
      </div>

      {/* TAB 1: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student, receipt number, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="Mobile Money">Mobile Money (MTN / Airtel)</option>
                <option value="Cash">Cash at Bursary</option>
                <option value="Bank">Bank Deposit</option>
                <option value="Card">Bank Card / POS</option>
              </select>
            </div>

            <span className="text-slate-400">
              Showing {filteredPayments.length} of {payments.length} transactions
            </span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Learner Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Method & Reference</th>
                    <th className="px-4 py-3 text-right">Amount (UGX)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No payments found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                          {p.receipt_number}
                        </td>
                        <td className="px-4 py-3">
                          <strong className="text-slate-900 dark:text-white block font-bold">
                            {p.student_name}
                          </strong>
                          <span className="text-[10px] font-mono text-slate-400">
                            {p.admission_number}
                          </span>
                        </td>
                        <td className="px-4 py-3">{p.class_name}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{p.payment_date}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 dark:text-white">{p.payment_method}</span>
                          {p.transaction_reference && (
                            <span className="block text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                              {p.transaction_reference}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          UGX {p.amount_ugx.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            title="Generate Official Receipt"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold text-[11px] transition cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT BALANCES */}
      {activeTab === 'balances' && (
        <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Learner Name</th>
                  <th className="px-4 py-3">Admission No</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3 text-right">Total Expected (UGX)</th>
                  <th className="px-4 py-3 text-right">Paid to Date (UGX)</th>
                  <th className="px-4 py-3 text-right">Fees Balance (UGX)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((st) => {
                  const b = computeStudentBalance(st);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {st.first_name} {st.last_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{st.admission_number}</td>
                      <td className="px-4 py-3">{st.class_name}</td>
                      <td className="px-4 py-3 text-right font-mono">UGX {b.expected.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">
                        UGX {b.paid.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                        UGX {b.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'CLEARED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : b.status === 'PARTIAL'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenRecordModal(st.id)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-bold text-[10px] transition cursor-pointer"
                        >
                          Receive Payment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEE STRUCTURES & REQUIREMENTS */}
      {activeTab === 'structure' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
            <div>
              <strong className="block font-bold">Uganda School Fees & Physical Requirements Structure:</strong>
              <span>
                Configure termly tuition, boarding fees, functional fees, as well as physical scholastic requirements
                (e.g. Reams of paper, brooms, geometry sets) that can be paid in cash or supplied in kind.
              </span>
            </div>
            <button
              onClick={() => handleOpenFeeModal()}
              className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fee / Requirement Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map((f) => {
              const isMaterial = f.requirement_type === 'School Requirement / Material';
              return (
                <div
                  key={f.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 text-xs hover:border-blue-400 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px]">
                        {f.class_name} • {f.term}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">{f.academic_year}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{f.category}</h4>
                      {isMaterial && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Physical Item
                        </span>
                      )}
                    </div>

                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      UGX {f.amount_ugx.toLocaleString()}
                    </div>

                    {f.description && (
                      <p className="text-slate-500 text-[11px] leading-tight mt-1">{f.description}</p>
                    )}

                    {/* Requirements and Status Tags */}
                    <div className="pt-2 flex flex-wrap items-center gap-1 text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          f.requirement_status === 'Required'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900'
                            : f.requirement_status === 'Supplied in Kind'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                        }`}
                      >
                        Status: {f.requirement_status || 'Required'}
                      </span>

                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {f.is_mandatory !== false ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {isMaterial ? 'Adjustable in Structure' : 'Direct Bursary Fee'}
                    </span>
                    <button
                      onClick={() => handleOpenFeeModal(f)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Edit Item</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL (WITH SEARCH & SELECT + REAL-TIME FEE BALANCE CARD) */}
      {/* ========================================================================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Record School Fee Payment (UGX)
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              {/* SEARCH AND SELECT STUDENT FIELD */}
              <div className="relative">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Search & Select Student / Learner *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by first/last name, admission number, or class..."
                    value={studentSearchTerm}
                    onChange={(e) => {
                      setStudentSearchTerm(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  />
                  {studentSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentSearchTerm('');
                        setIsStudentDropdownOpen(true);
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Instant Student Filter Results Dropdown */}
                {isStudentDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredStudentsForPayment.length === 0 ? (
                      <div className="p-3 text-center text-slate-400">
                        No students found matching "{studentSearchTerm}".
                      </div>
                    ) : (
                      filteredStudentsForPayment.map((st) => {
                        const bal = computeStudentBalance(st);
                        const isSelected = st.id === formData.student_id;
                        return (
                          <div
                            key={st.id}
                            onClick={() => handleSelectStudentInModal(st)}
                            className={`p-3 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-700/60 cursor-pointer transition ${
                              isSelected ? 'bg-blue-50 dark:bg-slate-700' : ''
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{st.first_name} {st.last_name}</span>
                                <span className="text-[10px] font-mono text-slate-400">({st.admission_number})</span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {st.class_name} • Stream {st.stream_name || 'General'}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 block">
                                Bal: UGX {bal.balance.toLocaleString()}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                  bal.status === 'CLEARED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {bal.status}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* REAL-TIME DYNAMIC STUDENT FEE BALANCE CARD */}
              {selectedStudentFeeDetails && selectedStudentForPayment && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-emerald-50/80 dark:from-slate-800/80 dark:to-slate-800/60 border border-blue-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider">
                        Learner Fee Statement & Balance
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {selectedStudentForPayment.first_name} {selectedStudentForPayment.last_name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {selectedStudentForPayment.admission_number} • {selectedStudentForPayment.class_name} (Stream {selectedStudentForPayment.stream_name || 'A'})
                      </span>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        selectedStudentFeeDetails.status === 'CLEARED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : selectedStudentFeeDetails.status === 'PARTIAL'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      Status: {selectedStudentFeeDetails.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 text-center font-mono">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                        Total Expected
                      </span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        UGX {selectedStudentFeeDetails.expected.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                        Paid to Date
                      </span>
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        UGX {selectedStudentFeeDetails.paid.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                        Remaining Balance
                      </span>
                      <span className="font-black text-xs text-amber-600 dark:text-amber-400">
                        UGX {selectedStudentFeeDetails.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Requirements & Items adjusted in fee structure */}
                  {selectedStudentFeeDetails.applicableFees.length > 0 && (
                    <div className="pt-2 text-[10px] space-y-1">
                      <span className="font-bold text-slate-500 uppercase tracking-wide block">
                        Included Fees & Scholastic Requirements:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedStudentFeeDetails.applicableFees.map((af) => (
                          <span
                            key={af.id}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {af.category} (UGX {af.amount_ugx.toLocaleString()})
                            {af.requirement_type === 'School Requirement / Material' && ' • [Item / Adjusted]'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick-fill balance button */}
                  {selectedStudentFeeDetails.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, amount_ugx: selectedStudentFeeDetails.balance }))}
                      className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Set Payment to Full Balance (UGX {selectedStudentFeeDetails.balance.toLocaleString()})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Amount and Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Amount Paid in UGX *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={formData.amount_ugx}
                    onChange={(e) => setFormData({ ...formData, amount_ugx: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Payment Channel *
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Mobile Money">Mobile Money (MTN / Airtel Money)</option>
                    <option value="Bank">Bank Deposit Slip (Stanbic / Centenary / DFCU)</option>
                    <option value="Cash">Cash at Bursary Counter</option>
                    <option value="Card">Bank Card / POS Terminal</option>
                    <option value="Other">Requirement In-Kind Adjustment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Transaction / Deposit Slip Reference
                  </label>
                  <input
                    type="text"
                    value={formData.transaction_reference}
                    onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                    placeholder="e.g. MTN-UG-982141"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Payment Purpose & Requirements Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Tuition installment 1 & Midday meals, including reams of paper adjusted"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Payment & Generate Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / ADD FEE STRUCTURE MODAL (WITH REQUIREMENTS & ADJUSTMENT ASPECTS)    */}
      {/* ========================================================================= */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                {editingFee ? 'Edit Fee Structure / Requirement Item' : 'New School Fee / Requirement Item'}
              </h3>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeStructure} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Fee / Requirement Category *
                  </label>
                  <select
                    value={feeFormData.category}
                    onChange={(e) => setFeeFormData({ ...feeFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Tuition">Tuition Fee</option>
                    <option value="Boarding">Boarding / Hostel</option>
                    <option value="Meals">Midday Meals / Nutrition</option>
                    <option value="Development">School Development Levy</option>
                    <option value="Examination">Examination & UNEB Assessment Fee</option>
                    <option value="Uniform">School Uniform & Sports Wear</option>
                    <option value="Transport">School Bus / Transport</option>
                    <option value="Photocopy Paper & Scholastic Material">Photocopy Paper & Scholastic Material</option>
                    <option value="Sanitation & Compound Utility">Sanitation & Compound Utility (Broom / Squeegee)</option>
                    <option value="Medical & Insurance">Medical & Sickbay Insurance</option>
                    <option value="Other">Other Functional Requirement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Class Applicability *
                  </label>
                  <select
                    value={feeFormData.class_name}
                    onChange={(e) => setFeeFormData({ ...feeFormData, class_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="All Classes">All Classes (Universal)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirement Type and Status */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <span className="font-bold text-amber-900 dark:text-amber-200 text-xs block">
                  Requirement Type & Structure Adjustment Options:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Item Nature *
                    </label>
                    <select
                      value={feeFormData.requirement_type}
                      onChange={(e) => setFeeFormData({ ...feeFormData, requirement_type: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="Fee">Monetary Fee (Paid in UGX)</option>
                      <option value="School Requirement / Material">Physical Requirement (Item or Cash Equivalent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Requirement Status *
                    </label>
                    <select
                      value={feeFormData.requirement_status}
                      onChange={(e) => setFeeFormData({ ...feeFormData, requirement_status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="Required">Required (Mandatory Submission)</option>
                      <option value="Optional">Optional</option>
                      <option value="Adjustable / Waivable">Adjustable / Waivable in Fees</option>
                      <option value="Supplied in Kind">Supplied in Kind</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Amount / Monetized Value in UGX *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={feeFormData.amount_ugx}
                    onChange={(e) => setFeeFormData({ ...feeFormData, amount_ugx: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    Academic Term *
                  </label>
                  <select
                    value={feeFormData.term}
                    onChange={(e) => setFeeFormData({ ...feeFormData, term: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Annual">All Terms (Annual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Description / Specification of Requirement
                </label>
                <input
                  type="text"
                  value={feeFormData.description}
                  onChange={(e) => setFeeFormData({ ...feeFormData, description: e.target.value })}
                  placeholder="e.g. 2 Reams of Dolphin photocopy paper, 1 Hard broom, 1 Squeegee"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="feeMandatory"
                  checked={feeFormData.is_mandatory}
                  onChange={(e) => setFeeFormData({ ...feeFormData, is_mandatory: e.target.checked })}
                  className="rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="feeMandatory" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Mandatory item for all registered learners
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer transition"
                >
                  {editingFee ? 'Update Fee Structure' : 'Save Fee Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Hidden printable tables for clean isolated printing */}
      <div className="hidden">
        {/* Printable Payments Register */}
        <div id="printable-payments-register" className="p-8 space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold uppercase">{schoolProfile.school_name}</h1>
            <p className="text-sm">{schoolProfile.school_address} • Tel: {schoolProfile.phone_contact}</p>
            <h2 className="text-lg font-bold mt-2 uppercase">Official School Fees & Payments Ledger</h2>
            <p className="text-xs text-slate-500 font-mono">Date Generated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="py-2">Receipt No</th>
                <th className="py-2">Learner Name</th>
                <th className="py-2">Admission No</th>
                <th className="py-2">Class</th>
                <th className="py-2">Date</th>
                <th className="py-2">Method</th>
                <th className="py-2 text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-b border-slate-200">
                  <td className="py-2 font-mono">{p.receipt_number}</td>
                  <td className="py-2 font-bold">{p.student_name}</td>
                  <td className="py-2 font-mono">{p.admission_number}</td>
                  <td className="py-2">{p.class_name}</td>
                  <td className="py-2">{p.payment_date}</td>
                  <td className="py-2">{p.payment_method}</td>
                  <td className="py-2 text-right font-mono font-bold">UGX {p.amount_ugx.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Balances Register */}
        <div id="printable-balances-register" className="p-8 space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold uppercase">{schoolProfile.school_name}</h1>
            <p className="text-sm">{schoolProfile.school_address} • Tel: {schoolProfile.phone_contact}</p>
            <h2 className="text-lg font-bold mt-2 uppercase">Student Outstanding Fee Balances Register</h2>
            <p className="text-xs text-slate-500 font-mono">Date Generated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="py-2">Admission No</th>
                <th className="py-2">Learner Name</th>
                <th className="py-2">Class</th>
                <th className="py-2 text-right">Expected (UGX)</th>
                <th className="py-2 text-right">Paid (UGX)</th>
                <th className="py-2 text-right">Balance (UGX)</th>
                <th className="py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => {
                const b = computeStudentBalance(st);
                return (
                  <tr key={st.id} className="border-b border-slate-200">
                    <td className="py-2 font-mono">{st.admission_number}</td>
                    <td className="py-2 font-bold">{st.first_name} {st.last_name}</td>
                    <td className="py-2">{st.class_name}</td>
                    <td className="py-2 text-right font-mono">UGX {b.expected.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono">UGX {b.paid.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono font-bold">UGX {b.balance.toLocaleString()}</td>
                    <td className="py-2 text-center font-bold">{b.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
