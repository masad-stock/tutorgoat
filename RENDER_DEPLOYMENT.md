# TutorGoat - Render Deployment Guide

This guide will help you deploy your TutorGoat application to Render.com.

## 🚀 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub (✅ Already done)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Database**: You'll need a MongoDB database (MongoDB Atlas recommended)

## 📋 Step-by-Step Deployment

### 1. Create MongoDB Database

**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get your connection string

**Option B: Render MongoDB (Paid)**
1. In Render dashboard, create a new MongoDB service
2. Use the provided connection string

### 2. Deploy to Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `masad-stock/tutorgoat`
   - Choose the repository

3. **Configure Service Settings**
   ```
   Name: tutorgoat-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: master
   Root Directory: (leave empty)
   Build Command: npm install && cd client && npm install && npm run build
   Start Command: npm start
   ```

4. **Set Environment Variables**
   Click "Advanced" and add these environment variables:
   
   **Required Variables:**
   ```
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/tutorgoat
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-app-password
   EMAIL_FROM = noreply@tutorgoat.com
   INTERNAL_EMAIL = admin@tutorgoat.com
   JWT_SECRET = your-super-secret-jwt-key-here
   CLIENT_URL = https://your-app-name.onrender.com
   ```

   **Optional Variables:**
   ```
   RATE_LIMIT_WINDOW_MS = 900000
   RATE_LIMIT_MAX_REQUESTS = 10
   MAX_FILE_SIZE = 10485760
   MAX_FILES = 5
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (5-10 minutes)
   - Your app will be available at `https://your-app-name.onrender.com`

## 🔧 Configuration Details

### Build Process
- Render will automatically install dependencies
- Build the React frontend
- Start the Node.js server

### File Structure
```
tutorgoat/
├── server/           # Backend API
├── client/          # React frontend
├── client/build/    # Built React app (created during build)
├── uploads/         # File uploads directory
└── render.yaml      # Render configuration
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection | `mongodb+srv://user:pass@cluster.mongodb.net/tutorgoat` |
| `EMAIL_USER` | SMTP email | `your-email@gmail.com` |
| `EMAIL_PASS` | SMTP password | `your-app-password` |
| `EMAIL_FROM` | From email | `noreply@tutorgoat.com` |
| `INTERNAL_EMAIL` | Admin email | `admin@tutorgoat.com` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `CLIENT_URL` | Frontend URL | `https://your-app.onrender.com` |

## 🗄️ Database Setup

### MongoDB Atlas Setup
1. **Create Cluster**
   - Choose "M0 Sandbox" (free tier)
   - Select region closest to your users
   - Name your cluster

2. **Create Database User**
   - Go to "Database Access"
   - Add new user
   - Set username and password
   - Grant "Read and write to any database"

3. **Whitelist IP Addresses**
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (for Render)
   - Or add Render's IP ranges

4. **Get Connection String**
   - Go to "Database"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user password

### Example Connection String
```
mongodb+srv://tutorgoat:<password>@cluster0.abc123.mongodb.net/tutorgoat?retryWrites=true&w=majority
```

## 📧 Email Configuration

### Gmail Setup
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### Other Email Providers
- **Outlook**: Use your regular password
- **Yahoo**: Generate app password
- **Custom SMTP**: Update email service configuration

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive data to Git
- Use Render's environment variable system
- Rotate secrets regularly

### Database Security
- Use strong passwords
- Enable IP whitelisting
- Regular backups

### Application Security
- HTTPS is automatically enabled on Render
- CORS is configured for your domain
- Rate limiting is enabled
- File upload restrictions are in place

## 📊 Monitoring and Logs

### Render Dashboard
- View build logs
- Monitor resource usage
- Check deployment status

### Application Logs
- Access logs in Render dashboard
- Health check endpoint: `/api/health`
- Monitor database connections

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Render dashboard
   - Verify all dependencies are in package.json
   - Ensure build commands are correct

2. **Database Connection Failed**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

3. **Email Not Sending**
   - Verify email credentials
   - Check SMTP settings
   - Test with a simple email

4. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Monitor disk space

### Health Check
Your application includes a health check endpoint:
```
GET https://your-app.onrender.com/api/health
```

Expected response:
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

## 🔄 Updates and Maintenance

### Updating Your App
1. Push changes to GitHub
2. Render will automatically redeploy
3. Monitor deployment logs

### Database Backups
- MongoDB Atlas provides automatic backups
- Set up regular backup schedules
- Test restore procedures

### Performance Monitoring
- Monitor response times
- Check memory usage
- Optimize database queries

## 💰 Cost Considerations

### Render Free Tier
- 750 hours/month
- Sleeps after 15 minutes of inactivity
- 512MB RAM
- 1GB disk space

### Render Paid Plans
- Always-on service
- More resources
- Custom domains
- Better performance

## 🎯 Next Steps

1. **Deploy to Render** (follow steps above)
2. **Test your application** thoroughly
3. **Set up monitoring** and alerts
4. **Configure custom domain** (optional)
5. **Set up CI/CD** for automatic deployments

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test health endpoint
4. Review this guide

---

**Note**: The free tier on Render may have limitations. Consider upgrading to a paid plan for production use.
