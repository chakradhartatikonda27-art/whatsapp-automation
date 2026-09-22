import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface UserRecord {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Campaign Manager" | "Sales User" | "Viewer";
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  organization_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  owner_name?: string;
  email?: string;
  mobile_number?: string;
  category?: string;
  website?: string;
  address?: string;
  gst_number?: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  plan: {
    id: string;
    name: string;
    price: number;
    monthly_messages: number;
    rate_per_meta_msg: number;
    rate_per_platform_msg: number;
    status: string;
    next_renewal: string;
  };
  wallet: {
    balance: number;
    currency: string;
    total_credits: number;
    used_credits: number;
  };
  whatsapp_config: {
    mode: "DEMO" | "LIVE";
    phone_number_id: string;
    business_account_id: string;
    access_token: string;
    display_phone_number: string;
    verify_token: string;
    is_embedded_connected?: boolean;
    connected_at?: string;
  };
  billing_history: Array<{
    id: string;
    amount: number;
    type: "PLAN_PAYMENT" | "TOPUP" | "CAMPAIGN_DISPATCH";
    description: string;
    date: string;
    reference?: string;
  }>;
  users?: UserRecord[];
  audit_logs?: AuditLogRecord[];
}

export interface ContactRecord {
  id: string;
  organization_id: string;
  name: string;
  phone_number: string;
  location?: string;
  tags?: string[];
  opt_out?: boolean;
  opt_out_at?: string;
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
  estimated_cost?: number;
  processed_fingerprints?: string[];
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

export const SAAS_PLANS = [
  {
    id: "plan_starter",
    name: "Starter",
    price: 2999,
    monthly_messages: 5000,
    rate_per_meta_msg: 0.78,
    rate_per_platform_msg: 0.10,
    description: "Ideal for small real estate agencies & individual brokers."
  },
  {
    id: "plan_growth",
    name: "Growth",
    price: 5999,
    monthly_messages: 10000,
    rate_per_meta_msg: 0.75,
    rate_per_platform_msg: 0.08,
    description: "Best for growing real estate companies with active monthly lead blasts."
  },
  {
    id: "plan_business",
    name: "Business",
    price: 12999,
    monthly_messages: 25000,
    rate_per_meta_msg: 0.70,
    rate_per_platform_msg: 0.05,
    description: "Designed for high-volume developers with multiple active property projects."
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: 29999,
    monthly_messages: 100000,
    rate_per_meta_msg: 0.65,
    rate_per_platform_msg: 0.03,
    description: "Custom enterprise volume with dedicated account manager & SLA support."
  }
];

// Global In-Memory Multi-Tenant Store
export const STORE = {
  organizations: [
    {
      id: "org_sri_infra",
      name: "Sri Infra",
      slug: "sri-infra",
      owner_name: "Srikanth Verma",
      email: "admin@sriinfra.com",
      mobile_number: "+91 98765 11111",
      category: "Real Estate Developer",
      website: "https://sriinfra.com",
      address: "Rajahmundry, AP",
      gst_number: "37AAACS9999A1Z1",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      plan: {
        id: "plan_growth",
        name: "Growth",
        price: 5999,
        monthly_messages: 10000,
        rate_per_meta_msg: 0.75,
        rate_per_platform_msg: 0.08,
        status: "ACTIVE",
        next_renewal: "2026-10-15"
      },
      wallet: {
        balance: 5200,
        currency: "INR",
        total_credits: 10000,
        used_credits: 8450
      },
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_sri_101",
        business_account_id: "act_sri_201",
        access_token: "",
        display_phone_number: "+91 98765 11111",
        verify_token: "sri_infra_verify_secret",
        is_embedded_connected: true,
        connected_at: new Date(Date.now() - 28 * 86400000).toISOString()
      },
      billing_history: [
        {
          id: "bill_sri_1",
          amount: 5999,
          type: "PLAN_PAYMENT",
          description: "Growth Plan Monthly Subscription (10,000 Messages)",
          date: new Date(Date.now() - 30 * 86400000).toISOString(),
          reference: "INV-2026-001"
        },
        {
          id: "bill_sri_2",
          amount: 2500,
          type: "TOPUP",
          description: "Wallet Credit Recharge (₹2,500)",
          date: new Date(Date.now() - 10 * 86400000).toISOString(),
          reference: "PAY-2026-882"
        }
      ],
      users: [
        { id: "usr_sri_1", organization_id: "org_sri_infra", name: "Srikanth Verma", email: "admin@sriinfra.com", role: "Owner", created_at: new Date().toISOString() },
        { id: "usr_sri_2", organization_id: "org_sri_infra", name: "Kiran Kumar", email: "kiran@sriinfra.com", role: "Campaign Manager", created_at: new Date().toISOString() }
      ],
      audit_logs: [
        { id: "log_sri_1", organization_id: "org_sri_infra", user_name: "Srikanth Verma", action: "WhatsApp Connected", details: "Connected WhatsApp Business Line (+91 98765 11111) via Meta Embedded Flow", timestamp: new Date(Date.now() - 28 * 86400000).toISOString() },
        { id: "log_sri_2", organization_id: "org_sri_infra", user_name: "Kiran Kumar", action: "Campaign Launched", details: "Launched Rajahmundry Villa Launch campaign (4 recipients)", timestamp: new Date(Date.now() - 3600000).toISOString() }
      ]
    },
    {
      id: "org_sai_infra",
      name: "Sai Infra",
      slug: "sai-infra",
      owner_name: "Sai Ram",
      email: "admin@saiinfra.com",
      mobile_number: "+91 98765 22222",
      category: "Gated Community Projects",
      website: "https://saiinfra.com",
      address: "Visakhapatnam, AP",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      plan: {
        id: "plan_starter",
        name: "Starter",
        price: 2999,
        monthly_messages: 5000,
        rate_per_meta_msg: 0.78,
        rate_per_platform_msg: 0.10,
        status: "ACTIVE",
        next_renewal: "2026-10-20"
      },
      wallet: {
        balance: 3100,
        currency: "INR",
        total_credits: 5000,
        used_credits: 1900
      },
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_sai_102",
        business_account_id: "act_sai_202",
        access_token: "",
        display_phone_number: "+91 98765 22222",
        verify_token: "sai_infra_verify_secret",
        is_embedded_connected: true,
        connected_at: new Date(Date.now() - 24 * 86400000).toISOString()
      },
      billing_history: [
        {
          id: "bill_sai_1",
          amount: 2999,
          type: "PLAN_PAYMENT",
          description: "Starter Plan Monthly Subscription (5,000 Messages)",
          date: new Date(Date.now() - 25 * 86400000).toISOString(),
          reference: "INV-2026-002"
        }
      ],
      users: [
        { id: "usr_sai_1", organization_id: "org_sai_infra", name: "Sai Ram", email: "admin@saiinfra.com", role: "Owner", created_at: new Date().toISOString() }
      ],
      audit_logs: [
        { id: "log_sai_1", organization_id: "org_sai_infra", user_name: "Sai Ram", action: "Campaign Launched", details: "Launched Open Plots Blast campaign", timestamp: new Date(Date.now() - 7200000).toISOString() }
      ]
    },
    {
      id: "org_tech_infra",
      name: "Tech Infra",
      slug: "tech-infra",
      owner_name: "Taran Kumar",
      email: "admin@techinfra.com",
      mobile_number: "+91 98765 33333",
      category: "Commercial Property",
      website: "https://techinfra.com",
      address: "Hyderabad, TS",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      plan: {
        id: "plan_business",
        name: "Business",
        price: 12999,
        monthly_messages: 25000,
        rate_per_meta_msg: 0.70,
        rate_per_platform_msg: 0.05,
        status: "ACTIVE",
        next_renewal: "2026-10-25"
      },
      wallet: {
        balance: 14500,
        currency: "INR",
        total_credits: 25000,
        used_credits: 10500
      },
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_tech_103",
        business_account_id: "act_tech_203",
        access_token: "",
        display_phone_number: "+91 98765 33333",
        verify_token: "tech_infra_verify_secret",
        is_embedded_connected: true,
        connected_at: new Date(Date.now() - 19 * 86400000).toISOString()
      },
      billing_history: [
        {
          id: "bill_tech_1",
          amount: 12999,
          type: "PLAN_PAYMENT",
          description: "Business Plan Monthly Subscription (25,000 Messages)",
          date: new Date(Date.now() - 20 * 86400000).toISOString(),
          reference: "INV-2026-003"
        }
      ],
      users: [
        { id: "usr_tech_1", organization_id: "org_tech_infra", name: "Taran Kumar", email: "admin@techinfra.com", role: "Owner", created_at: new Date().toISOString() }
      ],
      audit_logs: []
    },
    {
      id: "org_abc_properties",
      name: "ABC Properties",
      slug: "abc-properties",
      owner_name: "Anand Sharma",
      email: "admin@abcproperties.com",
      mobile_number: "+91 98765 44444",
      category: "Residential Agency",
      website: "https://abcproperties.com",
      address: "Vijayawada, AP",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      plan: {
        id: "plan_starter",
        name: "Starter",
        price: 2999,
        monthly_messages: 5000,
        rate_per_meta_msg: 0.78,
        rate_per_platform_msg: 0.10,
        status: "ACTIVE",
        next_renewal: "2026-10-30"
      },
      wallet: {
        balance: 2400,
        currency: "INR",
        total_credits: 5000,
        used_credits: 2600
      },
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_abc_104",
        business_account_id: "act_abc_204",
        access_token: "",
        display_phone_number: "+91 98765 44444",
        verify_token: "abc_properties_verify_secret",
        is_embedded_connected: true,
        connected_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      billing_history: [
        {
          id: "bill_abc_1",
          amount: 2999,
          type: "PLAN_PAYMENT",
          description: "Starter Plan Monthly Subscription (5,000 Messages)",
          date: new Date(Date.now() - 15 * 86400000).toISOString(),
          reference: "INV-2026-004"
        }
      ],
      users: [
        { id: "usr_abc_1", organization_id: "org_abc_properties", name: "Anand Sharma", email: "admin@abcproperties.com", role: "Owner", created_at: new Date().toISOString() }
      ],
      audit_logs: []
    },
    {
      id: "org_apex_realestate",
      name: "Apex Real Estate",
      slug: "apex-realestate",
      owner_name: "Vikram Sharma",
      email: "admin@apexrealestate.com",
      mobile_number: "+91 98765 43210",
      category: "Luxury Apartments",
      website: "https://apexrealestate.com",
      address: "Hyderabad, TS",
      status: "ACTIVE",
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      plan: {
        id: "plan_growth",
        name: "Growth",
        price: 5999,
        monthly_messages: 10000,
        rate_per_meta_msg: 0.75,
        rate_per_platform_msg: 0.08,
        status: "ACTIVE",
        next_renewal: "2026-10-05"
      },
      wallet: {
        balance: 6800,
        currency: "INR",
        total_credits: 10000,
        used_credits: 3200
      },
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_48372610",
        business_account_id: "act_10293847",
        access_token: "",
        display_phone_number: "+91 98765 43210",
        verify_token: "apex_realestate_verify_secret",
        is_embedded_connected: true,
        connected_at: new Date(Date.now() - 38 * 86400000).toISOString()
      },
      billing_history: [
        {
          id: "bill_apex_1",
          amount: 5999,
          type: "PLAN_PAYMENT",
          description: "Growth Plan Monthly Subscription (10,000 Messages)",
          date: new Date(Date.now() - 40 * 86400000).toISOString(),
          reference: "INV-2026-000"
        }
      ],
      users: [
        { id: "usr_apex_1", organization_id: "org_apex_realestate", name: "Vikram Sharma", email: "admin@apexrealestate.com", role: "Owner", created_at: new Date().toISOString() }
      ],
      audit_logs: []
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
      completed_at: new Date(Date.now() - 3400000).toISOString(),
      estimated_cost: 3.32
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
      completed_at: new Date(Date.now() - 7000000).toISOString(),
      estimated_cost: 2.64
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
    { id: "c_sri_1", organization_id: "org_sri_infra", name: "Ram", phone_number: "+918074418868", location: "Rajahmundry", tags: ["Villa", "Buyer", "Interested"], opt_out: false, created_at: new Date().toISOString() },
    { id: "c_sri_2", organization_id: "org_sri_infra", name: "Chakri", phone_number: "+916302042599", location: "Rajahmundry", tags: ["Investor", "Apartment"], opt_out: false, created_at: new Date().toISOString() },
    { id: "c_sri_3", organization_id: "org_sri_infra", name: "Pujitha", phone_number: "+918885397517", location: "Rajahmundry", tags: ["Buyer", "Follow-up"], opt_out: false, created_at: new Date().toISOString() },
    { id: "c_sri_4", organization_id: "org_sri_infra", name: "Ramu", phone_number: "+919390560625", location: "Kakinada", tags: ["Plot", "Investor"], opt_out: false, created_at: new Date().toISOString() },
    { id: "c_sai_1", organization_id: "org_sai_infra", name: "Vikram Varma", phone_number: "+919876500001", location: "Visakhapatnam", tags: ["Plot", "Buyer"], opt_out: false, created_at: new Date().toISOString() },
    { id: "c_tech_1", organization_id: "org_tech_infra", name: "Anil Kumar", phone_number: "+919876500002", location: "Hyderabad", tags: ["Apartment", "Interested"], opt_out: false, created_at: new Date().toISOString() }
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

  // Ensure default plans, wallets, users, and audit logs on all loaded organizations
  if (STORE.organizations && Array.isArray(STORE.organizations)) {
    STORE.organizations.forEach((org) => {
      if (!org.plan) {
        org.plan = {
          id: "plan_growth",
          name: "Growth",
          price: 5999,
          monthly_messages: 10000,
          rate_per_meta_msg: 0.75,
          rate_per_platform_msg: 0.08,
          status: "ACTIVE",
          next_renewal: "2026-10-15"
        };
      }
      if (!org.wallet) {
        org.wallet = {
          balance: 5000,
          currency: "INR",
          total_credits: org.plan.monthly_messages || 10000,
          used_credits: 1200
        };
      }
      if (!org.users || org.users.length === 0) {
        org.users = [
          { id: `usr_${org.id}_1`, organization_id: org.id, name: org.owner_name || "Business Owner", email: org.email || `admin@${org.slug}.com`, role: "Owner", created_at: new Date().toISOString() }
        ];
      }
      if (!org.audit_logs) {
        org.audit_logs = [
          { id: `log_${org.id}_init`, organization_id: org.id, user_name: org.owner_name || "System", action: "Account Activated", details: `Account activated under ${org.plan.name} Plan`, timestamp: org.created_at || new Date().toISOString() }
        ];
      }
      if (!org.billing_history) {
        org.billing_history = [
          {
            id: `bill_${org.id}_init`,
            amount: org.plan.price,
            type: "PLAN_PAYMENT",
            description: `${org.plan.name} Plan Monthly Subscription (${org.plan.monthly_messages.toLocaleString()} Messages)`,
            date: org.created_at || new Date().toISOString(),
            reference: `INV-2026-${Math.floor(100 + Math.random() * 900)}`
          }
        ];
      }
    });
  }

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
  const phoneRes = normalizePhone(phoneNumber);
  const normPhone = phoneRes.normalized;
  const normContent = (messageContentOrTemplate || "").trim().toLowerCase().replace(/\s+/g, " ");
  const normMedia = (mediaIdentifier || "").trim();

  // Core Rule: Same Business + Same Contact Phone + Same Message Content/Template = Duplicate
  const raw = `${normOrg}|${normPhone}|${normContent}|${normMedia}`;
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
