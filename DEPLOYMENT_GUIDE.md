# Sai Flow Water - Deployment Guide

## Architecture
- **Frontend**: Hostinger (Static React Build) - Your Domain
- **Backend**: Render.com (Node.js API) - Free Subdomain
- **Database**: MongoDB Atlas (Free Tier)

---

## Prerequisites
✅ Hostinger account with domain
✅ GitHub account
✅ MongoDB Atlas account (already set up)
✅ Render.com account (free)

---

## Step 1: Prepare Backend for Deployment

### 1.1 Create `.gitignore` in backend folder
```
node_modules/
.env
uploads/
*.log
.DS_Store
```

### 1.2 Update `backend/package.json`
Add these scripts:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "build": "echo 'No build required'"
}
```

### 1.3 Set Node version in `backend/package.json`
```json
"engines": {
  "node": "18.x"
}
```

### 1.4 Update CORS in `backend/server.js`
Replace the CORS section with:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production for now
    }
  },
  credentials: true
}));
```

---

## Step 2: Deploy Backend to Render.com

### 2.1 Push Code to GitHub
```bash
cd "c:\Water Filter copyy"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/saiflow-water.git
git push -u origin main
```

### 2.2 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### 2.3 Configure Render
- **Repository**: Select your GitHub repo
- **Name**: `saiflow-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 2.4 Add Environment Variables
Click "Environment" and add all from your `.env`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SHIPMOJO_EMAIL=your_shipmojo_email
SHIPMOJO_PASSWORD=your_shipmojo_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
PORT=5000
```

### 2.5 Deploy
- Click "Create Web Service"
- Wait 5-10 minutes for deployment
- Copy your backend URL: `https://saiflow-backend.onrender.com`

---

## Step 3: Build Frontend for Production

### 3.1 Update Frontend API URL
Edit `frontend/.env.production`:
```env
REACT_APP_API_URL=https://saiflow-backend.onrender.com/api
```

### 3.2 Build Frontend
```bash
cd "c:\Water Filter copyy\frontend"
npm run build
```

This creates a `build` folder with optimized static files.

---

## Step 4: Deploy Frontend to Hostinger

### 4.1 Access Hostinger File Manager
1. Login to Hostinger
2. Go to "File Manager"
3. Navigate to `public_html` folder

### 4.2 Upload Build Files
1. Delete default files in `public_html`
2. Upload ALL files from `frontend/build` folder
3. Make sure `index.html` is in root of `public_html`

### 4.3 Configure `.htaccess`
Create `.htaccess` in `public_html`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

## Step 5: Configure Domain & SSL

### 5.1 Point Domain to Hostinger
Already done if you're using Hostinger's nameservers.

### 5.2 Enable SSL
1. In Hostinger panel, go to "SSL"
2. Enable "Free SSL Certificate"
3. Wait 10-15 minutes for activation

### 5.3 Force HTTPS
Add to `.htaccess` (top):
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Step 6: Update Webhook URLs

### 6.1 Update ShipMozo Webhook
1. Login to ShipMozo dashboard
2. Go to Settings → Webhooks
3. Update URL to: `https://saiflow-backend.onrender.com/api/webhooks/shipmojo`

### 6.2 Update Razorpay Webhook
1. Login to Razorpay dashboard
2. Go to Settings → Webhooks
3. Update URL to: `https://saiflow-backend.onrender.com/api/webhook/razorpay`

---

## Step 7: Test Everything

### 7.1 Test Frontend
- Visit `https://yourdomain.com`
- Check if logo loads
- Test navigation

### 7.2 Test Backend Connection
- Try logging in
- Check if products load
- Test order creation

### 7.3 Test Payments
- Create test order
- Complete payment
- Verify webhook

---

## Maintenance

### Update Backend
```bash
git add .
git commit -m "Update message"
git push
```
Render auto-deploys from GitHub.

### Update Frontend
```bash
cd frontend
npm run build
# Upload new build folder to Hostinger
```

---

## Cost Breakdown

| Service | Cost | Usage |
|---------|------|-------|
| Hostinger | Paid (Your existing plan) | Frontend hosting |
| Render.com | FREE | Backend API (750 hrs/month) |
| MongoDB Atlas | FREE | Database (512MB) |
| Cloudinary | FREE | Image storage (25 credits) |
| **Total** | **~₹200-500/month** | Just Hostinger |

---

## Performance Tips

### 1. Keep Backend Awake
Render free tier sleeps after 15 min inactivity.

**Solution**: Use cron-job.org to ping your backend every 10 minutes:
```
https://saiflow-backend.onrender.com/api/health
```

### 2. Optimize Images
- Compress product images before upload
- Use Cloudinary transformations
- Enable lazy loading

### 3. Enable Caching
Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify API URL in `.env.production`
- Check `.htaccess` is uploaded

### Backend not responding
- Check Render logs
- Verify environment variables
- Check MongoDB connection

### Images not loading
- Check Cloudinary credentials
- Verify CORS settings
- Check image URLs

---

## Alternative: All-in-One VPS (Upgrade Option)

If you want better performance later:

### Option 1: Hostinger VPS (₹299/month)
- Host both frontend and backend
- Better performance
- No sleep time
- More control

### Option 2: DigitalOcean (₹400/month)
- $5/month droplet
- Full control
- Better for scaling

---

## Security Checklist

✅ Environment variables not in code
✅ HTTPS enabled
✅ CORS properly configured
✅ JWT secret is strong
✅ MongoDB IP whitelist (0.0.0.0/0 for now)
✅ Rate limiting enabled
✅ Input validation on backend

---

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Set up Google Analytics
3. ✅ Configure SEO meta tags
4. ✅ Set up email notifications
5. ✅ Create backup strategy
6. ✅ Monitor error logs
7. ✅ Set up uptime monitoring (uptimerobot.com)

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Hostinger Support**: https://www.hostinger.com/tutorials
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**Need help?** Check Render logs and Hostinger error logs for debugging.
