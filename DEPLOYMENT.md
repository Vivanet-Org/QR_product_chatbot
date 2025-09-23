# Production Deployment Guide

## Prerequisites

- Node.js 18+ and npm/yarn installed
- Git installed
- Access to a production server or cloud platform
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# API Keys (replace with your actual keys)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_google_custom_search_engine_id

# Database (if applicable)
DATABASE_URL=your_database_connection_string

# Session/Security
SESSION_SECRET=your_secure_session_secret
```

### 2. Install Dependencies

```bash
npm install --production
# or
yarn install --production
```

## Build Process

### 1. Build the Application

```bash
npm run build
# or
yarn build
```

### 2. Verify Build

```bash
npm run lint
npm run typecheck
```

## Deployment Options

### Option A: Traditional Server (VPS/Dedicated)

#### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2
```

#### 2. Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/yourusername/chatbot.git
cd chatbot

# Install dependencies
npm install --production

# Build application
npm run build
```

#### 3. Start with PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'chatbot',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy application files
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

#### 2. Build and Run Docker Container

```bash
# Build image
docker build -t chatbot:latest .

# Run container
docker run -d \
  --name chatbot \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  chatbot:latest
```

### Option C: Cloud Platform Deployment

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-chatbot-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your_key

# Deploy
git push heroku main
```

#### AWS/Azure/GCP

Refer to platform-specific documentation for deployment using:
- AWS: Elastic Beanstalk, ECS, or Lambda
- Azure: App Service or Container Instances
- GCP: App Engine or Cloud Run

## Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Post-Deployment

### 1. Health Checks

Implement health check endpoint in your application:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

### 2. Monitoring

Set up monitoring with:
- **PM2 Monitoring**: `pm2 monit`
- **Application Monitoring**: New Relic, DataDog, or Sentry
- **Logs**: CloudWatch, Loggly, or ELK stack

### 3. Backup Strategy

- Set up automated database backups
- Configure git repository backups
- Document recovery procedures

### 4. Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Set secure headers (Helmet.js)
- [ ] Enable CORS properly
- [ ] Rate limiting configured
- [ ] Input validation in place
- [ ] Dependencies updated
- [ ] Secrets in environment variables
- [ ] Firewall rules configured

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Build
npm run build

# Restart application
pm2 restart chatbot
```

### View Logs

```bash
# PM2 logs
pm2 logs chatbot

# Docker logs
docker logs -f chatbot
```

### Rollback

```bash
# Git rollback
git checkout <previous-commit-hash>
npm install --production
npm run build
pm2 restart chatbot
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Memory issues**
   ```bash
   # Increase Node.js memory
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

3. **Permission errors**
   ```bash
   # Fix npm permissions
   sudo chown -R $(whoami) ~/.npm
   ```

## Performance Optimization

1. **Enable compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Cache static assets**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1y',
     etag: false
   }));
   ```

3. **Database connection pooling**
4. **CDN for static assets**
5. **Load balancing for multiple instances**

## Contact

For deployment issues or questions, contact:
- Technical Lead: [email]
- DevOps Team: [email]
- Emergency: [phone]