import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  BookOpen,
  FileSpreadsheet,
  Award,
  Library,
  Package,
  ShieldAlert,
  Bell,
  FolderLock,
  Settings,
  RefreshCw,
  FileText,
  UserCheck,
  X,
  Inbox,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSyncCenter: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenSyncCenter }) => {
  const { activeView, setActiveView, activeRole, syncState } = useApp();

  const handleNav = (viewId: string) => {
    setActiveView(viewId);
    onClose();
  };

  // Role permissions filter
  const canAccess = (viewId: string) => {
    if (activeRole === 'Super Administrator' || activeRole === 'Administrator' || activeRole === 'Head Teacher') {
      return true;
    }
    if (activeRole === 'Deputy Head Teacher') {
      return viewId !== 'settings';
    }
    if (activeRole === 'Bursar') {
      return ['dashboard', 'fees', 'reports', 'students', 'applications', 'documents', 'sync-center'].includes(viewId);
    }
    if (activeRole === 'Registrar') {
      return ['dashboard', 'students', 'classes', 'parents', 'reports', 'applications', 'documents', 'sync-center'].includes(viewId);
    }
    if (activeRole === 'Teacher') {
      return ['dashboard', 'classes', 'attendance', 'exams', 'report-cards', 'students', 'library', 'applications', 'documents', 'communication', 'sync-center'].includes(viewId);
    }
    if (activeRole === 'Librarian') {
      return ['dashboard', 'library', 'students', 'communication', 'sync-center'].includes(viewId);
    }
    if (activeRole === 'Storekeeper') {
      return ['dashboard', 'inventory', 'communication', 'sync-center'].includes(viewId);
    }
    if (activeRole === 'Secretary') {
      return ['dashboard', 'students', 'parents', 'teachers', 'attendance', 'documents', 'applications', 'communication', 'sync-center'].includes(viewId);
    }
    return true;
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'sync-center',
          label: 'Sync Center',
          icon: RefreshCw,
          badge: syncState.pendingCount > 0 ? `${syncState.pendingCount}` : undefined,
          action: onOpenSyncCenter,
        },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { id: 'students', label: 'Students & Admissions', icon: GraduationCap },
        { id: 'parents', label: 'Parents & Guardians', icon: Users },
        { id: 'teachers', label: 'Staff (Teaching & Non-Teaching)', icon: UserCheck },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { id: 'classes', label: 'Classes & Streams', icon: BookOpen },
        { id: 'attendance', label: 'Attendance (Students & Staff)', icon: CalendarCheck },
        { id: 'exams', label: 'Exams & Marks Entry', icon: Award },
        { id: 'report-cards', label: 'Terminal Report Cards', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'FINANCE & BURSARY (UGX)',
      items: [
        { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
        { id: 'reports', label: 'Financial & School Reports', icon: FileText },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'applications', label: 'Applications & Grievances', icon: Inbox },
        { id: 'library', label: 'School Library', icon: Library },
        { id: 'inventory', label: 'Store & Inventory', icon: Package },
        { id: 'discipline', label: 'Discipline Records', icon: ShieldAlert },
      ],
    },
    {
      title: 'COMMUNICATION & FORMS',
      items: [
        { id: 'communication', label: 'School Notices & SMS', icon: Bell },
        { id: 'documents', label: 'School Forms & Templates', icon: FileCheck },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'settings', label: 'School & Supabase Setup', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside Sidebar on Mobile */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-sm">
              EC
            </div>
            <span className="font-bold text-slate-900 dark:text-white">EduCore Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => {
            const accessibleItems = section.items.filter((item) => canAccess(item.id));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                <h4 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                  {section.title}
                </h4>
                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => (item.action ? item.action() : handleNav(item.id))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-blue-900 text-white shadow-sm dark:bg-blue-600'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Offline Quick Status Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Storage Mode</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                Local-First
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              IndexedDB cache is ready. All actions function offline with auto-sync.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
