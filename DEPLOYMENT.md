# TutorGoat Deployment Guide

This guide covers various deployment options for the TutorGoat anonymous tutoring service.

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git repository cloned

### Local Docker Deployment

```bash
# Clone the repository
git clone <repository-url>
cd tutorgoat

# Create environment file
cp env.example .env
# Edit .env with your configuration

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

The application will be available at `http://localhost:5000`

## ☁️ Cloud Deployment Options

### 1. Heroku Deployment

#### Prerequisites

- Heroku CLI installed
- Git repository
- MongoDB Atlas account

#### Steps

1. **Create Heroku App**

   ```bash
   heroku create tutorgoat-app
   ```

2. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tutorgoat
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   heroku config:set EMAIL_FROM=noreply@tutorgoat.com
   heroku config:set INTERNAL_EMAIL=admin@tutorgoat.com
   ```

3. **Deploy**

   ```bash
   git push heroku main
   ```

4. **Add MongoDB Add-on (Optional)**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

### 2. AWS EC2 Deployment

#### Prerequisites

- AWS account
- EC2 instance (Ubuntu 20.04+)
- Domain name (optional)

#### Steps

1. **Launch EC2 Instance**

   - Choose Ubuntu 20.04 LTS
   - t3.micro or larger
   - Configure security groups (ports 22, 80, 443, 5000)

2. **Connect and Setup**

   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Deploy Application**

   ```bash
   # Clone repository
   git clone <repository-url>
   cd tutorgoat

   # Install dependencies
   npm run install-all

   # Build for production
   npm run build

   # Create environment file
   cp env.example .env
   # Edit .env with production values

   # Start with PM2
   pm2 start server/index.js --name tutorgoat
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx (Optional)**

   ```bash
   sudo apt install nginx

   # Create Nginx config
   sudo nano /etc/nginx/sites-available/tutorgoat
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/tutorgoat /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 3. DigitalOcean App Platform

#### Prerequisites

- DigitalOcean account
- GitHub repository

#### Steps

1. **Create New App**

   - Connect GitHub repository
   - Choose "Web Service"
   - Select Node.js

2. **Configure Build Settings**

   ```yaml
   build_command: npm run build
   run_command: npm start
   source_dir: /
   ```

3. **Set Environment Variables**

   - NODE_ENV=production
   - MONGODB_URI=your-mongodb-uri
   - EMAIL_USER=your-email
   - EMAIL_PASS=your-password
   - EMAIL_FROM=noreply@tutorgoat.com
   - INTERNAL_EMAIL=admin@tutorgoat.com

4. **Deploy**
   - Click "Create Resources"
   - Wait for deployment to complete

### 4. Vercel + Railway Deployment

#### Frontend (Vercel)

1. **Connect Repository**

   - Go to vercel.com
   - Import GitHub repository
   - Set root directory to `client`

2. **Build Settings**

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "installCommand": "npm install"
   }
   ```

3. **Environment Variables**
   - REACT_APP_API_URL=https://your-backend.railway.app

#### Backend (Railway)

1. **Connect Repository**

   - Go to railway.app
   - Deploy from GitHub
   - Select repository

2. **Environment Variables**
   - NODE_ENV=production
   - PORT=5000
   - MONGODB_URI=your-mongodb-uri
   - EMAIL_USER=your-email
   - EMAIL_PASS=your-password
   - EMAIL_FROM=noreply@tutorgoat.com
   - INTERNAL_EMAIL=admin@tutorgoat.com

## 🔒 SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption mode: "Full (strict)"
4. Enable "Always Use HTTPS"

## 📊 Monitoring and Logs

### PM2 Monitoring

```bash
# View logs
pm2 logs tutorgoat

# Monitor resources
pm2 monit

# Restart application
pm2 restart tutorgoat
```

### Health Check

The application includes a health check endpoint:

```
GET /api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": "3600 seconds",
  "database": "connected",
  "memory": {
    "rss": 50,
    "heapTotal": 20,
    "heapUsed": 15,
    "external": 5
  },
  "version": "1.0.0",
  "environment": "production"
}
```

## 🔧 Environment Variables

### Required Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tutorgoat
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@tutorgoat.com
INTERNAL_EMAIL=admin@tutorgoat.com
```

### Optional Variables

```env
CLIENT_URL=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
MAX_FILE_SIZE=10485760
MAX_FILES=5
```

## 🚨 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] File upload limits set
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Regular security updates
- [ ] Backup strategy implemented

## 📈 Performance Optimization

### Frontend

- Enable gzip compression
- Use CDN for static assets
- Optimize images
- Enable browser caching

### Backend

- Use PM2 cluster mode
- Enable database indexing
- Implement caching
- Monitor memory usage

### Database

- Create appropriate indexes
- Regular maintenance
- Monitor query performance
- Backup regularly

## 🔄 Backup Strategy

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/tutorgoat" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/tutorgoat" /backup/20240101/tutorgoat
```

### File Backup

```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Restore
tar -xzf uploads-backup-20240101.tar.gz
```

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection failed**

   - Check MongoDB service: `sudo systemctl status mongod`
   - Check connection string
   - Verify network access

3. **Email sending failed**

   - Verify email credentials
   - Check SMTP settings
   - Test with a simple email

4. **File upload issues**
   - Check file permissions
   - Verify upload directory exists
   - Check file size limits

### Logs Location

- Application logs: PM2 logs
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`

## 📞 Support

For deployment issues:

- Check application logs
- Verify environment variables
- Test health endpoint
- Review security settings

---

**Note**: Always test deployments in a staging environment before deploying to production.
