from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import get_db, create_tables
from models import Product, FAQ
from schemas import ProductResponse, ChatRequest, ChatResponse
from llm_service import LLMService

app = FastAPI(title="QR Product Chatbot API", version="1.0.0")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:3000"  # Container name in Docker
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM service
llm_service = LLMService()

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

@app.get("/product/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get all relevant information for a given product ID
    """
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Process chat request with product context and return LLM response
    """
    # Fetch product data
    product = db.query(Product).filter(Product.id == request.product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Convert product data to dict for prompt creation
    product_data = {
        "name": product.name,
        "category": product.category,
        "manufacturer": product.manufacturer,
        "model_number": product.model_number,
        "price": product.price,
        "short_description": product.short_description,
        "detailed_specs": product.detailed_specs,
        "warranty_info": product.warranty_info,
        "faqs": [
            {
                "question": faq.question,
                "answer": faq.answer,
                "category": faq.category
            }
            for faq in product.faqs
        ]
    }

    # Create context-rich prompt with language support
    prompt, detected_language = llm_service.create_context_prompt(
        product_data,
        request.user_message,
        response_language=request.language
    )

    # Get LLM response in the detected/requested language
    answer = await llm_service.get_response(prompt, detected_language)

    return ChatResponse(
        answer=answer,
        product_name=product.name,
        detected_language=detected_language
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

