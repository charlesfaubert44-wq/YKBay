# PostgreSQL Installation Guide for Windows

## Quick Install

### Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download the latest version (16.x recommended)
4. Or use direct link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### Step 2: Run Installer

1. Run the downloaded `.exe` file
2. Click "Next" through the wizard
3. **Important settings:**
   - Installation Directory: Default is fine (`C:\Program Files\PostgreSQL\16`)
   - Select Components: Check ALL (PostgreSQL Server, pgAdmin, Command Line Tools, Stack Builder)
   - Data Directory: Default is fine
   - **Password:** Choose a password and **REMEMBER IT** (you'll need it for .env)
   - Port: Keep default **5432**
   - Locale: Default

4. Click "Next" and "Finish"

### Step 3: Verify Installation

Open PowerShell and test:

```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Should show "Running" status
```

### Step 4: Install PostGIS Extension

1. Open **Stack Builder** (installed with PostgreSQL)
2. Select your PostgreSQL installation
3. Expand "Spatial Extensions"
4. Check "PostGIS 3.x for PostgreSQL 16"
5. Click "Next" and install

OR use Application Stack Builder from Start Menu.

### Step 5: Update Your .env File

Edit `c:\Users\Charles\Desktop\Oct29\YK Bay\.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=true_north_navigator
DB_USER=postgres
DB_PASSWORD=your_password_from_step2
```

### Step 6: Run Database Setup

```powershell
cd "c:\Users\Charles\Desktop\Oct29\YK Bay"
npm run db:setup
```

## Troubleshooting

### PostgreSQL Won't Start

```powershell
# Start the service manually
net start postgresql-x64-16

# Or use Services app
# Press Win+R, type: services.msc
# Find "postgresql-x64-16" and click Start
```

### Can't Connect After Installing

1. Check if service is running: `Get-Service postgresql*`
2. Check firewall settings (allow port 5432)
3. Verify password in .env matches what you set during installation

### PostGIS Extension Missing

If PostGIS isn't available, you can install it manually:

```sql
-- Open pgAdmin or psql and run:
CREATE EXTENSION postgis;
```

## Alternative: Use pgAdmin

PostgreSQL comes with **pgAdmin** - a GUI tool:

1. Open pgAdmin from Start Menu
2. Connect to your server (use password from installation)
3. Right-click "Databases" → Create → Database
4. Name it: `true_north_navigator`
5. Then run: `npm run db:setup`
