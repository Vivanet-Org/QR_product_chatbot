# Docker Setup Guide for QR-Based Product Chatbot

This guide explains how to run the QR-Based Product Chatbot using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed on your system
- Docker Compose (included with Docker Desktop)
- At least one LLM API key (Groq, OpenAI, or Anthropic)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd chatbot
```

### 2. Configure Environment Variables

Copy the sample environment file and edit it with your API keys:

```bash
cp .env.docker .env
```

Edit `.env` and add your LLM API key:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
# Or use OpenAI/Anthropic by uncommenting and adding keys
```

### 3. Build and Run the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 4. Generate QR Codes (Optional)

To generate QR codes for products:

```bash
# Run the QR generator service
docker-compose --profile tools run qr-generator
```

QR codes will be saved in the `qr_codes` directory.

## Service Architecture

The Docker setup includes the following services:

1. **PostgreSQL Database** (`postgres`)
   - Stores product information and chat history
   - Data persists in a Docker volume
   - Port: 5432

2. **FastAPI Backend** (`backend`)
   - Handles API requests and LLM integration
   - Auto-reloads on code changes
   - Port: 8000

3. **React Frontend** (`frontend`)
   - Serves the web interface
   - Built with multi-stage Docker for production optimization
   - Port: 3000 (served via nginx)

4. **QR Code Generator** (`qr-generator`)
   - Optional service for generating product QR codes
   - Run on demand using the `tools` profile

## Common Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build frontend

# Rebuild and restart
docker-compose up --build
```

### Database Management
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U chatbot_user -d chatbot_db

# Backup database
docker-compose exec postgres pg_dump -U chatbot_user chatbot_db > backup.sql

# Restore database
docker-compose exec postgres psql -U chatbot_user chatbot_db < backup.sql
```

### Development Workflow
```bash
# Run only database and backend for development
docker-compose up postgres backend

# Then run frontend locally with npm
cd frontend && npm start
```

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error, you can change the ports in `.env`:
```env
FRONTEND_PORT=3001
BACKEND_PORT=8001
POSTGRES_PORT=5433
```

### Database Connection Issues
If the backend can't connect to the database:
1. Ensure PostgreSQL is fully started: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Restart services: `docker-compose restart`

### API Key Issues
If you get LLM API errors:
1. Verify your API key is correctly set in `.env`
2. Restart the backend: `docker-compose restart backend`
3. Check backend logs: `docker-compose logs backend`

### Clearing Everything
To completely reset the application:
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## Production Deployment

For production deployment:

1. Update `.env` with production values:
   - Use strong passwords for PostgreSQL
   - Set proper API URLs
   - Use production API keys

2. Remove development flags:
   - Edit `backend/Dockerfile` and remove `--reload` flag from CMD
   - Set `NODE_ENV=production` in frontend build

3. Use Docker Swarm or Kubernetes for orchestration

4. Add SSL/TLS certificates for HTTPS

5. Set up monitoring and logging

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `chatbot_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `chatbot_pass` |
| `POSTGRES_DB` | PostgreSQL database name | `chatbot_db` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `BACKEND_PORT` | FastAPI backend port | `8000` |
| `FRONTEND_PORT` | React frontend port | `3000` |
| `REACT_APP_API_URL` | Backend API URL for frontend | `http://localhost:8000` |
| `GROQ_API_KEY` | Groq API key for LLM | Required |
| `OPENAI_API_KEY` | OpenAI API key (optional) | Optional |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | Optional |
| `FRONTEND_URL` | Frontend URL for QR codes | `http://localhost:3000` |

## Support

For issues or questions, please check the main README.md or open an issue on the repository.