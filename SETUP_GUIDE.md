# True North Navigator - Setup Guide

Complete guide to get your Great Slave Lake Navigation App up and running.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **PostgreSQL 14+** with PostGIS extension ([Download](https://www.postgresql.org/download/))
- **Mapbox Account** (free tier) for map tiles ([Sign up](https://www.mapbox.com/signup/))
- **Git** (optional, for version control)

## Step 1: Database Setup

### Install PostgreSQL and PostGIS

**Windows:**
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. During installation, make sure to install Stack Builder
3. Use Stack Builder to install PostGIS extension

**macOS:**
```bash
brew install postgresql postgis
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib postgis
sudo systemctl start postgresql
```

### Create Database

1. Open PostgreSQL command line (psql) or use pgAdmin
2. The setup script will create the database automatically, but you need PostgreSQL running

## Step 2: Project Installation

### 1. Install Backend Dependencies

```bash
# Navigate to project root
cd "c:\Users\Charles\Desktop\Oct29\YK Bay"

# Install backend dependencies
npm install
```

### 2. Install Frontend Dependencies

```bash
# Navigate to client folder
cd client

# Install frontend dependencies
npm install

# Go back to root
cd ..
```

## Step 3: Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Edit .env File

Open `.env` in your text editor and configure:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (update these!)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=true_north_navigator
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# JWT Secret (IMPORTANT: Change this to a random string!)
JWT_SECRET=your_super_secret_jwt_key_here_please_change_this

# Mapbox API Key (get from https://mapbox.com)
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Get Mapbox API Token

1. Go to https://www.mapbox.com/signup/
2. Sign up for a free account
3. Navigate to "Tokens" in your account dashboard
4. Copy your default public token
5. Paste it in your `.env` file as `MAPBOX_ACCESS_TOKEN`

Also add it to `client/.env`:

```bash
# In client folder
echo "VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here" > .env
```

## Step 4: Initialize Database

Run the database setup script:

```bash
npm run db:setup
```

This will:
- Create the database `true_north_navigator`
- Enable PostGIS extension
- Create all necessary tables
- Set up spatial indexes
- Create a default admin user (username: admin, password: admin123)

**IMPORTANT:** Change the admin password after first login!

## Step 5: Start the Application

### Development Mode (Recommended)

Start both backend and frontend simultaneously:

```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend dev server on http://localhost:5173

### Production Mode

Build and run in production:

```bash
# Build frontend
npm run build

# Start server
npm start
```

## Step 6: Verify Installation

1. Open your browser and go to http://localhost:5173
2. You should see the True North Navigator homepage
3. Try logging in with:
   - Username: `admin`
   - Password: `admin123`

## Common Issues & Troubleshooting

### PostgreSQL Connection Failed

**Error:** `ECONNREFUSED` or `connection refused`

**Solutions:**
- Make sure PostgreSQL service is running
- Check if the port (5432) is correct
- Verify username and password in `.env`
- Check if PostgreSQL is listening on localhost

### PostGIS Extension Error

**Error:** `ERROR: could not open extension control file`

**Solution:**
```bash
# In psql as superuser
CREATE EXTENSION postgis;
```

### Mapbox Map Not Loading

**Error:** Map shows gray screen or "Unauthorized"

**Solutions:**
- Verify your Mapbox token is correct in both `.env` and `client/.env`
- Make sure you're using a public token (starts with `pk.`)
- Check Mapbox account is active
- Restart the dev server after changing .env files

### Port Already in Use

**Error:** `EADDRINUSE` on port 3001 or 5173

**Solution:**
```bash
# Find and kill process on port (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change the port in .env
PORT=3002
```

### File Upload Errors

**Error:** Cannot upload GPX files

**Solutions:**
- Make sure `uploads` directory exists and is writable
- Check `MAX_FILE_SIZE` in `.env`
- Verify file is valid GPX/KML/CSV format

## Next Steps

### 1. Import Sample Data

To test the app with sample tracks, you can:
- Use the Upload Track page to add your own GPS files
- Or import sample data (create sample GPX files)

### 2. Customize for Your Area

Edit the initial map view in `client/src/pages/MapView.jsx`:

```javascript
const INITIAL_VIEW_STATE = {
  longitude: -114.3718, // Your longitude
  latitude: 62.4540,    // Your latitude
  zoom: 10
};
```

### 3. Add Water Level Integration

To integrate real-time water levels:
1. Get Environment Canada API access
2. Update `ENVIRONMENT_CANADA_API_KEY` in `.env`
3. Implement water level fetch service

### 4. Production Deployment

For production deployment:

1. **Security:**
   - Change all default passwords
   - Use strong JWT secret
   - Enable HTTPS
   - Set `NODE_ENV=production`

2. **Database:**
   - Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
   - Set up regular backups
   - Configure connection pooling

3. **Hosting Options:**
   - **Backend:** Railway, Render, DigitalOcean, AWS
   - **Frontend:** Vercel, Netlify, Cloudflare Pages
   - **Database:** AWS RDS, DigitalOcean Managed PostgreSQL

4. **Environment Variables:**
   - Never commit `.env` to Git
   - Use hosting platform's environment variable management

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite HMR automatically reloads on changes
- Backend: Nodemon restarts server on file changes

### Database Migrations

When you modify the database schema:
1. Update `server/scripts/setupDatabase.js`
2. Create a new migration script
3. Test thoroughly before applying to production

### Adding New Features

Structure for adding features:
```
1. Backend: Create route in server/routes/
2. Database: Add tables/columns if needed
3. Frontend: Create components in client/src/components/
4. Connect: Use axios in client/src/services/
```

## Getting Help

- Check [README.md](README.md) for project overview
- Review code comments for implementation details
- Open GitHub issues for bugs or feature requests

## License

MIT License - See LICENSE file for details

---

**Happy Navigating! Stay safe on the water!**
