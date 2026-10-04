import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { printContent } from '../../utils/printAndDownload';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const { schoolProfile } = useApp();

  if (!payment) return null;

  const handlePrint = () => {
    printContent('printable-official-receipt', `Receipt_${payment.receipt_number}`);
  };

  // Mock balance calculation for receipt display
  const expectedTotalUgx = 1245000;
  const balanceUgx = Math.max(0, expectedTotalUgx - payment.amount_ugx);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Official School Fees Receipt
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 overflow-y-auto print:p-0">
          <div id="printable-official-receipt" className="border-2 border-slate-900 p-6 rounded-2xl relative space-y-4">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-8xl font-black rotate-[-25deg]">PAID</span>
            </div>

            {/* School Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <div className="w-12 h-12 mx-auto mb-1.5 rounded-full bg-blue-900 text-amber-400 p-1 flex items-center justify-center font-black">
                <img src="icon.svg" alt="Crest" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase">
                {schoolProfile.name}
              </h1>
              <p className="text-[10px] text-slate-600 italic">
                "{schoolProfile.motto}"
              </p>
              <p className="text-[10px] text-slate-700 mt-1">
                {schoolProfile.address}, {schoolProfile.district}, {schoolProfile.country}
              </p>
              <p className="text-[10px] text-slate-700">
                Tel: {schoolProfile.phone} / {schoolProfile.alt_phone} • Email: {schoolProfile.email}
              </p>
            </div>

            {/* Receipt Identification Title */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px]">OFFICIAL RECEIPT NO:</span>
                <span className="font-mono font-black text-sm text-blue-950">{payment.receipt_number}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-semibold block text-[10px]">PAYMENT DATE:</span>
                <span className="font-bold">{payment.payment_date}</span>
              </div>
            </div>

            {/* Student & Academic Particulars */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <strong className="text-slate-900">{payment.student_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission Number:</span>
                <span className="font-mono font-bold text-slate-800">{payment.admission_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class / Level:</span>
                <span className="font-bold">{payment.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Term:</span>
                <span className="font-bold">{payment.term} ({payment.academic_year})</span>
              </div>
            </div>

            {/* Payment Method & Transaction Info */}
            <div className="text-xs space-y-1 py-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method:</span>
                <span className="font-bold">{payment.payment_method}</span>
              </div>
              {payment.transaction_reference && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Transaction Reference:</span>
                  <span className="font-mono text-slate-800">{payment.transaction_reference}</span>
                </div>
              )}
              {payment.notes && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Notes / Purpose:</span>
                  <span className="italic text-slate-700">{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Financial Amounts Breakdown (UGX) */}
            <div className="border-t-2 border-b-2 border-slate-900 py-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-sm font-black">
                <span className="uppercase text-slate-900">AMOUNT PAID (UGX):</span>
                <span className="text-emerald-700 font-mono text-base">
                  UGX {payment.amount_ugx.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px] pt-1 border-t border-dashed border-slate-300">
                <span>Remaining Fee Balance:</span>
                <span className="font-bold font-mono text-amber-700">
                  UGX {balanceUgx.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Signatures & Footer Note */}
            <div className="pt-2 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4">
                <div>
                  <span className="block text-slate-400">Received By:</span>
                  <span className="font-bold text-slate-800">{payment.received_by}</span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400">Bursar / Cashier Stamp:</span>
                  <span className="font-serif italic text-blue-900 font-bold">[ EduCore Bursary Verified ]</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-slate-200">
                <p className="font-bold text-xs text-blue-900 tracking-wide">
                  “Thank you for supporting the school.”
                </p>
                <p className="text-[8px] text-slate-400 mt-0.5">
                  Computer-generated valid receipt under EduCore School Management System.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
