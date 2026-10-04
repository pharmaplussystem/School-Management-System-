export type UserRole =
  | 'Super Administrator'
  | 'Administrator'
  | 'Head Teacher'
  | 'Deputy Head Teacher'
  | 'Secretary'
  | 'Bursar'
  | 'Teacher'
  | 'Registrar'
  | 'Librarian'
  | 'Storekeeper';

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed';

export interface SchoolProfile {
  id: string;
  name: string;
  motto: string;
  logo_url: string;
  address: string;
  district: string;
  country: string;
  phone: string;
  alt_phone: string;
  email: string;
  website: string;
  currency: string;
  currency_code: string;
  timezone: string;
  date_format: string;
  current_academic_year: string;
  current_term: string;
  school_sections: ('Primary' | 'Lower Secondary' | 'Advanced Secondary' | 'Other')[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  national_id?: string;
  school_id?: string;
}

export interface StudentDocumentItem {
  id: string;
  student_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  upload_date: string;
  uploaded_by: string;
  document_category:
    | 'Student Passport Photo'
    | 'Parent Passport Photo'
    | 'Student National ID / LIN'
    | 'Parent National ID / NIN'
    | 'Student Medical Report'
    | 'Previous School Report'
    | 'Other Admission Documents';
  file_size: string;
  file_url: string;
}

export interface Student {
  id: string;
  student_id_number: string; // Separate Student ID e.g. STU-2026-0042
  admission_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob: string;
  age: number; // Automatically calculated
  gender: 'Male' | 'Female';
  nationality: string;
  religion?: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  address: string;
  district: string;
  village?: string;
  photo_url?: string;
  national_id?: string; // NIN or LIN
  admission_date: string;
  previous_school?: string;
  class_id: string;
  class_name: string;
  stream_id?: string;
  stream_name?: string;
  house?: string;
  mobile_money_code?: string; // Separate registered Mobile Money payment code/reference identifier
  parent_id?: string;
  parent_name?: string;
  parent_relationship?: string;
  parent_sex?: 'Male' | 'Female';
  parent_dob?: string;
  parent_phone?: string;
  parent_alt_phone?: string;
  parent_email?: string;
  parent_address?: string;
  parent_occupation?: string;
  parent_religion?: string;
  parent_nin?: string;
  parent_photo_url?: string;
  emergency_contact?: string;
  medical_notes?: string;
  status: 'Active' | 'Graduated' | 'Transferred' | 'Suspended' | 'Left school' | 'Archived';
  documents: StudentDocumentItem[];
  enrollment_history?: {
    academic_year: string;
    term: string;
    class_name: string;
    stream_name?: string;
    date: string;
  }[];
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export interface StaffDocumentItem {
  id: string;
  staff_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  upload_date: string;
  uploaded_by: string;
  document_category:
    | 'National ID'
    | 'Academic Certificate'
    | 'Appointment Letter'
    | 'Professional Certificate'
    | 'Contract'
    | 'Other Document';
  file_size: string;
  file_url: string;
}

export interface StaffLeaveRecord {
  id: string;
  application_number: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  approved_by: string;
  approved_date: string;
  status: 'Approved' | 'Completed' | 'Cancelled';
  notes?: string;
  document_url?: string;
}

export interface StaffMember {
  id: string;
  staff_id: string;
  full_name: string;
  gender: 'Male' | 'Female';
  dob: string;
  age: number; // Automatically calculated
  national_id?: string;
  phone: string;
  email: string;
  address: string;
  religion?: string;
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
  designation: string; // e.g. "Senior Teacher", "Bursar", "Laboratory Assistant"
  department: string;
  date_of_appointment: string;
  category: 'Teaching' | 'Non-Teaching';
  qualification: string;
  employment_status: 'Active' | 'On Leave' | 'Resigned' | 'Retired';
  salary_ugx: number;
  photo_url?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  subjects: string[];
  classes: string[];
  documents: StaffDocumentItem[];
  leave_history?: StaffLeaveRecord[];
}

export type ApplicationType =
  | 'Leave Application'
  | 'Resignation Notice'
  | 'Complaint / Grievance'
  | 'Official Query';

export type LeaveType =
  | 'Annual Leave'
  | 'Sick Leave'
  | 'Maternity Leave'
  | 'Paternity Leave'
  | 'Compassionate Leave'
  | 'Study Leave'
  | 'Other Leave';

export type ApplicationStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'In Review'
  | 'Resolved';

export interface StaffApplication {
  id: string;
  application_number: string;
  staff_id: string;
  staff_name: string;
  staff_category: 'Teaching' | 'Non-Teaching';
  department: string;
  application_type: ApplicationType;
  leave_type?: LeaveType;
  start_date?: string;
  end_date?: string;
  days_requested?: number;
  subject: string;
  reason: string;
  uploaded_document_url?: string;
  uploaded_document_name?: string;
  uploaded_document_size?: string;
  status: ApplicationStatus;
  admin_comment?: string;
  admin_reply?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
  sync_status: SyncStatus;
}

export interface StaffAttendanceRecord {
  id: string;
  date: string;
  staff_id: string;
  staff_name: string;
  staff_code: string;
  category: 'Teaching' | 'Non-Teaching';
  department: string;
  status: 'Present' | 'Absent' | 'On Leave' | 'Late' | 'Off-Duty';
  clock_in_time?: string;
  reason?: string;
  recorded_by: string;
  sync_status: SyncStatus;
}

export type Teacher = StaffMember; // backward compatible alias

export interface Parent {
  id: string;
  parent_id_code: string;
  full_name: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  gender?: 'Male' | 'Female';
  phone: string;
  alt_phone?: string;
  email?: string;
  address: string;
  district: string;
  occupation?: string;
  religion?: string;
  nin?: string;
  photo_url?: string;
  emergency_contact?: string;
  student_ids: string[];
  student_names?: string[];
}

export interface StreamItem {
  id: string;
  class_id?: string;
  name: string;
  is_active: boolean;
  class_teacher_id?: string;
  class_teacher_name?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  level: 'Primary' | 'Lower Secondary' | 'Advanced Secondary' | 'Other';
  order_index: number;
  description?: string;
  section: string;
  streams: StreamItem[];
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  department: string;
  is_compulsory: boolean;
  is_core?: boolean;
  is_active: boolean;
  cycle: 'Primary' | 'Lower Secondary' | 'Advanced Secondary';
  classes: string[]; // classes this subject applies to
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_id: string;
  stream_id?: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  reason?: string;
  recorded_by?: string;
  sync_status: SyncStatus;
  updated_at: string;
}

export interface FeeStructure {
  id: string;
  academic_year: string;
  term: string;
  class_id: string;
  class_name: string;
  category: string; // Tuition, Boarding, Meals, Transport, Development, Examination, Uniform, Other
  amount_ugx: number;
  total_amount_ugx?: number;
  is_mandatory?: boolean;
  requirement_type?: 'Fee' | 'School Requirement / Material';
  requirement_status?: 'Required' | 'Optional' | 'Adjustable / Waivable' | 'Supplied in Kind';
  is_active?: boolean;
  is_archived?: boolean;
  description?: string;
}

export interface StudentFeeSummary {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  academic_year: string;
  term: string;
  total_billed_ugx: number;
  discount_ugx: number;
  amount_paid_ugx: number;
  balance_ugx: number;
  overpayment_ugx: number;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
}

export interface PaymentRecord {
  id: string;
  receipt_number: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  stream_name?: string;
  fee_structure_id?: string;
  amount_ugx: number;
  payment_date: string;
  payment_method: 'Cash' | 'Mobile Money' | 'Bank' | 'Card' | 'Other' | string;
  transaction_reference?: string;
  received_by: string;
  academic_year: string;
  term: string;
  category?: string;
  notes?: string;
  sync_status: SyncStatus;
}

export interface GradingLevel {
  id: string;
  min_mark: number;
  max_mark: number;
  grade: string; // e.g. A, B, C, D, E or D1, D2, C3...
  descriptor: string; // e.g. "Exceptional", "Outstanding", "Satisfactory", "Basic", "Elementary"
  points: number;
  comment: string;
}

export interface GradingScheme {
  id: string;
  name: string;
  curriculum: 'Lower Secondary Competency-Based' | 'Primary PLE' | 'Advanced Secondary UACE';
  is_default: boolean;
  levels: GradingLevel[];
}

export interface Exam {
  id: string;
  name: string;
  exam_type: 'Beginning of Term' | 'Mid Term' | 'End of Term' | 'Mock PLE' | 'Mock UCE' | 'Project Assessment';
  academic_year: string;
  term: string;
  class_name?: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
}

export interface ResultRecord {
  id: string;
  exam_id: string;
  exam_name: string;
  academic_year: string;
  term: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  stream_name?: string;
  subject_id: string;
  subject_name: string;
  subject_code?: string;
  marks_obtained: number; // 0 - 100
  score_percentage?: number;
  grade: string; // e.g. A, B, C, D, E or D1, D2...
  achievement_level?: string; // Exceptional, Outstanding, Satisfactory, Basic, Elementary
  project_score?: number; // Lower secondary competency-based project component
  remarks?: string;
  teacher_comment?: string;
  entered_by?: string;
  is_published: boolean;
}

export interface ReportCard {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  stream_name?: string;
  academic_year: string;
  term: string;
  results: {
    subject_code: string;
    subject_name: string;
    marks: number;
    grade: string;
    achievement_level?: string;
    project_score?: number;
    remarks: string;
    teacher_initials: string;
  }[];
  total_marks: number;
  average_marks: number;
  aggregate: number; // Uganda PLE aggregate or O-Level aggregate
  division: 'Division 1' | 'Division 2' | 'Division 3' | 'Division 4' | 'Division U';
  overall_achievement?: string;
  rank: number;
  total_students: number;
  attendance_percentage: number;
  teacher_remarks: string;
  head_teacher_remarks: string;
  next_term_begins: string;
  fees_balance_ugx: number;
  is_published: boolean;
}

export interface LibraryBook {
  id: string;
  book_code: string; // e.g. BK-BIO-001
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  edition?: string;
  year?: string;
  number_of_copies: number;
  total_copies?: number;
  available_copies: number;
  issued_copies: number;
  damaged_copies: number;
  shelf_location: string;
  status: 'Available' | 'Issued' | 'Damaged';
}

export interface LibraryIssueItem {
  id?: string;
  book_id: string;
  book_title: string;
  book_code: string;
  copies_issued: number;
  copies_returned?: number;
  status: 'Issued' | 'Returned' | 'Damaged';
  return_date?: string;
}

export interface LibraryIssueTransaction {
  id: string;
  issue_code: string;
  person_type: 'Student' | 'Staff' | 'Teacher';
  person_id: string;
  person_name: string;
  student_id?: string;
  identifier: string; // Admission number or Staff ID
  class_or_department: string;
  date_issued: string;
  expected_return_date: string;
  actual_return_date?: string;
  book_title?: string;
  accession_number?: string;
  issue_date?: string;
  due_date?: string;
  issued_by?: string;
  notes?: string;
  status: 'Currently issued' | 'Overdue' | 'Returned';
  items: LibraryIssueItem[];
  sync_status: SyncStatus;
}

// Backward compatibility alias for single transaction if needed
export type LibraryTransaction = LibraryIssueTransaction;

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Stationery' | 'Furniture' | 'Electronics' | 'Sports' | 'Lab' | 'Uniform' | 'Maintenance';
  quantity: number;
  unit: string;
  purchase_price_ugx: number;
  supplier?: string;
  purchase_date: string;
  location: string;
  condition: 'New' | 'Good' | 'Fair' | 'Damaged';
  notes?: string;
}

export interface DisciplineRecord {
  id: string;
  person_type: 'Student' | 'Staff' | 'Teacher';
  person_id: string;
  person_name: string;
  student_id?: string;
  student_name?: string;
  admission_number?: string;
  staff_name?: string;
  identifier: string; // Admission number or Staff ID
  incident_date: string;
  incident_type?: string;
  category: 'Lateness' | 'Bullying' | 'Uniform Misconduct' | 'Cheating' | 'Truancy' | 'Fighting' | 'Damage to Property' | 'Insubordination' | 'Absenteeism' | string;
  description: string;
  reported_by: string;
  recorded_by?: string;
  action_taken: string;
  follow_up?: string;
  status: 'Under Review' | 'Resolved' | 'Referred to Disciplinary Committee' | 'Closed' | 'Warning Issued' | 'Suspended' | 'Cleared' | string;
  created_at?: string;
  updated_at?: string;
  attachments?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  target_role: string;
  sender_name: string;
  is_urgent: boolean;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  entity_type: 'student' | 'staff' | 'academic' | 'finance';
  entity_id: string;
  document_type: string;
  title: string;
  file_url: string;
  file_size_bytes: number;
  uploaded_by: string;
  created_at: string;
}

export interface SyncQueueItem {
  id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  local_timestamp: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  retry_count: number;
  error_message?: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  role: string;
  action: string;
  table_name: string;
  record_id?: string;
  details?: string;
  timestamp: string;
}
