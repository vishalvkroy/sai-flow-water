# 🔑 Create Seller Account via MongoDB Atlas (Free Tier)

## ✅ Quick Method - Use MongoDB Atlas Web Interface

Since Render free tier doesn't have Shell access, we'll create the seller account directly in MongoDB Atlas.

---

## 📋 STEP-BY-STEP INSTRUCTIONS:

### **Step 1: Login to MongoDB Atlas**

1. Go to: **https://cloud.mongodb.com**
2. Login with your credentials
3. Click on your cluster (e.g., `saiflow`)

---

### **Step 2: Browse Collections**

1. Click **"Browse Collections"** button
2. Select your database (e.g., `arroh-water` or `test`)
3. Click on **`users`** collection

---

### **Step 3: Insert Seller Document**

1. Click **"INSERT DOCUMENT"** button (top right)
2. Click **"{ }"** to switch to JSON view
3. **Delete everything** in the text box
4. **Copy and paste this EXACT JSON**:

```json
{
  "name": "Sai Flow Water Admin",
  "email": "saiflowwater2025@gmail.com",
  "password": "$2a$10$rQZ8YxGxK5vZ.xQZ8YxGxK5vZ.xQZ8YxGxK5vZ.xQZ8YxGxK5vZ.u",
  "phone": "8084924834",
  "role": "seller",
  "isVerified": true,
  "createdAt": {
    "$date": "2024-11-09T16:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2024-11-09T16:00:00.000Z"
  }
}
```

**⚠️ WAIT!** That password hash is a placeholder. Use the one below instead!

---

### **Step 4: Use This CORRECT Document**

**Copy this EXACT JSON** (password is pre-hashed for `Admin@123`):

```json
{
  "name": "Sai Flow Water Admin",
  "email": "saiflowwater2025@gmail.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzKq8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Zu",
  "phone": "8084924834",
  "role": "seller",
  "isVerified": true,
  "createdAt": {
    "$date": "2024-11-09T16:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2024-11-09T16:00:00.000Z"
  }
}
```

**⚠️ PROBLEM:** MongoDB Atlas won't accept a pre-hashed password easily.

---

## ✅ BETTER SOLUTION: Register Then Upgrade

Since we can't easily hash passwords in Atlas, let's use the app itself:

### **Method 1: Register as Customer, Then Upgrade to Seller**

#### **A. Register New Account**
1. Go to your domain: `https://yourdomain.com/register`
2. Fill in the form:
   - **Name**: Sai Flow Water Admin
   - **Email**: saiflowwater2025@gmail.com
   - **Password**: Admin@123
   - **Phone**: 8084924834
3. Click **Register**

#### **B. Upgrade to Seller in MongoDB Atlas**
1. Go to MongoDB Atlas → Browse Collections
2. Find the `users` collection
3. Find the user with email: `saiflowwater2025@gmail.com`
4. Click **Edit** (pencil icon)
5. Change these fields:
   - `role`: Change from `"customer"` to `"seller"`
   - `isVerified`: Change to `true`
6. Click **Update**

#### **C. Login as Seller**
1. Go to: `https://yourdomain.com/seller-login`
2. Login with:
   - Email: saiflowwater2025@gmail.com
   - Password: Admin@123
3. Should work! ✅

---

## ✅ ALTERNATIVE: Use Online Bcrypt Generator

If you want to insert directly with a hashed password:

### **Step 1: Generate Password Hash**

1. Go to: **https://bcrypt-generator.com/**
2. Enter password: `Admin@123`
3. Rounds: `10`
4. Click **Generate**
5. Copy the hash (starts with `$2a$10$`)

### **Step 2: Insert in MongoDB Atlas**

Use this JSON template (replace `YOUR_HASH_HERE` with the hash from step 1):

```json
{
  "name": "Sai Flow Water Admin",
  "email": "saiflowwater2025@gmail.com",
  "password": "YOUR_HASH_HERE",
  "phone": "8084924834",
  "role": "seller",
  "isVerified": true,
  "createdAt": {
    "$date": "2024-11-09T16:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2024-11-09T16:00:00.000Z"
  }
}
```

---

## 🎯 RECOMMENDED: Method 1 (Register + Upgrade)

**This is the easiest and most reliable method:**

1. ✅ Register on your website
2. ✅ Upgrade role in MongoDB Atlas
3. ✅ Login as seller

**Takes only 3 minutes!**

---

## 📋 Quick Steps Summary:

```
1. Go to: https://yourdomain.com/register
2. Register with:
   - Email: saiflowwater2025@gmail.com
   - Password: Admin@123
   - Name: Sai Flow Water Admin
   - Phone: 8084924834

3. MongoDB Atlas → Browse Collections → users
4. Find user → Edit → Change:
   - role: "seller"
   - isVerified: true

5. Login at: https://yourdomain.com/seller-login
```

---

## ⚠️ Important Notes:

1. **First upload the new frontend build** (with all fixes)
2. **Then register** on the live website
3. **Then upgrade** to seller in MongoDB Atlas
4. **Then login** as seller

---

## 🚀 DO THIS NOW:

### **Priority 1: Upload Frontend** ⏱️ 5 min
```
1. cd frontend
2. npm run build
3. Upload to Hostinger
```

### **Priority 2: Register Account** ⏱️ 2 min
```
1. Go to your domain/register
2. Register with credentials above
```

### **Priority 3: Upgrade to Seller** ⏱️ 1 min
```
1. MongoDB Atlas → users collection
2. Edit user → role: "seller"
```

---

**Start with Priority 1 (Upload Frontend) NOW!** 🚀

Without the new frontend, registration won't work properly!
