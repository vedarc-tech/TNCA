# 🚀 TNCA IQ Platform - Deployment Guide

This guide will help you deploy the TNCA IQ Platform to production using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📋 Prerequisites

1. **MongoDB Atlas Account**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Set up database access and network access

2. **Render Account**
   - Sign up at [Render](https://render.com)
   - Connect your GitHub repository

3. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)
   - Connect your GitHub repository

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new project
3. Build a new cluster (Free tier recommended)
4. Choose your preferred cloud provider and region

### 1.2 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Set privileges to "Read and write to any database"

### 1.3 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For production, click "Allow Access from Anywhere" (0.0.0.0/0)

### 1.4 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `tnca_iq_platform`

**Example connection string:**
```
mongodb+srv://username:password@cluster.mongodb.net/tnca_iq_platform?retryWrites=true&w=majority
```

## 🔧 Step 2: Backend Deployment (Render)

### 2.1 Prepare Repository
Ensure your repository has these files in the `backend/` directory:
- `requirements.txt`
- `gunicorn_config.py`
- `wsgi.py`
- `build.sh`
- `start.sh`

### 2.2 Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `tnca-iq-platform-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `chmod +x start.sh && ./start.sh`

### 2.3 Environment Variables
Add these environment variables in Render:

```env
# Required
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tnca_iq_platform?retryWrites=true&w=majority
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Optional (with defaults)
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=https://your-frontend-domain.vercel.app
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800
```

### 2.4 Generate Secure Keys
Use this command to generate secure keys:
```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Note the service URL (e.g., `https://tnca-iq-platform-backend.onrender.com`)

## 🌐 Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare Repository
Ensure your repository has these files in the `frontend/` directory:
- `package.json`
- `vercel.json`
- `vite.config.js`

### 3.2 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Environment Variables
Add these environment variables in Vercel:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_APP_NAME=TNCA IQ Platform
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_MAINTENANCE_MODE=false
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Note your domain (e.g., `https://tnca-iq-platform.vercel.app`)

## 🔄 Step 4: Update CORS Configuration

### 4.1 Update Backend CORS
In your Render environment variables, update the CORS_ORIGINS:
```env
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### 4.2 Redeploy Backend
Trigger a new deployment in Render to apply the CORS changes.

## 🧪 Step 5: Testing

### 5.1 Test Backend Health
Visit: `https://your-backend-url.onrender.com/health`
Should return: `{"status": "healthy", "timestamp": "..."}`

### 5.2 Test Frontend
Visit your Vercel domain and test:
- User registration/login
- Quiz functionality
- Game functionality
- Admin features

## 🔒 Step 6: Security Checklist

- [ ] MongoDB Atlas network access configured
- [ ] Secure secret keys generated and set
- [ ] CORS origins properly configured
- [ ] Environment variables set in both platforms
- [ ] HTTPS enabled (automatic with Vercel/Render)
- [ ] Database user has minimal required permissions

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS_ORIGINS includes your frontend domain
   - Check that the domain is exactly correct (including https://)

2. **Database Connection Issues**
   - Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0)
   - Check connection string format
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check that all required files are in the correct directories
   - Verify Python version compatibility
   - Check build logs for specific error messages

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify values are properly formatted

### Getting Help
- Check Render logs: Dashboard → Your Service → Logs
- Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
- Check MongoDB Atlas logs: Database → Your Cluster → Logs

## 📊 Monitoring

### Render Monitoring
- CPU and memory usage
- Response times
- Error rates
- Logs

### Vercel Monitoring
- Page load times
- Build performance
- Function execution times
- Analytics

### MongoDB Atlas Monitoring
- Database performance
- Connection count
- Query performance
- Storage usage

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:
- Push to your main branch to trigger automatic deployment
- Set up preview deployments for pull requests
- Configure deployment notifications

## 📝 Post-Deployment

1. **Update Documentation**
   - Update any hardcoded URLs in documentation
   - Update README with production URLs

2. **Set Up Monitoring**
   - Configure uptime monitoring
   - Set up error tracking
   - Configure performance monitoring

3. **Backup Strategy**
   - Set up MongoDB Atlas backups
   - Configure automated backups
   - Test restore procedures

4. **SSL Certificates**
   - Vercel and Render provide automatic SSL
   - Verify HTTPS is working correctly

---

## 🎉 Deployment Complete!

Your TNCA IQ Platform is now live at:
- **Frontend**: `https://your-domain.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: MongoDB Atlas

Remember to:
- Monitor your application regularly
- Keep dependencies updated
- Backup your database regularly
- Test all features after deployment 