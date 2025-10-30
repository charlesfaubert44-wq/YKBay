# YK Bay UI/UX Redesign - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
```bash
# Ensure you have Node.js installed
node --version  # Should be v16+

# Navigate to project
cd "YK Bay"
```

### 1. Install Dependencies (if not already installed)
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies (in separate terminal)
cd ../server
npm install
```

### 2. Environment Setup
Create `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### 3. Start the Application
```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

The app should open at `http://localhost:5173`

---

## 📱 Testing the New UI/UX

### 1. **Test Navigation**
- Open the app
- Click through Map, Dashboard, Upload Track
- Try the mobile menu (resize browser < 768px)
- Notice the smooth animations

### 2. **Test Authentication**
Navigate to `/login` and try:

**Register a New Account:**
```
Username: testuser
Email: test@example.com
Password: test123
```

You should see:
- ✅ Form validation
- ✅ Loading spinner on submit
- ✅ Success toast notification
- ✅ Auto-redirect to dashboard
- ✅ Username in navigation

**Test Login:**
- Logout from the user menu
- Login with the same credentials
- Notice the "Welcome back" toast

**Test Errors:**
- Try invalid email format
- Try short password (< 6 chars)
- Try wrong credentials
- See error toasts and validation

### 3. **Test User Menu**
When logged in:
- Click your username in the top right
- Dropdown menu appears
- Click "Settings" → goes to dashboard
- Click "Logout" → logs out with toast

### 4. **Test Toast Notifications**
Toasts appear for:
- Successful login/register
- Logout
- Errors
- Auto-dismiss after 5 seconds
- Click X to dismiss manually

---

## 🎨 Using the New Components

### Example 1: Add a Button to Any Page
```jsx
import Button from '../components/ui/Button';
import { Download } from 'lucide-react';

function MyComponent() {
  return (
    <Button
      variant="aurora"
      size="lg"
      leftIcon={<Download size={20} />}
      onClick={() => console.log('Clicked!')}
    >
      Download Track
    </Button>
  );
}
```

### Example 2: Show a Toast Notification
```jsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError } = useToast();

  const handleAction = () => {
    // Do something...
    showSuccess('Action completed successfully!');
    // or
    showError('Something went wrong');
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

### Example 3: Create a Modal
```jsx
import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {/* Save */}}>
              Save
            </Button>
          </>
        }
      >
        <p>Modal content goes here!</p>
      </Modal>
    </>
  );
}
```

### Example 4: Use a Card
```jsx
import Card from '../components/ui/Card';

function MyComponent() {
  return (
    <Card variant="glass" hover padding="lg">
      <h2 className="text-xl font-bold text-ice-white mb-4">
        Track Statistics
      </h2>
      <p className="text-ice-blue">
        Distance: 25.3 km
      </p>
    </Card>
  );
}
```

### Example 5: Show Loading State
```jsx
import { useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SkeletonCard } from '../components/ui/Skeleton';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading data..." />;
    // or
    return <SkeletonCard />;
  }

  return <div>Your content</div>;
}
```

---

## 🔐 Using Authentication

### Check if User is Logged In
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Please login to continue</p>;
  }

  return <p>Welcome, {user.username}!</p>;
}
```

### Create a Protected Route
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// In App.jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🌐 Making API Calls

### Upload a Track
```jsx
import { useState } from 'react';
import trackService from '../services/trackService';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';

function UploadButton() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('track', file);
    formData.append('vesselType', 'kayak');

    try {
      const result = await trackService.uploadTrack(formData);
      showSuccess('Track uploaded successfully!');
      console.log('Track ID:', result.trackId);
    } catch (error) {
      showError(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button loading={loading} onClick={() => {/* trigger file input */}}>
      Upload Track
    </Button>
  );
}
```

### Fetch User Stats
```jsx
import { useState, useEffect } from 'react';
import userService from '../services/userService';
import { SkeletonCard } from '../components/ui/Skeleton';

function UserStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getUserStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <SkeletonCard />;

  return (
    <div>
      <p>Total Tracks: {stats.totalTracks}</p>
      <p>Total Distance: {stats.totalDistance} km</p>
    </div>
  );
}
```

---

## 🎨 Using Design Tokens

### Colors
```jsx
// In your components, use Tailwind classes:
<div className="bg-midnight-blue text-ice-white">
<Button className="bg-aurora-green">
<p className="text-ice-blue">
<div className="border-aurora-blue">
```

### Gradients
```jsx
<div className="bg-gradient-to-r from-aurora-green via-aurora-purple to-aurora-blue">
  Aurora Gradient
</div>

<div className="aurora-header">
  Header with animated aurora
</div>
```

### Animations
```jsx
<div className="animate-fadeIn">Fades in</div>
<div className="animate-slideUp">Slides up</div>
<div className="animate-slideInRight">Slides from right</div>
```

---

## 📱 Responsive Design Tips

### Mobile-First Approach
```jsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">Mobile only</div>
```

### Touch-Friendly Buttons
```jsx
// All buttons have .touch-target class (44x44px minimum)
<Button>Already touch-friendly!</Button>

// For custom buttons
<button className="touch-target">
  Custom Button
</button>
```

---

## 🐛 Common Issues & Solutions

### Issue: "useAuth must be used within an AuthProvider"
**Solution:** Make sure your component is inside the AuthProvider in App.jsx

```jsx
// App.jsx should have:
<AuthProvider>
  <YourComponent />
</AuthProvider>
```

### Issue: Toasts not appearing
**Solution:** Ensure ToastProvider wraps your app

```jsx
// App.jsx should have:
<ToastProvider>
  <YourComponent />
</ToastProvider>
```

### Issue: API calls failing with 401
**Solution:** Token might be expired or invalid

```jsx
// Logout and login again
const { logout } = useAuth();
logout();
```

### Issue: Styles not applying
**Solution:**
1. Check Tailwind classes are correct
2. Ensure index.css is imported in main.jsx
3. Try restarting the dev server

---

## 🎯 Next Steps

### Enhance Remaining Pages

1. **Dashboard:**
   - Replace mock data with API calls
   - Add loading skeletons
   - Add error handling

2. **MapView:**
   - Connect to heatmap API
   - Add hazard markers from API
   - Implement real-time updates

3. **UploadTrack:**
   - Connect to upload API
   - Add progress bar
   - Show upload confirmation

### Example: Enhance Dashboard
```jsx
import { useState, useEffect } from 'react';
import userService from '../services/userService';
import { SkeletonCard } from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import { useToast } from '../contexts/ToastContext';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userService.getUserStats();
        setStats(data);
      } catch (error) {
        showError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card variant="glass" hover>
        <h3 className="text-ice-blue text-sm mb-2">Total Tracks</h3>
        <p className="text-3xl font-bold text-ice-white">{stats.totalTracks}</p>
      </Card>
      {/* More stat cards... */}
    </div>
  );
}
```

---

## 📚 Learn More

- **Full Documentation:** See `UI_UX_REDESIGN_SUMMARY.md`
- **Component Props:** Check component files for JSDoc comments
- **Examples:** Look at Login.jsx for complete implementation

---

## ✅ Testing Checklist

Before deploying, test:

- [ ] Login/Register flows
- [ ] Toast notifications
- [ ] Mobile menu
- [ ] User dropdown
- [ ] Responsive design (resize browser)
- [ ] Keyboard navigation (Tab through forms)
- [ ] Error states (wrong password, etc.)
- [ ] Loading states
- [ ] Logout functionality

---

## 🎉 You're All Set!

You now have:
- ✅ Modern component library
- ✅ State management system
- ✅ API integration layer
- ✅ Beautiful animations
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Authentication flow

Start building amazing features! 🚀

---

**Need Help?**
- Review the full documentation in `UI_UX_REDESIGN_SUMMARY.md`
- Check component files for prop types
- Look at Login.jsx for implementation examples

*Happy coding! ⛵️*
