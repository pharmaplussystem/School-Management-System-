import { openDB, IDBPDatabase } from 'idb';
import {
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
  SchoolProfile,
  StaffApplication,
  StaffAttendanceRecord,
} from '../types';

const DB_NAME = 'educore_offline_db';
const DB_VERSION = 3; // Incremented for staff applications & attendance stores

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        const stores = [
          'students',
          'parents',
          'staff',
          'teachers', // alias
          'classes',
          'streams',
          'subjects',
          'attendance',
          'fee_structures',
          'payments',
          'grading_schemes',
          'exams',
          'results',
          'report_cards',
          'library_books',
          'library_issues',
          'inventory_items',
          'discipline_records',
          'notifications',
          'documents',
          'school_settings',
          'staff_attendance',
          'staff_applications',
          'sync_queue',
          'audit_logs',
        ];

        for (const store of stores) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        }
      },
    });
  }
  return dbPromise;
}

// -----------------------------------------------------------------------------
// SEED DATA: Realistic Ugandan Educational Environment
// -----------------------------------------------------------------------------

export const initialSchoolProfile: SchoolProfile = {
  id: 'school-ug-001',
  name: 'EduCore Model Academy Kampala',
  motto: 'Strive for Excellence and Integrity',
  logo_url: 'icon.svg',
  address: 'Plot 14 Lumumba Avenue, Nakasero',
  district: 'Kampala',
  country: 'Uganda',
  phone: '+256 414 123456',
  alt_phone: '+256 772 987654',
  email: 'info@educore.ac.ug',
  website: 'https://educore.ac.ug',
  currency: 'UGX',
  currency_code: 'UGX',
  timezone: 'Africa/Kampala',
  date_format: 'DD/MM/YYYY',
  current_academic_year: '2026',
  current_term: 'Term 1',
  school_sections: ['Primary', 'Lower Secondary', 'Advanced Secondary'],
};

export const initialStreamsList: StreamItem[] = [
  { id: 'st-gold', name: 'Gold', is_active: true },
  { id: 'st-silver', name: 'Silver', is_active: true },
  { id: 'st-blue', name: 'Blue', is_active: true },
  { id: 'st-red', name: 'Red', is_active: true },
  { id: 'st-north', name: 'North', is_active: true },
  { id: 'st-south', name: 'South', is_active: true },
  { id: 'st-east', name: 'East', is_active: true },
  { id: 'st-west', name: 'West', is_active: true },
  { id: 'st-green', name: 'Green', is_active: true },
  { id: 'st-yellow', name: 'Yellow', is_active: true },
];

export const initialClasses: ClassItem[] = [
  {
    id: 'cls-p1',
    name: 'P.1',
    level: 'Primary',
    order_index: 1,
    description: 'Primary One (Foundational Literacy & Numeracy)',
    section: 'Primary',
    streams: [
      { id: 'st-p1-blue', class_id: 'cls-p1', name: 'Blue', is_active: true, class_teacher_name: 'Tr. Florence Namaganda' },
      { id: 'st-p1-red', class_id: 'cls-p1', name: 'Red', is_active: true },
    ],
  },
  {
    id: 'cls-p2',
    name: 'P.2',
    level: 'Primary',
    order_index: 2,
    description: 'Primary Two',
    section: 'Primary',
    streams: [
      { id: 'st-p2-blue', class_id: 'cls-p2', name: 'Blue', is_active: true },
      { id: 'st-p2-red', class_id: 'cls-p2', name: 'Red', is_active: true },
    ],
  },
  {
    id: 'cls-p3',
    name: 'P.3',
    level: 'Primary',
    order_index: 3,
    description: 'Primary Three (Transition to Subject-Based Learning)',
    section: 'Primary',
    streams: [
      { id: 'st-p3-blue', class_id: 'cls-p3', name: 'Blue', is_active: true },
      { id: 'st-p3-gold', class_id: 'cls-p3', name: 'Gold', is_active: true },
    ],
  },
  {
    id: 'cls-p4',
    name: 'P.4',
    level: 'Primary',
    order_index: 4,
    description: 'Primary Four (Upper Primary Foundation)',
    section: 'Primary',
    streams: [
      { id: 'st-p4-blue', class_id: 'cls-p4', name: 'Blue', is_active: true },
      { id: 'st-p4-gold', class_id: 'cls-p4', name: 'Gold', is_active: true },
    ],
  },
  {
    id: 'cls-p5',
    name: 'P.5',
    level: 'Primary',
    order_index: 5,
    description: 'Primary Five',
    section: 'Primary',
    streams: [
      { id: 'st-p5-blue', class_id: 'cls-p5', name: 'Blue', is_active: true },
      { id: 'st-p5-gold', class_id: 'cls-p5', name: 'Gold', is_active: true },
    ],
  },
  {
    id: 'cls-p6',
    name: 'P.6',
    level: 'Primary',
    order_index: 6,
    description: 'Primary Six (Pre-PLE Preparation)',
    section: 'Primary',
    streams: [
      { id: 'st-p6-blue', class_id: 'cls-p6', name: 'Blue', is_active: true },
      { id: 'st-p6-gold', class_id: 'cls-p6', name: 'Gold', is_active: true },
    ],
  },
  {
    id: 'cls-p7',
    name: 'P.7',
    level: 'Primary',
    order_index: 7,
    description: 'Primary Seven (PLE Final Candidate Class)',
    section: 'Primary',
    streams: [
      { id: 'st-p7-gold', class_id: 'cls-p7', name: 'Gold', is_active: true, class_teacher_name: 'Tr. Emmanuel Tumuhimbise' },
      { id: 'st-p7-silver', class_id: 'cls-p7', name: 'Silver', is_active: true, class_teacher_name: 'Tr. Esther Nalwanga' },
    ],
  },
  {
    id: 'cls-s1',
    name: 'S.1',
    level: 'Lower Secondary',
    order_index: 8,
    description: 'Senior One (New Lower Secondary Competency-Based Curriculum)',
    section: 'Lower Secondary',
    streams: [
      { id: 'st-s1-north', class_id: 'cls-s1', name: 'North', is_active: true, class_teacher_name: 'Tr. David Mugisha' },
      { id: 'st-s1-south', class_id: 'cls-s1', name: 'South', is_active: true },
    ],
  },
  {
    id: 'cls-s2',
    name: 'S.2',
    level: 'Lower Secondary',
    order_index: 9,
    description: 'Senior Two',
    section: 'Lower Secondary',
    streams: [
      { id: 'st-s2-north', class_id: 'cls-s2', name: 'North', is_active: true },
      { id: 'st-s2-south', class_id: 'cls-s2', name: 'South', is_active: true },
    ],
  },
  {
    id: 'cls-s3',
    name: 'S.3',
    level: 'Lower Secondary',
    order_index: 10,
    description: 'Senior Three',
    section: 'Lower Secondary',
    streams: [
      { id: 'st-s3-east', class_id: 'cls-s3', name: 'East', is_active: true },
      { id: 'st-s3-west', class_id: 'cls-s3', name: 'West', is_active: true },
    ],
  },
  {
    id: 'cls-s4',
    name: 'S.4',
    level: 'Lower Secondary',
    order_index: 11,
    description: 'Senior Four (Uganda Certificate of Education - UCE Final Candidate Class)',
    section: 'Lower Secondary',
    streams: [
      { id: 'st-s4-east', class_id: 'cls-s4', name: 'East', is_active: true },
      { id: 'st-s4-west', class_id: 'cls-s4', name: 'West', is_active: true, class_teacher_name: 'Tr. David Mugisha' },
    ],
  },
  {
    id: 'cls-s5',
    name: 'S.5',
    level: 'Advanced Secondary',
    order_index: 12,
    description: 'Senior Five (Uganda Advanced Certificate of Education - UACE)',
    section: 'Advanced Secondary',
    streams: [
      { id: 'st-s5-sciences', class_id: 'cls-s5', name: 'Sciences (PCM/PCB/BCM)', is_active: true },
      { id: 'st-s5-arts', class_id: 'cls-s5', name: 'Arts & Humanities (HEG/MEG/DEG)', is_active: true },
    ],
  },
  {
    id: 'cls-s6',
    name: 'S.6',
    level: 'Advanced Secondary',
    order_index: 13,
    description: 'Senior Six (UACE Final National Candidate Class)',
    section: 'Advanced Secondary',
    streams: [
      { id: 'st-s6-sciences', class_id: 'cls-s6', name: 'Sciences', is_active: true },
      { id: 'st-s6-arts', class_id: 'cls-s6', name: 'Arts', is_active: true },
    ],
  },
];

export const initialSubjects: SubjectItem[] = [
  // PRIMARY SECTION (Uganda Primary Curriculum standard 4 core examinable subjects + co-curricular)
  { id: 'sub-p-eng', name: 'English Language', code: 'ENG', department: 'Languages', is_compulsory: true, is_core: true, is_active: true, cycle: 'Primary', classes: ['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7'] },
  { id: 'sub-p-mtc', name: 'Mathematics', code: 'MTC', department: 'Mathematics', is_compulsory: true, is_core: true, is_active: true, cycle: 'Primary', classes: ['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7'] },
  { id: 'sub-p-sci', name: 'Integrated Science', code: 'SCI', department: 'Sciences', is_compulsory: true, is_core: true, is_active: true, cycle: 'Primary', classes: ['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7'] },
  { id: 'sub-p-sst', name: 'Social Studies & R.E. (SST)', code: 'SST', department: 'Humanities', is_compulsory: true, is_core: true, is_active: true, cycle: 'Primary', classes: ['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7'] },
  { id: 'sub-p-lug', name: 'Luganda / Local Language', code: 'LUG', department: 'Languages', is_compulsory: false, is_core: false, is_active: true, cycle: 'Primary', classes: ['P.1', 'P.2', 'P.3', 'P.4', 'P.5'] },
  { id: 'sub-p-pe', name: 'Physical Education (P.E.)', code: 'PE', department: 'Physical Education', is_compulsory: false, is_core: false, is_active: true, cycle: 'Primary', classes: ['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7'] },
  { id: 'sub-p-art', name: 'Creative Arts & Music', code: 'CAM', department: 'Creative Arts', is_compulsory: false, is_core: false, is_active: true, cycle: 'Primary', classes: ['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6'] },

  // LOWER SECONDARY SECTION (New Competency-Based Curriculum NCDC)
  { id: 'sub-sec-eng', name: 'English Language', code: 'ENG-S', department: 'Languages', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-mtc', name: 'Mathematics', code: 'MTC-S', department: 'Mathematics', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-phy', name: 'Physics', code: 'PHY', department: 'Sciences', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-chm', name: 'Chemistry', code: 'CHM', department: 'Sciences', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-bio', name: 'Biology', code: 'BIO', department: 'Sciences', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-geo', name: 'Geography', code: 'GEO', department: 'Humanities', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-his', name: 'History & Political Education', code: 'HIS', department: 'Humanities', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-ent', name: 'Entrepreneurship Education', code: 'ENT', department: 'Vocational', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-cre', name: 'Religious Education (CRE / IRE)', code: 'RE', department: 'Humanities', is_compulsory: true, is_core: true, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-ict', name: 'Information & Communications Technology (ICT)', code: 'ICT', department: 'Vocational', is_compulsory: false, is_core: false, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-agr', name: 'Agriculture', code: 'AGR', department: 'Vocational', is_compulsory: false, is_core: false, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-pa', name: 'Performing Arts (Music & Drama)', code: 'PA', department: 'Creative Arts', is_compulsory: false, is_core: false, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },
  { id: 'sub-sec-art', name: 'Art & Design', code: 'ART', department: 'Creative Arts', is_compulsory: false, is_core: false, is_active: true, cycle: 'Lower Secondary', classes: ['S.1', 'S.2', 'S.3', 'S.4'] },

  // ADVANCED SECONDARY SECTION (UACE Standard)
  { id: 'sub-uace-gp', name: 'General Paper (GP)', code: 'GP', department: 'Humanities', is_compulsory: true, is_core: true, is_active: true, cycle: 'Advanced Secondary', classes: ['S.5', 'S.6'] },
  { id: 'sub-uace-sict', name: 'Subsidiary ICT', code: 'SICT', department: 'Vocational', is_compulsory: false, is_core: false, is_active: true, cycle: 'Advanced Secondary', classes: ['S.5', 'S.6'] },
  { id: 'sub-uace-smath', name: 'Subsidiary Mathematics', code: 'SMTC', department: 'Mathematics', is_compulsory: false, is_core: false, is_active: true, cycle: 'Advanced Secondary', classes: ['S.5', 'S.6'] },
];

export const initialGradingSchemes: GradingScheme[] = [
  {
    id: 'scheme-ncdc-lower-sec',
    name: 'Uganda New Lower Secondary (Competency-Based)',
    curriculum: 'Lower Secondary Competency-Based',
    is_default: true,
    levels: [
      { id: 'lvl-a', min_mark: 80, max_mark: 100, grade: 'A', descriptor: 'Exceptional', points: 5, comment: 'Consistently demonstrates mastery, critical thinking & originality' },
      { id: 'lvl-b', min_mark: 70, max_mark: 79.9, grade: 'B', descriptor: 'Outstanding', points: 4, comment: 'High competency application and strong conceptual understanding' },
      { id: 'lvl-c', min_mark: 60, max_mark: 69.9, grade: 'C', descriptor: 'Satisfactory', points: 3, comment: 'Meets curriculum learning objectives with good independence' },
      { id: 'lvl-d', min_mark: 50, max_mark: 59.9, grade: 'D', descriptor: 'Basic', points: 2, comment: 'Acquired foundational competency; further prep advised' },
      { id: 'lvl-e', min_mark: 0, max_mark: 49.9, grade: 'E', descriptor: 'Elementary', points: 1, comment: 'Developing competency; requires focused teacher intervention' },
    ],
  },
  {
    id: 'scheme-ple',
    name: 'Uganda Primary PLE Standard',
    curriculum: 'Primary PLE',
    is_default: false,
    levels: [
      { id: 'lvl-d1', min_mark: 90, max_mark: 100, grade: 'D1', descriptor: 'Distinction One', points: 1, comment: 'Superb excellence' },
      { id: 'lvl-d2', min_mark: 80, max_mark: 89.9, grade: 'D2', descriptor: 'Distinction Two', points: 2, comment: 'Very good performance' },
      { id: 'lvl-c3', min_mark: 70, max_mark: 79.9, grade: 'C3', descriptor: 'Credit Three', points: 3, comment: 'Good credit pass' },
      { id: 'lvl-c4', min_mark: 60, max_mark: 69.9, grade: 'C4', descriptor: 'Credit Four', points: 4, comment: 'Solid credit' },
      { id: 'lvl-c5', min_mark: 55, max_mark: 59.9, grade: 'C5', descriptor: 'Credit Five', points: 5, comment: 'Moderate credit' },
      { id: 'lvl-c6', min_mark: 50, max_mark: 54.9, grade: 'C6', descriptor: 'Credit Six', points: 6, comment: 'Fair credit' },
      { id: 'lvl-p7', min_mark: 45, max_mark: 49.9, grade: 'P7', descriptor: 'Pass Seven', points: 7, comment: 'Pass level' },
      { id: 'lvl-p8', min_mark: 40, max_mark: 44.9, grade: 'P8', descriptor: 'Pass Eight', points: 8, comment: 'Weak pass' },
      { id: 'lvl-f9', min_mark: 0, max_mark: 39.9, grade: 'F9', descriptor: 'Fail Nine', points: 9, comment: 'Failed — Remedial required' },
    ],
  },
];

export const initialStaffMembers: StaffMember[] = [
  // TEACHING STAFF
  {
    id: 'stf-001',
    staff_id: 'TR-KLA-001',
    full_name: 'Tumuhimbise Emmanuel',
    gender: 'Male',
    dob: '1984-04-12',
    age: 42,
    national_id: 'CM84023101ABCD',
    phone: '+256 772 112233',
    email: 'e.tumuhimbise@educore.ac.ug',
    address: 'Kyebando, Kampala',
    religion: 'Anglican',
    marital_status: 'Married',
    designation: 'Head of Mathematics / P.7 Class Teacher',
    department: 'Mathematics',
    qualification: 'Bachelor of Science with Education (Makerere University)',
    date_of_appointment: '2018-01-15',
    category: 'Teaching',
    employment_status: 'Active',
    salary_ugx: 1850000,
    photo_url: '',
    subjects: ['Mathematics'],
    classes: ['P.7', 'S.1'],
    documents: [
      { id: 'sdoc-01', staff_id: 'stf-001', file_name: 'Tumuhimbise_Makerere_Degree_Certificate.pdf', file_type: 'application/pdf', storage_path: 'staff_documents/stf-001/degree.pdf', upload_date: '2018-01-15', uploaded_by: 'Registrar', document_category: 'Academic Certificate', file_size: '1.4 MB', file_url: '#' },
      { id: 'sdoc-02', staff_id: 'stf-001', file_name: 'Appointment_Letter_Head_Maths.pdf', file_type: 'application/pdf', storage_path: 'staff_documents/stf-001/appointment.pdf', upload_date: '2018-01-15', uploaded_by: 'Bursary', document_category: 'Appointment Letter', file_size: '520 KB', file_url: '#' },
    ],
  },
  {
    id: 'stf-002',
    staff_id: 'TR-KLA-002',
    full_name: 'Namaganda Florence',
    gender: 'Female',
    dob: '1989-08-24',
    age: 37,
    national_id: 'CF89045102WXYZ',
    phone: '+256 701 445566',
    email: 'f.namaganda@educore.ac.ug',
    address: 'Kisaasi, Kampala',
    religion: 'Catholic',
    marital_status: 'Married',
    designation: 'Senior English Teacher',
    department: 'Languages',
    qualification: 'Diploma in Primary Education (Kyambogo University)',
    date_of_appointment: '2019-05-02',
    category: 'Teaching',
    employment_status: 'Active',
    salary_ugx: 1450000,
    photo_url: '',
    subjects: ['English Language'],
    classes: ['P.1', 'P.7'],
    documents: [
      { id: 'sdoc-03', staff_id: 'stf-002', file_name: 'Namaganda_Kyambogo_Diploma.pdf', file_type: 'application/pdf', storage_path: 'staff_documents/stf-002/diploma.pdf', upload_date: '2019-05-02', uploaded_by: 'Registrar', document_category: 'Academic Certificate', file_size: '980 KB', file_url: '#' },
    ],
  },
  {
    id: 'stf-003',
    staff_id: 'TR-KLA-003',
    full_name: 'Mugisha David',
    gender: 'Male',
    dob: '1982-11-03',
    age: 44,
    national_id: 'CM82012103KLMN',
    phone: '+256 782 998877',
    email: 'd.mugisha@educore.ac.ug',
    address: 'Ntinda, Kampala',
    religion: 'Anglican',
    marital_status: 'Married',
    designation: 'Head of Science & Senior Physics Teacher',
    department: 'Sciences',
    qualification: 'Master of Education in Physics (Makerere University)',
    date_of_appointment: '2016-02-01',
    category: 'Teaching',
    employment_status: 'Active',
    salary_ugx: 2200000,
    photo_url: '',
    subjects: ['Integrated Science', 'Physics'],
    classes: ['P.7', 'S.4'],
    documents: [],
  },
  {
    id: 'stf-004',
    staff_id: 'TR-KLA-004',
    full_name: 'Nalwanga Esther',
    gender: 'Female',
    dob: '1992-06-18',
    age: 34,
    national_id: 'CF92087104PQRS',
    phone: '+256 754 332211',
    email: 'e.nalwanga@educore.ac.ug',
    address: 'Bukoto, Kampala',
    religion: 'Pentecostal',
    marital_status: 'Single',
    designation: 'History & Social Studies Teacher',
    department: 'Humanities',
    qualification: 'BA Education (Uganda Christian University Mukono)',
    date_of_appointment: '2021-01-10',
    category: 'Teaching',
    employment_status: 'Active',
    salary_ugx: 1550000,
    photo_url: '',
    subjects: ['Social Studies (SST)', 'History & Political Education'],
    classes: ['P.7', 'S.4'],
    documents: [],
  },

  // NON-TEACHING STAFF
  {
    id: 'stf-005',
    staff_id: 'NT-KLA-001',
    full_name: 'Nansubuga Rose',
    gender: 'Female',
    dob: '1986-03-22',
    age: 40,
    national_id: 'CF86032105ABCD',
    phone: '+256 772 443322',
    email: 'bursar@educore.ac.ug',
    address: 'Kamwokya, Kampala',
    religion: 'Catholic',
    marital_status: 'Married',
    designation: 'Head Bursar & Accounts Lead',
    department: 'Finance & Bursary',
    qualification: 'B.Com (Finance & Accounting) - Makerere',
    date_of_appointment: '2017-08-01',
    category: 'Non-Teaching',
    employment_status: 'Active',
    salary_ugx: 2400000,
    photo_url: '',
    subjects: [],
    classes: [],
    documents: [
      { id: 'sdoc-04', staff_id: 'stf-005', file_name: 'CPA_Uganda_Certificate_Rose.pdf', file_type: 'application/pdf', storage_path: 'staff_documents/stf-005/cpa.pdf', upload_date: '2017-08-01', uploaded_by: 'Administration', document_category: 'Professional Certificate', file_size: '1.1 MB', file_url: '#' },
    ],
  },
  {
    id: 'stf-006',
    staff_id: 'NT-KLA-002',
    full_name: 'Akello Christine',
    gender: 'Female',
    dob: '1990-12-14',
    age: 36,
    national_id: 'CF90121406KLMN',
    phone: '+256 702 887766',
    email: 'librarian@educore.ac.ug',
    address: 'Kalerwe, Kampala',
    religion: 'Anglican',
    marital_status: 'Single',
    designation: 'Chief Librarian & Information Officer',
    department: 'Library Services',
    qualification: 'Diploma in Library & Information Science (Makerere)',
    date_of_appointment: '2020-02-15',
    category: 'Non-Teaching',
    employment_status: 'Active',
    salary_ugx: 1250000,
    photo_url: '',
    subjects: [],
    classes: [],
    documents: [],
  },
  {
    id: 'stf-007',
    staff_id: 'NT-KLA-003',
    full_name: 'Kato Ronald',
    gender: 'Male',
    dob: '1987-09-05',
    age: 39,
    national_id: 'CM87090507PQRS',
    phone: '+256 782 449900',
    email: 'storekeeper@educore.ac.ug',
    address: 'Nansana, Wakiso',
    religion: 'Muslim',
    marital_status: 'Married',
    designation: 'Senior Storekeeper & Assets Manager',
    department: 'Stores & Procurement',
    qualification: 'Diploma in Procurement & Logistics (MUBS)',
    date_of_appointment: '2019-11-01',
    category: 'Non-Teaching',
    employment_status: 'Active',
    salary_ugx: 1200000,
    bank_name: 'Equity Bank Uganda',
    bank_branch: 'Wandegeya Branch',
    bank_account_number: '1004289104',
    bank_account_name: 'Okumu Joseph',
    photo_url: '',
    subjects: [],
    classes: [],
    documents: [],
  },
  {
    id: 'stf-009',
    staff_id: 'NT-KLA-005',
    full_name: 'Nalubega Sarah',
    gender: 'Female',
    dob: '1993-05-19',
    age: 33,
    national_id: 'CF93051909WXYZ',
    phone: '+256 703 121212',
    email: 'secretary@educore.ac.ug',
    address: 'Makerere Kavule, Kampala',
    religion: 'Anglican',
    marital_status: 'Single',
    designation: 'Principal School Secretary & Front Office Lead',
    department: 'Administration',
    qualification: 'Diploma in Secretarial Studies & Office Management (MUBS)',
    date_of_appointment: '2020-09-01',
    category: 'Non-Teaching',
    employment_status: 'Active',
    salary_ugx: 1350000,
    bank_name: 'Centenary Bank',
    bank_branch: 'Mapeera House Main Branch',
    bank_account_number: '31000847291',
    bank_account_name: 'Sarah Nalubega',
    photo_url: '',
    subjects: [],
    classes: [],
    documents: [],
  },
];

export const initialStaffApplications: StaffApplication[] = [
  {
    id: 'app-001',
    application_number: 'APP-2026-001',
    staff_id: 'stf-001',
    staff_name: 'Tumuhimbise Emmanuel',
    staff_category: 'Teaching',
    department: 'Mathematics',
    application_type: 'Leave Application',
    leave_type: 'Compassionate Leave',
    start_date: '2026-03-10',
    end_date: '2026-03-13',
    days_requested: 4,
    subject: 'Request for Compassionate Leave — Family Bereavement',
    reason: 'Attending funeral and memorial arrangements for my late uncle in Bushenyi District.',
    status: 'Approved',
    admin_comment: 'Approved by Headteacher. Teacher Nalwanga to cover P.7 morning revision sessions.',
    reviewed_by: 'Mrs. Christine Kigozi (Head Teacher)',
    reviewed_at: '2026-03-08',
    submitted_at: '2026-03-07',
    sync_status: 'synced',
  },
  {
    id: 'app-002',
    application_number: 'APP-2026-002',
    staff_id: 'stf-002',
    staff_name: 'Namaganda Florence',
    staff_category: 'Teaching',
    department: 'Languages',
    application_type: 'Leave Application',
    leave_type: 'Sick Leave',
    start_date: '2026-04-02',
    end_date: '2026-04-06',
    days_requested: 5,
    subject: 'Medical Leave Application — Dental Surgery',
    reason: 'Scheduled for wisdom tooth extraction and recuperation as advised by Mulago Dental Clinic.',
    uploaded_document_name: 'Mulago_Dental_Clinic_Medical_Recommendation.pdf',
    uploaded_document_size: '640 KB',
    status: 'Approved',
    admin_comment: 'Approved with full pay. Wishing you a speedy recovery.',
    reviewed_by: 'Mrs. Christine Kigozi (Head Teacher)',
    reviewed_at: '2026-04-01',
    submitted_at: '2026-03-31',
    sync_status: 'synced',
  },
  {
    id: 'app-003',
    application_number: 'APP-2026-003',
    staff_id: 'stf-005',
    staff_name: 'Nansubuga Rose',
    staff_category: 'Non-Teaching',
    department: 'Finance & Bursary',
    application_type: 'Complaint / Grievance',
    subject: 'Bursary Office Power Backup & Inverter Battery Maintenance',
    reason: 'Urgent replacement of the bursary office inverter batteries to prevent fee receipting disruption during load-shedding.',
    status: 'In Review',
    admin_comment: 'Referred to Estates & Maintenance Committee for budget allocation this week.',
    reviewed_by: 'Dr. Ronald Mugisha (Administrator)',
    reviewed_at: '2026-09-15',
    submitted_at: '2026-09-14',
    sync_status: 'synced',
  },
];

export const initialStaffAttendance: StaffAttendanceRecord[] = [
  { id: 'satt-01', date: '2026-10-01', staff_id: 'stf-001', staff_name: 'Tumuhimbise Emmanuel', staff_code: 'TR-KLA-001', category: 'Teaching', department: 'Mathematics', status: 'Present', clock_in_time: '07:18 AM', recorded_by: 'Secretary', sync_status: 'synced' },
  { id: 'satt-02', date: '2026-10-01', staff_id: 'stf-002', staff_name: 'Namaganda Florence', staff_code: 'TR-KLA-002', category: 'Teaching', department: 'Languages', status: 'Present', clock_in_time: '07:25 AM', recorded_by: 'Secretary', sync_status: 'synced' },
  { id: 'satt-03', date: '2026-10-01', staff_id: 'stf-003', staff_name: 'Mugisha David', staff_code: 'TR-KLA-003', category: 'Teaching', department: 'Sciences', status: 'Present', clock_in_time: '07:10 AM', recorded_by: 'Secretary', sync_status: 'synced' },
  { id: 'satt-04', date: '2026-10-01', staff_id: 'stf-004', staff_name: 'Nalwanga Esther', staff_code: 'TR-KLA-004', category: 'Teaching', department: 'Humanities', status: 'Late', clock_in_time: '08:05 AM', reason: 'Heavy traffic at Bwaise junction', recorded_by: 'Secretary', sync_status: 'synced' },
  { id: 'satt-05', date: '2026-10-01', staff_id: 'stf-005', staff_name: 'Nansubuga Rose', staff_code: 'NT-KLA-001', category: 'Non-Teaching', department: 'Finance & Bursary', status: 'Present', clock_in_time: '07:30 AM', recorded_by: 'Secretary', sync_status: 'synced' },
  { id: 'satt-06', date: '2026-10-01', staff_id: 'stf-006', staff_name: 'Akello Christine', staff_code: 'NT-KLA-002', category: 'Non-Teaching', department: 'Library Services', status: 'Present', clock_in_time: '07:40 AM', recorded_by: 'Secretary', sync_status: 'synced' },
];

export const initialStudents: Student[] = [
  {
    id: 'stu-001',
    student_id_number: 'STU-2024-0042',
    admission_number: 'EMA/2024/0042',
    first_name: 'John',
    middle_name: 'Kevin',
    last_name: 'Mukasa',
    dob: '2012-05-14',
    age: 14,
    gender: 'Male',
    nationality: 'Ugandan',
    religion: 'Anglican',
    blood_group: 'O+',
    phone: '+256 772 345678',
    email: 'john.mukasa@student.educore.ac.ug',
    address: 'Plot 8 Kira Road, Kamwokya',
    district: 'Kampala',
    village: 'Kamwokya II',
    admission_date: '2024-02-05',
    previous_school: 'Greenhill Academy Kampala',
    class_id: 'cls-p7',
    class_name: 'P.7',
    stream_id: 'st-gold',
    stream_name: 'Gold',
    house: 'Nile House (Blue)',
    mobile_money_code: 'MM-256772345678',
    parent_id: 'par-001',
    parent_name: 'Kigozi Robert',
    parent_relationship: 'Father',
    parent_sex: 'Male',
    parent_dob: '1979-03-15',
    parent_phone: '+256 772 345678',
    parent_alt_phone: '+256 701 345678',
    parent_email: 'rkigozi@gmail.com',
    parent_address: 'Plot 8 Kira Road, Kamwokya',
    parent_occupation: 'Civil Engineer (UNRA)',
    parent_religion: 'Anglican',
    parent_nin: 'CM79031510UNRA',
    emergency_contact: '+256 772 345678',
    medical_notes: 'Mild seasonal asthma during cold mornings; carries ventolin inhaler.',
    status: 'Active',
    documents: [
      { id: 'doc-s1-1', student_id: 'stu-001', file_name: 'Mukasa_John_NIRA_Birth_Certificate.pdf', file_type: 'application/pdf', storage_path: 'student_documents/stu-001/birth_cert.pdf', upload_date: '2024-02-05', uploaded_by: 'Registrar', document_category: 'Student National ID / LIN', file_size: '1.2 MB', file_url: '#' },
      { id: 'doc-s1-2', student_id: 'stu-001', file_name: 'Immunization_Card_Kampala_Clinic.pdf', file_type: 'application/pdf', storage_path: 'student_documents/stu-001/medical.pdf', upload_date: '2024-02-05', uploaded_by: 'School Nurse', document_category: 'Student Medical Report', file_size: '850 KB', file_url: '#' },
      { id: 'doc-s1-3', student_id: 'stu-001', file_name: 'Greenhill_Academy_P6_Report.pdf', file_type: 'application/pdf', storage_path: 'student_documents/stu-001/prev_report.pdf', upload_date: '2024-02-05', uploaded_by: 'Registrar', document_category: 'Previous School Report', file_size: '1.5 MB', file_url: '#' },
    ],
    enrollment_history: [
      { academic_year: '2024', term: 'Term 1', class_name: 'P.6', stream_name: 'Blue', date: '2024-02-05' },
      { academic_year: '2025', term: 'Term 1', class_name: 'P.6', stream_name: 'Blue', date: '2025-02-03' },
      { academic_year: '2026', term: 'Term 1', class_name: 'P.7', stream_name: 'Gold', date: '2026-02-02' },
    ],
    sync_status: 'synced',
    created_at: '2024-02-05T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'stu-002',
    student_id_number: 'STU-2024-0043',
    admission_number: 'EMA/2024/0043',
    first_name: 'Sarah',
    middle_name: 'Patience',
    last_name: 'Namubiru',
    dob: '2012-09-20',
    age: 14,
    gender: 'Female',
    nationality: 'Ugandan',
    religion: 'Catholic',
    blood_group: 'A+',
    phone: '+256 752 987123',
    address: 'Kulambiro Ring Road',
    district: 'Wakiso',
    village: 'Kulambiro',
    admission_date: '2024-02-05',
    previous_school: 'City Parents School Kampala',
    class_id: 'cls-p7',
    class_name: 'P.7',
    stream_id: 'st-gold',
    stream_name: 'Gold',
    house: 'Speke House (Yellow)',
    mobile_money_code: 'MM-256752987123',
    parent_id: 'par-002',
    parent_name: 'Nabatanzi Grace',
    parent_relationship: 'Mother',
    parent_sex: 'Female',
    parent_dob: '1982-07-10',
    parent_phone: '+256 752 987123',
    parent_email: 'gnabatanzi@yahoo.com',
    parent_address: 'Kulambiro Ring Road',
    parent_occupation: 'Senior Accountant (Stanbic Bank)',
    parent_religion: 'Catholic',
    emergency_contact: '+256 752 987123',
    medical_notes: 'No chronic condition recorded. Fully vaccinated.',
    status: 'Active',
    documents: [
      { id: 'doc-s2-1', student_id: 'stu-002', file_name: 'Namubiru_Sarah_Birth_Cert.pdf', file_type: 'application/pdf', storage_path: 'student_documents/stu-002/birth_cert.pdf', upload_date: '2024-02-05', uploaded_by: 'Registrar', document_category: 'Student National ID / LIN', file_size: '920 KB', file_url: '#' },
    ],
    enrollment_history: [
      { academic_year: '2025', term: 'Term 1', class_name: 'P.6', stream_name: 'Gold', date: '2025-02-03' },
      { academic_year: '2026', term: 'Term 1', class_name: 'P.7', stream_name: 'Gold', date: '2026-02-02' },
    ],
    sync_status: 'synced',
    created_at: '2024-02-05T08:30:00Z',
    updated_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'stu-003',
    student_id_number: 'STU-2024-0044',
    admission_number: 'EMA/2024/0044',
    first_name: 'David',
    middle_name: 'Junior',
    last_name: 'Okello',
    dob: '2012-03-10',
    age: 14,
    gender: 'Male',
    nationality: 'Ugandan',
    religion: 'Anglican',
    blood_group: 'B+',
    address: 'Naalya Housing Estate',
    district: 'Wakiso',
    village: 'Naalya',
    admission_date: '2024-02-06',
    previous_school: 'Kampala Parents School',
    class_id: 'cls-p7',
    class_name: 'P.7',
    stream_id: 'st-silver',
    stream_name: 'Silver',
    house: 'Kiwala House (Red)',
    mobile_money_code: 'MM-256782554433',
    parent_id: 'par-003',
    parent_name: 'Okello James',
    parent_relationship: 'Father',
    parent_sex: 'Male',
    parent_phone: '+256 782 554433',
    parent_email: 'jokello@lawfirm.ug',
    parent_occupation: 'Advocate of the High Court',
    emergency_contact: '+256 782 554433',
    status: 'Active',
    documents: [],
    enrollment_history: [
      { academic_year: '2026', term: 'Term 1', class_name: 'P.7', stream_name: 'Silver', date: '2026-02-02' },
    ],
    sync_status: 'synced',
    created_at: '2024-02-06T09:00:00Z',
    updated_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'stu-004',
    student_id_number: 'STU-2025-0112',
    admission_number: 'EMA/2025/0112',
    first_name: 'Ronald',
    middle_name: 'Mark',
    last_name: 'Kiwanuka',
    dob: '2010-07-15',
    age: 16,
    gender: 'Male',
    nationality: 'Ugandan',
    religion: 'Catholic',
    address: 'Kisaasi Central',
    district: 'Kampala',
    admission_date: '2025-01-20',
    class_id: 'cls-s1',
    class_name: 'S.1',
    stream_id: 'st-north',
    stream_name: 'North',
    house: 'Lugard House (Green)',
    mobile_money_code: 'MM-256702119988',
    emergency_contact: '+256 702 119988',
    status: 'Active',
    documents: [],
    sync_status: 'synced',
    created_at: '2025-01-20T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z',
  },
];

export const initialFeeStructures: FeeStructure[] = [
  { id: 'fee-01', academic_year: '2026', term: 'Term 1', class_id: 'cls-p7', class_name: 'P.7', category: 'Tuition & Academic Support', amount_ugx: 750000, is_active: true, description: 'Class instruction, assessment papers & prep' },
  { id: 'fee-02', academic_year: '2026', term: 'Term 1', class_id: 'cls-p7', class_name: 'P.7', category: 'PLE Examination & Mock Registration', amount_ugx: 180000, is_active: true, description: 'UNEB registration and 3 regional mock exams' },
  { id: 'fee-03', academic_year: '2026', term: 'Term 1', class_id: 'cls-p7', class_name: 'P.7', category: 'Meals & Hot Lunch Scheme', amount_ugx: 220000, is_active: true, description: 'Daily nutritious lunch and evening tea' },
  { id: 'fee-04', academic_year: '2026', term: 'Term 1', class_id: 'cls-p7', class_name: 'P.7', category: 'School Development & ICT Levy', amount_ugx: 95000, is_active: true, description: 'Computer lab upgrades & campus maintenance' },
  { id: 'fee-05', academic_year: '2026', term: 'Term 1', class_id: 'cls-p1', class_name: 'P.1', category: 'Tuition', amount_ugx: 600000, is_active: true, description: 'Primary One tuition' },
  { id: 'fee-06', academic_year: '2026', term: 'Term 1', class_id: 'cls-s4', class_name: 'S.4', category: 'Tuition & Science Practical Fee', amount_ugx: 980000, is_active: true, description: 'Senior 4 Tuition & Laboratory Reagents' },
];

export const initialPayments: PaymentRecord[] = [
  {
    id: 'pay-001',
    receipt_number: 'REC-2026-0081',
    student_id: 'stu-001',
    student_name: 'John Mukasa',
    admission_number: 'EMA/2024/0042',
    class_name: 'P.7',
    amount_ugx: 1245000,
    payment_date: '2026-02-02',
    payment_method: 'Mobile Money',
    transaction_reference: 'MTN-UG-9843210492',
    received_by: 'Bursar: Nansubuga Rose',
    academic_year: '2026',
    term: 'Term 1',
    notes: 'Paid in full for Term 1 (Tuition + PLE + Meals + ICT)',
    sync_status: 'synced',
  },
  {
    id: 'pay-002',
    receipt_number: 'REC-2026-0082',
    student_id: 'stu-002',
    student_name: 'Sarah Namubiru',
    admission_number: 'EMA/2024/0043',
    class_name: 'P.7',
    amount_ugx: 800000,
    payment_date: '2026-02-04',
    payment_method: 'Bank',
    transaction_reference: 'STANBIC-KLA-778842',
    received_by: 'Bursar: Nansubuga Rose',
    academic_year: '2026',
    term: 'Term 1',
    notes: 'Installment 1. Balance: UGX 445,000 to be cleared before mid-term.',
    sync_status: 'synced',
  },
  {
    id: 'pay-003',
    receipt_number: 'REC-2026-0083',
    student_id: 'stu-003',
    student_name: 'David Okello',
    admission_number: 'EMA/2024/0044',
    class_name: 'P.7',
    amount_ugx: 600000,
    payment_date: '2026-02-06',
    payment_method: 'Cash',
    transaction_reference: 'CASH-REC-0083',
    received_by: 'Bursar: Nansubuga Rose',
    academic_year: '2026',
    term: 'Term 1',
    notes: 'Part payment by Mr. Okello. Balance UGX 645,000.',
    sync_status: 'synced',
  },
];

export const initialExams: Exam[] = [
  {
    id: 'exam-001',
    name: 'Mid Term 1 Assessment 2026',
    exam_type: 'Mid Term',
    academic_year: '2026',
    term: 'Term 1',
    class_name: 'P.7',
    start_date: '2026-03-09',
    end_date: '2026-03-14',
    is_published: true,
  },
  {
    id: 'exam-002',
    name: 'End of Term 1 Exams & PLE Candidate Mock',
    exam_type: 'End of Term',
    academic_year: '2026',
    term: 'Term 1',
    class_name: 'P.7',
    start_date: '2026-04-13',
    end_date: '2026-04-20',
    is_published: false,
  },
  {
    id: 'exam-003',
    name: 'S.1 Competency Project Evaluation',
    exam_type: 'Project Assessment',
    academic_year: '2026',
    term: 'Term 1',
    class_name: 'S.1',
    start_date: '2026-03-15',
    end_date: '2026-03-25',
    is_published: true,
  },
];

export const initialResults: ResultRecord[] = [
  // Mukasa John - P.7 Results
  { id: 'res-01', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-001', student_name: 'John Mukasa', admission_number: 'EMA/2024/0042', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-eng', subject_name: 'English Language', marks_obtained: 88, grade: 'D2', remarks: 'Good grasp of comprehension and grammar', is_published: true },
  { id: 'res-02', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-001', student_name: 'John Mukasa', admission_number: 'EMA/2024/0042', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-mtc', subject_name: 'Mathematics', marks_obtained: 94, grade: 'D1', remarks: 'Outstanding problem solving in algebra and sets', is_published: true },
  { id: 'res-03', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-001', student_name: 'John Mukasa', admission_number: 'EMA/2024/0042', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-sci', subject_name: 'Integrated Science', marks_obtained: 91, grade: 'D1', remarks: 'Excellent diagrams and factual recall', is_published: true },
  { id: 'res-04', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-001', student_name: 'John Mukasa', admission_number: 'EMA/2024/0042', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-sst', subject_name: 'Social Studies (SST)', marks_obtained: 86, grade: 'D2', remarks: 'Very thorough knowledge of East Africa history', is_published: true },

  // Namubiru Sarah - P.7 Results
  { id: 'res-05', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-002', student_name: 'Sarah Namubiru', admission_number: 'EMA/2024/0043', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-eng', subject_name: 'English Language', marks_obtained: 92, grade: 'D1', remarks: 'Exceptional creative writing and vocabulary', is_published: true },
  { id: 'res-06', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-002', student_name: 'Sarah Namubiru', admission_number: 'EMA/2024/0043', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-mtc', subject_name: 'Mathematics', marks_obtained: 85, grade: 'D2', remarks: 'Very good performance; keep practicing geometry', is_published: true },
  { id: 'res-07', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-002', student_name: 'Sarah Namubiru', admission_number: 'EMA/2024/0043', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-sci', subject_name: 'Integrated Science', marks_obtained: 89, grade: 'D2', remarks: 'Thorough understanding of human body systems', is_published: true },
  { id: 'res-08', exam_id: 'exam-001', exam_name: 'Mid Term 1 Assessment 2026', academic_year: '2026', term: 'Term 1', student_id: 'stu-002', student_name: 'Sarah Namubiru', admission_number: 'EMA/2024/0043', class_name: 'P.7', stream_name: 'Gold', subject_id: 'sub-sst', subject_name: 'Social Studies (SST)', marks_obtained: 93, grade: 'D1', remarks: 'Brilliant analysis and map work', is_published: true },

  // Ronald Kiwanuka - S.1 Lower Secondary Competency Result
  { id: 'res-09', exam_id: 'exam-003', exam_name: 'S.1 Competency Project Evaluation', academic_year: '2026', term: 'Term 1', student_id: 'stu-004', student_name: 'Ronald Kiwanuka', admission_number: 'EMA/2025/0112', class_name: 'S.1', stream_name: 'North', subject_id: 'sub-ict', subject_name: 'ICT & Computer Studies', marks_obtained: 84, grade: 'A', achievement_level: 'Exceptional', project_score: 9.2, remarks: 'Created an outstanding basic spreadsheet model', is_published: true },
];

export const initialAttendance: AttendanceRecord[] = [
  { id: 'att-01', student_id: 'stu-001', student_name: 'John Mukasa', admission_number: 'EMA/2024/0042', class_id: 'cls-p7', stream_id: 'st-gold', date: '2026-10-01', status: 'Present', sync_status: 'synced', updated_at: '2026-10-01T07:45:00Z' },
  { id: 'att-02', student_id: 'stu-002', student_name: 'Sarah Namubiru', admission_number: 'EMA/2024/0043', class_id: 'cls-p7', stream_id: 'st-gold', date: '2026-10-01', status: 'Present', sync_status: 'synced', updated_at: '2026-10-01T07:46:00Z' },
  { id: 'att-03', student_id: 'stu-003', student_name: 'David Okello', admission_number: 'EMA/2024/0044', class_id: 'cls-p7', stream_id: 'st-silver', date: '2026-10-01', status: 'Late', reason: 'Heavy morning traffic along Jinja Road', sync_status: 'synced', updated_at: '2026-10-01T08:15:00Z' },
  { id: 'att-04', student_id: 'stu-004', student_name: 'Ronald Kiwanuka', admission_number: 'EMA/2025/0112', class_id: 'cls-s1', stream_id: 'st-north', date: '2026-10-01', status: 'Present', sync_status: 'synced', updated_at: '2026-10-01T07:50:00Z' },
];

export const initialBooks: LibraryBook[] = [
  { id: 'bk-01', book_code: 'BK-MTC-001', title: 'Comprehensive Primary Mathematics P.7 (Revised)', author: 'M. K. Ssekandi', isbn: '978-9970-11-201-4', category: 'Mathematics', publisher: 'MK Publishers Uganda', edition: '4th Edition', year: '2023', number_of_copies: 45, available_copies: 41, issued_copies: 4, damaged_copies: 0, shelf_location: 'Shelf M-3', status: 'Available' },
  { id: 'bk-02', book_code: 'BK-SCI-002', title: 'Integrated Science for Ugandan Primary Schools Bk 7', author: 'Dr. Joseph Ssenyonga', isbn: '978-9970-22-315-8', category: 'Sciences', publisher: 'Fountain Publishers', edition: '2nd Edition', year: '2022', number_of_copies: 50, available_copies: 46, issued_copies: 4, damaged_copies: 0, shelf_location: 'Shelf S-1', status: 'Available' },
  { id: 'bk-03', book_code: 'BK-LIT-003', title: 'The River Between', author: 'Ngũgĩ wa Thiong’o', isbn: '978-0435905484', category: 'Literature', publisher: 'Heinemann African Writers Series', edition: 'Reprint', year: '2019', number_of_copies: 30, available_copies: 28, issued_copies: 2, damaged_copies: 0, shelf_location: 'Shelf L-4', status: 'Available' },
  { id: 'bk-04', book_code: 'BK-PHY-004', title: 'Uganda Secondary Certificate Physics (O-Level)', author: 'K. S. Lwanga', isbn: '978-9970-33-402-1', category: 'Physics', publisher: 'Longhorn Publishers', edition: '3rd Edition', year: '2024', number_of_copies: 35, available_copies: 33, issued_copies: 2, damaged_copies: 0, shelf_location: 'Shelf P-2', status: 'Available' },
  { id: 'bk-05', book_code: 'BK-REF-005', title: 'Oxford Advanced Learner’s Dictionary (10th Ed)', author: 'A. S. Hornby', isbn: '978-0194798488', category: 'Reference', publisher: 'Oxford University Press', edition: '10th', year: '2020', number_of_copies: 15, available_copies: 14, issued_copies: 1, damaged_copies: 0, shelf_location: 'Reference Table 1', status: 'Available' },
];

export const initialLibraryIssues: LibraryIssueTransaction[] = [
  {
    id: 'iss-001',
    issue_code: 'ISS-2026-001',
    person_type: 'Student',
    person_id: 'stu-001',
    person_name: 'John Mukasa',
    identifier: 'EMA/2024/0042',
    class_or_department: 'P.7 Gold',
    date_issued: '2026-02-10',
    expected_return_date: '2026-02-24',
    status: 'Currently issued',
    notes: 'Candidate prep lending',
    items: [
      { id: 'item-01', book_id: 'bk-01', book_title: 'Comprehensive Primary Mathematics P.7 (Revised)', book_code: 'BK-MTC-001', copies_issued: 1, copies_returned: 0, status: 'Issued' },
      { id: 'item-02', book_id: 'bk-02', book_title: 'Integrated Science for Ugandan Primary Schools Bk 7', book_code: 'BK-SCI-002', copies_issued: 1, copies_returned: 0, status: 'Issued' },
    ],
    sync_status: 'synced',
  },
  {
    id: 'iss-002',
    issue_code: 'ISS-2026-002',
    person_type: 'Staff',
    person_id: 'stf-001',
    person_name: 'Tumuhimbise Emmanuel',
    identifier: 'TR-KLA-001',
    class_or_department: 'Mathematics Dept',
    date_issued: '2026-02-05',
    expected_return_date: '2026-04-15',
    status: 'Currently issued',
    notes: 'Teacher syllabus guide',
    items: [
      { id: 'item-03', book_id: 'bk-01', book_title: 'Comprehensive Primary Mathematics P.7 (Revised)', book_code: 'BK-MTC-001', copies_issued: 2, copies_returned: 0, status: 'Issued' },
    ],
    sync_status: 'synced',
  },
  {
    id: 'iss-003',
    issue_code: 'ISS-2026-003',
    person_type: 'Student',
    person_id: 'stu-002',
    person_name: 'Sarah Namubiru',
    identifier: 'EMA/2024/0043',
    class_or_department: 'P.7 Gold',
    date_issued: '2026-01-20',
    expected_return_date: '2026-02-03',
    actual_return_date: '2026-02-02',
    status: 'Returned',
    notes: 'Returned in good condition',
    items: [
      { id: 'item-04', book_id: 'bk-03', book_title: 'The River Between', book_code: 'BK-LIT-003', copies_issued: 1, copies_returned: 1, status: 'Returned', return_date: '2026-02-02' },
    ],
    sync_status: 'synced',
  },
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv-01', name: 'Rotatrim A4 Duplicating Paper (500 sheets/ream)', category: 'Stationery', quantity: 85, unit: 'Reams', purchase_price_ugx: 28000, supplier: 'Picfare Industries Kampala', purchase_date: '2026-01-10', location: 'Main Store Room A', condition: 'New', notes: 'Exam printing and term assessments' },
  { id: 'inv-02', name: 'Standard 2-Seater Wooden School Desks (Hardwood)', category: 'Furniture', quantity: 120, unit: 'Pieces', purchase_price_ugx: 180000, supplier: 'Katwe Artisans Cooperative', purchase_date: '2025-12-18', location: 'Classes P.5, P.6, P.7', condition: 'Good', notes: 'Varnished mvule hardwood' },
  { id: 'inv-03', name: 'Dell OptiPlex 3080 Desktop Core i5 Computers', category: 'Electronics', quantity: 32, unit: 'Units', purchase_price_ugx: 210000, supplier: 'Computer Point Uganda Ltd', purchase_date: '2025-08-14', location: 'Computer Laboratory', condition: 'Good', notes: 'Equipped with offline school encyclopedia and coding software' },
];

export const initialDiscipline: DisciplineRecord[] = [
  {
    id: 'disc-01',
    person_type: 'Student',
    person_id: 'stu-003',
    person_name: 'David Okello',
    identifier: 'EMA/2024/0044',
    incident_date: '2026-02-18',
    category: 'Lateness',
    description: 'Arrived after morning school assembly on 3 consecutive Mondays without written note.',
    action_taken: 'Verbal warning given by Deputy Head Teacher. Parent informed via SMS. Student assigned to assist school librarian during morning prep.',
    reported_by: 'Deputy Head: Byamukama Joseph',
    follow_up: 'Student has been punctual for the past two weeks.',
    status: 'Resolved',
    attachments: [],
  },
  {
    id: 'disc-02',
    person_type: 'Staff',
    person_id: 'stf-004',
    person_name: 'Nalwanga Esther',
    identifier: 'TR-KLA-004',
    incident_date: '2026-02-25',
    category: 'Absenteeism',
    description: 'Missed scheduled afternoon double lesson for S.4 without prior department notification.',
    action_taken: 'Explanation letter submitted to Head of Department. Lesson successfully rescheduled on Saturday prep.',
    reported_by: 'Head Teacher: Mrs. Christine Kigozi',
    follow_up: 'Rescheduled lesson delivered satisfactorily.',
    status: 'Resolved',
    attachments: [],
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'UNEB PLE 2026 Registration Deadline',
    message: 'All Primary Seven candidate parents must submit verified birth certificates or LIN numbers to the Registrar by Friday 15th May 2026.',
    target_role: 'All',
    sender_name: 'Head Teacher: Mrs. Christine Kigozi',
    is_urgent: true,
    created_at: '2026-09-28T09:00:00Z',
  },
  {
    id: 'notif-02',
    title: 'Competency-Based Curriculum Project Exhibition',
    message: 'Senior 1 and Senior 2 learners will present their environmental agriculture projects on 24th October 2026 at the Main Hall.',
    target_role: 'All',
    sender_name: 'Director of Studies',
    is_urgent: false,
    created_at: '2026-10-02T10:00:00Z',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-01',
    user_name: 'System Administrator',
    role: 'Administrator',
    action: 'INIT',
    table_name: 'schools',
    record_id: 'school-ug-001',
    details: 'Initialized EduCore local-first database with Ugandan curriculum',
    timestamp: '2026-10-01T07:00:00Z',
  },
  {
    id: 'aud-02',
    user_name: 'Bursar: Nansubuga Rose',
    role: 'Bursar',
    action: 'INSERT',
    table_name: 'payments',
    record_id: 'REC-2026-0081',
    details: 'Recorded fee payment of UGX 1,245,000 via Mobile Money for John Mukasa',
    timestamp: '2026-10-01T07:30:00Z',
  },
];

// -----------------------------------------------------------------------------
// INITIALIZATION HELPER: Populates IndexedDB if empty or version upgraded
// -----------------------------------------------------------------------------

export async function initializeOfflineDatabase(): Promise<void> {
  const db = await getDb();

  const studentCount = await db.count('students');
  const staffCount = await db.count('staff');

  if (studentCount === 0 || staffCount === 0) {
    const tx = db.transaction([
      'school_settings',
      'classes',
      'streams',
      'subjects',
      'staff',
      'teachers',
      'students',
      'fee_structures',
      'payments',
      'grading_schemes',
      'exams',
      'results',
      'attendance',
      'library_books',
      'library_issues',
      'inventory_items',
      'discipline_records',
      'notifications',
      'staff_attendance',
      'staff_applications',
      'audit_logs',
    ], 'readwrite');

    await tx.objectStore('school_settings').put(initialSchoolProfile);

    for (const c of initialClasses) await tx.objectStore('classes').put(c);
    for (const st of initialStreamsList) await tx.objectStore('streams').put(st);
    for (const s of initialSubjects) await tx.objectStore('subjects').put(s);
    for (const stf of initialStaffMembers) {
      await tx.objectStore('staff').put(stf);
      await tx.objectStore('teachers').put(stf); // alias for backwards compatibility
    }
    for (const st of initialStudents) await tx.objectStore('students').put(st);
    for (const f of initialFeeStructures) await tx.objectStore('fee_structures').put(f);
    for (const pay of initialPayments) await tx.objectStore('payments').put(pay);
    for (const gs of initialGradingSchemes) await tx.objectStore('grading_schemes').put(gs);
    for (const ex of initialExams) await tx.objectStore('exams').put(ex);
    for (const res of initialResults) await tx.objectStore('results').put(res);
    for (const att of initialAttendance) await tx.objectStore('attendance').put(att);
    for (const bk of initialBooks) await tx.objectStore('library_books').put(bk);
    for (const iss of initialLibraryIssues) await tx.objectStore('library_issues').put(iss);
    for (const inv of initialInventory) await tx.objectStore('inventory_items').put(inv);
    for (const d of initialDiscipline) await tx.objectStore('discipline_records').put(d);
    for (const n of initialNotifications) await tx.objectStore('notifications').put(n);
    for (const satt of initialStaffAttendance) await tx.objectStore('staff_attendance').put(satt);
    for (const app of initialStaffApplications) await tx.objectStore('staff_applications').put(app);
    for (const aud of initialAuditLogs) await tx.objectStore('audit_logs').put(aud);

    await tx.done;
  }
}

// -----------------------------------------------------------------------------
// GENERIC CRUD HELPERS
// -----------------------------------------------------------------------------

export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await getDb();
  return (await db.getAll(storeName)) as T[];
}

export async function dbGetById<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await getDb();
  return (await db.get(storeName, id)) as T | undefined;
}

export async function dbSave<T extends { id: string }>(storeName: string, item: T): Promise<T> {
  const db = await getDb();
  await db.put(storeName, item);
  return item;
}

export async function dbDelete(storeName: string, id: string): Promise<void> {
  const db = await getDb();
  await db.delete(storeName, id);
}

export async function dbClear(storeName: string): Promise<void> {
  const db = await getDb();
  await db.clear(storeName);
}
