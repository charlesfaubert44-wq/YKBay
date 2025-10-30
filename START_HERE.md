# 🚀 START HERE - True North Navigator

Choose your setup path based on your needs:

---

## 🎯 Quick Decision Guide

**Want to test the app RIGHT NOW without installing PostgreSQL?**
→ Use **Option A: Quick Start (SQLite)**

**Planning to use this in production with full spatial features?**
→ Use **Option B: Full Setup (PostgreSQL)**

---

## Option A: Quick Start with SQLite (2 Minutes)

### Perfect for:
- ✅ Testing the app immediately
- ✅ Development without database setup
- ✅ Learning how the app works

### Limitations:
- ⚠️ No spatial queries (simplified geometry)
- ⚠️ Not recommended for production
- ⚠️ Some advanced features may not work

### Steps:

```powershell
# 1. Install all dependencies
npm install

# 2. Install frontend dependencies
cd client
npm install
cd ..

# 3. Setup SQLite database (no PostgreSQL needed!)
npm run db:setup-sqlite

# 4. Start the app
npm run dev
```

**That's it!** Open http://localhost:5173

**Login:** admin / admin123

---

## Option B: Full Setup with PostgreSQL

### Perfect for:
- ✅ Production deployment
- ✅ Full spatial features (PostGIS)
- ✅ Better performance
- ✅ Scalability

### Requirements:
- PostgreSQL 14+ with PostGIS extension

### Quick Steps:

1. **Install PostgreSQL:**
   - Download: https://www.postgresql.org/download/windows/
   - Follow installer (remember your password!)
   - Install PostGIS via Stack Builder

2. **Configure Environment:**
   ```powershell
   cp .env.example .env
   ```

   Edit `.env` and set:
   ```env
   DB_PASSWORD=your_postgres_password
   MAPBOX_ACCESS_TOKEN=your_mapbox_token
   JWT_SECRET=any_random_string
   ```

3. **Setup Database:**
   ```powershell
   npm install
   cd client && npm install && cd ..
   npm run db:setup
   ```

4. **Start App:**
   ```powershell
   npm run dev
   ```

**Detailed PostgreSQL installation:** See [INSTALL_POSTGRESQL.md](INSTALL_POSTGRESQL.md)

---

## 🔧 Your Current Issue

You got `ECONNREFUSED` error because PostgreSQL isn't installed/running.

### Solutions:

**Easiest:** Use SQLite (Option A above)
```powershell
npm run db:setup-sqlite
npm run dev
```

**Best for Production:** Install PostgreSQL (Option B)
- See [INSTALL_POSTGRESQL.md](INSTALL_POSTGRESQL.md)

---

## 🗺️ Get Your Mapbox Token

Both options need a Mapbox token for maps:

1. Sign up: https://www.mapbox.com/signup/ (FREE)
2. Go to: Account → Tokens
3. Copy your default public token (starts with `pk.`)
4. Create `client/.env`:
   ```bash
   echo "VITE_MAPBOX_TOKEN=pk.your_token_here" > client/.env
   ```

---

## ✅ Quick Verification

After setup, verify everything works:

1. **Backend API:** http://localhost:3001/api/health
   - Should return: `{"status":"OK",...}`

2. **Frontend:** http://localhost:5173
   - Should see the app with northern lights theme

3. **Login:** admin / admin123
   - Should access dashboard

---

## 🆘 Still Having Issues?

### Common Problems:

**Map shows gray screen:**
- Missing Mapbox token in `client/.env`
- Restart dev server after adding token

**Can't login:**
- Database not initialized
- Run `npm run db:setup-sqlite` again

**Port already in use:**
- Change PORT in `.env` (backend)
- Change port in `client/vite.config.js` (frontend)

**Module not found errors:**
- Run `npm install` in root
- Run `npm install` in client folder

---

## 📚 Next Steps

Once running:

1. **Explore the map** - Check out the interface
2. **Upload a test track** - Use `examples/sample-track.gpx`
3. **Check the dashboard** - View stats and leaderboard
4. **Read the docs:**
   - [README.md](README.md) - Project overview
   - [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
   - [QUICKSTART.md](QUICKSTART.md) - Feature guide

---

## 🎉 Ready to Go!

**Recommended for first-time users:**

```powershell
# Quick test with SQLite (no PostgreSQL needed)
npm install
cd client && npm install && cd ..
npm run db:setup-sqlite
npm run dev
```

Then open http://localhost:5173 and start exploring!

**Questions?** Check the docs or review code comments.
