# True North Navigator - Quick Start

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ running
- Mapbox account (free)

## Installation Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and update:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Any random secure string
- `MAPBOX_ACCESS_TOKEN` - Get from https://mapbox.com

Also create `client/.env`:
```bash
echo "VITE_MAPBOX_TOKEN=your_mapbox_token_here" > client/.env
```

### 3. Setup Database

```bash
npm run db:setup
```

### 4. Start the App

```bash
npm run dev
```

Open http://localhost:5173

## Default Login

- **Username:** `admin`
- **Password:** `admin123`

**Change this immediately after first login!**

## What's Included

✅ **Interactive Map** - Mapbox-powered navigation interface with satellite imagery
✅ **Track Upload** - Support for GPX, KML, and CSV files
✅ **Heatmap Visualization** - See crowdsourced safe routes
✅ **Hazard Reporting** - Community-reported obstacles
✅ **User Dashboard** - Track statistics and leaderboard
✅ **Authentication** - Secure JWT-based auth system
✅ **AI Route Analysis** - Intelligent route recommendations
✅ **Northern Theme** - Beautiful aurora-inspired design

## Project Structure

```
YK Bay/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── index.css       # Northern theme styles
│   └── package.json
├── server/                  # Express backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic & AI
│   ├── middleware/         # Auth middleware
│   └── config/             # Database config
├── .env                     # Environment variables
└── package.json            # Backend dependencies
```

## Key Features to Try

### 1. Upload a Track
1. Go to "Upload Track" page
2. Drag & drop a GPX file
3. Fill in vessel and condition information
4. Click "Upload Track"

### 2. View Heatmap
1. Go to Map page
2. Toggle "Community Tracks Heatmap" layer
3. See where most boats navigate
4. Identify safe corridors

### 3. Report a Hazard
1. Click on map location (feature to add in UI)
2. Select hazard type (reef, rock, etc.)
3. Add description and photo
4. Submit report

### 4. Check Dashboard
1. View your uploaded tracks
2. See community leaderboard
3. Track your contributions
4. Monitor reputation score

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Tracks
- `GET /api/tracks` - Get all public tracks
- `POST /api/tracks/upload` - Upload track (requires auth)
- `GET /api/tracks/heatmap/data` - Get heatmap data
- `DELETE /api/tracks/:id` - Delete track (owner only)

### Hazards
- `GET /api/hazards` - Get all hazards
- `POST /api/hazards` - Report hazard (requires auth)
- `POST /api/hazards/:id/report` - Add report to existing hazard

### Routes
- `GET /api/routes` - Get official routes
- `GET /api/routes/:id` - Get route with waypoints

### Users
- `GET /api/users/stats` - Get user statistics (requires auth)
- `GET /api/users/tracks` - Get user's tracks (requires auth)
- `GET /api/users/leaderboard` - Get community leaderboard

## Tech Stack

**Frontend:**
- React 19 with Vite
- Mapbox GL JS for maps
- React Router for navigation
- Tailwind CSS with custom northern theme
- Axios for API calls

**Backend:**
- Node.js + Express
- PostgreSQL with PostGIS (spatial data)
- JWT authentication
- Multer for file uploads
- xml2js for GPX parsing

**AI/Analysis:**
- Turf.js for geospatial calculations
- Custom route clustering algorithm
- Density-based heatmap generation

## Next Steps

1. **Read [SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed configuration
2. **Customize map center** for your area in `MapView.jsx`
3. **Add sample data** by uploading GPX tracks
4. **Integrate water levels** from Environment Canada
5. **Deploy to production** (see deployment guides)

## Troubleshooting

**Map not loading?**
- Check Mapbox token in both `.env` files
- Restart dev server after changing .env

**Database connection error?**
- Ensure PostgreSQL is running
- Verify credentials in `.env`
- Run `npm run db:setup` again

**File upload fails?**
- Check `uploads/` directory exists
- Verify file format (GPX, KML, CSV only)
- Check file size limit (10MB default)

## Support

- 📖 Documentation: See README.md and SETUP_GUIDE.md
- 🐛 Issues: Open a GitHub issue
- 💬 Questions: Check code comments

## Safety Notice

⚠️ **This app is a navigation aid, NOT a replacement for:**
- Official nautical charts
- Local knowledge and experience
- Proper safety equipment
- Weather monitoring
- Float plan filing

**Always prioritize safety on the water!**

---

**Built for the Great Slave Lake boating community**
Stay safe and happy navigating! 🚤
