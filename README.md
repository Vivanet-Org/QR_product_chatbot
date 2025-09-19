# QR-Based Product Chatbot

A product information chatbot where customers scan a QR code on a product to instantly open a chat window and get automated, context-aware answers to product queries.

---

## **Project Overview**

This solution streamlines product support and FAQ delivery at the point of sale or use. Each product displays a QR code; on scanning, users are directed to a chatbot interface customized for that specific product. All answers are generated using a prompt-based LLM approach (no external vector database or complex retrieval pipeline required for initial deployment).

---

## **Tech Stack**

- **Frontend:** React (works for web and PWA)
- **Backend:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL (with SQLAlchemy for ORM)
- **QR Generation:** Python `qrcode` or any generator tool
- **LLM:** Prompt-based API integration (OpenAI, local LM Studio, or Anthropic Claude)
- **(Future) RAG/Vector DB upgrade:** Design is compatible for later migration

---

## **Features**

- QR code on every product links customers directly to their product’s chat window
- Chatbot fetches all product details and FAQs using product ID from the QR
- Combines product information and user questions to create detailed prompts for the LLM, yielding accurate, contextual answers
- Modular, production-ready React frontend with integrated chat UI and QR scan
- Easy API endpoints for product retrieval and chat processing

---

## **How It Works**

1. **Product Setup:**
   - Each product is assigned a QR code that encodes a deep link (e.g. `https://yourdomain.com/?product_id=123`)
   - All product data (name, specs, FAQs, etc.) is stored in PostgreSQL

2. **User Flow:**
   - User scans QR → Chat UI auto-loads with product context
   - User asks a question → Chat UI sends the product ID and question to FastAPI backend
   - Backend fetches all relevant product data
   - Backend assembles a prompt: injects the product info and user’s question
   - Prompt is sent to LLM, which replies with contextual, trustworthy answer
   - Answer is displayed in the chat interface

---

## **API Overview**

- `GET /product/{product_id}`  
  Fetch all key info for a given product

- `POST /chat`  
  - Input: `{ product_id, user_message }`
  - Output: `{ answer }` – reply from LLM using context-rich prompt

---

## **Running the Project**

### Prerequisites

- Python 3.10 or later, Node.js 18+
- PostgreSQL running locally or in the cloud

### Backend FastAPI

1. **Install dependencies:**
    ```
    pip install fastapi[all] sqlalchemy psycopg2-binary
    ```
2. **Set up PostgreSQL:**  
   Create tables/models for Products and FAQs  
3. **Run FastAPI server:**  
    ```
    uvicorn api:app --reload
    ```

### Frontend React

1. **Install frontend dependencies:**
    ```
    npm install
    ```
2. **Start React dev server:**
    ```
    npm start
    ```

### QR Code Generation

- Generate QR codes with Python or any tool:
    ```
    import qrcode
    qrcode.make("https://yourdomain.com/?product_id=123").save("product123.png")
    ```

---

## **Future Improvements**

- Easily migrate to RAG (Retrieval-Augmented Generation) by integrating embeddings and a vector DB (e.g., with pgvector or Chroma)
- Add user analytics and feedback collection
- Add authentication or admin dashboard for product management

---

## **License**

This project is open source—customize and extend as needed!

---

## **Contact**

For questions or contributions, please open an issue or reach out to the project maintainer.

---

*Built for fast, clear product support—at the point of discovery.*
