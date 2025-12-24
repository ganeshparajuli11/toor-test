# Zanafly Hosting & Deployment Documentation

This document contains all necessary information to manage, update, and access the Zanafly project hosted on the Hostinger VPS.

## 🚀 Server Information

- **IP Address**: `72.62.61.214`
- **Domain**: [https://zanafly.ch](https://zanafly.ch)
- **User**: `root`
- **Operating System**: Ubuntu 24.04 LTS
- **Web Server**: Nginx (Reversed Proxy)
- **Application Server**: Node.js (Managed by PM2)

---

## 🔑 Accessing the Server (SSH)

You can access the server using the SSH key generated during setup or the root password.

### Option 1: Using the SSH Key (Recommended)
Run the following command from your local terminal (project root):
```bash
ssh -i ./hostinger_key root@72.62.61.214
```

### Option 2: Using Password
```bash
ssh root@72.62.61.214
# When prompted, enter the password: Apta,ZRMD9D2/@dHxc0/
```

---

## 📂 Project Structure on Server

All project files are located in `/var/www/zanafly`.

- **Root Directory**: `/var/www/zanafly`
- **Frontend (Static Files)**: `/var/www/zanafly/dist`
  - Served by Nginx on Port 80/443.
- **Backend (Node.js API)**: `/var/www/zanafly/server`
  - Running on Port `3001`.
  - Proxied via Nginx from `/api`.

---

## 🔄 How to Update the Application

To push the latest changes (Frontend or Backend) to the VPS, follow these steps:

### Step 1: Build the Frontend (Local)
Always rebuild the frontend to generate the latest static files.
```bash
npm run build
```

### Step 2: Prepare Files for Upload
Create compressed archives of the changes.

**For Frontend Only:**
```bash
tar -czf dist.tar.gz dist
```

**For Backend Only:**
```bash
tar --exclude='node_modules' --exclude='.git' -czf server.tar.gz server
```

**For Both:**
Run both commands above.

### Step 3: Upload to Server
Use `scp` to copy the files to the VPS.
```bash
scp -i ./hostinger_key dist.tar.gz server.tar.gz root@72.62.61.214:/root/
```

### Step 4: Apply Changes on Server
SSH into the server and extract the files.

**Update Frontend:**
```bash
ssh -i ./hostinger_key root@72.62.61.214 "rm -rf /var/www/zanafly/dist && tar -xzf /root/dist.tar.gz -C /var/www/zanafly"
```

**Update Backend (Requires Restart):**
```bash
ssh -i ./hostinger_key root@72.62.61.214 "cp -r /root/temp_server/server/* /var/www/zanafly/server/ && cd /var/www/zanafly/server && npm install && pm2 restart zanafly-server"
```
*(Note: For backend, it's safer to extract to a temp folder and copy over, or just tar directly to destination if you know what you are doing. The simplest generic command is below)*

**One-Liner for Backend Update:**
```bash
ssh -i ./hostinger_key root@72.62.61.214 "tar -xzf /root/server.tar.gz -C /var/www/zanafly && cd /var/www/zanafly/server && npm install && pm2 restart zanafly-server"
```

---

## ⚙️ Backend Management (PM2)

The backend is managed by **PM2**, which keeps it alive and auto-restarts it.

- **Check Status**: `pm2 status`
- **View Logs**: `pm2 logs zanafly-server`
- **Restart Backend**: `pm2 restart zanafly-server`
- **Stop Backend**: `pm2 stop zanafly-server`

### Environment Variables (.env)
The backend configuration is located at:
`/var/www/zanafly/server/.env`

To edit it:
```bash
nano /var/www/zanafly/server/.env
# After editing, restart the server:
pm2 restart zanafly-server
```

---

## 🌐 Web Server (Nginx)

Nginx handles the domain, SSL, and serving the frontend.

- **Configuration File**: `/etc/nginx/sites-enabled/zanafly`
- **Test Config**: `nginx -t`
- **Restart Nginx**: `systemctl restart nginx`
- **View Access Logs**: `tail -f /var/log/nginx/access.log`
- **View Error Logs**: `tail -f /var/log/nginx/error.log`

---

## 🔒 SSL / HTTPS

SSL is provided by **Let's Encrypt** (Certbot). It auto-renews.

- **Check Certificate**: `certbot certificates`
- **Force Renewal**: `certbot renew --force-renewal`
