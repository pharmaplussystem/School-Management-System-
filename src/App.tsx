import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ToastContainer } from './components/common/ToastContainer';
import { SyncCenterModal } from './components/common/SyncCenterModal';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentsView } from './components/students/StudentsView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { FeesView } from './components/finance/FeesView';
import { ClassesView } from './components/academics/ClassesView';
import { ExamsView } from './components/academics/ExamsView';
import { ReportCardsView } from './components/academics/ReportCardsView';
import { LibraryView } from './components/operations/LibraryView';
import { InventoryView } from './components/operations/InventoryView';
import { DisciplineView } from './components/operations/DisciplineView';
import { CommunicationView } from './components/communication/CommunicationView';
import { DocumentsView } from './components/documents/DocumentsView';
import { ApplicationsView } from './components/operations/ApplicationsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ParentsView } from './components/people/ParentsView';
import { TeachersView } from './components/people/TeachersView';

const MainLayout: React.FC = () => {
  const { activeView, isAuthenticated } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onOpenSyncCenter={() => setIsSyncCenterOpen(true)} />;
      case 'students':
        return <StudentsView />;
      case 'parents':
        return <ParentsView />;
      case 'teachers':
        return <TeachersView />;
      case 'attendance':
        return <AttendanceView />;
      case 'fees':
        return <FeesView />;
      case 'classes':
        return <ClassesView />;
      case 'exams':
        return <ExamsView />;
      case 'report-cards':
        return <ReportCardsView />;
      case 'library':
        return <LibraryView />;
      case 'inventory':
        return <InventoryView />;
      case 'discipline':
        return <DisciplineView />;
      case 'applications':
        return <ApplicationsView />;
      case 'communication':
        return <CommunicationView />;
      case 'documents':
        return <DocumentsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onOpenSyncCenter={() => setIsSyncCenterOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Offline Alert Strip */}
      <OfflineIndicator onOpenSyncCenter={() => setIsSyncCenterOpen(true)} />

      {/* Top Application Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSyncCenter={() => setIsSyncCenterOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenSyncCenter={() => setIsSyncCenterOpen(true)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Sync Center Modal */}
      <SyncCenterModal
        isOpen={isSyncCenterOpen}
        onClose={() => setIsSyncCenterOpen(false)}
      />

      {/* Auth Screen Modal if user signed out */}
      {!isAuthenticated && <AuthModal />}

      {/* Fixed Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
