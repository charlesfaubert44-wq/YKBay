# True North Navigator API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.truenorth.app/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow this structure:
```json
{
  "success": true|false,
  "data": {},
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "vesselType": "string (optional)",
  "vesselDraft": "number (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "vesselType": "string",
      "vesselDraft": "number"
    },
    "token": "JWT token string"
  }
}
```

#### POST /auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "vesselType": "string",
      "vesselDraft": "number",
      "reputationScore": "number"
    },
    "token": "JWT token string"
  }
}
```

#### GET /auth/verify
Verify current authentication token.

**Headers:**
- Authorization: Bearer <token>

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "reputationScore": "number"
    }
  }
}
```

#### POST /auth/change-password
Change user password (requires authentication).

**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Tracks

#### POST /tracks/upload
Upload a new GPS track (multipart/form-data).

**Headers:**
- Authorization: Bearer <token>
- Content-Type: multipart/form-data

**Form Fields:**
- `file`: GPX/KML file (required)
- `vesselType`: string (optional)
- `vesselDraft`: number (optional)
- `waterLevel`: number (optional)
- `windSpeed`: number (optional)
- `waveHeight`: number (optional)
- `visibility`: string (optional)
- `privacy`: "public" | "private" (default: "public")
- `notes`: string (optional)
- `tags`: comma-separated string (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "trackId": "number",
    "trackUuid": "string",
    "uploadDate": "timestamp",
    "distance": "number",
    "duration": "number"
  }
}
```

#### GET /tracks/:id
Get track details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "track_uuid": "string",
    "upload_date": "timestamp",
    "vessel_type": "string",
    "vessel_draft": "number",
    "water_level": "number",
    "geometry": {
      "type": "LineString",
      "coordinates": [[lng, lat], ...]
    },
    "distance_km": "number",
    "verified": "boolean",
    "username": "string"
  }
}
```

#### GET /tracks/search
Search tracks within geographic bounds.

**Query Parameters:**
- `minLat`: number (required)
- `minLng`: number (required)
- `maxLat`: number (required)
- `maxLng`: number (required)
- `vesselType`: string (optional)
- `minDraft`: number (optional)
- `maxDraft`: number (optional)
- `minWaterLevel`: number (optional)
- `verified`: boolean (optional)
- `limit`: number (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "geometry": {},
      "vessel_type": "string",
      "distance_km": "number",
      "verified": "boolean"
    }
  ],
  "count": "number"
}
```

#### GET /tracks/user
Get authenticated user's tracks.

**Headers:**
- Authorization: Bearer <token>

**Query Parameters:**
- `limit`: number (default: 50)
- `offset`: number (default: 0)

#### POST /tracks/:id/verify
Verify a track (requires authentication).

**Headers:**
- Authorization: Bearer <token>

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": "boolean",
    "verification_count": "number"
  }
}
```

#### GET /tracks/popular
Get popular routes based on track clustering.

**Query Parameters:**
- `limit`: number (default: 10)

#### GET /tracks/statistics
Get overall track statistics.

### Hazards

#### POST /hazards
Report a new hazard.

**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "type": "rock|shallow|ice|debris|other",
  "severity": "low|medium|high",
  "location": {
    "type": "Point",
    "coordinates": [lng, lat]
  },
  "description": "string",
  "activeSeasons": ["summer", "winter"]
}
```

#### GET /hazards/:id
Get hazard details by ID.

#### GET /hazards/search
Search hazards within geographic bounds.

**Query Parameters:**
- `minLat`: number (required)
- `minLng`: number (required)
- `maxLat`: number (required)
- `maxLng`: number (required)
- `type`: string (optional)
- `severity`: string (optional)
- `verified`: boolean (optional)
- `activeOnly`: boolean (optional)

#### POST /hazards/:id/report
Add additional report to existing hazard.

**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "photoUrls": ["string"],
  "description": "string"
}
```

#### POST /hazards/:id/verify
Verify a hazard (admin only).

**Headers:**
- Authorization: Bearer <token>

#### GET /hazards/nearby
Get hazards near a specific location.

**Query Parameters:**
- `lat`: number (required)
- `lng`: number (required)
- `radius`: number in km (default: 5)

### Routes

#### POST /routes/optimal
Find optimal route between two points.

**Request Body:**
```json
{
  "startPoint": [lng, lat],
  "endPoint": [lng, lat],
  "preferences": {
    "vesselDraft": "number",
    "avoidHazards": "boolean",
    "preferVerified": "boolean",
    "maxDetour": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "direct|optimized",
    "confidence": "number (0-100)",
    "geometry": {
      "type": "LineString",
      "coordinates": [[lng, lat], ...]
    },
    "distance": "number",
    "trackCount": "number"
  }
}
```

#### GET /routes/heatmap
Get safety heatmap for an area.

**Query Parameters:**
- `minLat`: number (required)
- `minLng`: number (required)
- `maxLat`: number (required)
- `maxLng`: number (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "lat": "number",
      "lng": "number",
      "safety_score": "number",
      "track_count": "number",
      "hazard_proximity": "number"
    }
  ]
}
```

#### GET /routes/warnings
Get navigation warnings for an area.

**Query Parameters:**
- `minLat`: number (required)
- `minLng`: number (required)
- `maxLat`: number (required)
- `maxLng`: number (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "hazards": [],
    "waterLevel": {},
    "lowCoverageArea": {},
    "timestamp": "ISO 8601"
  }
}
```

### Users

#### GET /users/profile
Get authenticated user's profile.

**Headers:**
- Authorization: Bearer <token>

#### PUT /users/profile
Update user profile.

**Headers:**
- Authorization: Bearer <token>

**Request Body:**
```json
{
  "username": "string (optional)",
  "vesselType": "string (optional)",
  "vesselDraft": "number (optional)"
}
```

#### GET /users/contributors
Get top contributors by reputation.

**Query Parameters:**
- `limit`: number (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "username": "string",
      "reputation_score": "number",
      "track_count": "number",
      "hazard_reports": "number"
    }
  ]
}
```

### Water Levels

#### GET /water-levels/current
Get current water level readings.

**Response:**
```json
{
  "success": true,
  "data": {
    "station_name": "string",
    "level_meters": "number",
    "reading_date": "timestamp",
    "source": "string"
  }
}
```

#### GET /water-levels/history
Get historical water level data.

**Query Parameters:**
- `days`: number (default: 7)

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Anonymous users**: 100 requests per 15 minutes
- **Authenticated users**: 1000 requests per 15 minutes
- **File uploads**: 10 per hour

## Webhooks

For real-time updates, the API supports webhooks for:
- New hazard reports in your area
- Track verifications
- Water level changes
- Route popularity updates

## WebSocket Events

Connect to `ws://localhost:3001/ws` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  // Handle events: track_added, hazard_reported, etc.
});
```

## SDK Examples

### JavaScript/TypeScript
```javascript
import { TrueNorthAPI } from '@truenorth/sdk';

const api = new TrueNorthAPI({
  baseURL: 'http://localhost:3001/api',
  token: 'your-jwt-token'
});

// Upload track
const track = await api.tracks.upload(gpxFile, {
  vesselType: 'kayak',
  vesselDraft: 0.3
});

// Find route
const route = await api.routes.findOptimal(
  [-114.37, 62.45], // start
  [-114.30, 62.50], // end
  { preferVerified: true }
);
```

### Python
```python
from truenorth import TrueNorthClient

client = TrueNorthClient(
    base_url='http://localhost:3001/api',
    token='your-jwt-token'
)

# Search tracks
tracks = client.tracks.search(
    bounds={'min_lat': 62.4, 'max_lat': 62.5,
            'min_lng': -114.4, 'max_lng': -114.3},
    verified=True
)

# Report hazard
hazard = client.hazards.create(
    type='rock',
    severity='high',
    location={'type': 'Point', 'coordinates': [-114.35, 62.47]},
    description='Submerged rock, visible at low water'
)
```

## Testing

Use the provided Postman collection or curl commands:

```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Upload track
curl -X POST http://localhost:3001/api/tracks/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@track.gpx" \
  -F "vesselType=kayak" \
  -F "vesselDraft=0.3"
```

## Support

For API support, please contact:
- Email: api-support@truenorth.app
- GitHub Issues: https://github.com/truenorth/api/issues
- Documentation: https://docs.truenorth.app