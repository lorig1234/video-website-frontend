# Production Setup Guide
# Server: 149.106.159.76
# Port: 8000

## First Time Setup (Run Once)

### 1. Install required packages
```bash
sudo apt update
sudo apt install -y nginx python3 python3-pip python3-venv
```

### 2. Setup Backend
```bash
cd /path/to/video-website-backend

# Create virtual environment
python3 -m venv venv

# Activate venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p data videos posters hls

deactivate
```

### 3. Setup Nginx
```bash
# Copy nginx config from frontend repo
sudo cp /path/to/video-website-frontend/nginx-streaming.conf /etc/nginx/sites-available/streaming

# Edit the config to set the correct frontend path
sudo nano /etc/nginx/sites-available/streaming
# Change the line: root /var/www/streaming/frontend;
# To: root /path/to/video-website-frontend;

# Enable the site
sudo ln -sf /etc/nginx/sites-available/streaming /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## Start Services (Every Time)

### Start Backend
```bash
cd /path/to/video-website-backend
source venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8087
```

### Start Backend in Background (Alternative)
```bash
cd /path/to/video-website-backend
source venv/bin/activate
nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 &
```

### Ensure Nginx is Running
```bash
sudo systemctl start nginx
sudo systemctl status nginx
```

---

## Stop Services

### Stop Backend (if running in background)
```bash
pkill -f uvicorn
```

### Stop Nginx
```bash
sudo systemctl stop nginx
```

---

## After Git Pull (Update Code)

### Update Backend
```bash
cd /path/to/video-website-backend
git pull
source venv/bin/activate
pip install -r requirements.txt
# Restart backend
pkill -f uvicorn
nohup uvicorn server:app --host 127.0.0.1 --port 8087 > backend.log 2>&1 &
```

### Update Frontend
```bash
cd /path/to/video-website-frontend
git pull
# No restart needed - nginx serves static files
```

---

## Useful Commands

```bash
# Check backend status
ps aux | grep uvicorn

# View backend logs
tail -f /path/to/video-website-backend/backend.log

# Check nginx status
sudo systemctl status nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## URLs

- Home: http://149.106.159.76:8000
- Login: http://149.106.159.76:8000/login.html
- API Docs: http://149.106.159.76:8000/docs
