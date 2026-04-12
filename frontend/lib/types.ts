export interface UserProfilePayload {
  user_id?: string;
  full_name: string;
  email: string;
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
  certifications?: string[];
}

export interface ResumeResponse {
  title: string;
  summary: string;
  content: string;
  recommendations: string[];
  template?: string | null;
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
