import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  UserProfile,
  SchoolProfile,
  Student,
  StaffMember,
  Parent,
  ClassItem,
  StreamItem,
  SubjectItem,
  AttendanceRecord,
  FeeStructure,
  PaymentRecord,
  GradingScheme,
  Exam,
  ResultRecord,
  LibraryBook,
  LibraryIssueTransaction,
  InventoryItem,
  DisciplineRecord,
  NotificationItem,
  SyncQueueItem,
  AuditLog,
  StaffApplication,
  StaffAttendanceRecord,
  StaffLeaveRecord,
  ApplicationStatus,
} from '../types';
import {
  initializeOfflineDatabase,
  dbGetAll,
  dbSave,
  dbDelete,
  initialSchoolProfile,
} from '../services/offlineDb';
import { syncEngine, SyncEngineState } from '../services/syncEngine';
import { logAction } from '../services/auditLogger';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  schoolProfile: SchoolProfile;
  setSchoolProfile: (profile: SchoolProfile) => Promise<void>;
  currentUser: UserProfile;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  signIn: (email: string, pass: string, role?: UserRole) => Promise<boolean>;
  signOut: () => Promise<void>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  syncState: SyncEngineState;
  toggleSimulatedOffline: () => void;
  syncNow: () => Promise<{ success: boolean; count: number; error?: string }>;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Data Collections
  students: Student[];
  staff: StaffMember[];
  teachers: StaffMember[]; // alias
  parents: Parent[];
  classes: ClassItem[];
  streams: StreamItem[];
  subjects: SubjectItem[];
  feeStructures: FeeStructure[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  staffAttendance: StaffAttendanceRecord[];
  gradingSchemes: GradingScheme[];
  exams: Exam[];
  results: ResultRecord[];
  libraryBooks: LibraryBook[];
  libraryIssues: LibraryIssueTransaction[];
  inventoryItems: InventoryItem[];
  disciplineRecords: DisciplineRecord[];
  staffApplications: StaffApplication[];
  notifications: NotificationItem[];
  syncQueue: SyncQueueItem[];
  auditLogs: AuditLog[];

  // Mutators
  addStudent: (student: Omit<Student, 'id' | 'sync_status' | 'created_at' | 'updated_at'>) => Promise<Student>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addStaff: (staffMember: Omit<StaffMember, 'id'>) => Promise<StaffMember>;
  updateStaff: (staffMember: StaffMember) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  addStream: (stream: Omit<StreamItem, 'id'>) => Promise<void>;
  updateStream: (stream: StreamItem) => Promise<void>;
  addClass: (cls: Omit<ClassItem, 'id'>) => Promise<void>;
  updateClass: (cls: ClassItem) => Promise<void>;
  addSubject: (sub: Omit<SubjectItem, 'id'>) => Promise<void>;
  updateSubject: (sub: SubjectItem) => Promise<void>;
  saveAttendanceBatch: (records: AttendanceRecord[]) => Promise<void>;
  saveStaffAttendanceBatch: (records: StaffAttendanceRecord[]) => Promise<void>;
  submitStaffApplication: (app: Omit<StaffApplication, 'id' | 'application_number' | 'status' | 'submitted_at' | 'sync_status'>) => Promise<StaffApplication>;
  reviewStaffApplication: (appId: string, status: ApplicationStatus, comment?: string, reply?: string) => Promise<void>;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'sync_status'>) => Promise<PaymentRecord>;
  addFeeStructure: (fee: Omit<FeeStructure, 'id'>) => Promise<void>;
  updateFeeStructure: (fee: FeeStructure) => Promise<void>;
  saveResultsBatch: (records: ResultRecord[]) => Promise<void>;
  updateGradingScheme: (scheme: GradingScheme) => Promise<void>;
  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => Promise<void>;
  updateLibraryBook: (book: LibraryBook) => Promise<void>;
  issueBooksTransaction: (tx: Omit<LibraryIssueTransaction, 'id' | 'sync_status'>) => Promise<LibraryIssueTransaction>;
  returnLibraryBookItem: (issueId: string, bookId: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  addDisciplineRecord: (record: Omit<DisciplineRecord, 'id'>) => Promise<void>;
  updateDisciplineRecord: (record: DisciplineRecord) => Promise<void>;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'created_at'>) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const defaultUser: UserProfile = {
  id: 'usr-001',
  email: 'headteacher@educore.ac.ug',
  full_name: 'Mrs. Christine Kigozi',
  role: 'Head Teacher',
  phone: '+256 772 123456',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolProfile, setProfileState] = useState<SchoolProfile>(initialSchoolProfile);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('educore_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });
  const [activeRole, setRoleState] = useState<UserRole>(currentUser.role);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('educore_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncEngineState>(syncEngine.getState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [streams, setStreams] = useState<StreamItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [staffApplications, setStaffApplications] = useState<StaffApplication[]>([]);
  const [gradingSchemes, setGradingSchemes] = useState<GradingScheme[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [libraryIssues, setLibraryIssues] = useState<LibraryIssueTransaction[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [disciplineRecords, setDisciplineRecords] = useState<DisciplineRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme application
  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem('educore_theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync listener
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((state) => {
      setSyncState(state);
      dbGetAll<SyncQueueItem>('sync_queue').then(setSyncQueue).catch(() => {});
    });
    return unsubscribe;
  }, []);

  // Initial load
  const refreshAllData = useCallback(async () => {
    try {
      await initializeOfflineDatabase();
      const [
        loadedProfile,
        loadedStudents,
        loadedStaff,
        loadedParents,
        loadedClasses,
        loadedStreams,
        loadedSubjects,
        loadedFeeStructures,
        loadedPayments,
        loadedAttendance,
        loadedStaffAttendance,
        loadedSchemes,
        loadedExams,
        loadedResults,
        loadedBooks,
        loadedIssues,
        loadedInventory,
        loadedDiscipline,
        loadedStaffApplications,
        loadedNotifs,
        loadedQueue,
        loadedLogs,
      ] = await Promise.all([
        dbGetAll<SchoolProfile>('school_settings'),
        dbGetAll<Student>('students'),
        dbGetAll<StaffMember>('staff'),
        dbGetAll<Parent>('parents'),
        dbGetAll<ClassItem>('classes'),
        dbGetAll<StreamItem>('streams'),
        dbGetAll<SubjectItem>('subjects'),
        dbGetAll<FeeStructure>('fee_structures'),
        dbGetAll<PaymentRecord>('payments'),
        dbGetAll<AttendanceRecord>('attendance'),
        dbGetAll<StaffAttendanceRecord>('staff_attendance'),
        dbGetAll<GradingScheme>('grading_schemes'),
        dbGetAll<Exam>('exams'),
        dbGetAll<ResultRecord>('results'),
        dbGetAll<LibraryBook>('library_books'),
        dbGetAll<LibraryIssueTransaction>('library_issues'),
        dbGetAll<InventoryItem>('inventory_items'),
        dbGetAll<DisciplineRecord>('discipline_records'),
        dbGetAll<StaffApplication>('staff_applications'),
        dbGetAll<NotificationItem>('notifications'),
        dbGetAll<SyncQueueItem>('sync_queue'),
        dbGetAll<AuditLog>('audit_logs'),
      ]);

      if (loadedProfile.length > 0) setProfileState(loadedProfile[0]);
      setStudents(loadedStudents);
      setStaff(loadedStaff);
      setParents(loadedParents);
      setClasses(loadedClasses);
      setStreams(loadedStreams);
      setSubjects(loadedSubjects);
      setFeeStructures(loadedFeeStructures);
      setPayments(loadedPayments);
      setAttendance(loadedAttendance);
      setStaffAttendance(loadedStaffAttendance);
      setGradingSchemes(loadedSchemes);
      setExams(loadedExams);
      setResults(loadedResults);
      setLibraryBooks(loadedBooks);
      setLibraryIssues(loadedIssues);
      setInventoryItems(loadedInventory);
      setDisciplineRecords(loadedDiscipline);
      setStaffApplications(loadedStaffApplications);
      setNotifications(loadedNotifs);
      setSyncQueue(loadedQueue);
      setAuditLogs(loadedLogs.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)));
    } catch (err) {
      console.error('[EduCore] Error refreshing data from IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Role switch handler
  const setActiveRole = useCallback((role: UserRole) => {
    setRoleState(role);
    setCurrentUser((prev) => {
      const updated = { ...prev, role };
      localStorage.setItem('educore_user', JSON.stringify(updated));
      return updated;
    });
    showToast(`Switched active view role to: ${role}`, 'info');
  }, [showToast]);

  const setSchoolProfile = useCallback(async (profile: SchoolProfile) => {
    setProfileState(profile);
    await dbSave('school_settings', profile);
    await syncEngine.enqueue('UPDATE', 'schools', profile);
    await logAction(currentUser.full_name, activeRole, 'CONFIG', 'schools', profile.id, 'Updated school profile');
    showToast('School profile updated successfully', 'success');
  }, [currentUser.full_name, activeRole, showToast]);

  const signIn = useCallback(async (email: string, pass: string, role?: UserRole): Promise<boolean> => {
    const assignedRole = role || 'Administrator';
    const user: UserProfile = {
      id: 'usr-' + Date.now(),
      email,
      full_name: email.split('@')[0].toUpperCase(),
      role: assignedRole,
    };
    setCurrentUser(user);
    setRoleState(assignedRole);
    setIsAuthenticated(true);
    localStorage.setItem('educore_user', JSON.stringify(user));
    await logAction(user.full_name, assignedRole, 'LOGIN', 'profiles', user.id, `User logged in (${email})`);
    showToast(`Welcome back, ${user.full_name}!`, 'success');
    return true;
  }, [showToast]);

  const signOut = useCallback(async () => {
    await logAction(currentUser.full_name, activeRole, 'LOGOUT', 'profiles', currentUser.id, 'User signed out');
    setIsAuthenticated(false);
    showToast('Signed out successfully.', 'info');
  }, [currentUser, activeRole, showToast]);

  const toggleSimulatedOffline = useCallback(() => {
    const isOfflineNow = syncEngine.toggleSimulatedOffline();
    if (isOfflineNow) {
      showToast('Simulation: Device is OFFLINE. All operations saved locally.', 'warning');
    } else {
      showToast('Simulation: Device is ONLINE. Auto-sync triggered.', 'success');
    }
  }, [showToast]);

  const syncNow = useCallback(async () => {
    const res = await syncEngine.syncNow();
    if (res.success) {
      showToast(res.count > 0 ? `Successfully synchronized ${res.count} records!` : 'Everything is already up to date.', 'success');
    } else {
      showToast(res.error || 'Sync failed. Local data remains completely safe.', 'error');
    }
    await refreshAllData();
    return res;
  }, [showToast, refreshAllData]);

  // MUTATORS: STUDENTS
  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'sync_status' | 'created_at' | 'updated_at'>): Promise<Student> => {
    const newStudent: Student = {
      ...studentData,
      id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      sync_status: syncState.effectiveOnline ? 'synced' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await dbSave('students', newStudent);
    setStudents((prev) => [newStudent, ...prev]);

    await syncEngine.enqueue('INSERT', 'students', newStudent);
    await logAction(currentUser.full_name, activeRole, 'INSERT', 'students', newStudent.id, `Enrolled learner ${newStudent.first_name} ${newStudent.last_name} (${newStudent.admission_number})`);

    const msg = syncState.effectiveOnline ? 'Student admitted and saved!' : 'Student saved locally (Offline — Pending Sync)';
    showToast(msg, 'success');
    return newStudent;
  }, [syncState.effectiveOnline, currentUser.full_name, activeRole, showToast]);

  const updateStudent = useCallback(async (updated: Student) => {
    const toSave: Student = {
      ...updated,
      sync_status: syncState.effectiveOnline ? 'synced' : 'pending',
      updated_at: new Date().toISOString(),
    };
    await dbSave('students', toSave);
    setStudents((prev) => prev.map((s) => (s.id === toSave.id ? toSave : s)));

    await syncEngine.enqueue('UPDATE', 'students', toSave);
    await logAction(currentUser.full_name, activeRole, 'UPDATE', 'students', toSave.id, `Updated learner record for ${toSave.first_name} ${toSave.last_name}`);
    showToast('Student information updated successfully!', 'success');
  }, [syncState.effectiveOnline, currentUser.full_name, activeRole, showToast]);

  const deleteStudent = useCallback(async (id: string) => {
    const target = students.find((s) => s.id === id);
    await dbDelete('students', id);
    setStudents((prev) => prev.filter((s) => s.id !== id));

    await syncEngine.enqueue('DELETE', 'students', { id });
    await logAction(currentUser.full_name, activeRole, 'DELETE', 'students', id, `Removed learner ${target?.first_name || ''} ${target?.last_name || ''}`);
    showToast('Student record archived/removed.', 'info');
  }, [students, currentUser.full_name, activeRole, showToast]);

  // MUTATORS: STAFF
  const addStaff = useCallback(async (staffData: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
    const newStaff: StaffMember = {
      ...staffData,
      id: 'stf-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    };
    await dbSave('staff', newStaff);
    await dbSave('teachers', newStaff); // backwards compat
    setStaff((prev) => [newStaff, ...prev]);

    await syncEngine.enqueue('INSERT', 'staff', newStaff);
    await logAction(currentUser.full_name, activeRole, 'INSERT', 'staff', newStaff.id, `Added staff member ${newStaff.full_name} (${newStaff.staff_id})`);
    showToast(`Staff member ${newStaff.full_name} registered successfully!`, 'success');
    return newStaff;
  }, [currentUser.full_name, activeRole, showToast]);

  const updateStaff = useCallback(async (staffMember: StaffMember) => {
    await dbSave('staff', staffMember);
    await dbSave('teachers', staffMember);
    setStaff((prev) => prev.map((s) => (s.id === staffMember.id ? staffMember : s)));

    await syncEngine.enqueue('UPDATE', 'staff', staffMember);
    await logAction(currentUser.full_name, activeRole, 'UPDATE', 'staff', staffMember.id, `Updated staff profile for ${staffMember.full_name}`);
    showToast('Staff profile updated successfully!', 'success');
  }, [currentUser.full_name, activeRole, showToast]);

  const deleteStaff = useCallback(async (id: string) => {
    const target = staff.find((s) => s.id === id);
    await dbDelete('staff', id);
    await dbDelete('teachers', id);
    setStaff((prev) => prev.filter((s) => s.id !== id));

    await syncEngine.enqueue('DELETE', 'staff', { id });
    await logAction(currentUser.full_name, activeRole, 'DELETE', 'staff', id, `Archived staff member ${target?.full_name || ''}`);
    showToast('Staff member record archived.', 'info');
  }, [staff, currentUser.full_name, activeRole, showToast]);

  // MUTATORS: STREAMS & CLASSES & SUBJECTS
  const addStream = useCallback(async (stData: Omit<StreamItem, 'id'>) => {
    const newStream: StreamItem = {
      ...stData,
      id: 'st-' + Date.now(),
    };
    await dbSave('streams', newStream);
    setStreams((prev) => [...prev, newStream]);
    await syncEngine.enqueue('INSERT', 'streams', newStream);
    showToast(`Stream "${newStream.name}" added to academic settings!`, 'success');
  }, [showToast]);

  const updateStream = useCallback(async (stItem: StreamItem) => {
    await dbSave('streams', stItem);
    setStreams((prev) => prev.map((s) => (s.id === stItem.id ? stItem : s)));
    await syncEngine.enqueue('UPDATE', 'streams', stItem);
    showToast(`Stream "${stItem.name}" updated!`, 'success');
  }, [showToast]);

  const addClass = useCallback(async (cData: Omit<ClassItem, 'id'>) => {
    const newClass: ClassItem = {
      ...cData,
      id: 'cls-' + Date.now(),
    };
    await dbSave('classes', newClass);
    setClasses((prev) => [...prev, newClass]);
    await syncEngine.enqueue('INSERT', 'classes', newClass);
    showToast(`Class "${newClass.name}" added!`, 'success');
  }, [showToast]);

  const updateClass = useCallback(async (cls: ClassItem) => {
    await dbSave('classes', cls);
    setClasses((prev) => prev.map((c) => (c.id === cls.id ? cls : c)));
    await syncEngine.enqueue('UPDATE', 'classes', cls);
    showToast(`Class "${cls.name}" updated!`, 'success');
  }, [showToast]);

  const addSubject = useCallback(async (subData: Omit<SubjectItem, 'id'>) => {
    const newSub: SubjectItem = {
      ...subData,
      id: 'sub-' + Date.now(),
    };
    await dbSave('subjects', newSub);
    setSubjects((prev) => [...prev, newSub]);
    await syncEngine.enqueue('INSERT', 'subjects', newSub);
    showToast(`Subject "${newSub.name}" added to curriculum!`, 'success');
  }, [showToast]);

  const updateSubject = useCallback(async (sub: SubjectItem) => {
    await dbSave('subjects', sub);
    setSubjects((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
    await syncEngine.enqueue('UPDATE', 'subjects', sub);
    showToast(`Subject "${sub.name}" updated!`, 'success');
  }, [showToast]);

  // MUTATORS: ATTENDANCE
  const saveAttendanceBatch = useCallback(async (records: AttendanceRecord[]) => {
    for (const record of records) {
      await dbSave('attendance', record);
      await syncEngine.enqueue('UPDATE', 'attendance', record);
    }
    setAttendance((prev) => {
      const ids = new Set(records.map((r) => r.id));
      return [...records, ...prev.filter((r) => !ids.has(r.id))];
    });

    await logAction(currentUser.full_name, activeRole, 'INSERT', 'attendance', undefined, `Marked attendance for ${records.length} learners`);
    const msg = syncState.effectiveOnline ? 'Attendance recorded and synchronized!' : 'Attendance saved offline — pending sync';
    showToast(msg, 'success');
  }, [syncState.effectiveOnline, currentUser.full_name, activeRole, showToast]);

  const saveStaffAttendanceBatch = useCallback(async (records: StaffAttendanceRecord[]) => {
    for (const record of records) {
      await dbSave('staff_attendance', record);
      await syncEngine.enqueue('UPDATE', 'staff_attendance', record);
    }
    setStaffAttendance((prev) => {
      const ids = new Set(records.map((r) => r.id));
      return [...records, ...prev.filter((r) => !ids.has(r.id))];
    });

    await logAction(currentUser.full_name, activeRole, 'INSERT', 'staff_attendance', undefined, `Marked attendance for ${records.length} staff members`);
    showToast(`Staff attendance saved for ${records.length} staff members!`, 'success');
  }, [currentUser.full_name, activeRole, showToast]);

  // MUTATORS: FEES & PAYMENTS
  const recordPayment = useCallback(async (paymentData: Omit<PaymentRecord, 'id' | 'sync_status'>): Promise<PaymentRecord> => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      sync_status: syncState.effectiveOnline ? 'synced' : 'pending',
    };
    await dbSave('payments', newPayment);
    setPayments((prev) => [newPayment, ...prev]);

    await syncEngine.enqueue('INSERT', 'payments', newPayment);
    await logAction(currentUser.full_name, activeRole, 'INSERT', 'payments', newPayment.receipt_number, `Recorded payment UGX ${newPayment.amount_ugx.toLocaleString()} (${newPayment.receipt_number})`);

    const msg = syncState.effectiveOnline ? 'Payment saved and receipt ready!' : 'Payment recorded offline — Pending Sync';
    showToast(msg, 'success');
    return newPayment;
  }, [syncState.effectiveOnline, currentUser.full_name, activeRole, showToast]);

  const addFeeStructure = useCallback(async (feeData: Omit<FeeStructure, 'id'>) => {
    const newFee: FeeStructure = {
      ...feeData,
      id: 'fee-' + Date.now(),
    };
    await dbSave('fee_structures', newFee);
    setFeeStructures((prev) => [...prev, newFee]);
    await syncEngine.enqueue('INSERT', 'fee_structures', newFee);
    showToast(`Fee item "${newFee.category}" saved!`, 'success');
  }, [showToast]);

  const updateFeeStructure = useCallback(async (fee: FeeStructure) => {
    await dbSave('fee_structures', fee);
    setFeeStructures((prev) => prev.map((f) => (f.id === fee.id ? fee : f)));
    await syncEngine.enqueue('UPDATE', 'fee_structures', fee);
    showToast(`Fee structure "${fee.category}" updated!`, 'success');
  }, [showToast]);

  // MUTATORS: RESULTS & GRADING
  const saveResultsBatch = useCallback(async (records: ResultRecord[]) => {
    for (const r of records) {
      await dbSave('results', r);
      await syncEngine.enqueue('UPDATE', 'results', r);
    }
    setResults((prev) => {
      const ids = new Set(records.map((x) => x.id));
      return [...records, ...prev.filter((x) => !ids.has(x.id))];
    });
    await logAction(currentUser.full_name, activeRole, 'UPDATE', 'results', undefined, `Entered marks for ${records.length} assessment entries`);
    showToast('Assessment marks saved successfully!', 'success');
  }, [currentUser.full_name, activeRole, showToast]);

  const updateGradingScheme = useCallback(async (scheme: GradingScheme) => {
    await dbSave('grading_schemes', scheme);
    setGradingSchemes((prev) => prev.map((s) => (s.id === scheme.id ? scheme : s)));
    await syncEngine.enqueue('UPDATE', 'grading_schemes', scheme);
    showToast(`Grading scheme "${scheme.name}" updated!`, 'success');
  }, [showToast]);

  // MUTATORS: LIBRARY
  const addLibraryBook = useCallback(async (bookData: Omit<LibraryBook, 'id'>) => {
    const newBook: LibraryBook = {
      ...bookData,
      id: 'bk-' + Date.now(),
    };
    await dbSave('library_books', newBook);
    setLibraryBooks((prev) => [newBook, ...prev]);
    await syncEngine.enqueue('INSERT', 'library_books', newBook);
    showToast('New book cataloged in library!', 'success');
  }, [showToast]);

  const updateLibraryBook = useCallback(async (book: LibraryBook) => {
    await dbSave('library_books', book);
    setLibraryBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
    await syncEngine.enqueue('UPDATE', 'library_books', book);
    showToast('Book details updated!', 'success');
  }, [showToast]);

  const issueBooksTransaction = useCallback(async (txData: Omit<LibraryIssueTransaction, 'id' | 'sync_status'>): Promise<LibraryIssueTransaction> => {
    const newTx: LibraryIssueTransaction = {
      ...txData,
      id: 'iss-' + Date.now(),
      sync_status: syncState.effectiveOnline ? 'synced' : 'pending',
    };

    // Update book stock in memory and IndexedDB
    for (const item of newTx.items) {
      const targetBook = libraryBooks.find((b) => b.id === item.book_id);
      if (targetBook) {
        const updatedBook: LibraryBook = {
          ...targetBook,
          available_copies: Math.max(0, targetBook.available_copies - item.copies_issued),
          issued_copies: targetBook.issued_copies + item.copies_issued,
          status: targetBook.available_copies - item.copies_issued <= 0 ? 'Issued' : 'Available',
        };
        await dbSave('library_books', updatedBook);
        setLibraryBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
      }
    }

    await dbSave('library_issues', newTx);
    setLibraryIssues((prev) => [newTx, ...prev]);
    await syncEngine.enqueue('INSERT', 'library_issues', newTx);
    await logAction(currentUser.full_name, activeRole, 'INSERT', 'library_issues', newTx.issue_code, `Issued ${newTx.items.length} book titles to ${newTx.person_name}`);
    showToast(`Books successfully issued to ${newTx.person_name}!`, 'success');
    return newTx;
  }, [libraryBooks, syncState.effectiveOnline, currentUser.full_name, activeRole, showToast]);

  const returnLibraryBookItem = useCallback(async (issueId: string, bookId: string) => {
    const issue = libraryIssues.find((i) => i.id === issueId);
    if (!issue) return;

    const returnDate = new Date().toISOString().split('T')[0];
    let allReturned = true;

    const updatedItems = issue.items.map((item) => {
      if (item.book_id === bookId && item.status !== 'Returned') {
        return {
          ...item,
          status: 'Returned' as const,
          copies_returned: item.copies_issued,
          return_date: returnDate,
        };
      }
      if (item.status !== 'Returned') {
        allReturned = false;
      }
      return item;
    });

    const updatedIssue: LibraryIssueTransaction = {
      ...issue,
      items: updatedItems,
      status: allReturned ? 'Returned' : 'Currently issued',
      actual_return_date: allReturned ? returnDate : undefined,
    };

    // Restore book stock
    const targetBook = libraryBooks.find((b) => b.id === bookId);
    if (targetBook) {
      const itemToReturn = issue.items.find((i) => i.book_id === bookId);
      const returnCount = itemToReturn ? itemToReturn.copies_issued : 1;
      const updatedBook: LibraryBook = {
        ...targetBook,
        available_copies: targetBook.available_copies + returnCount,
        issued_copies: Math.max(0, targetBook.issued_copies - returnCount),
        status: 'Available',
      };
      await dbSave('library_books', updatedBook);
      setLibraryBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
    }

    await dbSave('library_issues', updatedIssue);
    setLibraryIssues((prev) => prev.map((i) => (i.id === issueId ? updatedIssue : i)));
    await syncEngine.enqueue('UPDATE', 'library_issues', updatedIssue);
    showToast('Book marked as returned. Available stock restored!', 'success');
  }, [libraryIssues, libraryBooks, showToast]);

  // MUTATORS: INVENTORY & DISCIPLINE & NOTICES
  const addInventoryItem = useCallback(async (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: 'inv-' + Date.now(),
    };
    await dbSave('inventory_items', newItem);
    setInventoryItems((prev) => [newItem, ...prev]);
    await syncEngine.enqueue('INSERT', 'inventory_items', newItem);
    showToast('Item recorded into school inventory!', 'success');
  }, [showToast]);

  const addDisciplineRecord = useCallback(async (recData: Omit<DisciplineRecord, 'id'>) => {
    const newRec: DisciplineRecord = {
      ...recData,
      id: 'disc-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await dbSave('discipline_records', newRec);
    setDisciplineRecords((prev) => [newRec, ...prev]);
    await syncEngine.enqueue('INSERT', 'discipline_records', newRec);
    await logAction(currentUser.full_name, activeRole, 'INSERT', 'discipline_records', newRec.id, `Recorded disciplinary incident for ${newRec.person_name}`);
    showToast('Disciplinary incident recorded securely.', 'success');
  }, [currentUser.full_name, activeRole, showToast]);

  const updateDisciplineRecord = useCallback(async (rec: DisciplineRecord) => {
    const updated: DisciplineRecord = {
      ...rec,
      updated_at: new Date().toISOString(),
    };
    await dbSave('discipline_records', updated);
    setDisciplineRecords((prev) => prev.map((d) => (d.id === rec.id ? updated : d)));
    await syncEngine.enqueue('UPDATE', 'discipline_records', updated);
    showToast('Disciplinary record updated.', 'success');
  }, [showToast]);

  const addNotification = useCallback(async (notifData: Omit<NotificationItem, 'id' | 'created_at'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'notif-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    await dbSave('notifications', newNotif);
    setNotifications((prev) => [newNotif, ...prev]);
    await syncEngine.enqueue('INSERT', 'notifications', newNotif);
    showToast('School announcement broadcasted!', 'success');
  }, [showToast]);

  const submitStaffApplication = useCallback(async (appData: Omit<StaffApplication, 'id' | 'application_number' | 'status' | 'submitted_at' | 'sync_status'>) => {
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newApp: StaffApplication = {
      ...appData,
      id: 'app-' + Date.now(),
      application_number: `APP-2026-${nextNum}`,
      status: 'Pending Approval',
      submitted_at: new Date().toISOString(),
      sync_status: 'pending',
    };
    await dbSave('staff_applications', newApp);
    setStaffApplications((prev) => [newApp, ...prev]);
    await syncEngine.enqueue('INSERT', 'staff_applications', newApp);
    await logAction(currentUser.full_name, activeRole, 'INSERT', 'staff_applications', newApp.id, `Submitted ${newApp.application_type} for ${newApp.staff_name}`);
    showToast(`Your ${newApp.application_type} (#${newApp.application_number}) was submitted successfully!`, 'success');
    return newApp;
  }, [currentUser.full_name, activeRole, showToast]);

  const reviewStaffApplication = useCallback(async (appId: string, status: ApplicationStatus, comment?: string, reply?: string) => {
    const app = staffApplications.find((a) => a.id === appId);
    if (!app) return;
    const updatedApp: StaffApplication = {
      ...app,
      status,
      admin_comment: comment || app.admin_comment,
      admin_reply: reply || app.admin_reply,
      reviewed_by: `${currentUser.full_name} (${activeRole})`,
      reviewed_at: new Date().toISOString(),
      sync_status: 'pending',
    };
    await dbSave('staff_applications', updatedApp);
    setStaffApplications((prev) => prev.map((a) => (a.id === appId ? updatedApp : a)));
    await syncEngine.enqueue('UPDATE', 'staff_applications', updatedApp);

    // If leave application is approved, also record in the staff member's leave_history
    if (status === 'Approved' && app.application_type === 'Leave Application') {
      const targetStaff = staff.find((s) => s.id === app.staff_id || s.staff_id === app.staff_id || s.full_name === app.staff_name);
      if (targetStaff) {
        const leaveRecord: StaffLeaveRecord = {
          id: 'lvr-' + Date.now(),
          application_number: app.application_number,
          leave_type: app.leave_type || 'Annual Leave',
          start_date: app.start_date || new Date().toISOString().split('T')[0],
          end_date: app.end_date || new Date().toISOString().split('T')[0],
          days_count: app.days_requested || 1,
          reason: app.reason,
          approved_by: `${currentUser.full_name} (${activeRole})`,
          approved_date: new Date().toISOString().split('T')[0],
          status: 'Approved',
          notes: comment,
          document_url: app.uploaded_document_url,
        };
        const updatedStaff: StaffMember = {
          ...targetStaff,
          leave_history: [leaveRecord, ...(targetStaff.leave_history || [])],
        };
        await dbSave('staff', updatedStaff);
        setStaff((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));
        await syncEngine.enqueue('UPDATE', 'staff', updatedStaff);
      }
    }

    await logAction(currentUser.full_name, activeRole, 'UPDATE', 'staff_applications', appId, `Reviewed application ${app.application_number}: marked ${status}`);
    showToast(`Application #${app.application_number} marked as ${status}.`, 'success');
  }, [staffApplications, staff, currentUser.full_name, activeRole, showToast]);

  return (
    <AppContext.Provider
      value={{
        schoolProfile,
        setSchoolProfile,
        currentUser,
        activeRole,
        setActiveRole,
        isAuthenticated,
        signIn,
        signOut,
        theme,
        setTheme,
        activeView,
        setActiveView,
        selectedStudentId,
        setSelectedStudentId,
        syncState,
        toggleSimulatedOffline,
        syncNow,
        toasts,
        showToast,
        removeToast,
        students,
        staff,
        teachers: staff, // alias
        parents,
        classes,
        streams,
        subjects,
        feeStructures,
        payments,
        attendance,
        staffAttendance,
        gradingSchemes,
        exams,
        results,
        libraryBooks,
        libraryIssues,
        inventoryItems,
        disciplineRecords,
        staffApplications,
        notifications,
        syncQueue,
        auditLogs,
        addStudent,
        updateStudent,
        deleteStudent,
        addStaff,
        updateStaff,
        deleteStaff,
        addStream,
        updateStream,
        addClass,
        updateClass,
        addSubject,
        updateSubject,
        saveAttendanceBatch,
        saveStaffAttendanceBatch,
        submitStaffApplication,
        reviewStaffApplication,
        recordPayment,
        addFeeStructure,
        updateFeeStructure,
        saveResultsBatch,
        updateGradingScheme,
        addLibraryBook,
        updateLibraryBook,
        issueBooksTransaction,
        returnLibraryBookItem,
        addInventoryItem,
        addDisciplineRecord,
        updateDisciplineRecord,
        addNotification,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
