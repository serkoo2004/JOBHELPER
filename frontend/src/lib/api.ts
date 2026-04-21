import axios, { AxiosInstance } from "axios";

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend";

const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");
const API_PREFIX = `${BASE_URL}/api/v1`;

export const api: AxiosInstance = axios.create({
  baseURL: API_PREFIX,
  timeout: 30000,
  withCredentials: false,
  headers: { "Content-Type": "application/json" }
});

if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("cc_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const adminKey = localStorage.getItem("cc_admin_key");
    const adminTarget =
      config.url?.startsWith("/admin") || config.url?.startsWith("/system/audit-logs");
    if (adminKey && adminTarget) {
      config.headers["x-admin-key"] = adminKey;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
}

export async function downloadFromApi(path: string, body?: unknown, method: "GET" | "POST" = "POST") {
  const adminKey = typeof window !== "undefined" ? localStorage.getItem("cc_admin_key") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("cc_token") : null;

  const response = await axios.request({
    url: `${API_PREFIX}${path}`,
    method,
    data: body,
    responseType: "blob",
    withCredentials: false,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(adminKey && (path.startsWith("/admin") || path.startsWith("/system/audit-logs"))
        ? { "x-admin-key": adminKey }
        : {}),
    },
  });

  const contentDisposition = response.headers["content-disposition"] || "";
  const fileNameMatch = /filename="?([^"]+)"?/.exec(contentDisposition);
  const fileName = fileNameMatch?.[1] || "download";

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const authApi = {
  login: (data: { email: string; password?: string }) =>
    api.post("/auth/login", data).then((r) => r.data),
  register: (data: { name?: string; email: string; password: string }) =>
    api.post("/auth/register", data).then((r) => r.data)
};

export const profileApi = {
  create: (payload: any) => api.post("/profiles", payload).then((r) => r.data),
  get: (id: string) => api.get(`/profiles/${id}`).then((r) => r.data),
  update: (id: string, payload: any) =>
    api.patch(`/profiles/${id}`, payload).then((r) => r.data)
};

export const resumeApi = {
  analyze: (text: string, target_role?: string) =>
    api.post("/resumes/analyze", { content: text, target_role }).then((r) => r.data),
  analyzeUpload: (form: FormData, target_role?: string) =>
    api
      .post("/resumes/analyze-upload", form, {
        params: target_role ? { target_role } : undefined,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((r) => r.data),
  generate: (payload: any) =>
    api.post("/resumes/generate", payload).then((r) => r.data),
  generateFile: (payload: any) =>
    downloadFromApi("/resumes/generate-file", payload),
  templates: () => api.get("/resumes/templates").then((r) => r.data),
  createDraft: (payload: any) =>
    api.post("/resumes/drafts", payload).then((r) => r.data),
  getDraft: (draftId: string) =>
    api.get(`/resumes/drafts/${draftId}`).then((r) => r.data),
  updateDraft: (draftId: string, payload: any) =>
    api.patch(`/resumes/drafts/${draftId}`, payload).then((r) => r.data),
  autoDraft: (payload: any) =>
    api.post("/resumes/auto-draft", payload).then((r) => r.data),
  autoGenerateFile: (payload: any) =>
    downloadFromApi("/resumes/auto-generate-file", payload),
  finalize: (draftId: string) =>
    api.post(`/resumes/drafts/${draftId}/finalize`).then((r) => r.data),
  export: (draftId: string, format = "pdf") =>
    downloadFromApi(`/resumes/drafts/${draftId}/export`, { format }),
  listSaved: (profileId: string) =>
    api.get(`/resumes/profile/${profileId}`).then((r) => r.data),
  versions: (resumeId: string) =>
    api.get(`/resumes/${resumeId}/versions`).then((r) => r.data),
  restoreVersion: (resumeId: string, versionNumber: number) =>
    api.post(`/resumes/${resumeId}/versions/${versionNumber}/restore`).then((r) => r.data)
};

export const coverLetterApi = {
  generate: (payload: any) =>
    api.post("/cover-letters/generate", payload).then((r) => r.data)
};

export const careerApi = {
  matchJob: (p: any) => api.post("/career/job-match", p).then((r) => r.data),
  jobMatch: (p: any) => api.post("/career/job-match", p).then((r) => r.data),
  optimizeLinkedIn: (p: any) =>
    api.post("/career/linkedin-optimize", p).then((r) => r.data),
  linkedinOptimize: (p: any) =>
    api.post("/career/linkedin-optimize", p).then((r) => r.data),
  portfolioSummary: (p: any) =>
    api.post("/career/portfolio-summary", p).then((r) => r.data),
  interviewPrep: (p: any) =>
    api.post("/career/interview-prep", p).then((r) => r.data),
  roadmap: (p: any) => api.post("/career/roadmap", p).then((r) => r.data),
  photoAssistant: (p: any) =>
    api.post("/career/photo-assistant", p).then((r) => r.data),
  coachApplication: (applicationId: string) =>
    api.post(`/applications/${applicationId}/coach`).then((r) => r.data)
};

export const applicationsApi = {
  list: () => api.get("/applications").then((r) => r.data),
  create: (p: any) => api.post("/applications", p).then((r) => r.data),
  get: (id: string) => api.get(`/applications/${id}`).then((r) => r.data),
  update: (id: string, p: any) =>
    api.patch(`/applications/${id}`, p).then((r) => r.data)
};

export const flowApi = {
  start: (p: any) => api.post("/flows/document", p).then((r) => r.data),
  get: (id: string) => api.get(`/flows/document/${id}`).then((r) => r.data),
  answer: (id: string, p: any) =>
    api.post(`/flows/document/${id}/answer`, p).then((r) => r.data),
  generateDraft: (id: string) =>
    api.post(`/flows/document/${id}/generate-resume-draft`).then((r) => r.data)
};

export const aiSessionApi = {
  createSession: (p: any) => api.post("/ai/sessions", p).then((r) => r.data),
  create: (p: any) => api.post("/ai/sessions", p).then((r) => r.data),
  listSessions: (userId: string) => api.get(`/ai/users/${userId}/sessions`).then((r) => r.data),
  list: (userId: string) => api.get(`/ai/users/${userId}/sessions`).then((r) => r.data),
  get: (id: string) => api.get(`/ai/sessions/${id}`).then((r) => r.data),
  addMessage: (id: string, p: any) =>
    api.post(`/ai/sessions/${id}/messages`, p).then((r) => r.data),
  message: (id: string, p: any) =>
    api.post(`/ai/sessions/${id}/messages`, p).then((r) => r.data)
};

export const assetsApi = {
  uploadPhoto: (form: FormData) =>
    api
      .post("/assets/photos/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((r) => r.data),
  professionalizePhoto: (p: any) =>
    api.post("/assets/photos/professionalize", p, { timeout: 180000 }).then((r) => r.data),
  uploadTemplate: (form: FormData) =>
    api
      .post("/assets/templates/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((r) => r.data),
  listPhotos: () => api.get("/assets/photos").then((r) => r.data),
  listGeneratedPhotos: () => api.get("/assets/photos/generated").then((r) => r.data),
  deletePhoto: (photoPath: string) =>
    api.post("/assets/photos/delete", { photo_path: photoPath }).then((r) => r.data),
  usePhotoInProfile: (payload: { profile_id: string; photo_path: string }) =>
    api.post("/assets/photos/use-in-profile", payload).then((r) => r.data),
  listTemplates: () => api.get("/assets/templates").then((r) => r.data)
};

export const adminApi = {
  overview: () => api.get("/admin/overview").then((r) => r.data),
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  auditLogs: (limit?: number) =>
    api.get("/system/audit-logs", { params: limit ? { limit } : undefined }).then((r) => r.data)
};

export const systemApi = {
  health: () => api.get("/health").then((r) => r.data)
};
