-- ==============================================================================
-- EduCore School Management System - Supabase PostgreSQL Database Schema
-- Designed for Ugandan Educational Institutions (Primary & Secondary)
-- Location: Uganda | Currency: UGX | Timezone: Africa/Kampala
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOL PROFILE & SYSTEM CONFIGURATION
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'EduCore Model Academy Kampala',
    motto VARCHAR(255) DEFAULT 'Strive for Excellence and Integrity',
    logo_url TEXT,
    address TEXT DEFAULT 'Plot 14 Lumumba Avenue, Nakasero',
    district VARCHAR(100) DEFAULT 'Kampala',
    country VARCHAR(100) DEFAULT 'Uganda',
    phone VARCHAR(50) DEFAULT '+256 414 123456',
    alt_phone VARCHAR(50) DEFAULT '+256 772 987654',
    email VARCHAR(100) DEFAULT 'info@educore.ac.ug',
    website VARCHAR(100) DEFAULT 'https://educore.ac.ug',
    currency VARCHAR(10) DEFAULT 'UGX',
    currency_code VARCHAR(10) DEFAULT 'UGX',
    timezone VARCHAR(50) DEFAULT 'Africa/Kampala',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    current_academic_year VARCHAR(20) DEFAULT '2026',
    current_term VARCHAR(20) DEFAULT 'Term 1',
    school_sections TEXT[] DEFAULT ARRAY['Primary', 'Lower Secondary', 'Advanced Secondary'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES & ROLES (Central RBAC)
CREATE TYPE user_role AS ENUM (
    'Super Administrator',
    'Administrator',
    'Head Teacher',
    'Deputy Head Teacher',
    'Bursar',
    'Teacher',
    'Registrar',
    'Librarian',
    'Storekeeper',
    'Parent',
    'Student'
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Teacher',
    phone VARCHAR(50),
    avatar_url TEXT,
    national_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACADEMIC YEARS & TERMS
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    year_name VARCHAR(50) NOT NULL, -- e.g., '2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 'Term 1', 'Term 2', 'Term 3'
    term_number INT NOT NULL CHECK (term_number BETWEEN 1 AND 3),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLASSES & STREAMS (Uganda Primary P.1-P.7 and Secondary S.1-S.6)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. 'P.1', 'P.7', 'S.1', 'S.4', 'S.6'
    level VARCHAR(50) NOT NULL, -- 'Primary', 'Lower Secondary', 'Advanced Secondary', 'Other'
    order_index INT NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Configurable: 'Blue', 'Red', 'North', 'Green', 'East', 'West'
    is_active BOOLEAN DEFAULT TRUE,
    class_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBJECTS (Ugandan Curriculum - Competency-Based & Traditional)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Mathematics', 'English Language', 'History & Political Education'
    code VARCHAR(20) NOT NULL, -- 'MTC', 'ENG', 'SCI', 'PHY', 'HIS'
    department VARCHAR(100) DEFAULT 'General',
    is_compulsory BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    cycle VARCHAR(50) DEFAULT 'Lower Secondary',
    classes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STAFF (Teaching & Non-Teaching)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    staff_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    dob DATE,
    age INT,
    national_id VARCHAR(50),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    religion VARCHAR(50),
    marital_status VARCHAR(30) DEFAULT 'Single', -- 'Single', 'Married', 'Divorced', 'Widowed', 'Other'
    department VARCHAR(100) DEFAULT 'Academics',
    designation VARCHAR(100) DEFAULT 'Teacher',
    category VARCHAR(50) NOT NULL DEFAULT 'Teaching' CHECK (category IN ('Teaching', 'Non-Teaching')),
    qualification VARCHAR(150),
    date_of_appointment DATE DEFAULT CURRENT_DATE,
    employment_status VARCHAR(50) DEFAULT 'Active',
    salary_ugx NUMERIC(15, 2) DEFAULT 0.00,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Document Storage Metadata
CREATE TABLE IF NOT EXISTS public.staff_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by VARCHAR(100),
    document_category VARCHAR(100) NOT NULL, -- 'National ID', 'Academic Certificate', 'Appointment Letter', 'Professional Certificate', 'Contract', 'Other Document'
    file_size VARCHAR(50),
    file_url TEXT
);

-- Backward compatibility view/alias for teachers
CREATE OR REPLACE VIEW public.teachers AS 
SELECT id, school_id, user_id, staff_id, full_name, gender, dob, national_id, phone, email, address, department, designation AS position, qualification, date_of_appointment AS employment_date, salary_ugx, photo_url, employment_status AS status, created_at, updated_at
FROM public.staff;

-- 7. PARENTS & GUARDIANS
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    parent_id_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Parent', -- 'Father', 'Mother', 'Guardian'
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    phone VARCHAR(50) NOT NULL,
    alt_phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    district VARCHAR(100) DEFAULT 'Kampala',
    occupation VARCHAR(100),
    religion VARCHAR(50),
    nin VARCHAR(50),
    photo_url TEXT,
    emergency_contact VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STUDENTS & STUDENT DOCUMENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id_number VARCHAR(50) NOT NULL UNIQUE, -- STU-2026-0042
    admission_number VARCHAR(50) NOT NULL UNIQUE, -- EMA/2026/0042
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    age INT,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    nationality VARCHAR(50) DEFAULT 'Ugandan',
    religion VARCHAR(50),
    blood_group VARCHAR(10),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    district VARCHAR(100) DEFAULT 'Kampala',
    village VARCHAR(100),
    photo_url TEXT,
    national_id VARCHAR(50), -- NIN (National Identification Number) or LIN (Learner ID)
    admission_date DATE DEFAULT CURRENT_DATE,
    previous_school VARCHAR(255),
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    stream_id UUID REFERENCES public.streams(id) ON DELETE SET NULL,
    house VARCHAR(50) DEFAULT 'Nile House',
    mobile_money_code VARCHAR(100), -- Separate registered Mobile Money payment code/reference identifier
    parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
    parent_name VARCHAR(255),
    parent_relationship VARCHAR(50),
    parent_sex VARCHAR(10),
    parent_dob DATE,
    parent_phone VARCHAR(50),
    parent_alt_phone VARCHAR(50),
    parent_email VARCHAR(100),
    parent_address TEXT,
    parent_occupation VARCHAR(100),
    parent_religion VARCHAR(50),
    parent_nin VARCHAR(50),
    parent_photo_url TEXT,
    emergency_contact VARCHAR(100),
    medical_notes TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Graduated', 'Transferred', 'Suspended', 'Left school', 'Archived')),
    sync_status VARCHAR(20) DEFAULT 'synced',
    local_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Document Storage Metadata (Supabase Storage)
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by VARCHAR(100),
    document_category VARCHAR(100) NOT NULL, 
    -- 'Student Passport Photo', 'Parent Passport Photo', 'Student National ID / LIN', 'Parent National ID / NIN', 'Student Medical Report', 'Previous School Report', 'Other Admission Documents'
    file_size VARCHAR(50),
    file_url TEXT
);

-- 9. ATTENDANCE (Offline-first enabled)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    reason TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, date)
);

-- 10. FEES & FINANCES (UGX)
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026',
    term VARCHAR(20) NOT NULL DEFAULT 'Term 1',
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'Tuition', 'Boarding', 'Meals', 'Transport', 'Development', 'Examination', 'Uniform', 'Other'
    amount_ugx NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    amount_ugx NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'Mobile Money', 'Bank', 'Card', 'Other')),
    transaction_reference VARCHAR(100), -- MTN MoMo Txn, Airtel Money Txn, Bank Slip Ref
    received_by VARCHAR(100),
    academic_year VARCHAR(20) DEFAULT '2026',
    term VARCHAR(20) DEFAULT 'Term 1',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CONFIGURABLE GRADING SCHEMES & LEVELS
CREATE TABLE IF NOT EXISTS public.grading_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g. 'Uganda New Lower Secondary (Competency-Based)', 'Primary PLE Standard'
    curriculum VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grading_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID REFERENCES public.grading_schemes(id) ON DELETE CASCADE,
    min_mark NUMERIC(5, 2) NOT NULL,
    max_mark NUMERIC(5, 2) NOT NULL,
    grade VARCHAR(20) NOT NULL, -- 'A', 'B', 'C', 'D', 'E' or 'D1', 'D2'...
    descriptor VARCHAR(100) NOT NULL, -- 'Exceptional', 'Outstanding', 'Satisfactory', 'Basic', 'Elementary'
    points INT NOT NULL,
    comment TEXT
);

-- 12. EXAMS, ASSESSMENTS & RESULTS
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'End of Term', -- 'Beginning of Term', 'Mid Term', 'End of Term', 'Mock PLE', 'Mock UCE', 'Project Assessment'
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026',
    term VARCHAR(20) NOT NULL DEFAULT 'Term 1',
    start_date DATE,
    end_date DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5, 2) NOT NULL CHECK (marks_obtained BETWEEN 0 AND 100),
    grade VARCHAR(10) NOT NULL,
    achievement_level VARCHAR(50), -- 'Exceptional', 'Outstanding', 'Satisfactory', 'Basic', 'Elementary'
    project_score NUMERIC(5, 2), -- Lower secondary competency-based project component
    remarks TEXT,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (exam_id, student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.report_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026',
    term VARCHAR(20) NOT NULL DEFAULT 'Term 1',
    total_marks NUMERIC(8, 2) DEFAULT 0,
    average_marks NUMERIC(5, 2) DEFAULT 0,
    aggregate INT DEFAULT 0,
    division VARCHAR(20), -- 'Division 1', 'Division 2', 'Division 3', 'Division 4', 'Division U'
    rank INT,
    total_students_in_class INT,
    attendance_percentage NUMERIC(5, 2) DEFAULT 100.0,
    teacher_remarks TEXT,
    head_teacher_remarks TEXT,
    next_term_begins DATE,
    fees_balance_ugx NUMERIC(15, 2) DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, academic_year, term)
);

-- 13. SCHOOL LIBRARY (Multiple Books Issue & Return Tracking)
CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    book_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    category VARCHAR(100) DEFAULT 'Curriculum Textbooks',
    publisher VARCHAR(150),
    edition VARCHAR(50),
    year VARCHAR(20),
    number_of_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    issued_copies INT NOT NULL DEFAULT 0,
    damaged_copies INT NOT NULL DEFAULT 0,
    shelf_location VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.library_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    issue_code VARCHAR(50) NOT NULL UNIQUE,
    person_type VARCHAR(20) NOT NULL CHECK (person_type IN ('Student', 'Staff')),
    person_id UUID NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    identifier VARCHAR(50) NOT NULL,
    class_or_department VARCHAR(100),
    date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Currently issued' CHECK (status IN ('Currently issued', 'Overdue', 'Returned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.library_issue_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES public.library_issues(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.library_books(id) ON DELETE CASCADE,
    book_title VARCHAR(255) NOT NULL,
    book_code VARCHAR(50) NOT NULL,
    copies_issued INT NOT NULL DEFAULT 1,
    copies_returned INT NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Returned', 'Damaged')),
    return_date DATE
);

-- 14. SCHOOL INVENTORY & ASSETS
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Stationery', 'Furniture', 'Electronics', 'Sports', 'Lab', 'Uniform'
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'Pieces', -- 'Boxes', 'Pcs', 'Reams', 'Pairs'
    purchase_price_ugx NUMERIC(15, 2) DEFAULT 0.00,
    supplier VARCHAR(255),
    purchase_date DATE DEFAULT CURRENT_DATE,
    location VARCHAR(100) DEFAULT 'Main Store',
    condition VARCHAR(50) DEFAULT 'Good' CHECK (condition IN ('New', 'Good', 'Fair', 'Damaged', 'Disposed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DISCIPLINE MANAGEMENT (Students & Staff)
CREATE TABLE IF NOT EXISTS public.discipline_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    person_type VARCHAR(20) NOT NULL CHECK (person_type IN ('Student', 'Staff')),
    person_id UUID NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    identifier VARCHAR(50) NOT NULL,
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    reported_by VARCHAR(255) NOT NULL,
    action_taken TEXT NOT NULL,
    follow_up TEXT,
    status VARCHAR(50) DEFAULT 'Under Review' CHECK (status IN ('Under Review', 'Resolved', 'Referred to Disciplinary Committee', 'Closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. COMMUNICATION & NOTICES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(50) DEFAULT 'All',
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_issue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read for all basic institutional data"
ON public.schools FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow public read for school profile"
ON public.schools FOR SELECT TO anon USING (TRUE);

-- ==============================================================================
-- SUPABASE STORAGE BUCKETS (Execute in Supabase Storage or API)
-- 1. student_photos
-- 2. parent_photos
-- 3. student_documents
-- 4. staff_photos
-- 5. staff_documents
-- 6. report_cards
-- 7. school_documents
-- 8. discipline_attachments
-- ==============================================================================
