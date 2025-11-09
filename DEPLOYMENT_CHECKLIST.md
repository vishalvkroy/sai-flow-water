# 🚀 Deployment Checklist - Sai Flow Water

## ✅ Pre-Deployment

### Backend Preparation
- [ ] Create GitHub repository
- [ ] Add `.gitignore` to backend folder
- [ ] Update `package.json` with start script
- [ ] Test backend locally one more time
- [ ] Note down all environment variables from `.env`

### Frontend Preparation  
- [ ] Create `.env.production` with backend URL
- [ ] Test build locally: `npm run build`
- [ ] Verify build folder created successfully
- [ ] Check `.htaccess` file is in public folder

---

## 🔧 Backend Deployment (Render.com)

### Step 1: GitHub Setup
```bash
cd "c:\Water Filter copyy"
git init
git add .
git commit -m "Initial deployment"
git branch -M main
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/saiflow-water.git
git push -u origin main
```

### Step 2: Render Configuration
- [ ] Sign up at https://render.com with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Select your repository
- [ ] Configure:
  - Name: `saiflow-backend`
  - Root Directory: `backend`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: **Free**

### Step 3: Environment Variables
Add these in Render dashboard:
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `SHIPMOJO_EMAIL`
- [ ] `SHIPMOJO_PASSWORD`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASS`
- [ ] `FRONTEND_URL=https://yourdomain.com`
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`

### Step 4: Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)
- [ ] Copy backend URL (e.g., `https://saiflow-backend.onrender.com`)
- [ ] Test health endpoint: `https://saiflow-backend.onrender.com/api/health`

---

## 🌐 Frontend Deployment (Hostinger)

### Step 1: Update API URL
- [ ] Edit `frontend/.env.production`
- [ ] Set: `REACT_APP_API_URL=https://saiflow-backend.onrender.com/api`

### Step 2: Build Production
```bash
cd "c:\Water Filter copyy\frontend"
npm run build
```
- [ ] Verify `build` folder created
- [ ] Check size (should be ~2-5 MB)

### Step 3: Upload to Hostinger
- [ ] Login to Hostinger control panel
- [ ] Go to File Manager
- [ ] Navigate to `public_html`
- [ ] Delete all default files
- [ ] Upload ALL files from `build` folder
- [ ] Verify `index.html` is in root
- [ ] Verify `.htaccess` is uploaded

### Step 4: SSL Configuration
- [ ] Go to SSL section in Hostinger
- [ ] Enable "Free SSL Certificate"
- [ ] Wait 10-15 minutes
- [ ] Test HTTPS: `https://yourdomain.com`

---

## 🔗 Third-Party Services Update

### ShipMozo Webhook
- [ ] Login to ShipMozo dashboard
- [ ] Go to Settings → Webhooks
- [ ] Update URL: `https://saiflow-backend.onrender.com/api/webhooks/shipmojo`
- [ ] Save and test

### Razorpay Webhook
- [ ] Login to Razorpay dashboard
- [ ] Go to Settings → Webhooks
- [ ] Update URL: `https://saiflow-backend.onrender.com/api/webhook/razorpay`
- [ ] Save and test

### MongoDB Atlas
- [ ] Go to Network Access
- [ ] Ensure `0.0.0.0/0` is whitelisted (for Render)
- [ ] Or add Render's IP addresses

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Visit `https://yourdomain.com`
- [ ] Logo loads correctly
- [ ] Navigation works
- [ ] All pages accessible
- [ ] No console errors

### Backend Tests
- [ ] Health check: `/api/health`
- [ ] User registration works
- [ ] User login works
- [ ] Products load
- [ ] Cart functionality

### Full Flow Tests
- [ ] Create account
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout process
- [ ] Payment (test mode)
- [ ] Order confirmation
- [ ] Email notifications
- [ ] Order tracking

### Admin/Seller Tests
- [ ] Seller login
- [ ] View orders
- [ ] Create shipment
- [ ] Cancel shipment
- [ ] Webhook updates work

---

## 🎯 Performance Optimization

### Keep Backend Awake
- [ ] Sign up at https://cron-job.org
- [ ] Create job to ping: `https://saiflow-backend.onrender.com/api/health`
- [ ] Set interval: Every 10 minutes

### Monitor Uptime
- [ ] Sign up at https://uptimerobot.com
- [ ] Add monitor for frontend: `https://yourdomain.com`
- [ ] Add monitor for backend: `https://saiflow-backend.onrender.com/api/health`
- [ ] Set alert email

---

## 📊 Post-Deployment

### Analytics
- [ ] Set up Google Analytics
- [ ] Add tracking code to `index.html`
- [ ] Verify tracking works

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Add domain to Bing Webmaster Tools
- [ ] Verify meta tags are correct

### Monitoring
- [ ] Check Render logs daily for first week
- [ ] Monitor error rates
- [ ] Check webhook delivery success

### Backup
- [ ] Export MongoDB data weekly
- [ ] Keep local backup of code
- [ ] Document any custom configurations

---

## 🆘 Troubleshooting

### Frontend Issues
**Blank page:**
- Check browser console
- Verify API URL in `.env.production`
- Check `.htaccess` uploaded

**404 on refresh:**
- Verify `.htaccess` rules
- Check Hostinger mod_rewrite enabled

### Backend Issues
**500 errors:**
- Check Render logs
- Verify environment variables
- Test MongoDB connection

**Slow response:**
- Backend might be sleeping (Render free tier)
- Set up cron job to keep awake

### Payment Issues
**Razorpay not working:**
- Check webhook URL updated
- Verify API keys in environment
- Check CORS settings

---

## 📝 Important URLs

### Production URLs
- **Frontend**: https://yourdomain.com
- **Backend**: https://saiflow-backend.onrender.com
- **API Health**: https://saiflow-backend.onrender.com/api/health

### Dashboards
- **Render**: https://dashboard.render.com
- **Hostinger**: https://hpanel.hostinger.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Razorpay**: https://dashboard.razorpay.com
- **ShipMozo**: https://app.shipmozo.com
- **Cloudinary**: https://cloudinary.com/console

---

## 💰 Monthly Costs

| Service | Cost |
|---------|------|
| Hostinger | ₹200-500 (your plan) |
| Render.com | FREE |
| MongoDB Atlas | FREE |
| Cloudinary | FREE |
| Domain | Included with Hostinger |
| **Total** | **₹200-500/month** |

---

## 🎉 Success Criteria

- [ ] Website loads on your domain
- [ ] HTTPS working
- [ ] Users can register/login
- [ ] Products display correctly
- [ ] Orders can be placed
- [ ] Payments work
- [ ] Emails are sent
- [ ] Seller dashboard functional
- [ ] ShipMozo integration working
- [ ] No critical errors in logs

---

## 📞 Support

If stuck, check:
1. Render deployment logs
2. Browser console errors
3. Hostinger error logs
4. MongoDB Atlas metrics

**Common fixes:**
- Clear browser cache
- Restart Render service
- Check environment variables
- Verify webhook URLs

---

**Ready to deploy?** Follow this checklist step by step! 🚀
