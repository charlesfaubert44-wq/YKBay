# Client Troubleshooting Guide

## 🔧 CSS MIME Type Error - FIXED!

### Problem
```
Loading module from "http://localhost:5173/src/index.css" was blocked
because of a disallowed MIME type ("").
```

This was caused by a service worker interfering with CSS file loading in development.

---

## ✅ **What Was Fixed**

1. **Disabled Service Worker in Development**
   - Service worker now commented out in `main.jsx`
   - Only enable for production builds

2. **Cleared Vite Cache**
   - Removed `node_modules/.vite` cache
   - Fresh start for the dev server

---

## 🧹 **Clear Browser Cache (Important!)**

To completely fix the issue, you need to clear the browser cache and unregister the service worker:

### Option 1: Hard Reload (Quick)
1. Open your browser at `http://localhost:5173`
2. Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. This forces a hard reload, bypassing cache

### Option 2: Clear Everything (Recommended)
1. Open DevTools (F12 or Right-click → Inspect)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In the left sidebar:
   - Click **Service Workers**
   - Click **Unregister** next to any service worker
   - Click **Clear site data** button at the top
4. Go to **Network** tab
5. Check **Disable cache** checkbox
6. Refresh the page (F5)

### Option 3: Browser Console (Fastest)
1. Open DevTools Console (F12, then click Console tab)
2. Paste and run this command:
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
    console.log('Service Worker unregistered');
  }
  location.reload(true);
});
```

---

## 🚀 **Restart the Dev Server**

After clearing the cache:

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
cd client
npm run dev
```

The app should now load correctly at `http://localhost:5173`

---

## 🎯 **Verify It's Working**

You should see:
1. ✅ No console errors about MIME types
2. ✅ CSS loaded correctly (colors, styling visible)
3. ✅ [vite] connected message
4. ✅ No service worker errors

Look for this in the console:
```
[vite] connected.
```

---

## 🔍 **Still Having Issues?**

### Issue: CSS still not loading
**Solution:** Clear browser data completely

**Chrome:**
1. Settings → Privacy and Security
2. Clear browsing data
3. Select "Cached images and files"
4. Time range: "Last hour"
5. Click "Clear data"

**Firefox:**
1. Options → Privacy & Security
2. Cookies and Site Data
3. Click "Clear Data"
4. Check "Cached Web Content"
5. Click "Clear"

### Issue: Service worker keeps reappearing
**Solution:** Make sure you saved the changes to `main.jsx`
- Check that the service worker lines are commented out
- Restart the dev server

### Issue: Port 5173 is in use
**Solution:** Kill the process using port 5173

```bash
# Windows
netstat -ano | findstr :5173
cmd //c "taskkill /PID <PID> /F"

# Or change the port in vite.config.js
server: {
  port: 5174  // Change to any available port
}
```

---

## 🛡️ **Prevention**

### For Development:
- Service worker is now disabled
- No more MIME type issues
- Faster hot reload

### For Production:
To enable the service worker for production:

1. Uncomment in `main.jsx`:
```javascript
import { registerServiceWorker } from './services/serviceWorkerRegistration'

// Only register in production
if (import.meta.env.PROD) {
  registerServiceWorker();
}
```

2. Build the app:
```bash
npm run build
```

---

## 📋 **Quick Commands**

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear Vite cache (Windows)
rmdir /s /q node_modules\.vite

# Restart dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 **Check CSS is Working**

Once the app loads, you should see:
- ✅ Aurora gradient navigation bar
- ✅ Northern lights color scheme (blues, greens, purples)
- ✅ Smooth animations
- ✅ Glass effect cards
- ✅ Proper fonts (Inter for body, Montserrat for headings)

If you see plain white background with black text, CSS didn't load.

---

## 🔧 **Advanced: Vite Cache Issues**

If Vite keeps having issues:

```bash
# Full clean
rm -rf node_modules/.vite
rm -rf dist
npm cache clean --force

# Reinstall (only if necessary)
rm -rf node_modules
npm install

# Restart
npm run dev
```

---

## ✅ **Your Issue is Fixed!**

✅ Service worker disabled in development
✅ Vite cache cleared
✅ Browser cache clearing instructions provided

**Just clear your browser cache using one of the methods above and refresh!** 🎉

---

## 🎯 **Expected Result**

After following these steps, you should see the beautiful YK Bay app with:
- Northern lights themed design
- Interactive navigation
- Smooth animations
- All CSS loaded correctly

**No more MIME type errors!** 🚀
