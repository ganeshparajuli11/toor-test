#!/bin/bash
set -e

# Update and Install Dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx

# Install PM2
npm install -g pm2

# Setup App Directory
mkdir -p /var/www/zanafly
# Clean previous if exists
rm -rf /var/www/zanafly/dist /var/www/zanafly/server

# Extract Files (Assumes they are in current dir/root)
# The tar includes 'server/' and 'dist/' prefixes
tar -xzf server.tar.gz -C /var/www/zanafly
tar -xzf dist.tar.gz -C /var/www/zanafly

# Backend Setup
cd /var/www/zanafly/server
npm install
# Generate .env
cat > .env <<EOT
PORT=3001
JWT_SECRET=supersecret
NODE_ENV=production
EOT

# Start/Restart Backend
pm2 delete zanafly-server || true
pm2 start server.js --name zanafly-server

# Nginx Configuration
cat > /etc/nginx/sites-available/zanafly <<EOF
server {
    listen 80;
    server_name _;

    root /var/www/zanafly/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Site
ln -sf /etc/nginx/sites-available/zanafly /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Restart Nginx
nginx -t && systemctl restart nginx

echo "Deployment Script Completed Successfully!"
