from sqlalchemy.orm import Session
from database import SessionLocal, create_tables
from models import Product, FAQ

def populate_sample_data():
    """Populate database with sample products and FAQs"""
    create_tables()

    db: Session = SessionLocal()

    try:
        # Check if data already exists
        existing_product = db.query(Product).first()
        if existing_product:
            print("Sample data already exists. Skipping population.")
            return

        # Sample Product 1
        product1 = Product(
            name="UltraBook Pro 15",
            short_description="High-performance laptop for professionals",
            detailed_specs="Intel i7-12700H, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6\" 4K IPS display, NVIDIA RTX 3060, Wi-Fi 6, Thunderbolt 4",
            warranty_info="2-year limited warranty covering manufacturing defects. Does not cover physical damage, liquid damage, or normal wear and tear.",
            category="Laptops",
            price="$1,299.99",
            manufacturer="TechCorp",
            model_number="UBP15-2024"
        )

        # Sample FAQs for Product 1
        faqs1 = [
            FAQ(
                question="What's the battery life?",
                answer="Up to 10 hours of typical usage including web browsing, document editing, and video streaming. Gaming and intensive tasks will reduce battery life to 4-6 hours.",
                category="specs"
            ),
            FAQ(
                question="Does it support external monitors?",
                answer="Yes, supports up to two 4K external monitors via USB-C/Thunderbolt 4 ports. You can also use the HDMI port for a third display.",
                category="specs"
            ),
            FAQ(
                question="What's covered under warranty?",
                answer="Manufacturing defects, hardware failures, screen defects, and keyboard/trackpad issues. Physical damage, liquid damage, and software issues are not covered.",
                category="warranty"
            ),
            FAQ(
                question="Can I upgrade the RAM and storage?",
                answer="The laptop has two RAM slots supporting up to 32GB total. Storage can be upgraded with an additional M.2 NVMe SSD slot available.",
                category="specs"
            ),
            FAQ(
                question="What operating system does it come with?",
                answer="Ships with Windows 11 Pro pre-installed. Linux compatibility is excellent with all hardware drivers available.",
                category="software"
            )
        ]

        db.add(product1)
        db.commit()
        db.refresh(product1)

        for faq in faqs1:
            faq.product_id = product1.id
            db.add(faq)

        # Sample Product 2
        product2 = Product(
            name="SmartPhone X Pro",
            short_description="Advanced smartphone with professional camera system",
            detailed_specs="6.7\" OLED display, A16 Bionic chip, 256GB storage, Triple camera system (48MP main, 12MP ultra-wide, 12MP telephoto), 5G connectivity, IP68 water resistance",
            warranty_info="1-year limited warranty covering manufacturing defects. AppleCare+ available for extended coverage including accidental damage.",
            category="Smartphones",
            price="$999.99",
            manufacturer="TechCorp",
            model_number="SPX-PRO-2024"
        )

        # Sample FAQs for Product 2
        faqs2 = [
            FAQ(
                question="Is it waterproof?",
                answer="The phone has IP68 water resistance rating, meaning it can withstand submersion in up to 6 meters of water for 30 minutes. However, water damage is not covered under warranty.",
                category="specs"
            ),
            FAQ(
                question="How long does the battery last?",
                answer="Up to 28 hours of video playback, 22 hours of streaming, or 95 hours of audio playback. Typical daily usage provides 1-2 days of battery life.",
                category="specs"
            ),
            FAQ(
                question="Does it support wireless charging?",
                answer="Yes, supports Qi wireless charging up to 15W, MagSafe wireless charging up to 15W, and reverse wireless charging for accessories.",
                category="specs"
            ),
            FAQ(
                question="What's included in the box?",
                answer="Phone, USB-C to Lightning cable, documentation. Power adapter sold separately to reduce environmental impact.",
                category="general"
            )
        ]

        db.add(product2)
        db.commit()
        db.refresh(product2)

        for faq in faqs2:
            faq.product_id = product2.id
            db.add(faq)

        db.commit()
        print(f"Created products with IDs: {product1.id}, {product2.id}")
        print("Sample data populated successfully!")

    except Exception as e:
        print(f"Error populating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_sample_data()