import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Calendar,
  Receipt,
  DollarSign,
  ArrowUpRight,
  Printer,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Student, PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { ReceiptModal } from '../finance/ReceiptModal';

interface StudentFeePaymentModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentFeePaymentModal: React.FC<StudentFeePaymentModalProps> = ({
  student,
  onClose,
}) => {
  const {
    payments,
    feeStructures,
    recordPayment,
    schoolProfile,
    currentUser,
    showToast,
  } = useApp();

  const [amountUgx, setAmountUgx] = useState<number>(350000);
  const [feeCategory, setFeeCategory] = useState<'Tuition & Development' | 'Boarding & Meals' | 'Uniform & Scholastic' | 'Registration & Admission' | 'Examination Fees'>('Tuition & Development');
  const [paymentMethod, setPaymentMethod] = useState<'MTN Mobile Money' | 'Airtel Money' | 'Bank Deposit (Stanbic)' | 'Bank Deposit (Centenary)' | 'School Pay' | 'Cash at Bursary'>('MTN Mobile Money');
  const [referenceNumber, setReferenceNumber] = useState(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
  const [payerName, setPayerName] = useState(student?.parent_name || 'Parent / Guardian');
  const [payerPhone, setPayerPhone] = useState(student?.parent_phone || student?.mobile_money_code || '+256 7');
  const [notes, setNotes] = useState('Term fees installment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentRecord | null>(null);

  if (!student) return null;

  // Filter student payments
  const studentPayments = payments.filter((p) => p.student_id === student.id);

  // Applicable fee structure for student's class
  const classFee = feeStructures.find(
    (f) => f.class_name === student.class_name || f.term === schoolProfile.current_term
  );

  const expectedAmountUgx = classFee?.total_amount_ugx || classFee?.amount_ugx || 1245000;
  const totalPaidUgx = studentPayments.reduce((acc, p) => acc + p.amount_ugx, 0);
  const balanceUgx = expectedAmountUgx - totalPaidUgx;
  const isOverpaid = balanceUgx < 0;
  const creditAmountUgx = isOverpaid ? Math.abs(balanceUgx) : 0;
  const actualBalanceUgx = isOverpaid ? 0 : balanceUgx;

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountUgx || amountUgx <= 0) {
      showToast('Please enter a valid payment amount in UGX.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const saved = await recordPayment({
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        admission_number: student.admission_number,
        class_name: student.class_name,
        stream_name: student.stream_name,
        fee_structure_id: classFee?.id,
        academic_year: schoolProfile.current_academic_year,
        term: schoolProfile.current_term,
        category: feeCategory,
        amount_ugx: Number(amountUgx),
        payment_method: paymentMethod,
        transaction_reference: referenceNumber,
        receipt_number: receiptNo,
        payment_date: new Date().toISOString().split('T')[0],
        received_by: currentUser.full_name,
        notes: notes,
      });

      setGeneratedReceipt(saved);
      showToast(`Payment of UGX ${Number(amountUgx).toLocaleString()} recorded! Receipt: ${receiptNo}`, 'success');
    } catch (err: any) {
      showToast('Failed to record payment: ' + (err?.message || 'Error occurred'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight">Student Fee Account & Payment</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Live Ledger
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Learner: <strong className="text-white font-bold">{student.first_name} {student.last_name}</strong> • Adm: <strong className="font-mono text-white">{student.admission_number}</strong> • Class: <strong className="text-white">{student.class_name} {student.stream_name ? `(${student.stream_name})` : ''}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Account Financial Overview Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Expected Fees
                </span>
                <strong className="text-base font-black text-slate-900 dark:text-white font-mono mt-1 block">
                  UGX {expectedAmountUgx.toLocaleString()}
                </strong>
                <span className="text-[10px] text-slate-500">
                  {student.class_name} • {schoolProfile.current_term}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Total Paid
                </span>
                <strong className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1 block">
                  UGX {totalPaidUgx.toLocaleString()}
                </strong>
                <span className="text-[10px] text-emerald-600/80">
                  {studentPayments.length} transactions recorded
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Outstanding Balance
                </span>
                <strong className="text-base font-black text-amber-700 dark:text-amber-300 font-mono mt-1 block">
                  UGX {actualBalanceUgx.toLocaleString()}
                </strong>
                <span className="text-[10px] text-amber-600/80">
                  {actualBalanceUgx === 0 ? 'Fully Cleared!' : 'Pending payment'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Credit / Overpayment
                </span>
                <strong className="text-base font-black text-blue-700 dark:text-blue-300 font-mono mt-1 block">
                  UGX {creditAmountUgx.toLocaleString()}
                </strong>
                <span className="text-[10px] text-blue-600/80">
                  {creditAmountUgx > 0 ? 'Rolls over to next term' : 'No credit'}
                </span>
              </div>
            </div>

            {/* Mobile money code notification if registered */}
            {student.mobile_money_code && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Registered Mobile Money Code / Identifier:
                  </span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded text-[11px]">
                    {student.mobile_money_code}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Verified for telecom reconciliation
                </span>
              </div>
            )}

            {/* Two Columns: Record Payment Form + Payment History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Form */}
              <form onSubmit={handleRecord} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Record Payment for {student.first_name}
                </h3>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Amount Received (UGX) *
                  </label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={amountUgx}
                    onChange={(e) => setAmountUgx(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-black font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Fee Category
                    </label>
                    <select
                      value={feeCategory}
                      onChange={(e) => setFeeCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Tuition & Development">Tuition & Development</option>
                      <option value="Boarding & Meals">Boarding & Meals</option>
                      <option value="Uniform & Scholastic">Uniform & Scholastic</option>
                      <option value="Registration & Admission">Registration & Admission</option>
                      <option value="Examination Fees">Examination Fees</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="Bank Deposit (Stanbic)">Bank Deposit (Stanbic)</option>
                      <option value="Bank Deposit (Centenary)">Bank Deposit (Centenary)</option>
                      <option value="School Pay">School Pay</option>
                      <option value="Cash at Bursary">Cash at Bursary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Tx / Bank Reference No *
                    </label>
                    <input
                      type="text"
                      required
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g. 1048290291"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Payer Phone
                    </label>
                    <input
                      type="text"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Payer Full Name
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Notes / Receipt Remarks
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording & Issuing...' : `Post UGX ${amountUgx.toLocaleString()} & Issue Official Receipt`}</span>
                </button>
              </form>

              {/* Payment History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Payment Ledger ({studentPayments.length})
                  </h3>
                  <span className="text-[10px] text-slate-400">All terms historical</span>
                </div>

                {studentPayments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No payments recorded for this learner yet. Use the form to record the first installment.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {studentPayments.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-emerald-300 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                              {p.receipt_number}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-2">
                            <span>Method: <strong className="text-slate-700 dark:text-slate-300">{p.payment_method}</strong></span>
                            <span>Ref: <strong className="font-mono">{p.transaction_reference}</strong></span>
                            <span>Date: {p.payment_date}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <strong className="text-xs font-black text-emerald-600 font-mono block">
                            UGX {p.amount_ugx.toLocaleString()}
                          </strong>
                          <button
                            onClick={() => setGeneratedReceipt(p)}
                            className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print Receipt</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Offline-ready • Instant Supabase ledger sync when online
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Generated or selected receipt view */}
      {generatedReceipt && (
        <ReceiptModal
          payment={generatedReceipt}
          onClose={() => setGeneratedReceipt(null)}
        />
      )}
    </>
  );
};
