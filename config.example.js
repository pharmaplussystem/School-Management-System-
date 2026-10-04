/**
 * EduCore School Management System
 * Environment Configuration Template
 * 
 * Instructions:
 * 1. Copy this file or configure these variables in your deployment / settings.
 * 2. In EduCore, you can also enter your Supabase URL & Anon Key directly via
 *    the in-app System Settings -> Supabase Cloud Sync tab.
 * 3. Never commit real secret/service_role keys to GitHub or public repositories.
 */

window.__EDUCORE_CONFIG__ = {
  // Supabase Project URL (e.g. https://your-project-ref.supabase.co)
  SUPABASE_URL: "https://your-project-id.supabase.co",

  // Supabase Public Anonymous API Key (safe for browser client-side use with RLS)
  SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  // School Default Metadata
  SCHOOL_NAME: "EduCore Model Academy Kampala",
  LOCATION: "Kampala, Uganda",
  CURRENCY: "UGX",
  TIMEZONE: "Africa/Kampala",
  DATE_FORMAT: "DD/MM/YYYY",

  // GitHub Pages Redirect URL for Supabase Auth Password Reset
  AUTH_REDIRECT_URL: window.location.origin + window.location.pathname
};
