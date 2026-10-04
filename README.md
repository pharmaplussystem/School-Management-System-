# EduCore School Management System 🇺🇬
### Production-Ready, Offline-First School Management System Designed for Ugandan Educational Institutions

EduCore is a modern, high-performance School Management System tailored specifically for Primary and Secondary schools in Uganda. It is built with a **local-first architecture** using **IndexedDB and Cache API**, allowing teachers, bursars, and administrators to take attendance, record fee payments in Uganda Shillings (UGX), enter assessment marks, and catalog assets completely **OFFLINE**. When network connectivity returns, EduCore automatically synchronizes queued operations with a cloud **Supabase PostgreSQL** database.

EduCore is 100% client-side compatible with **GitHub Pages** static deployment and can be installed as a **Progressive Web App (PWA)** on Android phones, tablets, Chromebooks, and desktop computers.

---

## Table of Contents
1. [Creating a Supabase Project](#1-creating-a-supabase-project)
2. [Running the SQL Database Schema](#2-running-the-sql-database-schema)
3. [Configuring the Supabase URL](#3-configuring-the-supabase-url)
4. [Configuring the Supabase Publishable Key](#4-configuring-the-supabase-publishable-key)
5. [Configuring Authentication Redirect URLs for GitHub Pages](#5-configuring-authentication-redirect-urls-for-github-pages)
6. [Uploading Files to GitHub](#6-uploading-files-to-github)
7. [Enabling GitHub Pages Deployment](#7-enabling-github-pages-deployment)
8. [Installing EduCore as a PWA (Android, iOS & Desktop)](#8-installing-educore-as-a-pwa)
9. [How Offline Mode Works (Local-First Architecture)](#9-how-offline-mode-works)
10. [How Synchronization Works (Sync Engine & Conflict Prevention)](#10-how-synchronization-works)
11. [Creating the First Administrator Account](#11-creating-the-first-administrator-account)
12. [Configuring User Roles and Central RBAC](#12-configuring-user-roles-and-central-rbac)
13. [Configuring School Information & Ugandan Curriculum](#13-configuring-school-information)
14. [Troubleshooting Common Issues](#14-troubleshooting-common-issues)

---

### 1. Creating a Supabase Project

1. Visit [supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New Project** and enter your desired project details:
   - **Name**: e.g., `EduCore-Uganda-School`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose a region closest to Uganda (such as `eu-central-1` Frankfurt or `af-south-1` Cape Town) for low latency.
3. Click **Create new project** and wait ~2 minutes while Supabase provisions your PostgreSQL database.

---

### 2. Running the SQL Database Schema

EduCore includes a complete, production-ready SQL migration script located at `supabase/schema.sql`.

1. In your Supabase dashboard, navigate to the **SQL Editor** on the left menu.
2. Click **New Query**.
3. Copy the entire contents of the file `supabase/schema.sql` from this repository.
4. Paste it into the Supabase SQL editor and click **Run** (or press `Ctrl + Enter`).
5. The script will automatically create:
   - All 17 tables (`profiles`, `schools`, `academic_years`, `terms`, `classes`, `streams`, `subjects`, `teachers`, `parents`, `students`, `attendance`, `fee_structures`, `payments`, `exams`, `results`, `library_books`, `inventory_items`, `discipline_records`, `audit_logs`).
   - Indexes for high performance.
   - Strict Row Level Security (RLS) policies enforcing multi-role permissions.
   - Initial Ugandan curriculum seed data (P.1–P.7, S.1–S.6, subjects, and grading scales).

---

### 3. Configuring the Supabase URL

1. In your Supabase project, go to **Project Settings** -> **API**.
2. Under **Project URL**, copy the URL (looks like: `https://xyzprojectid.supabase.co`).
3. You can configure this in EduCore using either of two methods:
   - **In-App (No rebuild required)**: Open EduCore -> Click **Configuration / Settings** -> Click **Supabase Cloud Sync** tab -> Paste your URL and click **Save Supabase Configuration**.
   - **Environment / Config file**: Copy `config.example.js` to `config.js` or set `VITE_SUPABASE_URL` in your `.env`.

---

### 4. Configuring the Supabase Publishable Key

1. In Supabase **Project Settings** -> **API**, locate **Project API keys**.
2. Copy the **`anon` `public`** key (starts with `eyJhbGci...`).
3. **CRITICAL SECURITY RULE**: Never use or expose the `service_role` or database secret password in frontend code. The `anon` key is designed to be public and works safely with Row Level Security.
4. Paste this key into EduCore via **Settings -> Supabase Cloud Sync** or in `config.js`. Click **Test Connection** to confirm connectivity.

---

### 5. Configuring Authentication Redirect URLs for GitHub Pages

When hosting on GitHub Pages, redirect URLs must be whitelisted in Supabase:
1. In the Supabase Dashboard, go to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your GitHub Pages URL:
   ```
   https://USERNAME.github.io/REPOSITORY/
   ```
3. Under **Redirect URLs**, add:
   ```
   https://USERNAME.github.io/REPOSITORY/**
   ```
4. Click **Save**.

---

### 6. Uploading Files to GitHub

Initialize your repository and push the files:
```bash
git init
git add .
git commit -m "Initial commit: EduCore School Management System for Uganda"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

---

### 7. Enabling GitHub Pages Deployment

To deploy EduCore directly as a static web application:
1. In your GitHub repository, click **Settings** -> **Pages**.
2. Under **Build and deployment**:
   - If deploying pre-built `dist/`: Select **Deploy from a branch**, choose `main` or `gh-pages` with folder `/ (root)` or `/dist`.
   - Or configure GitHub Actions with the standard static Vite workflow:
     ```yaml
     name: Deploy to GitHub Pages
     on:
       push:
         branches: [main]
     jobs:
       deploy:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with:
               node-version: 22
           - run: npm ci
           - run: npm run build
           - uses: actions/upload-pages-artifact@v3
             with:
               path: ./dist
           - uses: actions/deploy-pages@v4
     ```
3. Because `vite.config.ts` uses `base: './'`, all asset paths are relative and work seamlessly on subpaths like `https://USERNAME.github.io/REPOSITORY/`.

---

### 8. Installing EduCore as a PWA

EduCore provides a fully compliant Progressive Web App experience:
- **On Android & Chrome**: Click the **Install App** button in the header (or browser menu -> *Install App* / *Add to Home Screen*).
- **On iPhone & iPad**: Tap the **Share** button in Safari -> scroll down and select **Add to Home Screen**.
- **Offline Launch**: Once installed, you can launch EduCore directly from your home screen even with airplane mode enabled!

---

### 9. How Offline Mode Works

EduCore uses a **Local-First Architecture**:
1. **IndexedDB Local Store**: Contains all students, classes, attendance records, fee transactions, exam results, and library inventory.
2. **Service Worker Caching**: The app shell, stylesheets, icons, and fonts are precached using Workbox and the Cache API.
3. When offline:
   - All forms, filters, and searches function at instantaneous local speed.
   - Any new record (such as taking attendance or recording a UGX fee payment) is immediately saved to IndexedDB and enqueued in `sync_queue`.
   - The user interface immediately displays **"Saved Offline — Pending Sync"**.

---

### 10. How Synchronization Works

EduCore features a dedicated background `syncEngine`:
1. It listens to `navigator.onLine` and `window.addEventListener('online')`.
2. When the device returns online (or when the user taps **Sync Now** in the Sync Center):
   - Status transitions to **SYNCING...**
   - The engine validates remote Supabase connectivity.
   - Pending `INSERT`, `UPDATE`, and `DELETE` operations are processed sequentially.
   - UUID primary keys prevent record duplication.
   - On completion, items are marked `synced` and the status updates to **SYNC COMPLETE**.

---

### 11. Creating the First Administrator Account

1. Open EduCore in your browser.
2. Click **Register Account** on the sign-in modal.
3. Enter your administrative email (e.g. `headteacher@educore.ac.ug`), name, and choose the role **Administrator** or **Head Teacher**.
4. In Supabase SQL editor or Table Editor -> `profiles`, verify that your user profile has `role = 'Administrator'`.

---

### 12. Configuring User Roles and Central RBAC

EduCore includes 11 specific roles with granular access permissions:
- **Super Administrator & Administrator**: Full access to all modules, billing, settings, and audit logs.
- **Head Teacher & Deputy Head Teacher**: Academic management, staff oversight, student dossiers, attendance audits, confidential discipline records.
- **Bursar**: School fees structures, fee collections (UGX), receipt generation, and financial reports.
- **Teacher**: Daily attendance registers, assessment marks entry, assigned classes and subject syllabi.
- **Registrar**: Student admissions, family records, class enrollments.
- **Librarian**: Book cataloging, circulation, borrowing and overdue tracking.
- **Storekeeper**: Asset inventory, stationery, furniture, sports gear, and laboratory supplies.
- **Parent**: Restricted strictly to their linked children's report cards, fee balances, and attendance.
- **Student**: Restricted strictly to their own published marks and personal profile.

*Note: Use the interactive Role Switcher in the top header during evaluation to experience each role's view!*

---

### 13. Configuring School Information

From **Settings -> School Information**:
- Configure school name (e.g. `EduCore Model Academy Kampala`).
- Set motto, address (Plot and street), and Ugandan district (Kampala, Wakiso, Mukono, Jinja, Gulu, Mbarara, etc.).
- Configure phone numbers (+256...) and official email.
- Default currency is locked to **Uganda Shilling (UGX)** with standard formatting (e.g. `UGX 1,245,000`).
- Academic year and current term (Term 1, Term 2, Term 3).

---

### 14. Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Sync failed: fetch failed"** | No active internet connection or incorrect Supabase URL | Check that the device is online and verify your Supabase project URL in Settings -> Supabase Cloud Sync. |
| **"Permission denied (RLS)"** | Authenticated user role does not have SQL permission | Check that you ran `supabase/schema.sql` and that your user in `profiles` has the required `role`. |
| **PWA Install Button not showing** | Running inside an iframe or browser does not support `beforeinstallprompt` | On desktop Chrome or Android, ensure you are visiting via HTTPS; on iOS Safari, use the *Share -> Add to Home Screen* guide. |
| **Assets 404 on GitHub Pages** | Absolute root URLs used instead of relative paths | EduCore uses `base: './'` in `vite.config.ts`, ensuring assets resolve properly under repository subpaths. |
| **Local storage cleared** | Browser private browsing session ended | Use the **Settings -> Data Safety & Backup -> Export Database JSON** button periodically to create offline archival backups. |

---

### Uganda Education Support Summary
- **Curriculum**: Primary Leaving Examinations (PLE) and Uganda Certificate of Education (UCE / Lower Secondary).
- **Grading Scale**: D1 (90-100), D2 (80-89), C3 (70-79), C4 (60-69), C5 (55-59), C6 (50-54), P7 (45-49), P8 (40-44), F9 (0-39).
- **Currency**: UGX (Uganda Shilling).
- **Timezone**: Africa/Kampala (EAT, UTC+3).
- **Date Format**: DD/MM/YYYY.
