# 🚀 Render.com Deployment - Step by Step

## Prerequisites
- GitHub account (create at github.com if you don't have)
- Git installed on your computer
- All your environment variables from backend/.env file

---

## Step 1: Create GitHub Repository

### 1.1 Go to GitHub
1. Open https://github.com
2. Click "Sign in" (or "Sign up" if new)
3. Click the "+" icon (top right) → "New repository"

### 1.2 Repository Settings
- **Repository name**: `saiflow-water` (or any name you like)
- **Description**: "Sai Flow Water - E-commerce platform for water purifiers"
- **Visibility**: Private (recommended) or Public
- **DO NOT** initialize with README, .gitignore, or license
- Click "Create repository"

### 1.3 Copy the Repository URL
You'll see something like:
```
https://github.com/YOUR_USERNAME/saiflow-water.git
```
**Keep this URL handy!**

---

## Step 2: Push Your Code to GitHub

### 2.1 Open PowerShell in Your Project Folder
1. Open File Explorer
2. Navigate to: `c:\Water Filter copyy`
3. Type `powershell` in the address bar and press Enter

### 2.2 Initialize Git and Push
Copy and paste these commands ONE BY ONE:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Sai Flow Water"

# Set main branch
git branch -M main

# Add your GitHub repository (REPLACE with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/saiflow-water.git

# Push to GitHub
git push -u origin main
```

**Important**: Replace `YOUR_USERNAME` with your actual GitHub username!

### 2.3 Verify Upload
1. Go back to your GitHub repository page
2. Refresh the page
3. You should see all your files uploaded

---

## Step 3: Sign Up for Render.com

### 3.1 Create Account
1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Choose "Sign up with GitHub" (easiest)
4. Authorize Render to access your GitHub

### 3.2 Dashboard
You'll land on the Render dashboard.

---

## Step 4: Create Web Service on Render

### 4.1 Create New Service
1. Click "New +" button (top right)
2. Select "Web Service"

### 4.2 Connect Repository
1. You'll see a list of your GitHub repositories
2. Find "saiflow-water" (or your repo name)
3. Click "Connect"

**If you don't see your repo:**
- Click "Configure account" 
- Grant Render access to the repository

### 4.3 Configure Service
Fill in these details:

**Name**: `saiflow-backend`
- This will be your URL: `https://saiflow-backend.onrender.com`

**Region**: `Singapore` (closest to India)

**Branch**: `main`

**Root Directory**: `backend`
- ⚠️ IMPORTANT: Type exactly `backend` (this tells Render where your backend code is)

**Environment**: `Node`

**Build Command**: `npm install`

**Start Command**: `npm start`

**Plan**: Select **"Free"**
- 750 hours/month
- 512 MB RAM
- Shared CPU

Click "Advanced" to expand more options (we'll add environment variables next)

---

## Step 5: Add Environment Variables

### 5.1 Open Your .env File
1. Open `c:\Water Filter copyy\backend\.env` in notepad
2. Keep it open for reference

### 5.2 Add Variables in Render
In the "Environment Variables" section, click "Add Environment Variable" for each:

**Copy these EXACTLY from your .env file:**

| Key | Value (from your .env) |
|-----|------------------------|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Your JWT secret |
| `RAZORPAY_KEY_ID` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `SHIPMOJO_EMAIL` | Your ShipMozo email |
| `SHIPMOJO_PASSWORD` | Your ShipMozo password |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary name |
| `CLOUDINARY_API_KEY` | Your Cloudinary key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary secret |
| `EMAIL_USER` | Your email |
| `EMAIL_PASS` | Your email password |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

**Add this NEW variable:**
| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://yourdomain.com` (your Hostinger domain) |

### 5.3 Double-Check
- Make sure NO quotes around values
- No extra spaces
- All values copied correctly

---

## Step 6: Deploy!

### 6.1 Create Service
1. Scroll down
2. Click "Create Web Service"

### 6.2 Wait for Deployment
You'll see a build log. This takes **5-10 minutes**:

```
==> Cloning from https://github.com/...
==> Checking out commit...
==> Running build command 'npm install'...
==> Starting service with 'npm start'...
==> Your service is live 🎉
```

### 6.3 Check Status
- Green "Live" badge = Success! ✅
- Red "Failed" badge = Check logs for errors ❌

---

## Step 7: Test Your Backend

### 7.1 Get Your Backend URL
At the top of the page, you'll see:
```
https://saiflow-backend.onrender.com
```
**Copy this URL!**

### 7.2 Test Health Endpoint
Open in browser:
```
https://saiflow-backend.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running successfully",
  "timestamp": "2025-11-09T..."
}
```

✅ **If you see this, your backend is LIVE!**

---

## Step 8: Update Frontend Configuration

### 8.1 Update .env.production
The file is already created at:
`c:\Water Filter copyy\frontend\.env.production`

Edit it and replace with YOUR actual Render URL:
```
REACT_APP_API_URL=https://saiflow-backend.onrender.com/api
```

---

## Step 9: Update Webhook URLs

### 9.1 ShipMozo
1. Login to https://app.shipmozo.com
2. Go to Settings → Webhooks
3. Update URL to:
   ```
   https://saiflow-backend.onrender.com/api/webhooks/shipmojo
   ```
4. Save

### 9.2 Razorpay
1. Login to https://dashboard.razorpay.com
2. Go to Settings → Webhooks
3. Update URL to:
   ```
   https://saiflow-backend.onrender.com/api/webhook/razorpay
   ```
4. Save

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] All environment variables added
- [ ] Deployment successful (green "Live" badge)
- [ ] Health endpoint returns success
- [ ] Backend URL copied
- [ ] Frontend .env.production updated
- [ ] ShipMozo webhook updated
- [ ] Razorpay webhook updated

---

## 🔧 Troubleshooting

### Build Failed
**Check the logs for errors:**
- Missing environment variable?
- Typo in package.json?
- Wrong root directory?

**Common fixes:**
1. Go to "Environment" tab
2. Verify all variables are set
3. Click "Manual Deploy" → "Clear build cache & deploy"

### Service Won't Start
**Check logs for:**
- MongoDB connection error → Check MONGODB_URI
- Port already in use → Render handles this automatically
- Missing dependencies → Check package.json

### Can't Access Backend
**Verify:**
- Service status is "Live" (green)
- URL is correct: `https://YOUR-SERVICE-NAME.onrender.com`
- No typos in the URL

---

## 📊 Render Dashboard Tips

### View Logs
- Click "Logs" tab to see real-time server logs
- Useful for debugging

### Metrics
- Click "Metrics" to see:
  - CPU usage
  - Memory usage
  - Request count

### Manual Deploy
- Click "Manual Deploy" if you need to redeploy
- Use "Clear build cache & deploy" if having issues

### Environment Variables
- Click "Environment" to add/edit variables
- Changes require redeployment

---

## 🚨 Important Notes

### Free Tier Limitations
- **Sleeps after 15 minutes** of inactivity
- **First request takes ~30 seconds** to wake up
- **750 hours/month** (enough for one service)

### Keep It Awake (Optional)
Use https://cron-job.org:
1. Sign up (free)
2. Create new cron job
3. URL: `https://saiflow-backend.onrender.com/api/health`
4. Interval: Every 10 minutes
5. This keeps your backend awake 24/7

### Upgrade Options
If you need better performance:
- **Starter Plan**: $7/month
  - No sleep
  - 512 MB RAM
  - Better performance

---

## 🔄 Future Updates

### To Update Your Backend:
```powershell
# Make your changes, then:
git add .
git commit -m "Description of changes"
git push
```

Render will **automatically redeploy** when you push to GitHub!

---

## 📞 Need Help?

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com

### Check These First:
1. Render logs (Logs tab)
2. Environment variables (Environment tab)
3. Service status (should be green "Live")

---

## ✅ Next Steps

After backend is live:
1. ✅ Build frontend for production
2. ✅ Upload to Hostinger
3. ✅ Test complete flow
4. ✅ Set up monitoring

---

**Your backend URL**: `https://saiflow-backend.onrender.com`

**Save this URL** - you'll need it for frontend deployment!

🎉 **Congratulations! Your backend is now live on Render!**
