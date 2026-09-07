import crypto from "crypto";

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

// In-Memory Data Store across Serverless Invocations
export const STORE = {
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
      organization_id: "org_apex_realestate",
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
      organization_id: "org_apex_realestate",
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
  ],
  campaigns: [
    {
      id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
      organization_id: "org_apex_realestate",
      name: "Gachibowli Luxury Villas Prospect Blast",
      message_type: "custom",
      template_id: null,
      status: "COMPLETED",
      total_contacts: 3,
      queued_count: 0,
      sent_count: 3,
      delivered_count: 3,
      read_count: 2,
      failed_count: 0,
      skipped_count: 0,
      created_by: "user_demo",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      started_at: new Date(Date.now() - 3500000).toISOString(),
      completed_at: new Date(Date.now() - 3400000).toISOString()
    }
  ] as CampaignRecord[],
  recipients: [
    {
      id: "rec_1",
      campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
      organization_id: "org_apex_realestate",
      phone_number: "+919876543210",
      name: "Ravi Kumar",
      location: "Gachibowli, Hyderabad",
      message_hash: "hash_demo_1",
      status: "DELIVERED",
      whatsapp_message_id: "wamid.HBgM12345678",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: "rec_2",
      campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
      organization_id: "org_apex_realestate",
      phone_number: "+919876543211",
      name: "Priya Sharma",
      location: "Jubilee Hills, Hyderabad",
      message_hash: "hash_demo_2",
      status: "READ",
      whatsapp_message_id: "wamid.HBgM12345679",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: "rec_3",
      campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
      organization_id: "org_apex_realestate",
      phone_number: "+919876543212",
      name: "Suresh Reddy",
      location: "Banjara Hills, Hyderabad",
      message_hash: "hash_demo_3",
      status: "DELIVERED",
      whatsapp_message_id: "wamid.HBgM12345680",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    }
  ] as RecipientRecord[],
  contacts: [
    {
      id: "c1",
      organization_id: "org_apex_realestate",
      name: "Ravi Kumar",
      phone_number: "+919876543210",
      location: "Gachibowli, Hyderabad",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "c2",
      organization_id: "org_apex_realestate",
      name: "Priya Sharma",
      phone_number: "+919876543211",
      location: "Jubilee Hills, Hyderabad",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "c3",
      organization_id: "org_apex_realestate",
      name: "Suresh Reddy",
      phone_number: "+919876543212",
      location: "Banjara Hills, Hyderabad",
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ] as ContactRecord[],
  imports: {} as Record<string, ImportSession>,
  // SHA-256 fingerprint ledger for 100% duplicate protection
  messageHashes: new Set<string>()
};

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
