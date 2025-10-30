# True North Navigator

A community-powered navigation app for safe passage through Great Slave Lake (Yellowknife Bay to East Arm).

## Features

- **Track Upload**: Upload GPS tracks from GPX, KML, CSV formats
- **AI Route Analysis**: Machine learning identifies safest routes from crowdsourced data
- **Interactive Map**: View official routes, community tracks, and hazard markers
- **Offline Support**: Download maps and routes for areas without cell service
- **Community Features**: Share tracks, report hazards, contribute to safety
- **Real-time Conditions**: Water levels, weather, and user-reported updates

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Mapbox API key (free tier available)

### Installation

1. Install dependencies:
```bash
npm install
cd client && npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

3. Set up database:
```bash
npm run db:setup
```

4. Start development server:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   ├── styles/      # Northern theme CSS
│   │   └── utils/       # Helper functions
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   └── ai/         # Route analysis algorithms
│   └── scripts/         # Database setup scripts
└── docs/                # Documentation

```

## Tech Stack

**Frontend:**
- React + Vite
- Mapbox GL JS
- Tailwind CSS
- Turf.js (geospatial)

**Backend:**
- Node.js + Express
- PostgreSQL + PostGIS
- JWT authentication

**AI/ML:**
- Track clustering (DBSCAN)
- Heatmap generation
- Route confidence scoring

## Design System

The app features a **Northern Aesthetic** inspired by the NWT landscape:

**Colors:**
- Aurora Green: `#1a4d2e`
- Ice Blue: `#c8e6f5`
- Midnight Blue: `#0f1c2e`
- Tundra Gold: `#d4a574`

**Icons:** Inukshuk, northern lights, and traditional northern motifs

## Contributing

We welcome contributions from the boating community! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Safety Notice

This app is a navigation aid and should not replace traditional navigation methods, charts, or local knowledge. Always:
- Carry paper charts and compass
- Check water levels and weather
- Tell someone your float plan
- Wear a lifejacket

## License

MIT License - See [LICENSE](LICENSE) for details

## Contact

For questions, suggestions, or to report issues, please open a GitHub issue or contact [your contact info].

---

**Built with ❄️ in Yellowknife, Northwest Territories**
