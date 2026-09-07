import os
import pandas as pd
from sqlalchemy import select
from core.database import SyncSessionLocal, Base, sync_engine, set_sync_tenant_rls_context
from core.security import get_password_hash
from models.schema import Organization, User, Contact, MessageTemplate, WhatsAppAccount

def run_seed():
    print("Creating database tables if not present...")
    Base.metadata.create_all(bind=sync_engine)

    session = SyncSessionLocal()
    try:
        # 1. Create Organization
        org = session.query(Organization).filter(Organization.slug == "apex-realestate").first()
        if not org:
            org = Organization(
                name="Apex Real Estate Solutions",
                slug="apex-realestate"
            )
            session.add(org)
            session.commit()
            session.refresh(org)
            print(f"Created Demo Organization: {org.name} ({org.id})")

        # Set RLS context for seed execution
        set_sync_tenant_rls_context(session, org.id)

        # 2. Create Admin User
        user = session.query(User).filter(User.email == "admin@apexrealestate.com").first()
        if not user:
            user = User(
                organization_id=org.id,
                name="Vikram Sharma",
                email="admin@apexrealestate.com",
                hashed_password=get_password_hash("password123"),
                role="owner"
            )
            session.add(user)
            print("Created Demo Admin User: admin@apexrealestate.com / password123")

        # 3. Create WhatsApp Account
        wa = session.query(WhatsAppAccount).filter(WhatsAppAccount.organization_id == org.id).first()
        if not wa:
            wa = WhatsAppAccount(
                organization_id=org.id,
                business_account_id="100000000000000",
                phone_number_id="200000000000000",
                display_phone_number="+91 98765 43210",
                encrypted_access_token="mock_encrypted_access_token"
            )
            session.add(wa)
            print("Created Demo WhatsApp Business Account")

        # 4. Create Approved Templates
        templates = [
            {
                "name": "Luxury Property Launch 2026",
                "template_name": "real_estate_launch",
                "category": "MARKETING",
                "components": [
                    {
                        "type": "BODY",
                        "text": "Hi {{1}}, we are excited to launch modern 3BHK luxury apartments in {{2}}. Exclusive pre-launch discount available this week. Would you like to schedule a private site visit?"
                    }
                ]
            },
            {
                "name": "Commercial Site Inquiry Followup",
                "template_name": "property_inquiry_followup",
                "category": "UTILITY",
                "components": [
                    {
                        "type": "BODY",
                        "text": "Hello {{1}}, following up on your inquiry for prime commercial office space in {{2}}. Let us know if you have 10 mins for a quick call today."
                    }
                ]
            },
            {
                "name": "Default Hello World Template",
                "template_name": "hello_world",
                "category": "UTILITY",
                "components": [
                    {
                        "type": "BODY",
                        "text": "Hello {{1}}, greetings from Apex Real Estate Solutions!"
                    }
                ]
            }
        ]

        for t in templates:
            existing = session.query(MessageTemplate).filter(
                MessageTemplate.organization_id == org.id,
                MessageTemplate.template_name == t["template_name"]
            ).first()
            if not existing:
                session.add(MessageTemplate(
                    organization_id=org.id,
                    name=t["name"],
                    template_name=t["template_name"],
                    category=t["category"],
                    status="APPROVED",
                    components=t["components"]
                ))

        # 5. Create Sample Directory Contacts
        sample_contacts = [
            {"name": "Ravi Kumar", "phone_number": "+919876543210", "location": "Gachibowli, Hyderabad"},
            {"name": "Ananya Reddy", "phone_number": "+919876543211", "location": "Jubilee Hills, Hyderabad"},
            {"name": "Suresh Verma", "phone_number": "+919876543212", "location": "Banjara Hills, Hyderabad"},
            {"name": "Priya Sharma", "phone_number": "+919876543213", "location": "Hitec City, Hyderabad"},
            {"name": "Rajesh Patel", "phone_number": "+919876543214", "location": "Kondapur, Hyderabad"}
        ]

        for c in sample_contacts:
            existing_c = session.query(Contact).filter(
                Contact.organization_id == org.id,
                Contact.phone_number == c["phone_number"]
            ).first()
            if not existing_c:
                session.add(Contact(
                    organization_id=org.id,
                    name=c["name"],
                    phone_number=c["phone_number"],
                    location=c["location"]
                ))

        session.commit()
        print("Database seed completed successfully!")

        # 6. Generate Sample Excel dataset file for local testing
        uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        sample_excel_path = os.path.join(uploads_dir, "sample_realestate_prospects.xlsx")
        excel_data = [
            {"Customer Name": "Ravi Kumar", "Mobile Number": "9876543210", "Location": "Gachibowli, Hyderabad"},
            {"Customer Name": "Ananya Reddy", "Mobile Number": "+919876543211", "Location": "Jubilee Hills, Hyderabad"},
            {"Customer Name": "Suresh Verma", "Mobile Number": "919876543212", "Location": "Banjara Hills, Hyderabad"},
            {"Customer Name": "Priya Sharma", "Mobile Number": "98765 43213", "Location": "Hitec City, Hyderabad"},
            {"Customer Name": "Rajesh Patel", "Mobile Number": "9876543214", "Location": "Kondapur, Hyderabad"},
            {"Customer Name": "Kiran Rao", "Mobile Number": "9876543215", "Location": "Madhapur, Hyderabad"},
            {"Customer Name": "Venkat Raju", "Mobile Number": "9876543216", "Location": "Kukatpally, Hyderabad"},
            {"Customer Name": "Sneha Kulkarni", "Mobile Number": "INVALID_PHONE", "Location": "Miyapur, Hyderabad"},  # Invalid
            {"Customer Name": "Ravi Kumar (Dup)", "Mobile Number": "9876543210", "Location": "Gachibowli"},  # Intra-file duplicate
            {"Customer Name": "Deepak Mehta", "Mobile Number": "9876543217", "Location": "Financial District"}
        ]
        df_sample = pd.DataFrame(excel_data)
        df_sample.to_excel(sample_excel_path, index=False)
        print(f"Generated sample Excel file at: {sample_excel_path}")

    except Exception as exc:
        session.rollback()
        print(f"Error seeding database: {exc}")
        raise exc
    finally:
        session.close()

if __name__ == "__main__":
    run_seed()
