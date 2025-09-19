# QR Product Chatbot - Setup Guide

This guide will walk you through setting up the complete QR-driven product chatbot system.

## Prerequisites

- Python 3.10 or later
- Node.js 18+ and npm
- PostgreSQL (local or cloud instance)
- OpenAI API key (or alternative LLM provider)

## Quick Start

### 1. Database Setup

First, create a PostgreSQL database:

```sql
CREATE DATABASE chatbot_db;
CREATE USER chatbot_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your database credentials and OpenAI API key

# Populate sample data
python populate_sample_data.py

# Start FastAPI server
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit if needed (default should work for local development)

# Start React development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Generate QR Codes

```bash
# From the project root directory
python generate_qr.py
```

This will create QR codes in the `qr_codes/` directory for the sample products.

## Environment Configuration

### Backend (.env)

```bash
# Required
DATABASE_URL=postgresql://chatbot_user:your_password@localhost:5432/chatbot_db
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional - for production
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend (.env)

```bash
# Development
REACT_APP_API_URL=http://localhost:8000

# Production
REACT_APP_API_URL=https://your-api-domain.com
```

## Testing the System

1. **Start both servers** (backend on :8000, frontend on :3000)

2. **Test via browser**:
   - Go to `http://localhost:3000`
   - Enter product ID `1` or `2` manually
   - Start chatting!

3. **Test via QR code**:
   - Use your phone's camera or QR scanner app
   - Scan one of the generated QR codes
   - Should redirect to the chat interface

4. **Test the API directly**:
   ```bash
   # Get product info
   curl http://localhost:8000/product/1

   # Send chat message
   curl -X POST http://localhost:8000/chat \
     -H "Content-Type: application/json" \
     -d '{"product_id": 1, "user_message": "What is the battery life?"}'
   ```

## Sample Products

The system comes with two sample products:

1. **UltraBook Pro 15** (ID: 1) - A laptop with detailed specs and FAQs
2. **SmartPhone X Pro** (ID: 2) - A smartphone with comprehensive product info

## Customization

### Adding New Products

1. **Via Database**:
   - Connect to your PostgreSQL database
   - Insert into the `products` and `faqs` tables

2. **Via Script**:
   - Modify `populate_sample_data.py`
   - Add your product data
   - Run the script

3. **Via Admin Interface** (Future Enhancement):
   - Build an admin panel for product management

### Modifying LLM Integration

Edit `backend/llm_service.py`:

- Change the model (e.g., `gpt-4`, `gpt-3.5-turbo`)
- Modify the prompt template
- Add support for other LLM providers (Anthropic, Azure OpenAI, etc.)

### Customizing the Chat UI

Edit `frontend/src/components/ChatInterface.js` and `frontend/src/App.css`:

- Change colors, fonts, layout
- Add new features (file upload, voice input, etc.)
- Modify the welcome message

## Production Deployment

### Backend (FastAPI)

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (React)

```bash
# Build for production
npm run build

# Serve with nginx, Apache, or any static file server
```

### Database

- Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Update `DATABASE_URL` in production environment

### Environment Variables

Set these in your production environment:

```bash
DATABASE_URL=your_production_database_url
OPENAI_API_KEY=your_production_openai_key
CORS_ORIGINS=https://yourdomain.com
```

## Future Enhancements

### RAG/Vector Database Migration

To upgrade to semantic search:

1. **Add vector database**:
   ```bash
   pip install pgvector  # or chroma-db, pinecone-client
   ```

2. **Generate embeddings**:
   ```python
   from openai import OpenAI
   client = OpenAI()

   def generate_embeddings(text):
       response = client.embeddings.create(
           model="text-embedding-ada-002",
           input=text
       )
       return response.data[0].embedding
   ```

3. **Modify the chat endpoint**:
   - Replace direct database queries with semantic search
   - Retrieve relevant product info based on query similarity

### Additional Features

- **User Analytics**: Track popular questions and products
- **Admin Dashboard**: Manage products, view chat logs
- **Multi-language Support**: Translate product info and responses
- **Voice Interface**: Add speech-to-text and text-to-speech
- **Image Recognition**: Let users upload product photos for identification

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **CORS Error**:
   - Check `CORS_ORIGINS` in backend
   - Verify frontend URL matches allowed origins

3. **OpenAI API Error**:
   - Verify API key is correct
   - Check you have sufficient credits
   - Ensure API key has proper permissions

4. **QR Scanner Not Working**:
   - Enable camera permissions in browser
   - Use HTTPS for production (camera requires secure context)
   - Try different QR scanner libraries if needed

### Development Tips

- Use browser dev tools to debug API calls
- Check FastAPI docs at `http://localhost:8000/docs`
- Monitor backend logs for error details
- Test with different product IDs and questions

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Examine the sample data and test with known product IDs
4. Open an issue with detailed error messages and steps to reproduce