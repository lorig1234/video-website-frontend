# Video Website — Service Guide

This guide explains how the backend and frontend are hosted, how they auto-start, and how to manage them.

---

## How It Works (Architecture Overview)

```
┌─────────────────────────────────────────────────────────┐
│  User's Browser                                         │
│  http://149.106.159.76:8000                             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Nginx (port 8000)                                      │
│  Service: nginx.service                                 │
│                                                         │
│  • Serves frontend HTML/CSS/JS files directly           │
│    from: /home/tony-server/pieres/video-website-frontend│
│                                                         │
│  • Proxies API requests (/api/*, /posters/*, /hls/*,    │
│    /docs) to the backend on 127.0.0.1:8087              │
│                                                         │
│  Config: /etc/nginx/sites-available/streaming           │
└──────────────────────┬──────────────────────────────────┘
                       │ proxy_pass (only for /api, etc.)
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend — Uvicorn + FastAPI (port 8087)                │
│  Service: video-backend.service                         │
│                                                         │
│  • Handles authentication, video listing, streaming     │
│  • Runs from: /home/tony-server/pieres/video-website-backend │
│  • Logs to:   /home/tony-server/pieres/video-website-backend/backend.log │
└─────────────────────────────────────────────────────────┘
```

**In short:** Nginx is the "front door" on port 8000. It serves your HTML pages directly and forwards API calls to the Python backend on port 8087.

---

## Auto-Start & Watchdog (systemd)

Both services are managed by **systemd** — the built-in Linux service manager. This means:

1. ✅ **Auto-start on boot** — When the PC turns on, both services start automatically. No manual action needed.
2. ✅ **Auto-restart on crash** — If either service crashes, systemd will restart it within 5 seconds.
3. ✅ **Logging** — systemd captures all output. You can view it with `journalctl`.

### What's configured

| Service | Service File | Auto-start | Auto-restart |
|---------|-------------|------------|--------------|
| **Backend** | `/etc/systemd/system/video-backend.service` | ✅ Enabled | ✅ `Restart=always` (5s delay) |
| **Nginx** | `/usr/lib/systemd/system/nginx.service` + override | ✅ Enabled | ✅ `Restart=always` (5s delay) |

### Backend service file (`/etc/systemd/system/video-backend.service`)
```ini
[Unit]
Description=Video Streaming Backend (uvicorn)
After=network.target

[Service]
Type=simple
User=tony-server
Group=tony-server
WorkingDirectory=/home/tony-server/pieres/video-website-backend
ExecStart=/home/tony-server/pieres/video-website-backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8087
Restart=always
RestartSec=5
StandardOutput=append:/home/tony-server/pieres/video-website-backend/backend.log
StandardError=append:/home/tony-server/pieres/video-website-backend/backend.log

[Install]
WantedBy=multi-user.target
```

### Nginx restart override (`/etc/systemd/system/nginx.service.d/restart.conf`)
```ini
[Service]
Restart=always
RestartSec=5
```

---

## Configuration

**Backend settings** can be changed in:
```
/home/tony-server/pieres/video-website-backend/config.py
```

Edit this file to change:
- `VIDEOS_PATH` — Where your video files are stored
- `SERVER_PORT` — Backend server port
- `SECRET_KEY` — JWT token secret (change in production!)
- `TOKEN_EXPIRE_MINUTES` — How long login tokens last

After changing config.py, restart the backend: `sudo systemctl restart video-backend`

**Nginx config** is at:
```
/etc/nginx/sites-available/streaming
```

After editing nginx config: `sudo nginx -t && sudo systemctl reload nginx`

---

## Managing Services

### Backend

```bash
# Start
sudo systemctl start video-backend

# Stop
sudo systemctl stop video-backend

# Restart (after code changes)
sudo systemctl restart video-backend

# Check status
sudo systemctl status video-backend

# View logs (last 50 lines)
tail -50 /home/tony-server/pieres/video-website-backend/backend.log

# View logs in real-time
tail -f /home/tony-server/pieres/video-website-backend/backend.log

# View systemd journal logs
journalctl -u video-backend -f
```

### Nginx (Frontend)

```bash
# Start
sudo systemctl start nginx

# Stop
sudo systemctl stop nginx

# Restart
sudo systemctl restart nginx

# Reload config without downtime
sudo nginx -t && sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -50 /var/log/nginx/error.log

# View access logs
sudo tail -50 /var/log/nginx/access.log
```

---

## After Code Updates (Git Pull)

### Update Backend Code
```bash
cd /home/tony-server/pieres/video-website-backend
git pull

# If requirements.txt changed:
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Restart backend
sudo systemctl restart video-backend
```

### Update Frontend Code
```bash
cd /home/tony-server/pieres/video-website-frontend
git pull

# No restart needed — nginx serves static files directly.
# Users should refresh their browser (Ctrl+F5) to see changes.
```

---

## Troubleshooting

### Check if everything is running
```bash
sudo systemctl status video-backend --no-pager
sudo systemctl status nginx --no-pager
```

### Backend won't start
```bash
# Check if port 8087 is already in use
sudo lsof -i :8087

# Check for errors in log
tail -50 /home/tony-server/pieres/video-website-backend/backend.log

# Check systemd journal for errors
journalctl -u video-backend --no-pager -n 30
```

### Nginx won't start
```bash
# Test nginx configuration for syntax errors
sudo nginx -t

# Check if port 8000 is in use
sudo lsof -i :8000

# Check error logs
sudo tail -50 /var/log/nginx/error.log
```

### Website returns 502 Bad Gateway
Nginx is running but can't reach the backend.

```bash
# Check backend is running
sudo systemctl status video-backend

# If stopped, start it
sudo systemctl start video-backend
```

### Website returns 404 Not Found
Nginx can't find the frontend files.

```bash
# Verify nginx config points to the correct path
grep "root" /etc/nginx/sites-available/streaming
# Should show: root /home/tony-server/pieres/video-website-frontend;
```

---

## Disable / Re-enable Auto-Start

```bash
# Disable backend auto-start
sudo systemctl disable video-backend

# Re-enable backend auto-start
sudo systemctl enable video-backend

# Disable nginx auto-start
sudo systemctl disable nginx

# Re-enable nginx auto-start
sudo systemctl enable nginx
```

---

## URLs

| Page | URL |
|------|-----|
| Home | http://149.106.159.76:8000 |
| Login | http://149.106.159.76:8000/login.html |
| API Docs | http://149.106.159.76:8000/docs |
| Local Testing | http://127.0.0.1:8000 |

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `sudo systemctl start video-backend` |
| Stop backend | `sudo systemctl stop video-backend` |
| Restart backend | `sudo systemctl restart video-backend` |
| Check backend | `sudo systemctl status video-backend` |
| Backend logs | `tail -f /home/tony-server/pieres/video-website-backend/backend.log` |
| Start nginx | `sudo systemctl start nginx` |
| Stop nginx | `sudo systemctl stop nginx` |
| Restart nginx | `sudo systemctl restart nginx` |
| Reload nginx config | `sudo nginx -t && sudo systemctl reload nginx` |
| Check nginx | `sudo systemctl status nginx` |
| Nginx errors | `sudo tail -f /var/log/nginx/error.log` |

## Verification I ran

I verified the running services and configs on the host and confirmed both nginx and the backend are enabled, running, and configured to auto-restart under systemd.

- nginx service: loaded from `/usr/lib/systemd/system/nginx.service` with a drop-in at `/etc/systemd/system/nginx.service.d/restart.conf` containing:

    ```ini
    [Service]
    Restart=always
    RestartSec=5
    ```

- backend service: file at `/etc/systemd/system/video-backend.service` with the following key bits:

    ```ini
    [Service]
    WorkingDirectory=/home/tony-server/pieres/video-website-backend
    ExecStart=/home/tony-server/pieres/video-website-backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8087
    Restart=always
    RestartSec=5
    StandardOutput=append:/home/tony-server/pieres/video-website-backend/backend.log
    StandardError=append:/home/tony-server/pieres/video-website-backend/backend.log
    ```

- Confirmations I ran (examples):

    ```bash
    sudo systemctl status nginx --no-pager
    sudo systemctl status video-backend --no-pager
    sudo sed -n '1,200p' /etc/systemd/system/video-backend.service
    sudo sed -n '1,200p' /etc/systemd/system/nginx.service.d/restart.conf
    wget --spider -S http://127.0.0.1:8000
    wget --spider -S http://127.0.0.1:8087/docs
    sudo lsof -i :8087
    ```

## Recreating the backend service file (if required)

If you ever need to recreate the backend systemd unit (for example after a clean OS install), create `/etc/systemd/system/video-backend.service` with this content, then reload and enable it:

```ini
[Unit]
Description=Video Streaming Backend (uvicorn)
After=network.target

[Service]
Type=simple
User=tony-server
Group=tony-server
WorkingDirectory=/home/tony-server/pieres/video-website-backend
ExecStart=/home/tony-server/pieres/video-website-backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8087
Restart=always
RestartSec=5
StandardOutput=append:/home/tony-server/pieres/video-website-backend/backend.log
StandardError=append:/home/tony-server/pieres/video-website-backend/backend.log

[Install]
WantedBy=multi-user.target
```

Then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now video-backend
```

And for nginx watchdog behavior, create the drop-in (if missing):

```bash
sudo mkdir -p /etc/systemd/system/nginx.service.d
sudo tee /etc/systemd/system/nginx.service.d/restart.conf > /dev/null <<'EOF'
[Service]
Restart=always
RestartSec=5
EOF

sudo systemctl daemon-reload
sudo systemctl restart nginx
```

These steps ensure both services are started on boot and automatically restarted if they crash.
