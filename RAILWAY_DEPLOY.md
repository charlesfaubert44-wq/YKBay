# Railway Deployment - FrozenShield Backend 🚂

## Quick Fix for Railway Build Error

If you saw: `Script start.sh not found` or `Railpack could not determine how to build the app`, this has been fixed!

### Files Added:
- ✅ `railway.toml` - Railway configuration
- ✅ `Procfile` - Process configuration
- ✅ `nixpacks.toml` - Build configuration
- ✅ `package.json` - Updated with Node.js version

---

## Deploy Backend to Railway (5 Minutes)

### Step 1: Create New Project

1. Go to **https://railway.app**
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose: **charlesfaubert44-wq/YKBay**

Railway will now automatically detect:
- Node.js application ✅
- Start command: `node server/server.js` ✅
- Build command: `npm install` ✅

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway automatically creates and connects the database
5. Environment variable `DATABASE_URL` is auto-provided

### Step 3: Configure Environment Variables

Click on your service → **"Variables"** tab → Add these:

#### Required Variables:

```bash
# Server
PORT=3002
NODE_ENV=production
HOST=0.0.0.0

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secret_random_string_here_change_this

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
```

#### Optional (For Email Features):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 4: Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://ykbay-production.up.railway.app`
4. **Copy this URL** - you'll need it for Vercel

### Step 5: Deploy

1. Click **"Deploy"** (or it auto-deploys)
2. Watch the build logs
3. Wait for: `✅ Build successful`
4. Wait for: `✅ Deployment live`

### Step 6: Initialize Database

After first deployment, initialize your database:

#### Option A: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run database setup
railway run node server/scripts/setupDatabase.js
```

#### Option B: Manual SQL

1. Go to your PostgreSQL database in Railway
2. Click **"Connect"** → **"Query"**
3. Run the SQL from `server/scripts/setupDatabase.js`

---

## Verify Deployment

### Test Backend Health

Visit your Railway URL + `/api/health`:

```
https://your-app.up.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "FrozenShield API",
  "timestamp": "2025-10-30T..."
}
```

### Check Logs

1. Click on your service in Railway
2. View **"Deployments"** tab
3. Click latest deployment
4. View logs to see:
   ```
   🛡️ FrozenShield API Server
   📍 Local:   http://localhost:3002
   ⏰ Started at ...
   ```

---

## Troubleshooting Railway Issues

### ❌ Build Failed: "Cannot find module"

**Solution:** Missing dependencies. Check your `package.json`:

```bash
# Ensure all dependencies are listed
npm install pdfkit nodemailer moment-timezone
npm install --save
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

Railway will auto-redeploy.

### ❌ Deployment Failed: "Port already in use"

**Solution:** Railway provides `PORT` via environment variable.

Ensure your `server/server.js` uses:
```javascript
const PORT = process.env.PORT || 3002;
```

### ❌ Database Connection Failed

**Solution:** Railway auto-provides `DATABASE_URL`.

**Check:**
1. PostgreSQL service is running
2. Both services are in same project
3. DATABASE_URL is visible in Variables

**Don't manually set DATABASE_URL** - Railway does this automatically.

### ❌ "Railpack could not determine how to build"

**Solution:** You've already fixed this! Files added:
- `railway.toml`
- `Procfile`
- `nixpacks.toml`

**If still failing:**
1. Ensure these files are committed to GitHub
2. Push to GitHub: `git push origin master`
3. In Railway, click **"Redeploy"**

### ❌ Application Crashes on Start

**Check logs for specific error:**

**Common issues:**
1. **Missing environment variables** - Add in Railway Variables
2. **Database not initialized** - Run database setup script
3. **Port binding issue** - Use `HOST=0.0.0.0`

---

## Railway Configuration Explained

### `railway.toml`
```toml
[build]
builder = "NIXPACKS"           # Use Nixpacks builder
buildCommand = "npm install"   # Install dependencies

[deploy]
startCommand = "node server/server.js"  # Start server
restartPolicyType = "ON_FAILURE"        # Auto-restart on crash
restartPolicyMaxRetries = 10            # Max 10 retries
```

### `Procfile`
```
web: node server/server.js
```
Tells Railway this is a web process.

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]  # Use Node.js 18

[start]
cmd = "node server/server.js"  # Start command
```

---

## Environment Variables Reference

### Auto-Provided by Railway

Railway automatically provides these when you add PostgreSQL:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=hostname
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=railway
```

**Don't manually set these!** Railway manages them.

### You Must Provide

```bash
PORT=3002                    # Server port
NODE_ENV=production         # Environment
HOST=0.0.0.0               # Bind to all interfaces
JWT_SECRET=random_string    # Authentication secret
FRONTEND_URL=https://...    # Your Vercel URL
```

### Optional (Email)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## After Railway Deployment

### Update Vercel with Railway URL

1. Go to Vercel project
2. **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your Railway URL:
   ```
   VITE_API_URL=https://your-app.up.railway.app
   ```
4. **Redeploy** frontend in Vercel

### Update Railway with Vercel URL

1. Go to Railway project
2. Your service → **Variables**
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Railway auto-redeploys

---

## Cost & Limits

### Free Tier
- ✅ $5 free credit per month
- ✅ ~500 execution hours
- ✅ 1 GB memory per service
- ✅ PostgreSQL included
- ✅ 1 GB database storage
- ✅ Automatic SSL
- ✅ Auto-deploy from GitHub

### After Free Credit
- 💰 ~$5-10/month for typical usage
- Pay only for what you use
- No credit card required for free tier

### Monitor Usage
1. Click **"Usage"** in Railway dashboard
2. See hours used, database size, bandwidth
3. Set up alerts when approaching limit

---

## Production Checklist

After deployment, verify:

- [ ] Backend responds at Railway URL
- [ ] Health endpoint returns 200 OK
- [ ] Database tables created
- [ ] Can register new user
- [ ] Can login
- [ ] JWT authentication works
- [ ] CORS configured correctly (Frontend URL)
- [ ] All API endpoints respond
- [ ] Environment variables set
- [ ] Logs show no errors
- [ ] Email service configured (if needed)
- [ ] Database backups enabled (Railway Pro)

---

## Next Steps

1. ✅ **Backend deployed** - Railway URL obtained
2. ⏭️ **Deploy frontend** - Follow [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
3. ⏭️ **Connect services** - Update URLs in both platforms
4. ⏭️ **Test live app** - Register, login, create trip
5. ⏭️ **Share with users** - Application is live!

---

## Railway CLI Commands

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Common Commands
```bash
railway login              # Login to Railway
railway link               # Link local project to Railway
railway status             # Check deployment status
railway logs               # View live logs
railway run [cmd]          # Run command in Railway environment
railway open               # Open project in browser
railway variables          # View environment variables
railway up                 # Deploy manually
```

### Useful Commands
```bash
# Run database setup
railway run node server/scripts/setupDatabase.js

# Check environment
railway run env

# Connect to database
railway connect postgres

# View logs
railway logs --follow
```

---

## Support

### Railway Support
- 📚 Docs: https://docs.railway.app
- 💬 Discord: https://discord.gg/railway
- 📧 Email: team@railway.app

### FrozenShield Issues
- Create issue: https://github.com/charlesfaubert44-wq/YKBay/issues

---

**🚂 Your FrozenShield backend is now deployed on Railway!**

**Railway URL:** `https://your-app.up.railway.app`

**Next:** Deploy frontend to Vercel using [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
