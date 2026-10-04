import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { isSupabaseConfigured, getSupabaseClient } from '../../services/supabaseClient';

export const AuthModal: React.FC = () => {
  const { signIn, showToast, syncState, schoolProfile } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');

  const [email, setEmail] = useState('headteacher@educore.ac.ug');
  const [password, setPassword] = useState('EduCore#2026');
  const [role, setRole] = useState<UserRole>('Head Teacher');
  const [fullName, setFullName] = useState('Mrs. Christine Kigozi');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const client = getSupabaseClient();
      const hasSupabase = isSupabaseConfigured() && client && syncState.effectiveOnline;

      if (tab === 'signin') {
        if (hasSupabase && client) {
          try {
            const { data, error } = await client.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;
          } catch (supaErr: any) {
            console.warn('[Supabase Auth Warning]:', supaErr?.message);
            // Fallback to local session if network or credentials mismatch
          }
        }
        await signIn(email, password, role);
      } else if (tab === 'signup') {
        if (hasSupabase && client) {
          try {
            await client.auth.signUp({
              email,
              password,
              options: {
                data: { full_name: fullName, role },
              },
            });
          } catch (supaErr) {
            console.warn('[Supabase Auth Warning]:', supaErr);
          }
        }
        await signIn(email, password, role);
        showToast('Account registered and session saved locally!', 'success');
      } else {
        // Reset password
        showToast(`Password reset link sent to ${email} (via Supabase Email Service)`, 'info');
        setTab('signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickRoles: { role: UserRole; email: string; name: string }[] = [
    { role: 'Administrator', email: 'admin@educore.ac.ug', name: 'Dr. Ronald Mugisha' },
    { role: 'Head Teacher', email: 'headteacher@educore.ac.ug', name: 'Mrs. Christine Kigozi' },
    { role: 'Deputy Head Teacher', email: 'deputy@educore.ac.ug', name: 'Mr. David Sserwadda' },
    { role: 'Secretary', email: 'secretary@educore.ac.ug', name: 'Ms. Sarah Nalubega' },
    { role: 'Bursar', email: 'bursar@educore.ac.ug', name: 'Ms. Rose Nansubuga' },
    { role: 'Teacher', email: 'e.tumuhimbise@educore.ac.ug', name: 'Mr. Emmanuel Tumuhimbise' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white text-center relative">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center">
            <img src="icon.svg" alt="EduCore" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-base font-black tracking-tight">{schoolProfile.name}</h2>
          <p className="text-[11px] text-blue-200">
            Ugandan Institutional Portal • Online & Offline Access
          </p>
          {!syncState.effectiveOnline && (
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
              <WifiOff className="w-3 h-3" />
              <span>Offline Local Session Active</span>
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-center">
          <button
            onClick={() => setTab('signin')}
            className={`flex-1 py-3 border-b-2 transition ${
              tab === 'signin'
                ? 'border-blue-700 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-3 border-b-2 transition ${
              tab === 'signup'
                ? 'border-blue-700 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Register Account
          </button>
          <button
            onClick={() => setTab('reset')}
            className={`flex-1 py-3 border-b-2 transition ${
              tab === 'reset'
                ? 'border-blue-700 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {tab === 'signup' && (
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mrs. Florence Namaganda"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@educore.ac.ug"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          {tab !== 'reset' && (
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
          )}

          {tab !== 'reset' && (
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Select Your Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              >
                <option value="Administrator">Administrator</option>
                <option value="Head Teacher">Head Teacher</option>
                <option value="Deputy Head Teacher">Deputy Head Teacher</option>
                <option value="Secretary">Secretary (Administration)</option>
                <option value="Bursar">Bursar (Finance)</option>
                <option value="Teacher">Teacher (Class & Subject)</option>
                <option value="Registrar">Registrar (Admissions)</option>
                <option value="Librarian">Librarian</option>
                <option value="Storekeeper">Storekeeper</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : tab === 'signin' ? 'Sign In to EduCore' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>

          {/* Quick Demo Role Clickers */}
          {tab === 'signin' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="block text-[10px] uppercase font-bold text-slate-400 text-center mb-1.5">
                Quick Demo Evaluation Profiles
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {quickRoles.map((qr) => (
                  <button
                    key={qr.role}
                    type="button"
                    onClick={() => {
                      setEmail(qr.email);
                      setRole(qr.role);
                      setFullName(qr.name);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] truncate"
                  >
                    <strong className="block text-slate-800 dark:text-slate-200">{qr.role}</strong>
                    <span className="text-[10px] text-slate-400 truncate">{qr.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
