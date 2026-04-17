export interface UserProfilePayload {
  user_id?: string;
  full_name: string;
  email: string;
  photo_url?: string;
  phone?: string;
  location?: string;
  summary?: string;
  target_role?: string;
  seniority_level?: string;
  years_of_experience?: number;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: string[];
  languages?: string[];
  certifications?: Array<string | { name: string; issuer?: string; year?: string }>;
  experiences?: Array<{
    title: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    bullets?: string[];
    technologies?: string[];
  }>;
  projects?: Array<{
    name: string;
    subtitle?: string;
    technologies?: string[];
    bullets?: string[];
    link?: string;
  }>;
  education?: Array<{
    degree: string;
    school: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    details?: string[];
  }>;
}

export interface ResumeResponse {
  title: string;
  summary: string;
  content: string;
  recommendations: string[];
  template?: string | null;
  template_reason?: string | null;
}

export interface ResumeTemplateOption {
  key: string;
  name: string;
  description: string;
  layout_hint: string;
}

export interface ResumeDraftResponse extends ResumeResponse {
  draft_id: string;
  resume_id?: string | null;
  version_number?: number | null;
  profile_warnings: string[];
  finalized: boolean;
  preview_url?: string | null;
}

export interface CoverLetterResponse {
  title: string;
  summary: string;
  content: string;
  recommendations: string[];
}

export interface JobApplication {
  application_id: string;
  company_name: string;
  role_name: string;
  source?: string | null;
  job_url?: string | null;
  applied_at?: string | null;
  status: string;
  interview_date?: string | null;
  notes?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
}

export interface MediaItem {
  name: string;
  path: string;
}

export interface AuditLogEntry {
  log_id: string;
  request_id: string;
  method: string;
  path: string;
  status_code: number;
  client_ip?: string | null;
  user_agent?: string | null;
  duration_ms: number;
  created_at: string;
}

export interface AdminOverview {
  profiles: number;
  resumes: number;
  resume_versions: number;
  applications: number;
  ai_sessions: number;
  ai_messages: number;
  audit_logs: number;
}

export interface AdminSystemHealth {
  database_backend: string;
  admin_guard_enabled: boolean;
  rate_limit_enabled: boolean;
  rate_limit_max_requests: number;
  rate_limit_window_seconds: number;
  google_ai_configured: boolean;
  openai_ai_configured: boolean;
  requests_last_24h: number;
  errors_last_24h: number;
}

export interface AdminApplicationStatusItem {
  status: string;
  count: number;
}

export interface AdminRecentProfileItem {
  user_id: string;
  full_name: string;
  email: string;
  target_role?: string | null;
  created_at: string;
}

export interface AdminRecentResumeItem {
  resume_id: string;
  version_number: number;
  title: string;
  template?: string | null;
  status: string;
  created_at: string;
}

export interface AdminRecentApplicationItem {
  application_id: string;
  company_name: string;
  role_name: string;
  status: string;
  source?: string | null;
  created_at: string;
}

export interface AdminRecentAuditItem {
  log_id: string;
  request_id: string;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  client_ip?: string | null;
  created_at: string;
}

export interface AdminDashboard {
  overview: AdminOverview;
  system: AdminSystemHealth;
  application_statuses: AdminApplicationStatusItem[];
  recent_profiles: AdminRecentProfileItem[];
  recent_resume_versions: AdminRecentResumeItem[];
  recent_applications: AdminRecentApplicationItem[];
  recent_audit_logs: AdminRecentAuditItem[];
}
