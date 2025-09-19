from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Product(Base):
    """
    Product model containing all product information
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    short_description = Column(Text)
    detailed_specs = Column(Text)  # JSON or detailed text specs
    warranty_info = Column(Text)
    category = Column(String(100))
    price = Column(String(50))  # Can include currency symbol
    manufacturer = Column(String(100))
    model_number = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to FAQs
    faqs = relationship("FAQ", back_populates="product")

class FAQ(Base):
    """
    FAQ model for product-specific questions and answers
    """
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100))  # e.g., "warranty", "specs", "usage"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to product
    product = relationship("Product", back_populates="faqs")