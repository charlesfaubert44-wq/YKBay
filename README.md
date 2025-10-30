# True North Navigator

**Community-Guided Waters of the North**

A community-powered navigation platform for safe passage across Northern Canadian waters. Built by boaters in Yellowknife and designed to scale across all Northwest Territories and Arctic regions, we combine modern technology with traditional knowledge sharing to keep Northern communities safe on the water.

![Version](https://img.shields.io/badge/version-1.0.0-2E8B8B)
![License](https://img.shields.io/badge/license-MIT-0B1A2B)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Android-4CAF6D)

---

## About True North Navigator

True North Navigator is more than a navigation app—it's a community safety network. Starting in Yellowknife Bay and expanding across Great Slave Lake, the platform empowers boaters to share GPS tracks, report hazards, and access verified routes even in areas without cell service.

### Our Mission
To provide free, community-driven navigation tools that honor Northern traditions of knowledge sharing while leveraging modern technology for safer waters from Yellowknife to the Arctic.

### Core Values
- **Safety First** - Every feature prioritizes boater safety
- **Community Trust** - Built by and for Northern communities
- **Cultural Respect** - Honors Indigenous heritage and traditional knowledge
- **Reliability** - Works offline in the most remote locations
- **Inclusivity** - Accessible to all skill levels and backgrounds

---

## Current Coverage

### Active Regions
- **Yellowknife Bay** - Full coverage with community verification
- **Great Slave Lake** - East Arm to West Basin
- **Yellowknife River** - Town to Prosperous Lake

### Expanding To
- Great Bear Lake (2026)
- Slave River & Fort Smith region (2026)
- Beaufort Sea coastal waters (2027)
- Additional NWT and Nunavut waters (Ongoing)

---

## Features

### Core Navigation
- **Track Upload** - Share GPS tracks from GPX, KML, CSV formats
- **AI Route Analysis** - Machine learning identifies safest routes from crowdsourced data
- **Interactive Map** - View official routes, community tracks, and hazard markers
- **Offline Support** - Download maps and routes for areas without cell service
- **Multi-Region Support** - Seamlessly navigate across different Northern waters

### Community Features
- **Share Tracks** - Contribute your local knowledge to help others
- **Report Hazards** - Alert the community to rocks, shoals, and changing conditions
- **Verify Routes** - Community voting on route safety and accuracy
- **Local Knowledge** - Access traditional navigation wisdom and seasonal considerations

### Safety & Conditions
- **Real-time Updates** - Water levels, weather, and user-reported conditions
- **Hazard Alerts** - Visual and notification-based warnings
- **Seasonal Routes** - Routes marked by season with ice and water level considerations
- **Emergency Info** - Quick access to VHF channels and emergency contacts

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with PostGIS extension (or SQLite for quick start)
- Mapbox API key (free tier available at https://mapbox.com)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/true-north-navigator.git
cd true-north-navigator
```

2. **Install dependencies**
```bash
npm install
cd client && npm install && cd ..
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. **Set up database**
```bash
# For full PostgreSQL setup:
npm run db:setup

# OR for quick start with SQLite:
npm run db:setup-sqlite
```

5. **Start development server**
```bash
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## Project Structure

```
true-north-navigator/
├── client/                    # React frontend
│   ├── public/
│   │   ├── manifest.json     # PWA configuration
│   │   └── icons/            # App icons (all sizes)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Map, Dashboard, Upload)
│   │   ├── contexts/         # React contexts (Auth, Toast, App)
│   │   ├── services/         # API service calls
│   │   ├── utils/            # Helper functions
│   │   └── App.jsx           # Main app component
│   ├── index.html            # HTML entry point with meta tags
│   └── tailwind.config.js    # Brand design system config
│
├── server/                    # Express backend
│   ├── controllers/          # Request handlers
│   ├── models/               # Database models (Track, User, Hazard)
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   │   └── ai/              # Route analysis algorithms (DBSCAN, heatmaps)
│   ├── middleware/           # Auth, validation, error handling
│   └── scripts/              # Database setup and utilities
│
├── docs/                      # Documentation
│   └── BRAND_GUIDELINES.md   # Complete brand system documentation
│
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
└── README.md                  # This file
```

---

## Tech Stack

### Frontend
- **React 18** + **Vite** - Fast, modern development
- **Mapbox GL JS** - Interactive maps with offline support
- **Tailwind CSS** - Utility-first styling with custom Northern theme
- **Turf.js** - Geospatial calculations and analysis
- **Lucide Icons** - Consistent, accessible iconography

### Backend
- **Node.js** + **Express** - RESTful API server
- **PostgreSQL** + **PostGIS** - Spatial database for track storage
- **SQLite** (optional) - Lightweight alternative for development
- **JWT Authentication** - Secure user sessions
- **Multer** - File upload handling (GPX, KML, CSV)

### AI/ML Analysis
- **DBSCAN Clustering** - Identify common routes from GPS tracks
- **Heatmap Generation** - Visualize track density and safety
- **Route Confidence Scoring** - Rate routes based on community usage
- **Anomaly Detection** - Flag unusual tracks for review

---

## Design System

True North Navigator features a **Northern Aesthetic** that scales from Yellowknife to all Northern regions while maintaining visual consistency and cultural respect.

### Brand Colors

**Primary Palette:**
- **Midnight Navy** `#0B1A2B` - Deep waters, night sky
- **Aurora Teal** `#2E8B8B` - Primary brand, northern lights
- **Arctic Ice** `#E8F4F4` - Backgrounds, clarity

**Regional Accents (Aurora Spectrum):**
- **Aurora Green** `#4CAF6D` - Yellowknife/Central NWT
- **Aurora Purple** `#8B5A9F` - Great Bear Lake/Western NWT
- **Aurora Blue** `#5B9BD5` - Beaufort Sea/Arctic waters
- **Aurora Pink** `#E67A9E` - Slave River/Eastern NWT

**Safety Colors:**
- **Critical Red** `#DC2626` - Hazards, danger
- **Warning Amber** `#F59E0B` - Caution, weather alerts
- **Success Green** `#10B981` - Verified, safe

### Typography
- **Display Font:** Outfit (headings, brand moments)
- **Body Font:** Inter (UI, text, navigation)
- **Monospace:** JetBrains Mono (coordinates, technical data)

### Iconography
Outlined style with 2px stroke, 24x24px grid, from Lucide icon family for consistency.

**For complete brand guidelines, see:** [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)

---

## Development

### Available Scripts

```bash
npm run dev          # Start both frontend and backend in development mode
npm run server       # Start backend only (with nodemon)
npm run client       # Start frontend only (Vite dev server)
npm run build        # Build production frontend
npm start            # Start production server
npm run quickstart   # Install dependencies, setup SQLite DB, and start dev server
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=truenorth_nav
DB_USER=your_username
DB_PASSWORD=your_password

# OR Database (SQLite - for development)
DB_TYPE=sqlite
DB_PATH=./database.sqlite

# API Keys
MAPBOX_ACCESS_TOKEN=your_mapbox_token
JWT_SECRET=your_secure_random_string

# Server Config
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### API Documentation

**Authentication:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/verify` - Verify JWT token validity

**Tracks:**
- `GET /api/tracks` - Get all tracks (with optional region filter)
- `GET /api/tracks/:id` - Get specific track by ID
- `POST /api/tracks` - Upload new GPS track (GPX/KML/CSV)
- `DELETE /api/tracks/:id` - Delete own track (auth required)

**Hazards:**
- `GET /api/hazards` - Get all hazards in region
- `POST /api/hazards` - Report new hazard (auth required)
- `PUT /api/hazards/:id` - Update hazard status (auth required)

**Routes (AI-Generated):**
- `GET /api/routes/recommended` - Get AI-recommended safe routes
- `GET /api/routes/heatmap` - Get track density heatmap data

---

## Contributing

We welcome contributions from the boating community! True North Navigator is built on shared knowledge.

### How to Contribute

1. **Share your tracks** - Upload GPS tracks to improve route data
2. **Report hazards** - Help keep the community informed
3. **Code contributions** - See [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **Documentation** - Improve guides and help pages
5. **Community feedback** - Report bugs and suggest features

### Development Guidelines

- Follow the brand guidelines in [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)
- Maintain WCAG AA accessibility standards
- Write clean, commented code
- Test on mobile devices (primary platform)
- Consider offline-first functionality
- Respect cultural sensitivity in all contributions

---

## Safety Notice

**IMPORTANT:** True North Navigator is a navigation aid and should not replace traditional navigation methods, official charts, or local knowledge. Always:

- Carry paper charts and compass
- Check water levels and weather forecasts
- File a float plan with someone onshore
- Wear a properly fitted lifejacket
- Know your boat's limitations
- Respect posted restrictions and closures
- Monitor VHF Channel 16 for emergencies
- Understand that community-sourced data may not be 100% accurate

**In case of emergency:**
- VHF Channel 16 (Maritime Emergency)
- Cell: 911 (if in coverage area)
- Satellite: Use emergency beacon (EPIRB/PLB)

---

## Regional Expansion

True North Navigator is designed to scale from local waters to the entire Canadian North while respecting regional differences and Indigenous knowledge.

### Expansion Principles
1. **Community First** - Partner with local boating communities
2. **Cultural Respect** - Engage Indigenous organizations and knowledge keepers
3. **Local Customization** - Adapt features to regional needs (ice vs. tides vs. rapids)
4. **Consistent Core** - Maintain brand identity while allowing regional character
5. **Incremental Growth** - Expand thoughtfully, not rapidly

### Next Regions
See [BRAND_GUIDELINES.md - Regional Expansion Framework](./BRAND_GUIDELINES.md#regional-expansion-framework) for detailed expansion plans.

---

## Accessibility

True North Navigator is committed to WCAG 2.1 Level AA compliance:

- Keyboard navigation for all functions
- Screen reader compatible
- High contrast color combinations (4.5:1 minimum)
- Touch targets minimum 44x44px
- Respects reduced motion preferences
- Multi-language support (English, French, Indigenous languages as resources allow)

---

## License

MIT License - See [LICENSE](./LICENSE) for details.

True North Navigator is free and open-source software. We believe safety information should be freely accessible to all Northern communities.

---

## Contact & Community

### Get Involved
- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Community forum for questions and ideas
- **Email** - [contact info to be added]

### Acknowledgments

True North Navigator honors the traditional territories and waters of Indigenous peoples across the North, including the Tlicho, Dene, Inuvialuit, Metis, and Inuit nations. This project is built on the principle that knowledge sharing keeps communities safe—a tradition as old as the Northern waters themselves.

**Special thanks to:**
- Yellowknife boating community for initial GPS tracks
- Local knowledge keepers who shared navigation wisdom
- Open-source contributors who make projects like this possible

---

## Roadmap

### Version 1.0 (Current)
- [x] Yellowknife Bay coverage
- [x] GPX/KML/CSV track upload
- [x] Basic hazard reporting
- [x] Offline map support
- [x] AI route analysis

### Version 1.5 (Q1 2026)
- [ ] Great Slave Lake full coverage
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced weather integration
- [ ] Community verification system
- [ ] Multi-language support (French)

### Version 2.0 (Q3 2026)
- [ ] Great Bear Lake expansion
- [ ] Slave River navigation
- [ ] Indigenous language support
- [ ] Tidal data for coastal areas
- [ ] Enhanced offline features

### Version 3.0 (2027+)
- [ ] Beaufort Sea coastal waters
- [ ] Eastern NWT & Nunavut
- [ ] Integration with marine VHF
- [ ] Collaborative voyage planning
- [ ] Research partnerships

---

**Built with dedication in Yellowknife, Northwest Territories**

*Navigate safely. Share knowledge. Respect the North.*
