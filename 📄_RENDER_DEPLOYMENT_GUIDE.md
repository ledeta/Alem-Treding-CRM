# 🚀 RENDER DEPLOYMENT GUIDE

**Date**: July 24, 2026  
**Application**: Alem CRM Frontend  
**Deployment Target**: Render.com (Free Tier)  
**Status**: Ready to Deploy

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- ✅ Code committed to GitHub (`main` branch)
- ✅ All features tested locally
- ✅ No console errors or warnings
- ✅ Build passes successfully
- ✅ Dependencies installed (including `xlsx`)
- ✅ Latest commits: `19f51a3` pushed to origin/main

---

## 🔑 STEP 1: Prepare Your Render Account

### 1.1 Create Render Account
1. Go to https://render.com
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Render to access your GitHub account
5. Complete account setup

### 1.2 Authorize GitHub Repository Access
1. In Render dashboard, go to **Account Settings**
2. Click **"Connections"**
3. Connect your GitHub account (or verify it's already connected)
4. Grant repository access to your GitHub account

---

## 🏗️ STEP 2: Create a New Web Service on Render

### 2.1 Start New Service
1. Go to https://dashboard.render.com
2. Click **"+ New"** button
3. Select **"Web Service"**

### 2.2 Connect Repository
1. Select **"Build and deploy from a Git repository"**
2. Click **"Connect"** next to your GitHub account
3. Search for **"Alem-Treding"** (or your repo name)
4. Click on it to select
5. Click **"Connect"**

### 2.3 Configure Build Settings

**Service Details**:
```
Name: alem-crm-frontend
(or any name you prefer)

Environment: Node
Region: Your closest region (e.g., Ohio for US)
Branch: main
```

**Build Command**:
```
npm install && npm run build
```

**Start Command**:
```
npm run start
```

**Instance Type**: Free (for testing/demo)

---

## 🔧 STEP 3: Set Environment Variables

### 3.1 Add Environment Variables in Render Dashboard

After clicking **"Create Web Service"**, you'll see an **"Environment"** section.

Add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://[your-app-name].onrender.com` |

**Note**: Replace `[your-app-name]` with your Render service name.

### 3.2 Example Setup
If your service is named `alem-crm-frontend`, set:
```
NEXT_PUBLIC_API_URL=https://alem-crm-frontend.onrender.com
```

---

## ✅ STEP 4: Deploy

### 4.1 Create Service
1. Scroll to bottom of the form
2. Click **"Create Web Service"**
3. Render will start building automatically

### 4.2 Monitor Build Progress
- The logs will display in real-time
- Watch for build completion (should take 2-5 minutes)
- Expected output:
  ```
  ✓ Running build command: npm install && npm run build
  ✓ Build successful
  ✓ Starting application...
  ✓ Application is live on https://alem-crm-frontend.onrender.com
  ```

### 4.3 Verify Deployment
1. Once build completes, you'll see a **"Live"** badge
2. Click the URL to visit your deployed app
3. Test login and features

---

## 🧪 STEP 5: Post-Deployment Testing

### 5.1 Test Login Flow
1. Visit: `https://[your-app-name].onrender.com`
2. Click "Admin" or "Sales" button
3. Enter credentials:
   - **Admin**: `admin` / `Admin@2024!` / `AdminSecure#2024`
   - **Sales**: `sales` / `Sales@2024!` / `SalesSecure#2024`
4. ✅ Should login successfully

### 5.2 Test Sales Features
1. Navigate to **Sales → Create Request**
2. Create a test payment request
3. Navigate to **Sales → Upload**
4. Upload a test Excel file
5. View data in table and card mode
6. ✅ Should work without errors

### 5.3 Test Admin Features
1. Navigate to **Admin → Approvals**
2. Verify payment requests appear
3. Try to approve/reject a request
4. Refresh page to verify status persists
5. ✅ Should work without errors

---

## 📊 MONITORING & MAINTENANCE

### View Logs
1. In Render dashboard, select your service
2. Click **"Logs"** tab
3. View real-time application logs

### Restart Service
1. Click **"Settings"** tab
2. Scroll to **"Restart"** section
3. Click **"Reboot"** button

### View Metrics
1. Click **"Metrics"** tab
2. Monitor CPU, memory, and bandwidth usage
3. Free tier has generous limits

### Redeploy
Push new code to main branch and Render will automatically redeploy:
```bash
git push origin main
```

---

## 🔗 IMPORTANT NOTES

### localStorage Persistence
- All data is stored in browser localStorage
- **Each user's browser has separate data**
- Data doesn't sync between devices
- Data persists until browser cache is cleared

### Free Tier Limitations
- **No persistent storage** - data only in localStorage
- **Auto-pauses after inactivity** - wake up on request
- **Monthly bandwidth limit** - generous for testing

### Data Backup
If you need persistent data across sessions, you would need:
1. Backend API (like the Node.js backend in this project)
2. Database (PostgreSQL, MongoDB, etc.)
3. Deploy backend alongside frontend

For now, localStorage is perfect for demo/testing.

---

## 🆘 TROUBLESHOOTING

### Issue: Build fails with "module not found"
**Solution**: Check `package.json` has all dependencies:
```json
{
  "dependencies": {
    "next": "^14.2.35",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "xlsx": "^0.18.5",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.x.x"
  }
}
```

### Issue: App goes blank after deployment
**Solution**: 
1. Check browser console for errors
2. Check Render logs for server errors
3. Try hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
4. Clear browser cache and cookies

### Issue: Login doesn't work
**Solution**: 
- Check localStorage is enabled in browser
- Try incognito/private window
- Check browser developer tools → Application → Storage → localStorage

### Issue: Excel upload not working
**Solution**:
- Check file is valid .xlsx, .xls, or .csv
- Check browser console for parsing errors
- Try a different Excel file
- Check localStorage has space (unlikely on free tier)

### Issue: Environment variables not applying
**Solution**:
1. Update environment variable in Render dashboard
2. Redeploy: Click **"Deployments"** → **"Redeploy"** on latest build
3. Wait for rebuild to complete
4. Clear browser cache

### Issue: "Auto-paused due to inactivity"
**Solution**: 
- This is normal on free tier
- App will restart when accessed
- Takes 30-60 seconds to wake up
- Upgrade to paid plan to prevent pauses

---

## 🚀 YOUR DEPLOYMENT CHECKLIST

Before you start deployment:

- [ ] You have a Render account (or will create one)
- [ ] You have GitHub access with Alem-Treding repository
- [ ] You're on main branch with latest code pushed
- [ ] You have a name picked for your service (e.g., `alem-crm-frontend`)
- [ ] You're ready to set environment variables

During deployment:

- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm run start`
- [ ] Add environment variables
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (green "Live" badge)

After deployment:

- [ ] Visit the app URL
- [ ] Test login with both users
- [ ] Test creating a payment request
- [ ] Test uploading Excel file
- [ ] Test admin approval workflow

---

## 📝 DEPLOYMENT SUMMARY

```
Repository:     https://github.com/miliyee/Alem-Treding
Branch:         main
Latest Commit:  19f51a3 - Session continuation documentation
Build Command:  npm install && npm run build
Start Command:  npm run start
Port:           3000 (internal, Render maps to 443)
Estimated Time: 2-5 minutes for first build
```

---

## ✨ AFTER SUCCESSFUL DEPLOYMENT

Your app will be live at:
```
https://[your-service-name].onrender.com
```

### Share Your App
- Share the URL with stakeholders
- Test with multiple users
- Gather feedback
- Request features or improvements

### Monitor Performance
- Check logs regularly for errors
- Monitor bandwidth and CPU usage
- Plan upgrade to paid tier if needed

### Keep Code Updated
```bash
# From your local machine
git push origin main
# Render automatically redeploys
```

---

## 🎉 YOU'RE READY TO DEPLOY!

Your Alem CRM frontend is production-ready. Follow the steps above to deploy to Render.

**Need help?**
- Render docs: https://render.com/docs
- Next.js docs: https://nextjs.org/docs
- GitHub docs: https://docs.github.com

**Questions?** Check your Render dashboard logs for detailed error messages.

---

**Happy Deploying! 🚀**

**Deployment Date**: Ready to go - July 24, 2026
