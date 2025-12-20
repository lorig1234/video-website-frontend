# Restart Guide - After Reboot or Updates

This guide explains how to start, stop, and restart the backend and frontend services.

---

## Configuration

**Important**: The video path and other settings can be changed in:
```
/home/tony-server/pieres/video-website-backend/config.py
```

Edit this file to change:
- `VIDEOS_PATH` - Where your video files are stored
- `SERVER_PORT` - Backend server port
- `SECRET_KEY` - JWT token secret (change in production!)
- `TOKEN_EXPIRE_MINUTES` - How long login tokens last

After changing config.py, restart the backend for changes to take effect.

---

## Quick Start (After Reboot)

To start everything after a system reboot:

```bash
# 1. Start Backend
cd /home/tony-server/pieres/video-website-backend
source venv/bin/activate
nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 &
deactivate

# 2. Start Nginx
sudo systemctl start nginx

# 3. Verify everything is running
ps aux | grep uvicorn | grep -v grep
sudo systemctl status nginx
```

---

## Backend Only

### Start Backend
```bash
cd /home/tony-server/pieres/video-website-backend
source venv/bin/activate
nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 &
deactivate
```

### Stop Backend
```bash
pkill -f uvicorn
```

### Restart Backend
```bash
# Stop it first
pkill -f uvicorn

# Wait a moment
sleep 2

# Start it again
cd /home/tony-server/pieres/video-website-backend
source venv/bin/activate
nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 &
deactivate
```

### Check Backend Status
```bash
# Check if running
ps aux | grep uvicorn | grep -v grep

# View logs (last 50 lines)
tail -50 /home/tony-server/pieres/video-website-backend/backend.log

# View logs in real-time
tail -f /home/tony-server/pieres/video-website-backend/backend.log
```

---

## Frontend (Nginx) Only

### Start Nginx
```bash
sudo systemctl start nginx
```

### Stop Nginx
```bash
sudo systemctl stop nginx
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### View Nginx Logs
```bash
# Error logs
sudo tail -50 /var/log/nginx/error.log

# Access logs
sudo tail -50 /var/log/nginx/access.log

# Real-time error logs
sudo tail -f /var/log/nginx/error.log
```

### Reload Nginx Config (without stopping service)
```bash
# After editing nginx config
sudo nginx -t              # Test config
sudo systemctl reload nginx  # Apply changes
```

---

## After Code Updates (Git Pull)

### Update Backend Code
```bash
cd /home/tony-server/pieres/video-website-backend
git pull

# If requirements.txt changed
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Restart backend
pkill -f uvicorn
sleep 2
source venv/bin/activate
nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 &
deactivate
```

### Update Frontend Code
```bash
cd /home/tony-server/pieres/video-website-frontend
git pull

# No restart needed - nginx serves static files
# However, users need to refresh their browser (Ctrl+F5)
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8087 is already in use
sudo lsof -i :8087

# If something is using it, kill it
sudo kill -9 <PID>

# Check for errors in log
tail -50 /home/tony-server/pieres/video-website-backend/backend.log
```

### Nginx won't start
```bash
# Check if port 8000 is in use
sudo lsof -i :8000

# Test nginx configuration
sudo nginx -t

# Check error logs
sudo tail -50 /var/log/nginx/error.log

# If permission issues with frontend files
chmod o+x /home/tony-server
chmod o+x /home/tony-server/pieres
chmod o+x /home/tony-server/pieres/video-website-frontend
chmod -R o+r /home/tony-server/pieres/video-website-frontend
```

### Website returns 502 Bad Gateway
This usually means nginx is running but can't connect to the backend.

```bash
# Check if backend is running
ps aux | grep uvicorn | grep -v grep

# If not running, start backend
cd /home/tony-server/pieres/video-website-backend
source venv/bin/activate
nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 &
deactivate
```

### Website returns 404 Not Found
Nginx is running but can't find the frontend files.

```bash
# Verify nginx config points to correct path
sudo cat /etc/nginx/sites-available/streaming | grep "root"

# Should show: root /home/tony-server/pieres/video-website-frontend;

# If wrong, fix it:
sudo nano /etc/nginx/sites-available/streaming
# Then restart nginx
sudo systemctl restart nginx
```

---

## URLs After Starting

- **Home**: http://149.106.159.76:8000
- **Login**: http://149.106.159.76:8000/login.html  
- **API Docs**: http://149.106.159.76:8000/docs
- **Local Testing**: http://127.0.0.1:8000

---

## Enable Auto-Start on Boot (Optional)

If you want the backend to start automatically on boot:

### Create systemd service for backend
```bash
sudo nano /etc/systemd/system/video-backend.service
```

Add this content:
```ini
[Unit]
Description=Video Streaming Backend
After=network.target

[Service]
Type=simple
User=tony-server
WorkingDirectory=/home/tony-server/pieres/video-website-backend
ExecStart=/home/tony-server/pieres/video-website-backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8087
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable video-backend.service
sudo systemctl start video-backend.service
```

### Nginx already auto-starts
Nginx is already configured to auto-start on boot (systemd handles this by default).

To disable auto-start:
```bash
sudo systemctl disable nginx
```

To re-enable auto-start:
```bash
sudo systemctl enable nginx
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `cd /home/tony-server/pieres/video-website-backend && source venv/bin/activate && nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 & deactivate` |
| Stop backend | `pkill -f uvicorn` |
| Check backend | `ps aux \| grep uvicorn \| grep -v grep` |
| Backend logs | `tail -f /home/tony-server/pieres/video-website-backend/backend.log` |
| Start nginx | `sudo systemctl start nginx` |
| Stop nginx | `sudo systemctl stop nginx` |
| Restart nginx | `sudo systemctl restart nginx` |
| Check nginx | `sudo systemctl status nginx` |
| Nginx errors | `sudo tail -f /var/log/nginx/error.log` |
