# 🌐 Frontend Setup - Connect to Production Backend

## ✅ What I Fixed:

Updated `frontend/.env` to use your production backend:
```
REACT_APP_API_URL=https://sai-flow-water.onrender.com/api
```

---

## 🔄 Restart Your Frontend:

### Step 1: Stop Current Server
Press `Ctrl + C` in your frontend terminal

### Step 2: Restart Frontend
```bash
cd frontend
npm start
```

---

## 📋 Environment Files Explained:

### `.env` (Local Development)
- Used when you run `npm start`
- **NOW POINTS TO**: Production backend (Render)
- **USE THIS**: For local testing with production data

### `.env.production` (Production Build)
- Used when you run `npm run build`
- Used when deploying frontend to Vercel/Netlify
- **POINTS TO**: Production backend (Render)

---

## ✅ After Restarting:

Your local frontend will now:
- ✅ Connect to production backend on Render
- ✅ Use real MongoDB data
- ✅ Process real payments (test mode)
- ✅ Send real emails
- ✅ Create real shipments

---

## 🧪 Test It:

1. **Restart frontend**: `npm start`
2. **Open**: http://localhost:3000
3. **Try login/signup**
4. **Create test order**
5. **Check if it appears in database**

---

## 🎯 Quick Commands:

```bash
# Stop frontend (Ctrl + C)

# Restart frontend
cd frontend
npm start

# Frontend will now connect to:
# https://sai-flow-water.onrender.com/api
```

---

## ⚠️ Important Notes:

### CORS is Already Configured ✅
Your backend allows `localhost:3000` in CORS settings, so local frontend can connect to production backend.

### Data is Real ⚠️
- Orders created will be REAL
- Payments will be processed (test mode)
- Emails will be sent
- Use test data only!

---

## 🔧 If You Want Local Backend Instead:

If you want to run backend locally too:

1. **Start local backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Update frontend/.env**:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Restart frontend**

---

**Restart your frontend now and it will connect to production backend!** 🚀
