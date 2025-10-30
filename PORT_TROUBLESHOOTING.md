# Port Troubleshooting Guide

## 🔧 Quick Fix: Port Already in Use

### Problem
```
Error: listen EADDRINUSE: address already in use :::PORT
```

This happens when a previous Node.js process didn't shut down properly or another application is using the port.

---

## ✅ **Solutions**

### Solution 1: Kill the Process (Recommended)

**Windows:**
```bash
# Find what's using the port (replace 5000 with your port)
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
cmd //c "taskkill /PID <PID> /F"

# One-liner (automatically kills the process)
cmd //c "for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :5000') do taskkill /PID %a /F"
```

**Linux/Mac:**
```bash
# Find what's using the port
lsof -i :5000

# Kill the process
lsof -ti:5000 | xargs kill -9
```

### Solution 2: Change the Port

Edit your `.env` file:
```env
# Change this to any available port
PORT=5000  # or 3000, 3001, 8000, etc.
```

Then update the client `.env` to match:
```env
VITE_API_URL=http://localhost:5000/api
```

### Solution 3: Restart Everything

**Stop all processes:**
- Press `Ctrl+C` in all terminal windows
- Close VS Code (if running integrated terminal)
- Wait 5 seconds

**Start fresh:**
```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

---

## 🚀 **Current Configuration**

Your app is now configured to use:
- **Server Port:** 5000
- **Client Dev Server:** 5173 (Vite default)
- **API URL:** http://localhost:5000/api

---

## 🛡️ **Prevention**

The server now includes automatic error handling:

1. **Clear error messages** - Shows exactly what to do if port is in use
2. **Graceful shutdown** - Properly closes when you press Ctrl+C
3. **SIGTERM/SIGINT handling** - Prevents zombie processes

---

## 📋 **Common Port Numbers**

| Port | Common Use |
|------|------------|
| 3000 | React default, Next.js |
| 3001 | Common alternate |
| 5000 | Flask, Express common |
| 5173 | Vite dev server |
| 8000 | Django, Python HTTP server |
| 8080 | Alternative HTTP |

---

## 🐛 **Still Having Issues?**

### Issue: Port keeps getting taken
**Solution:** Something is auto-starting on your port. Check:
- Other running apps
- Docker containers
- Background services
- Previous terminal windows

### Issue: Can't kill the process
**Solution:** Run your terminal as Administrator (Windows) or use sudo (Mac/Linux)

```bash
# Windows: Right-click terminal → "Run as Administrator"

# Mac/Linux
sudo lsof -ti:5000 | xargs kill -9
```

### Issue: Server won't start even after killing process
**Solution:** Wait 10 seconds for the OS to fully release the port, then try again

---

## ✨ **Best Practices**

1. **Always stop servers properly:**
   - Use `Ctrl+C` instead of closing the terminal
   - This allows graceful shutdown

2. **Use standard ports:**
   - 5000 for backend API
   - 5173 for Vite frontend
   - Easy to remember and unlikely to conflict

3. **Check what's running:**
   ```bash
   # Windows
   netstat -ano | findstr :5000

   # Mac/Linux
   lsof -i :5000
   ```

4. **Use process managers (optional):**
   - PM2 for production
   - Nodemon for development (already configured)

---

## 🎯 **Quick Commands Reference**

```bash
# Check if port is in use (Windows)
netstat -ano | findstr :5000

# Kill process using port (Windows)
cmd //c "taskkill /PID <PID> /F"

# Check if port is in use (Mac/Linux)
lsof -i :5000

# Kill process using port (Mac/Linux)
kill -9 $(lsof -ti:5000)

# Start both server and client (from root)
npm run dev

# Start server only
cd server && npm run dev

# Start client only
cd client && npm run dev
```

---

## 🔍 **Understanding the Error**

```
Error: listen EADDRINUSE: address already in use :::5000
```

Breaking it down:
- **listen** - Trying to start server
- **EADDRINUSE** - Error code for "address already in use"
- **address already in use** - Something is using this port
- **:::5000** - Port number (5000 in this example)

---

## ✅ **Your Issue is Fixed!**

✅ Killed the old process on port 4772
✅ Changed server port to 5000
✅ Updated client API URL to match
✅ Added automatic error handling
✅ Added graceful shutdown

**Your server should now start without issues!** 🎉

---

**Need Help?** Check the server logs for helpful error messages with solutions.
