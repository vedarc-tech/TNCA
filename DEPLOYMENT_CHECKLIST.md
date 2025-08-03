# 🚀 TNCA IQ Platform - Quick Deployment Checklist

## ✅ Your MongoDB Atlas Setup
- **Connection String**: `mongodb+srv://tnca:tnca5959@iqualizer.wsbg8br.mongodb.net/tnca_iq_platform?retryWrites=true&w=majority`
- **Database Name**: `tnca_iq_platform`
- **Status**: ✅ Ready

## 🔧 Backend Deployment (Render)

### Environment Variables to Set:
```env
MONGO_URI=mongodb+srv://tnca:tnca5959@iqualizer.wsbg8br.mongodb.net/tnca_iq_platform?retryWrites=true&w=majority
SECRET_KEY=your-generated-secret-key
JWT_SECRET_KEY=your-generated-jwt-secret-key
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=https://your-frontend-domain.vercel.app
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800
```

### Render Configuration:
- **Name**: `tnca-iq-platform-backend`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `chmod +x build.sh && ./build.sh`
- **Start Command**: `chmod +x start.sh && ./start.sh`

## 🌐 Frontend Deployment (Vercel)

### Environment Variables to Set:
```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_APP_NAME=TNCA IQ Platform
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_MAINTENANCE_MODE=false
```

### Vercel Configuration:
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🔑 Generate Secure Keys

Run these commands to generate secure keys:

```bash
# For SECRET_KEY
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# For JWT_SECRET_KEY
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas network access allows all IPs (0.0.0.0/0)
- [ ] Generated secure SECRET_KEY and JWT_SECRET_KEY
- [ ] All code committed and pushed to GitHub
- [ ] Render account created and connected to GitHub
- [ ] Vercel account created and connected to GitHub
- [ ] No sensitive data in repository

## 🚀 Deployment Steps

1. **Deploy Backend to Render**
   - Create new Web Service
   - Set environment variables
   - Deploy and note the URL

2. **Deploy Frontend to Vercel**
   - Create new project
   - Set environment variables (update VITE_API_URL with Render URL)
   - Deploy and note the domain

3. **Update CORS**
   - Update CORS_ORIGINS in Render with your Vercel domain
   - Redeploy backend

4. **Test Everything**
   - Test backend health endpoint
   - Test frontend functionality
   - Test user registration/login
   - Test admin features

## 🔗 Your URLs (After Deployment)

- **Backend**: `https://your-backend-name.onrender.com`
- **Frontend**: `https://your-frontend-name.vercel.app`
- **Database**: MongoDB Atlas (already configured)

## 🚨 Important Notes

1. **Security**: Change the super admin password after first login
2. **Monitoring**: Set up monitoring for both platforms
3. **Backups**: Enable MongoDB Atlas backups
4. **SSL**: Both platforms provide automatic HTTPS
5. **Updates**: Keep dependencies updated regularly

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments
3. Check MongoDB Atlas logs: Database → Your Cluster → Logs 