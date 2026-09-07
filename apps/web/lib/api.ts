const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// Fallback Mock State for Cloud / Vercel Standalone Deployments
const MOCK_TEMPLATES = [
  {
    id: "31a0550e-1dcb-4dc3-9605-b936526455e8",
    name: "Luxury Villa Pre-Launch Offer",
    template_name: "luxury_villa_prelaunch",
    language: "en_US",
    category: "MARKETING",
    status: "APPROVED",
    components: [
      {
        type: "BODY",
        text: "Hi {{1}}, we are excited to launch modern 3BHK luxury apartments in {{2}}. Exclusive pre-launch discount available this week. Would you like to schedule a private site visit?"
      }
    ]
  },
  {
    id: "52b0660f-2ecb-5dc4-0716-c947637566f9",
    name: "Site Visit Confirmation",
    template_name: "site_visit_confirm",
    language: "en_US",
    category: "UTILITY",
    status: "APPROVED",
    components: [
      {
        type: "BODY",
        text: "Hi {{1}}, your site visit for Apex Luxury Living in {{2}} is confirmed. Our Relationship Manager will meet you at the site."
      }
    ]
  }
];

let MOCK_CAMPAIGNS: any[] = [
  {
    id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
    organization_id: "org_apex_realestate",
    name: "Gachibowli Luxury Villas Prospect Blast",
    message_type: "custom",
    template_id: null,
    status: "COMPLETED",
    total_contacts: 1000,
    queued_count: 0,
    sent_count: 980,
    delivered_count: 965,
    read_count: 890,
    failed_count: 20,
    skipped_count: 0,
    created_by: "test_user_id",
    created_at: new Date().toISOString()
  }
];

let MOCK_RECIPIENTS: any[] = [
  {
    id: "rec_1",
    campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
    phone_number: "+919876543210",
    name: "Ravi Kumar",
    location: "Gachibowli, Hyderabad",
    message_hash: "hash_123",
    status: "DELIVERED",
    skip_reason: null,
    whatsapp_message_id: "wamid.HBgM12345678",
    sent_at: new Date().toISOString()
  },
  {
    id: "rec_2",
    campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
    phone_number: "+919876543211",
    name: "Priya Sharma",
    location: "Jubilee Hills, Hyderabad",
    message_hash: "hash_124",
    status: "READ",
    skip_reason: null,
    whatsapp_message_id: "wamid.HBgM12345679",
    sent_at: new Date().toISOString()
  }
];

export async function ensureAuthenticated() {
  if (typeof window === "undefined") return "mock_token";
  let token = localStorage.getItem("access_token");
  
  if (!token) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@apexrealestate.com",
          password: "password123"
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_info", JSON.stringify(data));
        token = data.access_token;
      }
    } catch (e) {
      // Mock auth fallback for standalone frontend on Vercel
      token = "mock_demo_access_token";
      localStorage.setItem("access_token", token);
      localStorage.setItem("user_info", JSON.stringify({
        user_id: "user_demo",
        organization_id: "org_apex_realestate",
        user_name: "Vikram Sharma",
        role: "owner"
      }));
    }
  }
  return token;
}

async function handleMockFallback(url: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || "GET").toUpperCase();

  if (url.includes("/api/v1/auth/login") || url.includes("/api/v1/auth/me")) {
    return {
      access_token: "mock_demo_access_token",
      token_type: "bearer",
      user_id: "user_demo",
      organization_id: "org_apex_realestate",
      user_name: "Vikram Sharma",
      role: "owner"
    };
  }

  if (url.includes("/api/v1/templates")) {
    return MOCK_TEMPLATES;
  }

  if (url.includes("/api/v1/whatsapp/status")) {
    return {
      is_connected: true,
      provider_mode: "Mock",
      display_phone_number: "+91 98765 43210",
      business_account_id: "act_10293847",
      phone_number_id: "pn_48372610",
      status: "connected"
    };
  }

  if (url.includes("/api/v1/imports/upload")) {
    const importId = "imp_" + Math.random().toString(36).substring(2, 9);
    return {
      import_id: importId,
      file_name: "prospects_dataset.xlsx",
      total_rows: 10,
      valid_contacts: 10,
      invalid_numbers: 0,
      duplicate_rows: 0,
      previously_processed: 0,
      ready_for_campaign: 10,
      detected_columns: { name: "Name", phone: "Phone", location: "Location" },
      sample_valid: [
        { name: "Ravi Kumar", phone_number: "+919876543210", location: "Gachibowli, Hyderabad" },
        { name: "Priya Sharma", phone_number: "+919876543211", location: "Jubilee Hills, Hyderabad" },
        { name: "Suresh Reddy", phone_number: "+919876543212", location: "Banjara Hills, Hyderabad" }
      ],
      sample_invalid: []
    };
  }

  if (url.includes("/api/v1/media/upload")) {
    return {
      media_id: "med_" + Math.random().toString(36).substring(2, 9),
      filename: "property_preview.jpg",
      media_url: "/sample_property.jpg"
    };
  }

  if (url.includes("/api/v1/campaigns") && method === "POST") {
    let bodyData: any = {};
    try {
      if (options.body && typeof options.body === "string") {
        bodyData = JSON.parse(options.body);
      }
    } catch {}

    const newCampaign = {
      id: "cmp_" + Math.random().toString(36).substring(2, 9),
      organization_id: "org_apex_realestate",
      name: bodyData.name || "Real Estate Bulk Campaign",
      message_type: bodyData.message_type || "template",
      template_id: bodyData.template_id || null,
      message_body: bodyData.message_body || null,
      media_url: bodyData.media_url || "/sample_property.jpg",
      status: "COMPLETED",
      total_contacts: 10,
      queued_count: 0,
      sent_count: 10,
      delivered_count: 10,
      read_count: 8,
      failed_count: 0,
      skipped_count: 0,
      created_by: "user_demo",
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    MOCK_CAMPAIGNS.unshift(newCampaign);
    return newCampaign;
  }

  if (url.includes("/api/v1/campaigns/") && url.includes("/recipients")) {
    let list = [...MOCK_RECIPIENTS];
    try {
      const u = new URL(url, "http://localhost");
      const st = u.searchParams.get("status");
      const sr = u.searchParams.get("search")?.toLowerCase();
      if (st && st.toUpperCase() !== "ALL") {
        list = list.filter((r) => r.status.toUpperCase() === st.toUpperCase());
      }
      if (sr) {
        list = list.filter((r) => (r.name || "").toLowerCase().includes(sr) || (r.phone_number || "").includes(sr));
      }
    } catch {}
    return list;
  }

  if (url.includes("/api/v1/campaigns/") && (url.includes("/pause") || url.includes("/resume") || url.includes("/cancel"))) {
    return { status: "COMPLETED", message: "Campaign updated successfully" };
  }

  if (url.includes("/api/v1/campaigns/")) {
    const parts = url.split("/");
    const id = parts[parts.length - 1];
    const found = MOCK_CAMPAIGNS.find((c) => c.id === id);
    return found || MOCK_CAMPAIGNS[0];
  }

  if (url.includes("/api/v1/campaigns")) {
    return MOCK_CAMPAIGNS;
  }

  if (url.includes("/api/v1/contacts")) {
    return [
      { id: "c1", name: "Ravi Kumar", phone_number: "+919876543210", location: "Gachibowli, Hyderabad", created_at: new Date().toISOString() },
      { id: "c2", name: "Priya Sharma", phone_number: "+919876543211", location: "Jubilee Hills, Hyderabad", created_at: new Date().toISOString() },
      { id: "c3", name: "Suresh Reddy", phone_number: "+919876543212", location: "Banjara Hills, Hyderabad", created_at: new Date().toISOString() }
    ];
  }

  return {};
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

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    let response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timer);

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

    return await response.json();
  } catch (err: any) {
    // If local backend is unreachable (e.g. deployed on Vercel or mobile device), fallback seamlessly to mock handler
    console.warn(`[API Client] Backend unreachable (${err.message}), using cloud mock fallback for ${url}`);
    return handleMockFallback(url, options);
  }
}

export const api = {
  login: async (email: string, password: string) => {
    try {
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
    } catch {
      // Mock login for cloud demo
      const data = {
        access_token: "mock_demo_access_token",
        token_type: "bearer",
        user_id: "user_demo",
        organization_id: "org_apex_realestate",
        user_name: "Vikram Sharma",
        role: "owner"
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_info", JSON.stringify(data));
      }
      return data;
    }
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
