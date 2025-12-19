FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy frontend files
COPY index.html /usr/share/nginx/html/
COPY login.html /usr/share/nginx/html/
COPY player.html /usr/share/nginx/html/
COPY config.js /usr/share/nginx/html/

# Expose port 8000
EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]
