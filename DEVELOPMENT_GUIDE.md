# Development Guide

This guide explains how to run the backend and frontend locally for development without nginx.

## Prerequisites

- Python 3.12+
- A web browser
- Terminal/Command line access

---

## Backend Setup (First Time Only)

### 1. Navigate to Backend Directory
```bash
cd /home/tony-server/pieres/video-website-backend
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure Video Path (Optional)
Edit `config.py` to set your video directory:
```python
VIDEOS_PATH = "/path/to/your/videos"
```

---

## Running the Backend for Development

### 1. Navigate to Backend Directory
```bash
cd /home/tony-server/pieres/video-website-backend
```

### 2. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 3. Start Backend Server
```bash
uvicorn server:app --host 127.0.0.1 --port 8087 --reload
```

**Important Flags:**
- `--reload`: Automatically restarts server when code changes (essential for development)
- `--host 127.0.0.1`: Binds to localhost
- `--port 8087`: Runs on port 8087

### 4. Verify Backend is Running
Open your browser and go to:
- API Documentation: http://127.0.0.1:8087/docs
- Alternative Docs: http://127.0.0.1:8087/redoc

You should see the FastAPI interactive documentation.

---

## Running the Frontend for Development

Since the frontend is just static HTML/CSS/JavaScript files, you have two options:

### Option 1: Python HTTP Server (Recommended)

#### 1. Navigate to Frontend Directory
```bash
cd /home/tony-server/pieres/video-website-frontend
```

#### 2. Start HTTP Server
```bash
python3 -m http.server 8080
```

#### 3. Access Frontend
Open your browser and go to: http://localhost:8080

**Advantages:**
- Simple and built-in with Python
- No installation required
- Handles CORS properly
- Port 8080 avoids conflicts

### Option 2: Using a VS Code Extension

If you're using VS Code:

1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Frontend will open in your browser (usually on port 5500)

---

## Frontend Configuration for Development

### Update API Base URL

Edit `config.js` to point to your local backend:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8087';
```

This is already configured, so no changes needed if using default ports.

---

## Development Workflow

### Backend Development

1. **Start backend with reload:**
   ```bash
   cd /home/tony-server/pieres/video-website-backend
   source venv/bin/activate
   uvicorn server:app --host 127.0.0.1 --port 8087 --reload
   ```

2. **Make code changes** in backend files (`server.py`, `routers/`, etc.)

3. **Server auto-restarts** - changes take effect immediately

4. **View logs** in the terminal where uvicorn is running

5. **Test API endpoints** at http://127.0.0.1:8087/docs

### Frontend Development

1. **Start frontend server:**
   ```bash
   cd /home/tony-server/pieres/video-website-frontend
   python3 -m http.server 8080
   ```

2. **Make code changes** in frontend files (`index.html`, `player.html`, `config.js`, etc.)

3. **Refresh browser** (or hard refresh with Ctrl+Shift+R) to see changes

4. **Use browser DevTools:**
   - Press F12 to open Developer Tools
   - Check Console tab for JavaScript errors
   - Check Network tab for API calls
   - Use Sources tab for debugging

---

## Common Development Tasks

### Testing Authentication

1. Start both backend and frontend
2. Go to http://localhost:8080/login.html
3. Login with test credentials
4. Check browser Console (F12) for any errors
5. Verify token is stored in localStorage (Application tab in DevTools)

### Testing Video Streaming

1. Login first
2. Navigate to homepage
3. Click on a show and episode
4. Player should load at http://localhost:8080/player.html
5. Check Console for any errors
6. Check Network tab for video streaming requests

### Testing Watch Progress

1. Start watching a video
2. Check Console logs for "Saving watch progress" messages
3. Verify in backend logs that POST requests are received
4. Query database to confirm data is saved:
   ```bash
   sqlite3 /home/tony-server/pieres/video-website-backend/data/streaming.db
   SELECT * FROM watch_history ORDER BY watched_at DESC LIMIT 5;
   .exit
   ```

### Debugging API Calls

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "XHR" or "Fetch"
4. Click on any API call to see:
   - Request headers (check Authorization token)
   - Request payload
   - Response status and data
   - Response headers

---

## Database Management

### View Database Contents
```bash
sqlite3 /home/tony-server/pieres/video-website-backend/data/streaming.db

# List all tables
.tables

# View users
SELECT * FROM users;

# View watch history
SELECT * FROM watch_history ORDER BY watched_at DESC LIMIT 10;

# Exit
.exit
```

### Reset Watch History (for testing)
```bash
sqlite3 /home/tony-server/pieres/video-website-backend/data/streaming.db "DELETE FROM watch_history;"
```

---

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError` when starting backend
- **Solution:** Make sure venv is activated and dependencies are installed
  ```bash
  source venv/bin/activate
  pip install -r requirements.txt
  ```

**Problem:** Port 8087 already in use
- **Solution:** Kill existing process or use different port
  ```bash
  # Find process
  lsof -i :8087
  # Kill it
  kill -9 <PID>
  # Or use different port
  uvicorn server:app --host 127.0.0.1 --port 8088 --reload
  ```

**Problem:** Videos not found
- **Solution:** Check `config.py` has correct `VIDEOS_PATH`

### Frontend Issues

**Problem:** "Not authenticated" errors
- **Solution:** 
  1. Check if backend is running
  2. Clear localStorage and login again
  3. Check browser Console for errors

**Problem:** CORS errors
- **Solution:** Make sure you're using http.server or Live Server, not just opening files directly in browser (file://)

**Problem:** Changes not showing
- **Solution:** Hard refresh browser with Ctrl+Shift+R to clear cache

**Problem:** API calls failing
- **Solution:** 
  1. Verify backend is running at http://127.0.0.1:8087
  2. Check `config.js` has correct `API_BASE_URL`
  3. Check Network tab in DevTools for actual error

---

## Quick Reference Commands

### Start Everything for Development

**Terminal 1 - Backend:**
```bash
cd /home/tony-server/pieres/video-website-backend
source venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8087 --reload
```

**Terminal 2 - Frontend:**
```bash
cd /home/tony-server/pieres/video-website-frontend
python3 -m http.server 8080
```

**Browser:**
- Frontend: http://localhost:8080
- Backend Docs: http://127.0.0.1:8087/docs

### Stop Everything

- Press `Ctrl+C` in each terminal to stop the servers

---

## VS Code Setup (Optional)

### Recommended Extensions

1. **Python** - Python language support
2. **Pylance** - Fast Python language server
3. **Live Server** - Launch local development server
4. **SQLite Viewer** - View SQLite databases in VS Code

### Debugging Backend in VS Code

Create `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": [
                "server:app",
                "--reload",
                "--host",
                "127.0.0.1",
                "--port",
                "8087"
            ],
            "jinja": true,
            "justMyCode": true,
            "cwd": "${workspaceFolder}/video-website-backend",
            "python": "${workspaceFolder}/video-website-backend/venv/bin/python"
        }
    ]
}
```

Press F5 to start debugging with breakpoints!

---

## Production vs Development

### Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Backend Server | uvicorn with --reload | uvicorn in background (nohup) |
| Frontend Server | Python http.server | nginx reverse proxy |
| Ports | Backend 8087, Frontend 8080 | nginx 8000, proxies to backend 8087 |
| Logs | Terminal output | Log files |
| Auto-restart | Yes (--reload flag) | No (manual restart needed) |
| CORS | Handled by browser | Handled by nginx |

### Switching to Production

When ready to deploy, see `production_start.md` and `RESTART_GUIDE.md` for production setup with nginx.

---

## Tips for Effective Development

1. **Keep both terminals visible** so you can see logs from both backend and frontend server

2. **Use browser DevTools extensively** - most frontend issues can be diagnosed in Console and Network tabs

3. **Test incrementally** - make small changes and test immediately rather than making many changes at once

4. **Check backend logs** for API errors - uvicorn prints all requests and errors

5. **Use --reload flag** for backend - saves time by auto-restarting on code changes

6. **Hard refresh often** (Ctrl+Shift+R) - browser caching can hide your changes

7. **Keep API docs open** at http://127.0.0.1:8087/docs for quick endpoint testing

8. **Use print() or logging** in Python code for debugging (will show in terminal)

9. **Use console.log()** in JavaScript for debugging (will show in browser Console)

10. **Commit frequently** to git so you can revert if something breaks

---

## Need Help?

- **Backend API docs:** http://127.0.0.1:8087/docs
- **Check terminal logs** for error messages
- **Check browser Console** (F12) for JavaScript errors
- **Check Network tab** (F12) for API call failures
- **Review `RESTART_GUIDE.md`** for production deployment
- **Review `production_start.md`** for production setup details
