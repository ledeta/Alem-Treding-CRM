# Render Backend Deployment Guide - MongoDB Setup

## Prerequisites
- Repository: `https://github.com/ledeta/Alem-Treding-CRM` (PUBLIC)
- MongoDB Connection: `mongodb+srv://milion:zeryehun@102030@cluster0.ioimjyw.mongodb.net/?appName=Cluster0`
- Vercel Frontend URL: (Get from your Vercel dashboard)

---

## Step 1: Create New Web Service in Render

1. Go to: **https://dashboard.render.com**
2. Click: **"New +"** → **"Web Service"**
3. Select: **"Public Git Repository"**
4. Paste URL: `https://github.com/ledeta/Alem-Treding-CRM.git`
5. Click: **"Connect"**

---

## Step 2: Configure Build Settings

Fill in these fields:

```
Name:                    alem-crm-backend
Environment:             Node
Root Directory:          backend
Build Command:           npm install && npm run build
Start Command:           node dist/main
Render Plan:             Free (or Starter)
```

---

## Step 3: Add Environment Variables

**IMPORTANT:** Add ALL of these variables exactly as shown:

### Copy-Paste Ready (one variable at a time):

**Variable 1:**
```
Name:  NODE_ENV
Value: production
```

**Variable 2:**
```
Name:  PORT
Value: 3001
```

**Variable 3:**
```
Name:  JWT_SECRET
Value: alem-crm-super-secret-jwt-key-development-only-change-in-production
```

**Variable 4:**
```
Name:  JWT_EXPIRATION
Value: 3600
```

**Variable 5:**
```
Name:  JWT_REFRESH_SECRET
Value: alem-crm-super-secret-refresh-key-development-only-change-in-production
```

**Variable 6:**
```
Name:  JWT_REFRESH_EXPIRATION
Value: 604800
```

**Variable 7:**
```
Name:  MONGODB_URI
Value: mongodb+srv://milion:zeryehun@102030@cluster0.ioimjyw.mongodb.net/?appName=Cluster0
```

**Variable 8:**
```
Name:  FRONTEND_URL
Value: https://YOUR_VERCEL_URL_HERE
```
(Replace `YOUR_VERCEL_URL_HERE` with your actual Vercel URL)

**Variable 9:**
```
Name:  UPLOAD_DIR
Value: ./uploads
```

**Variable 10:**
```
Name:  MAX_FILE_SIZE
Value: 52428800
```

**Variable 11:**
```
Name:  ALLOWED_FILE_TYPES
Value: xlsx,xls
```

**Variable 12:**
```
Name:  LOG_LEVEL
Value: debug
```

---

## Step 4: Deploy

1. Click: **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://alem-crm-backend.onrender.com`

---

## Step 5: Update Vercel Frontend

Once backend is deployed:

1. Go to: **Vercel Dashboard** → Your frontend project
2. Click: **Settings** → **Environment Variables**
3. Add:
   ```
   Name:  NEXT_PUBLIC_API_URL
   Value: https://alem-crm-backend.onrender.com
   ```
4. **Redeploy** the frontend

---

## Step 6: Test the Connection

1. Go to your Vercel frontend URL
2. Login with test account:
   - **Username:** admin
   - **Password:** Admin@2024!
3. Verify dashboard loads without "Failed to fetch" errors

---

## Troubleshooting

### If deployment fails:
- Check build logs in Render dashboard
- Ensure all environment variables are set correctly
- Verify MongoDB connection string is valid

### If frontend can't reach backend:
- Check `NEXT_PUBLIC_API_URL` in Vercel is set correctly
- Verify backend is running (check Render dashboard)
- Check CORS is enabled (it is by default in our config)

### MongoDB Connection Issues:
- Verify IP whitelist allows Render (should be *.0.0.0/0 for public)
- Test connection string in MongoDB Atlas dashboard

---

## Your Credentials

**MongoDB:**
- Connection String: `mongodb+srv://milion:zeryehun@102030@cluster0.ioimjyw.mongodb.net/?appName=Cluster0`

**Test Accounts:**
```
Admin:
- Username: admin
- Password: Admin@2024!
- Secret: AdminSecure#2024

Sales:
- Username: sales
- Password: Sales@2024!
- Secret: SalesSecure#2024

Million:
- Username: million
- Password: million123
- Secret: million456
```

---

## Notes

- Backend will auto-sync MongoDB on first run
- CORS is open to all origins (change in production)
- JWT tokens expire in 1 hour
- Refresh tokens expire in 7 days
