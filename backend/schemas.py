from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str
    category: Optional[str]

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    name: str
    short_description: Optional[str]
    detailed_specs: Optional[str]
    warranty_info: Optional[str]
    category: Optional[str]
    price: Optional[str]
    manufacturer: Optional[str]
    model_number: Optional[str]
    faqs: List[FAQResponse]

    model_config = {"protected_namespaces": (), "from_attributes": True}

class ChatRequest(BaseModel):
    product_id: int
    user_message: str

class ChatResponse(BaseModel):
    answer: str
    product_name: str