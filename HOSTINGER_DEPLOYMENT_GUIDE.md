# 🚀 Deploy React Frontend to Hostinger - Complete Guide

## 📋 Prerequisites:
- ✅ Hostinger hosting account
- ✅ Domain name (or use Hostinger subdomain)
- ✅ Backend deployed on Render (DONE ✅)
- ✅ FTP/File Manager access

---

## 🎯 Step 1: Build Your React App for Production

### 1.1 Open Terminal in Frontend Folder
```bash
cd frontend
```

### 1.2 Build Production Version
```bash
npm run build
```

**This will create a `build` folder with optimized production files.**

**Wait for build to complete** (1-2 minutes). You'll see:
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
  XX KB  build/static/js/main.xxxxx.js
  XX KB  build/static/css/main.xxxxx.css

The build folder is ready to be deployed.
```

---

## 🎯 Step 2: Prepare Build Files

After build completes, you'll have:
```
frontend/
  └── build/
      ├── index.html
      ├── static/
      │   ├── css/
      │   ├── js/
      │   └── media/
      ├── manifest.json
      └── robots.txt
```

**These are the files you'll upload to Hostinger.**

---

## 🎯 Step 3: Upload to Hostinger

### Method 1: Using File Manager (Easiest)

#### 3.1 Login to Hostinger
1. Go to: https://hpanel.hostinger.com
2. Login with your credentials
3. Click on your hosting plan

#### 3.2 Open File Manager
1. Click **"File Manager"** in the control panel
2. Navigate to `public_html` folder
3. **Delete all default files** in public_html (index.html, etc.)

#### 3.3 Upload Build Files
1. Click **"Upload Files"** button
2. Select ALL files from `frontend/build` folder
3. Upload them to `public_html`

**OR drag and drop the entire contents of `build` folder**

**Final structure in public_html:**
```
public_html/
  ├── index.html
  ├── static/
  ├── manifest.json
  └── robots.txt
```

---

### Method 2: Using FTP (FileZilla)

#### 3.1 Get FTP Credentials
1. Hostinger Panel → **FTP Accounts**
2. Note down:
   - FTP Host: `ftp.yourdomain.com`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: `21`

#### 3.2 Connect with FileZilla
1. Download FileZilla: https://filezilla-project.org
2. Open FileZilla
3. Enter FTP credentials
4. Click **"Quickconnect"**

#### 3.3 Upload Files
1. Navigate to `public_html` on remote side
2. Delete all default files
3. Navigate to `frontend/build` on local side
4. Select ALL files in build folder
5. Drag to `public_html` folder
6. Wait for upload to complete

---

## 🎯 Step 4: Configure .htaccess for React Router

React uses client-side routing. You need `.htaccess` to handle routes properly.

### 4.1 Create .htaccess File

In `public_html`, create a file named `.htaccess` with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### 4.2 Upload .htaccess
- Save the file as `.htaccess` (note the dot at the beginning)
- Upload to `public_html` folder
- Make sure it's in the root of public_html

---

## 🎯 Step 5: Verify Deployment

### 5.1 Access Your Website
Open your domain in browser:
```
https://yourdomain.com
```

### 5.2 Test Routes
Try navigating to different pages:
```
https://yourdomain.com/products
https://yourdomain.com/login
https://yourdomain.com/cart
```

All should work without 404 errors!

### 5.3 Test Backend Connection
1. Try logging in
2. View products
3. Add to cart
4. Create test order

Everything should work with your Render backend!

---

## 🎯 Step 6: SSL Certificate (HTTPS)

### 6.1 Enable SSL in Hostinger
1. Hostinger Panel → **SSL**
2. Click **"Install SSL"**
3. Choose **"Free SSL"** (Let's Encrypt)
4. Wait 5-10 minutes for activation

### 6.2 Force HTTPS
Add this to the TOP of your `.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🎯 Step 7: Update Backend CORS (Important!)

Your backend needs to allow your Hostinger domain.

### 7.1 Add to Render Environment Variables

In Render Dashboard → Environment:

Update `FRONTEND_URL`:
```
FRONTEND_URL=https://yourdomain.com
```

### 7.2 Redeploy Backend
After updating, redeploy your backend on Render.

---

## 📋 Complete File Structure on Hostinger:

```
public_html/
  ├── .htaccess              ← React Router config
  ├── index.html             ← Main HTML file
  ├── manifest.json          ← PWA manifest
  ├── robots.txt             ← SEO file
  ├── favicon.ico            ← Site icon
  └── static/
      ├── css/
      │   └── main.xxxxx.css
      ├── js/
      │   └── main.xxxxx.js
      └── media/
          └── (images, fonts, etc.)
```

---

## 🔧 Troubleshooting:

### Issue 1: 404 on Page Refresh
**Solution**: Make sure `.htaccess` is uploaded and configured correctly

### Issue 2: API Not Connecting
**Solution**: 
1. Check `REACT_APP_API_URL` in `.env.production`
2. Rebuild: `npm run build`
3. Re-upload build files

### Issue 3: Blank Page
**Solution**:
1. Check browser console for errors (F12)
2. Verify all files uploaded correctly
3. Check `.htaccess` syntax

### Issue 4: CORS Error
**Solution**:
1. Add your domain to backend CORS
2. Update `FRONTEND_URL` in Render
3. Redeploy backend

---

## 🎯 Quick Deployment Checklist:

- [ ] Run `npm run build` in frontend folder
- [ ] Upload all files from `build` folder to `public_html`
- [ ] Create and upload `.htaccess` file
- [ ] Enable SSL certificate in Hostinger
- [ ] Update `FRONTEND_URL` in Render backend
- [ ] Test website on your domain
- [ ] Test all routes (products, login, cart, etc.)
- [ ] Test backend connection (login, orders, etc.)

---

## 🚀 After Deployment:

### Your Website Will Be:
- ✅ Live on your domain
- ✅ HTTPS secured
- ✅ Connected to production backend
- ✅ Fast and optimized
- ✅ SEO friendly
- ✅ Professional

### Test Everything:
1. **Homepage**: Loads correctly
2. **Products**: Display from backend
3. **Login/Signup**: Works with backend
4. **Cart**: Add/remove items
5. **Checkout**: Process orders
6. **Payment**: Razorpay integration
7. **Orders**: View order history

---

## 📱 Mobile Optimization:

Your React app is already mobile-responsive! Test on:
- Mobile browsers
- Tablets
- Different screen sizes

---

## 🔄 Future Updates:

When you make changes to frontend:

1. **Make changes** in your code
2. **Test locally**: `npm start`
3. **Build**: `npm run build`
4. **Upload**: Upload new build files to Hostinger
5. **Clear cache**: Ctrl + F5 to see changes

---

## 💡 Pro Tips:

### 1. Custom Domain
If using custom domain:
- Point A record to Hostinger IP
- Wait for DNS propagation (24-48 hours)

### 2. Performance
- Build is already optimized
- GZIP compression enabled in .htaccess
- Browser caching configured

### 3. SEO
- Update `public/index.html` meta tags before building
- Add sitemap.xml
- Configure robots.txt

### 4. Analytics
Add Google Analytics in `public/index.html` before building

---

## 🎉 Success!

Your frontend will be live at:
```
https://yourdomain.com
```

Connected to backend:
```
https://sai-flow-water.onrender.com/api
```

---

**Ready to deploy? Run `npm run build` in the frontend folder now!** 🚀
