# Quick Deploy to Vercel 🚀

## Fastest Way to Deploy FrozenShield

### Option 1: Deploy via Vercel Dashboard (Easiest - 5 minutes)

#### Step 1: Deploy Backend to Railway First

1. **Sign up**: https://railway.app (use GitHub login)
2. **Create New Project** → **Deploy from GitHub**
3. **Select**: `charlesfaubert44-wq/YKBay`
4. **Add PostgreSQL Database**: Click "+ New" → "Database" → "PostgreSQL"
5. **Add Environment Variables** (Settings → Variables):
   ```
   PORT=3002
   NODE_ENV=production
   JWT_SECRET=your_secure_random_string_here
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. **Deploy** → Copy your Railway URL (e.g., `https://ykbay-production.up.railway.app`)

#### Step 2: Deploy Frontend to Vercel

1. **Sign up**: https://vercel.com (use GitHub login)
2. **New Project** → Import `charlesfaubert44-wq/YKBay`
3. **Configure**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   VITE_MAPBOX_TOKEN=your_mapbox_token
   VITE_APP_ENV=production
   ```
5. **Deploy** → Your app is live!

#### Step 3: Update Backend CORS

1. Go back to Railway
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy backend

**Done! Your app is live at: https://your-app.vercel.app** ✅

---

### Option 2: Deploy via CLI (For Power Users)

#### Prerequisites

```bash
# Install Vercel CLI
npm install -g vercel

# Install Railway CLI
npm install -g @railway/cli
```

#### Deploy Backend (Railway)

```bash
# Login to Railway
railway login

# From project root
cd "c:\Users\Charles\Desktop\Oct29\YK Bay"

# Initialize Railway project
railway init

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway variables set PORT=3002
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret_here

# Deploy
railway up

# Get your URL
railway status
```

#### Deploy Frontend (Vercel)

```bash
# Login to Vercel
vercel login

# Navigate to client folder
cd client

# Deploy preview
vercel

# When satisfied, deploy to production
vercel --prod
```

---

## Environment Variables You'll Need

### For Railway (Backend)

```env
PORT=3002
NODE_ENV=production
HOST=0.0.0.0
JWT_SECRET=change_this_to_a_random_string
FRONTEND_URL=https://your-vercel-url.vercel.app

# Optional: For email features
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### For Vercel (Frontend)

```env
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_MAPBOX_TOKEN=pk.your_mapbox_token
VITE_APP_ENV=production
```

---

## Get Your Tokens

### Mapbox Token (Free)
1. Sign up: https://account.mapbox.com/
2. Create token with default scopes
3. Copy token starting with `pk.`

### Gmail App Password (For SMTP)
1. Enable 2FA on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password
4. Use this password (not your Gmail password)

---

## Verify Deployment

### Check Backend
Visit: `https://your-railway-url.up.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "service": "FrozenShield API"
}
```

### Check Frontend
Visit: `https://your-vercel-url.vercel.app`

Should display FrozenShield homepage.

---

## Troubleshooting

### Build Fails on Vercel?
- ✅ Verify Root Directory is `client`
- ✅ Check all environment variables are set
- ✅ Review build logs in Vercel dashboard

### API Calls Not Working?
- ✅ Check `VITE_API_URL` is correct
- ✅ Verify CORS: `FRONTEND_URL` in Railway matches Vercel URL
- ✅ Check Railway service is running

### Database Connection Issues?
- ✅ Railway auto-provides `DATABASE_URL`
- ✅ Run database setup: `railway run node server/scripts/setupDatabase.js`

---

## Cost Breakdown

### Vercel (Frontend)
- **Free**: 100GB bandwidth, unlimited deployments
- **Pro**: $20/month (if you need more)

### Railway (Backend + Database)
- **Free**: $5 credit/month (~500 hours)
- **After free credit**: ~$5-10/month

**Total: FREE to start, $5-10/month after credits**

---

## Next Steps After Deployment

1. ✅ Test registration/login
2. ✅ Create a trip
3. ✅ Export PDF
4. ✅ Test on mobile
5. ✅ Share with friends
6. ✅ Set up custom domain (optional)

---

## Need Help?

- 📚 Full Guide: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 🐛 Issues: Create GitHub issue
- 💬 Vercel Support: https://vercel.com/discord
- 💬 Railway Support: https://discord.gg/railway

---

**🛡️ Your FrozenShield app will be live in under 10 minutes!**
