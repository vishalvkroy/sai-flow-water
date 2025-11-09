# 🚀 Deploy Backend to Render.com - Quick Guide

## ✅ Prerequisites Complete
- ✅ Code is on GitHub: https://github.com/vishalvkroy/sai-flow-water
- ✅ Database optimized and protected
- ✅ All scripts tested
- ✅ Ready to deploy!

---

## 📋 Step 1: Sign Up for Render.com

1. **Go to**: https://render.com
2. **Click**: "Get Started" or "Sign Up"
3. **Choose**: "Sign up with GitHub" (easiest option)
4. **Authorize**: Allow Render to access your GitHub repositories

---

## 📋 Step 2: Create Web Service

### 2.1 Start New Service
1. Click "New +" button (top right)
2. Select "Web Service"

### 2.2 Connect Repository
1. Click "Connect a repository"
2. Find: `vishalvkroy/sai-flow-water`
3. Click "Connect"

### 2.3 Configure Service

**Basic Settings:**
```
Name: sai-flow-water-backend
Region: Singapore (closest to India)
Branch: main
Root Directory: backend
Runtime: Node
```

**Build & Deploy:**
```
Build Command: npm install
Start Command: npm start
```

**Instance Type:**
```
Free (0$/month)
```

---

## 📋 Step 3: Add Environment Variables

Click "Advanced" → "Add Environment Variable"

**Copy these from your `backend/.env` file:**

### Required Variables:

```bash
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# ShipMozo
SHIPMOJO_PUBLIC_KEY=your_public_key
SHIPMOJO_PRIVATE_KEY=your_private_key
SHIPMOJO_WAREHOUSE_ID=your_warehouse_id
SHIPMOJO_PICKUP_PINCODE=your_pincode

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=http://localhost:3000

# Port
PORT=5000

# Node Environment
NODE_ENV=production
```

---

## 📋 Step 4: Deploy!

1. **Click**: "Create Web Service"
2. **Wait**: 5-10 minutes for deployment
3. **Watch**: Build logs in real-time

### Deployment Process:
```
1. Cloning repository... ✅
2. Installing dependencies... ✅
3. Building application... ✅
4. Starting server... ✅
5. Health check... ✅
6. Live! 🎉
```

---

## 📋 Step 5: Get Your Backend URL

After deployment succeeds:

1. You'll see: `https://sai-flow-water-backend.onrender.com`
2. **Copy this URL** - you'll need it!

### Test Your Backend:
```
Open: https://sai-flow-water-backend.onrender.com/api/health

Should see:
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "..."
}
```

---

## 📋 Step 6: Update ShipMozo Webhook

1. **Login to**: https://app.shipmozo.com
2. **Go to**: Settings → Webhooks
3. **Update URL to**:
   ```
   https://sai-flow-water-backend.onrender.com/api/webhooks/shipmojo
   ```
4. **Save**

**Now webhooks will work automatically!** 🎉

---

## 📋 Step 7: Update Frontend Environment

Update `frontend/.env.production`:
```bash
REACT_APP_API_URL=https://sai-flow-water-backend.onrender.com/api
```

---

## 🎯 What You'll Get

### ✅ Benefits:
- ✅ **Always Online**: 24/7 availability
- ✅ **Webhooks Work**: ShipMozo can reach your backend
- ✅ **Auto-Deploy**: Push to GitHub → Auto-deploys
- ✅ **Free SSL**: HTTPS included
- ✅ **Free Tier**: $0/month
- ✅ **Monitoring**: Built-in logs and metrics

### ⚠️ Free Tier Limitations:
- Sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month free (enough for one service)

### 💡 Keep Awake (Optional):
Use a service like UptimeRobot to ping your backend every 10 minutes

---

## 🔧 Troubleshooting

### Build Fails?
**Check**:
- All environment variables added
- MongoDB URI is correct
- Root directory is set to `backend`

### Can't Connect?
**Check**:
- Service is "Live" (green status)
- URL is correct (ends with .onrender.com)
- Health endpoint works

### Webhook Not Working?
**Check**:
- ShipMozo webhook URL updated
- Backend is not sleeping
- Check Render logs for webhook requests

---

## 📊 Monitor Your Deployment

### Render Dashboard:
- **Logs**: See all server logs
- **Metrics**: CPU, Memory usage
- **Events**: Deployments, restarts
- **Shell**: Access server terminal

### Check Logs:
```
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs
```

---

## 🔄 Auto-Deploy Setup

Already configured! When you push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will automatically:
1. Detect the push
2. Pull latest code
3. Rebuild
4. Deploy
5. Go live!

---

## 📝 Environment Variables Checklist

Before deploying, make sure you have:

- [ ] MONGODB_URI (from MongoDB Atlas)
- [ ] JWT_SECRET (any random string)
- [ ] EMAIL_USER (your Gmail)
- [ ] EMAIL_PASS (Gmail app password)
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] SHIPMOJO_PUBLIC_KEY
- [ ] SHIPMOJO_PRIVATE_KEY
- [ ] SHIPMOJO_WAREHOUSE_ID
- [ ] SHIPMOJO_PICKUP_PINCODE
- [ ] FRONTEND_URL (update later)
- [ ] PORT=5000
- [ ] NODE_ENV=production

---

## 🎉 After Deployment

### Test Everything:

1. **Health Check**:
   ```
   GET https://your-backend.onrender.com/api/health
   ```

2. **Test Login** (from frontend):
   - Update frontend API URL
   - Try logging in
   - Should work!

3. **Test Order**:
   - Create an order
   - Check if it appears in dashboard

4. **Test Webhook**:
   - Create shipment in ShipMozo
   - Cancel it
   - Should update in dashboard automatically!

---

## 🚀 Ready to Deploy?

### Quick Checklist:
- [ ] Render.com account created
- [ ] Environment variables ready
- [ ] MongoDB Atlas accessible
- [ ] All services (Cloudinary, Razorpay, ShipMozo) configured

### Let's Go!
1. Open https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Follow steps above
5. Deploy! 🚀

---

## 💡 Pro Tips

1. **Keep .env file safe**: Don't commit to GitHub
2. **Use strong JWT_SECRET**: At least 32 characters
3. **Monitor logs**: Check regularly for errors
4. **Set up alerts**: Get notified of issues
5. **Backup database**: MongoDB Atlas auto-backups

---

## 📞 Need Help?

### Resources:
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://cloud.mongodb.com
- Your GitHub Repo: https://github.com/vishalvkroy/sai-flow-water

### Common Issues:
- **Build fails**: Check environment variables
- **Can't connect**: Check MongoDB whitelist (allow all IPs: 0.0.0.0/0)
- **Webhook fails**: Update ShipMozo webhook URL

---

**Ready to make your backend live? Let's do this! 🚀**
