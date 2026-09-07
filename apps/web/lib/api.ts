const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function ensureAuthenticated() {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("access_token");
  
  if (!token) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@apexrealestate.com",
          password: "password123"
        })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_info", JSON.stringify(data));
        token = data.access_token;
      }
    } catch (e) {
      console.error("Auto-login failed:", e);
    }
  }
  return token;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = await ensureAuthenticated();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized (token expired), refresh token via auto-login once and retry
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    token = await ensureAuthenticated();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    let errorDetail = "API Request failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.detail || "Login failed");
    }
    const data = await response.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_info", JSON.stringify(data));
    }
    return data;
  },

  getMe: () => fetchWithAuth("/api/v1/auth/me"),

  uploadExcel: async (file: File, templateId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    let query = templateId ? `?template_id=${templateId}` : "";
    return fetchWithAuth(`/api/v1/imports/upload${query}`, {
      method: "POST",
      body: formData,
    });
  },

  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchWithAuth("/api/v1/media/upload", {
      method: "POST",
      body: formData,
    });
  },


  getImportPreview: (importId: string) => fetchWithAuth(`/api/v1/imports/${importId}/preview`),

  getTemplates: () => fetchWithAuth("/api/v1/templates"),

  createCampaign: (data: {
    name: string;
    template_id?: string;
    message_type?: string;
    message_body?: string;
    media_url?: string;
    import_id?: string;
    contacts?: any[];
  }) =>
    fetchWithAuth("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),


  getCampaigns: () => fetchWithAuth("/api/v1/campaigns"),

  getCampaign: (id: string) => fetchWithAuth(`/api/v1/campaigns/${id}`),

  getCampaignRecipients: (id: string, statusFilter?: string, search?: string) => {
    const params = new URLSearchParams();
    if (statusFilter) params.append("status", statusFilter);
    if (search) params.append("search", search);
    return fetchWithAuth(`/api/v1/campaigns/${id}/recipients?${params.toString()}`);
  },

  pauseCampaign: (id: string) => fetchWithAuth(`/api/v1/campaigns/${id}/pause`, { method: "POST" }),
  resumeCampaign: (id: string) => fetchWithAuth(`/api/v1/campaigns/${id}/resume`, { method: "POST" }),
  cancelCampaign: (id: string) => fetchWithAuth(`/api/v1/campaigns/${id}/cancel`, { method: "POST" }),

  getContacts: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return fetchWithAuth(`/api/v1/contacts${query}`);
  },

  getContactHistory: (contactId: string) => fetchWithAuth(`/api/v1/contacts/${contactId}/history`),

  getWhatsAppStatus: () => fetchWithAuth("/api/v1/whatsapp/status"),
};
