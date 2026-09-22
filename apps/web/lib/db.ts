import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  whatsapp_config: {
    mode: "DEMO" | "LIVE";
    phone_number_id: string;
    business_account_id: string;
    access_token: string;
    display_phone_number: string;
    verify_token: string;
  };
}

export interface ContactRecord {
  id: string;
  organization_id: string;
  name: string;
  phone_number: string;
  location?: string;
  created_at: string;
}

export interface CampaignRecord {
  id: string;
  organization_id: string;
  name: string;
  message_type: string;
  template_id?: string | null;
  message_body?: string | null;
  media_url?: string | null;
  status: string;
  total_contacts: number;
  queued_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  skipped_count: number;
  created_by: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface RecipientRecord {
  id: string;
  campaign_id: string;
  organization_id: string;
  contact_id?: string;
  phone_number: string;
  name: string;
  location?: string;
  message_hash: string;
  status: string;
  skip_reason?: string | null;
  whatsapp_message_id?: string | null;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
}

export interface ImportSession {
  import_id: string;
  file_name: string;
  organization_id: string;
  total_rows: number;
  valid_contacts: any[];
  invalid_numbers: any[];
  duplicate_rows: number;
  previously_processed: number;
  ready_for_campaign: number;
  detected_columns: Record<string, string>;
}

// Global In-Memory Multi-Tenant Store
export const STORE = {
  organizations: [
    {
      id: "org_sri_infra",
      name: "Sri Infra",
      slug: "sri-infra",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_sri_101",
        business_account_id: "act_sri_201",
        access_token: "",
        display_phone_number: "+91 98765 11111",
        verify_token: "sri_infra_verify_secret"
      }
    },
    {
      id: "org_sai_infra",
      name: "Sai Infra",
      slug: "sai-infra",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_sai_102",
        business_account_id: "act_sai_202",
        access_token: "",
        display_phone_number: "+91 98765 22222",
        verify_token: "sai_infra_verify_secret"
      }
    },
    {
      id: "org_tech_infra",
      name: "Tech Infra",
      slug: "tech-infra",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_tech_103",
        business_account_id: "act_tech_203",
        access_token: "",
        display_phone_number: "+91 98765 33333",
        verify_token: "tech_infra_verify_secret"
      }
    },
    {
      id: "org_abc_properties",
      name: "ABC Properties",
      slug: "abc-properties",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_abc_104",
        business_account_id: "act_abc_204",
        access_token: "",
        display_phone_number: "+91 98765 44444",
        verify_token: "abc_properties_verify_secret"
      }
    },
    {
      id: "org_apex_realestate",
      name: "Apex Real Estate",
      slug: "apex-realestate",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_48372610",
        business_account_id: "act_10293847",
        access_token: "",
        display_phone_number: "+91 98765 43210",
        verify_token: "apex_realestate_verify_secret"
      }
    }
  ] as OrganizationRecord[],

  config: {
    mode: "DEMO" as "DEMO" | "LIVE",
    phone_number_id: "pn_48372610",
    business_account_id: "act_10293847",
    access_token: "",
    display_phone_number: "+91 98765 43210",
    verify_token: "apex_realestate_verify_secret"
  },

  templates: [
    {
      id: "31a0550e-1dcb-4dc3-9605-b936526455e8",
      organization_id: "org_sri_infra",
      name: "Sri Infra Luxury Villa Offer",
      template_name: "sri_infra_luxury_villa",
      language: "en_US",
      category: "MARKETING",
      status: "APPROVED",
      components: [
        {
          type: "BODY",
          text: "Hi {{1}}, Sri Infra has a new property opportunity available in {{2}}. Exclusive pre-launch discount available this week!"
        }
      ]
    },
    {
      id: "52b0660f-2ecb-5dc4-0716-c947637566f9",
      organization_id: "org_sai_infra",
      name: "Sai Infra Gated Community Launch",
      template_name: "sai_infra_gated_launch",
      language: "en_US",
      category: "MARKETING",
      status: "APPROVED",
      components: [
        {
          type: "BODY",
          text: "Hi {{1}}, Sai Infra is launching premium open plots in {{2}}. Contact us for private site visits!"
        }
      ]
    },
    {
      id: "63c07710-3fdc-6ed5-1827-d0587486770a",
      organization_id: "org_tech_infra",
      name: "Tech Infra Smart Homes Offer",
      template_name: "tech_infra_smart_homes",
      language: "en_US",
      category: "MARKETING",
      status: "APPROVED",
      components: [
        {
          type: "BODY",
          text: "Hi {{1}}, Tech Infra smart 2BHK apartments in {{2}} are now open for booking."
        }
      ]
    }
  ],

  campaigns: [
    {
      id: "cmp_sri_1",
      organization_id: "org_sri_infra",
      name: "Sri Infra Rajahmundry Villa Launch",
      message_type: "custom",
      template_id: null,
      message_body: "Hi {{Name}}, Sri Infra has a new property opportunity available in {{Location}}.",
      media_url: "/sample_property.jpg",
      status: "COMPLETED",
      total_contacts: 4,
      queued_count: 0,
      sent_count: 4,
      delivered_count: 4,
      read_count: 3,
      failed_count: 0,
      skipped_count: 0,
      created_by: "sri_admin",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      started_at: new Date(Date.now() - 3500000).toISOString(),
      completed_at: new Date(Date.now() - 3400000).toISOString()
    },
    {
      id: "cmp_sai_1",
      organization_id: "org_sai_infra",
      name: "Sai Infra Open Plots Blast",
      message_type: "custom",
      template_id: null,
      message_body: "Hi {{Name}}, Sai Infra presents gated plots in {{Location}}.",
      media_url: null,
      status: "COMPLETED",
      total_contacts: 3,
      queued_count: 0,
      sent_count: 3,
      delivered_count: 3,
      read_count: 2,
      failed_count: 0,
      skipped_count: 0,
      created_by: "sai_admin",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      started_at: new Date(Date.now() - 7100000).toISOString(),
      completed_at: new Date(Date.now() - 7000000).toISOString()
    }
  ] as CampaignRecord[],

  recipients: [
    {
      id: "rec_sri_1",
      campaign_id: "cmp_sri_1",
      organization_id: "org_sri_infra",
      phone_number: "+918074418868",
      name: "Ram",
      location: "Rajahmundry",
      message_hash: "hash_sri_1",
      status: "DELIVERED",
      whatsapp_message_id: "wamid.SRI_101",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: "rec_sri_2",
      campaign_id: "cmp_sri_1",
      organization_id: "org_sri_infra",
      phone_number: "+916302042599",
      name: "Chakri",
      location: "Rajahmundry",
      message_hash: "hash_sri_2",
      status: "READ",
      whatsapp_message_id: "wamid.SRI_102",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: "rec_sri_3",
      campaign_id: "cmp_sri_1",
      organization_id: "org_sri_infra",
      phone_number: "+918885397517",
      name: "Pujitha",
      location: "Rajahmundry",
      message_hash: "hash_sri_3",
      status: "DELIVERED",
      whatsapp_message_id: "wamid.SRI_103",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: "rec_sri_4",
      campaign_id: "cmp_sri_1",
      organization_id: "org_sri_infra",
      phone_number: "+919390560625",
      name: "Ramu",
      location: "Kakinada",
      message_hash: "hash_sri_4",
      status: "DELIVERED",
      whatsapp_message_id: "wamid.SRI_104",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    }
  ] as RecipientRecord[],

  contacts: [
    { id: "c_sri_1", organization_id: "org_sri_infra", name: "Ram", phone_number: "+918074418868", location: "Rajahmundry", created_at: new Date().toISOString() },
    { id: "c_sri_2", organization_id: "org_sri_infra", name: "Chakri", phone_number: "+916302042599", location: "Rajahmundry", created_at: new Date().toISOString() },
    { id: "c_sri_3", organization_id: "org_sri_infra", name: "Pujitha", phone_number: "+918885397517", location: "Rajahmundry", created_at: new Date().toISOString() },
    { id: "c_sri_4", organization_id: "org_sri_infra", name: "Ramu", phone_number: "+919390560625", location: "Kakinada", created_at: new Date().toISOString() },
    { id: "c_sai_1", organization_id: "org_sai_infra", name: "Vikram Varma", phone_number: "+919876500001", location: "Visakhapatnam", created_at: new Date().toISOString() },
    { id: "c_tech_1", organization_id: "org_tech_infra", name: "Anil Kumar", phone_number: "+919876500002", location: "Hyderabad", created_at: new Date().toISOString() }
  ] as ContactRecord[],

  imports: {} as Record<string, ImportSession>,
  messageHashes: new Set<string>()
};

const TMP_FILE = path.join("/tmp", "whatsapp_saas_store_persist.json");

export function saveStore() {
  try {
    const data = {
      organizations: STORE.organizations,
      config: STORE.config,
      campaigns: STORE.campaigns,
      recipients: STORE.recipients,
      contacts: STORE.contacts,
      imports: STORE.imports,
      messageHashes: Array.from(STORE.messageHashes)
    };
    fs.writeFileSync(TMP_FILE, JSON.stringify(data), "utf-8");
  } catch (e) {
    // Ignore write errors
  }
}

export function loadStore() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.organizations)) STORE.organizations = data.organizations;
      if (data.config) STORE.config = data.config;
      if (Array.isArray(data.campaigns)) STORE.campaigns = data.campaigns;
      if (Array.isArray(data.recipients)) STORE.recipients = data.recipients;
      if (Array.isArray(data.contacts)) STORE.contacts = data.contacts;
      if (data.imports) STORE.imports = data.imports;
      if (Array.isArray(data.messageHashes)) {
        data.messageHashes.forEach((h: string) => STORE.messageHashes.add(h));
      }
    }
  } catch (e) {}

  if (STORE.recipients && Array.isArray(STORE.recipients)) {
    STORE.recipients.forEach((r) => {
      if (r.message_hash) {
        STORE.messageHashes.add(r.message_hash);
      }
    });
  }
}

// Initial load
loadStore();

export function computeMessageFingerprint(
  organizationId: string,
  phoneNumber: string,
  messageContentOrTemplate: string,
  variables: Record<string, any> = {},
  mediaIdentifier: string = ""
): string {
  const normOrg = (organizationId || "").trim().toLowerCase();
  const normPhone = (phoneNumber || "").trim();
  const normContent = (messageContentOrTemplate || "").trim();
  const sortedVars = JSON.stringify(variables || {});
  const normMedia = (mediaIdentifier || "").trim();

  const raw = `${normOrg}|${normPhone}|${normContent}|${sortedVars}|${normMedia}`;
  return crypto.createHash("sha256").update(raw, "utf-8").digest("hex");
}

export function normalizePhone(raw: string): { normalized: string; is_valid: boolean } {
  let cleaned = (raw || "").replace(/[^\d+]/g, "");
  if (!cleaned) return { normalized: raw, is_valid: false };

  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
      cleaned = "+" + cleaned;
    } else {
      cleaned = "+" + cleaned;
    }
  }

  const isValid = /^\+\d{10,15}$/.test(cleaned);
  return { normalized: cleaned, is_valid: isValid };
}
