# 🔑 Create Seller Account - Quick Guide

## Problem:
You're getting 401 errors because no seller account exists in the production database.

---

## ✅ Solution: Create Seller Account

### **Method 1: Using MongoDB Atlas (Easiest)**

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Login** with your credentials
3. **Browse Collections**:
   - Click your cluster
   - Click "Browse Collections"
   - Select your database (e.g., `arroh-water`)
   - Click `users` collection

4. **Insert New Document**:
   - Click **"INSERT DOCUMENT"**
   - Switch to **"JSON View"** (toggle at top)
   - Paste this:

```json
{
  "name": "Sai Flow Water Admin",
  "email": "saiflowwater2025@gmail.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "phone": "8084924834",
  "role": "seller",
  "isVerified": true,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

**WAIT!** The password needs to be hashed. Use Method 2 instead.

---

### **Method 2: Using Render Shell (Recommended)**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click your service**: `sai-flow-water-backend`
3. **Click "Shell"** tab (left sidebar)
4. **Wait for shell to connect**
5. **Run this command**:

```bash
node scripts/createSellerAccount.js
```

This will create/update the seller account with these credentials:

```
Email:    saiflowwater2025@gmail.com
Password: Admin@123
```

---

### **Method 3: Using Local Script (If local MongoDB works)**

If your local `.env` has the correct production MongoDB URI:

```bash
cd backend
node scripts/createSellerAccount.js
```

---

## 📋 Login Credentials

After creating the account, use these to login:

```
URL:      https://yourdomain.com/seller-login
Email:    saiflowwater2025@gmail.com
Password: Admin@123
```

---

## 🔧 Alternative: Register New Seller

If you want to create a seller through the app:

1. **Go to**: https://yourdomain.com/register
2. **Fill in the form**
3. **After registration**, manually update the user in MongoDB:
   - Find the user by email
   - Change `role` from `customer` to `seller`
   - Set `isVerified` to `true`

---

## ✅ Verify It Works

After creating the seller account:

1. Go to: https://yourdomain.com/seller-login
2. Enter:
   - Email: `saiflowwater2025@gmail.com`
   - Password: `Admin@123`
3. Click Login
4. Should redirect to seller dashboard ✅

---

## 🎯 Quick Fix (Use Render Shell):

**Fastest way:**

1. Render Dashboard → Your Service → **Shell**
2. Run: `node scripts/createSellerAccount.js`
3. Wait for success message
4. Login with credentials shown

---

**Do this now and you'll be able to login!** 🚀
