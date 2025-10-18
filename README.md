# Video Streaming Website - Frontend

A Netflix-style video streaming frontend built with vanilla HTML, CSS, and JavaScript.

## Features

- 🎬 Browse shows with season organization
- 🔍 Search functionality to filter shows
- 📱 Responsive design for all devices
- ⏭️ Next/Previous episode navigation
- 🎨 Modern, dark-themed UI

## Setup

### Local Development

1. Update the backend API URL in `config.js`:
```javascript
const API_BASE_URL = 'http://localhost:8085'; // Your backend URL
```

2. Serve the files using any static file server:

**Using Python:**
```bash
python -m http.server 3000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 3000
```

**Using VS Code Live Server:**
- Right-click on `index.html`
- Select "Open with Live Server"

3. Open your browser to `http://localhost:3000`

## Configuration

Edit `config.js` to change the backend API URL:
- **Local Development**: `http://localhost:8085`
- **Production**: `https://your-backend-url.com`

## Project Structure

```
video-website-frontend/
├── index.html          # Main page with show listing
├── player.html         # Video player page
├── config.js          # Backend API configuration
└── README.md          # This file
```

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Netlify
1. Connect your repository to Netlify
2. Build command: (leave empty)
3. Publish directory: `/`

### GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select branch and folder
4. Save

## Backend Repository

The backend API is in a separate repository:
- Repository: [video-website-backend](../video-website-backend)
- Make sure the backend is running before using this frontend

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT
