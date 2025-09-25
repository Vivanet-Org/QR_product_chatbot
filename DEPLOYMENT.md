# Digital Ocean Deployment Guide

This guide covers deploying the QR Product Chatbot as a single containerized application on Digital Ocean to minimize costs.

## Prerequisites

1. **Digital Ocean Account** with SSH key configured
2. **Domain Name** (optional but recommended)
3. **Docker** installed locally for testing

## Deployment Options

### Option 1: Single Droplet Deployment (Recommended - $12/month)

#### Step 1: Create Digital Ocean Droplet

```bash
# Create a $12/month droplet with Docker pre-installed
doctl compute droplet create chatbot-app \
  --region nyc1 \
  --size s-2vcpu-2gb \
  --image docker-20-04 \
  --ssh-keys your-ssh-key-id
```

Or create manually in DO dashboard:
- **Image**: Docker on Ubuntu 20.04
- **Plan**: Basic - $12/month (2 vCPU, 2GB RAM, 50GB SSD)
- **Region**: Choose closest to your users

#### Step 2: Connect and Setup

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Create production environment file
cp .env.production .env
nano .env  # Edit with your production values
```

#### Step 3: Configure Production Environment

Edit `.env` file with your production values:

```bash
# Required Configuration
DATABASE_URL=sqlite:///./data/chatbot.db
GROQ_API_KEY=your_actual_groq_api_key
REACT_APP_API_URL=http://your-droplet-ip:80
FRONTEND_URL=http://your-droplet-ip:80
BACKEND_URL=http://your-droplet-ip:80
```

#### Step 4: Build and Deploy

```bash
# Build and run the application
docker-compose -f docker-compose.prod.yml up -d

# Check if it's running
docker-compose -f docker-compose.prod.yml ps
```

#### Step 5: Configure Domain (Optional)

If you have a domain:

1. **Add DNS A Record**: Point your domain to droplet IP
2. **Update environment variables**:
   ```bash
   # Update .env file
   REACT_APP_API_URL=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://yourdomain.com

   # Restart container
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

#### Step 6: SSL Setup (Optional)

For HTTPS with Let's Encrypt:

```bash
# Install certbot
sudo apt update && sudo apt install certbot

# Stop the app temporarily
docker-compose -f docker-compose.prod.yml down

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Enable nginx profile for SSL
docker-compose -f docker-compose.prod.yml --profile nginx up -d
```

### Option 2: Digital Ocean App Platform ($5/month + database costs)

#### Deploy via App Platform

1. **Connect Repository** in DO App Platform dashboard
2. **Configure Build Settings**:
   - Build Command: `docker build -t chatbot .`
   - Run Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables**: Add all from `.env.production`
4. **Database**: Use DO Managed Database (additional $15/month) or stick with SQLite

## Local Development

### Run with Docker

```bash
# Development mode (with hot reload)
docker-compose --profile dev up

# Production mode locally
docker-compose -f docker-compose.prod.yml up
```

### Traditional Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check application health
curl http://your-droplet-ip/health

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

### Logs

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs chatbot-app
```

### Updates

```bash
# Pull latest changes
git pull

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database

```bash
# Backup SQLite database
docker exec -it $(docker-compose -f docker-compose.prod.yml ps -q chatbot-app) \
  cp /app/data/chatbot.db /app/backup-$(date +%Y%m%d).db

# Copy backup to host
docker cp container_name:/app/backup-$(date +%Y%m%d).db ./
```

## Cost Breakdown

### Single Droplet (Recommended)
- **Droplet**: $12/month (2 vCPU, 2GB RAM, 50GB SSD)
- **Domain**: ~$12/year (optional)
- **Total**: ~$12/month

### App Platform
- **App**: $5/month (Basic plan)
- **Database**: $15/month (if using managed DB)
- **Total**: $20/month

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check resource usage
docker stats
```

### Database Issues
```bash
# Check database file permissions
ls -la data/

# Reset database (creates new)
rm data/chatbot.db
docker-compose -f docker-compose.prod.yml restart
```

### Performance Issues
```bash
# Monitor resource usage
htop

# Check container resources
docker stats
```

## Security Considerations

1. **Firewall**: Configure UFW to only allow necessary ports
2. **SSH**: Disable password auth, use key-based auth only
3. **Updates**: Keep system and Docker images updated
4. **Environment Variables**: Never commit secrets to repository
5. **Database**: Regular backups and consider encryption for sensitive data

## Next Steps

1. Set up automated backups
2. Configure monitoring/alerting
3. Implement CI/CD pipeline
4. Add rate limiting for API endpoints
5. Consider CDN for static assets