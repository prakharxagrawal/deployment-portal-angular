# 🚀 Server Deployment Guide

**Complete production deployment guide for hosting Deployment Portal on servers**

## 📋 **Table of Contents**
- [Deployment Architecture](#deployment-architecture)
- [Server Requirements](#server-requirements)
- [Production Environment Setup](#production-environment-setup)
- [Application Deployment](#application-deployment)
- [Load Balancing & High Availability](#load-balancing--high-availability)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Security Hardening](#security-hardening)

---

## 🏗️ **Deployment Architecture**

### **Single Server Deployment (Small Organizations)**
```
┌─────────────────────────────────────────┐
│           Single Server                 │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │   Nginx     │  │  Spring Boot    │  │
│  │  (Frontend) │  │   (Backend)     │  │
│  │   Port 80   │  │   Port 8080     │  │
│  └─────────────┘  └─────────────────┘  │
│           │               │             │
│  ┌─────────────────────────────────┐   │
│  │        PostgreSQL              │   │
│  │        Port 5432               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### **Multi-Server Deployment (Medium Organizations)**
```
    ┌─────────────────┐
    │  Load Balancer  │
    │   (Nginx/HAProxy)│
    └─────────┬───────┘
              │
    ┌─────────┴───────┐
    │                 │
┌───▼─────┐      ┌────▼────┐
│  Web    │      │   Web   │
│ Server 1│      │ Server 2│
│ (Nginx) │      │ (Nginx) │
└───┬─────┘      └────┬────┘
    │                 │
┌───▼─────┐      ┌────▼────┐
│  App    │      │   App   │
│Server 1 │      │ Server 2│
│(Spring) │      │(Spring) │
└───┬─────┘      └────┬────┘
    │                 │
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │   Database      │
    │  (PostgreSQL)   │
    │   with Replica  │
    └─────────────────┘
```

### **Cloud Native Deployment (Large Organizations)**
```
    ┌─────────────────┐
    │   Cloud CDN     │
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │ Application     │
    │ Load Balancer   │
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │  Container      │
    │  Orchestration  │
    │  (Kubernetes)   │
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │   Managed       │
    │   Database      │
    │   (RDS/CloudSQL)│
    └─────────────────┘
```

---

## 💻 **Server Requirements**

### **Minimum Requirements (Small Deployment)**
- **CPU**: 4 cores (2.5 GHz)
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 20.04 LTS or RHEL 8+

### **Recommended Requirements (Medium Deployment)**
- **CPU**: 8 cores (3.0 GHz)
- **RAM**: 16GB
- **Storage**: 500GB SSD
- **Network**: 10Gbps
- **OS**: Ubuntu 22.04 LTS or RHEL 9+

### **High Availability Requirements (Large Deployment)**
- **Web Servers**: 2+ servers (4 cores, 8GB each)
- **Application Servers**: 2+ servers (8 cores, 16GB each)
- **Database**: Primary + Replica (16 cores, 32GB each)
- **Load Balancer**: 2+ servers (4 cores, 8GB each)

### **Software Prerequisites**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget unzip git software-properties-common

# Install Java 17
sudo apt install -y openjdk-17-jdk

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Install monitoring tools
sudo apt install -y htop iotop netstat-nat
```

---

## 🏭 **Production Environment Setup**

### **System User Creation**
```bash
# Create dedicated user for application
sudo useradd -r -m -s /bin/bash deployment-portal
sudo usermod -aG sudo deployment-portal

# Create application directories
sudo mkdir -p /opt/deployment-portal
sudo mkdir -p /var/log/deployment-portal
sudo mkdir -p /var/run/deployment-portal

# Set ownership
sudo chown -R deployment-portal:deployment-portal /opt/deployment-portal
sudo chown -R deployment-portal:deployment-portal /var/log/deployment-portal
sudo chown -R deployment-portal:deployment-portal /var/run/deployment-portal
```

### **Environment Configuration**
```bash
# Create environment file
sudo nano /opt/deployment-portal/.env
```

```ini
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=deployment_portal
DB_USER=deployment_user
DB_PASSWORD=secure_password_here

# Application Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production

# Security Configuration
SESSION_TIMEOUT=1800
ENABLE_SSL=true

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=/var/log/deployment-portal/application.log

# Performance Configuration
JAVA_OPTS=-Xmx4g -Xms2g -XX:+UseG1GC
```

### **Directory Structure**
```
/opt/deployment-portal/
├── backend/
│   ├── deployment-portal-1.0.0.jar
│   └── config/
│       └── application-production.properties
├── frontend/
│   └── dist/
│       └── (Angular build files)
├── scripts/
│   ├── start.sh
│   ├── stop.sh
│   └── deploy.sh
├── logs/
└── backups/
```

---

## 📦 **Application Deployment**

### **Backend Deployment**

#### **Build and Deploy Script**
```bash
# Create deployment script
sudo nano /opt/deployment-portal/scripts/deploy-backend.sh
```

```bash
#!/bin/bash
set -e

APP_DIR="/opt/deployment-portal"
BACKEND_DIR="$APP_DIR/backend"
LOG_FILE="$APP_DIR/logs/deploy.log"
SERVICE_NAME="deployment-portal-backend"

echo "$(date): Starting backend deployment" >> $LOG_FILE

# Stop existing service
sudo systemctl stop $SERVICE_NAME || true

# Backup current version
if [ -f "$BACKEND_DIR/deployment-portal.jar" ]; then
    cp "$BACKEND_DIR/deployment-portal.jar" "$APP_DIR/backups/deployment-portal-$(date +%Y%m%d_%H%M%S).jar"
fi

# Copy new version
cp "$APP_DIR/build/deployment-portal-*.jar" "$BACKEND_DIR/deployment-portal.jar"

# Set permissions
chown deployment-portal:deployment-portal "$BACKEND_DIR/deployment-portal.jar"
chmod 755 "$BACKEND_DIR/deployment-portal.jar"

# Start service
sudo systemctl start $SERVICE_NAME
sudo systemctl enable $SERVICE_NAME

# Verify deployment
sleep 10
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "$(date): Backend deployment successful" >> $LOG_FILE
    exit 0
else
    echo "$(date): Backend deployment failed" >> $LOG_FILE
    exit 1
fi
```

#### **Systemd Service Configuration**
```bash
# Create service file
sudo nano /etc/systemd/system/deployment-portal-backend.service
```

```ini
[Unit]
Description=Deployment Portal Backend Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=deployment-portal
Group=deployment-portal
WorkingDirectory=/opt/deployment-portal/backend

# Environment
Environment=SPRING_PROFILES_ACTIVE=production
EnvironmentFile=/opt/deployment-portal/.env

# Execution
ExecStart=/usr/bin/java $JAVA_OPTS -jar deployment-portal.jar
ExecStop=/bin/kill -15 $MAINPID

# Process management
Restart=always
RestartSec=10
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/deployment-portal /var/run/deployment-portal

# Logging
StandardOutput=append:/var/log/deployment-portal/application.log
StandardError=append:/var/log/deployment-portal/error.log

[Install]
WantedBy=multi-user.target
```

### **Frontend Deployment**

#### **Build and Deploy Script**
```bash
# Create frontend deployment script
sudo nano /opt/deployment-portal/scripts/deploy-frontend.sh
```

```bash
#!/bin/bash
set -e

APP_DIR="/opt/deployment-portal"
FRONTEND_DIR="$APP_DIR/frontend"
WEB_ROOT="/var/www/deployment-portal"
LOG_FILE="$APP_DIR/logs/deploy.log"

echo "$(date): Starting frontend deployment" >> $LOG_FILE

# Backup current version
if [ -d "$WEB_ROOT" ]; then
    sudo tar -czf "$APP_DIR/backups/frontend-$(date +%Y%m%d_%H%M%S).tar.gz" -C "$WEB_ROOT" .
fi

# Create web root if it doesn't exist
sudo mkdir -p "$WEB_ROOT"

# Copy new build
sudo cp -r "$FRONTEND_DIR/dist/"* "$WEB_ROOT/"

# Set ownership and permissions
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo find "$WEB_ROOT" -type f -exec chmod 644 {} \;
sudo find "$WEB_ROOT" -type d -exec chmod 755 {} \;

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

echo "$(date): Frontend deployment successful" >> $LOG_FILE
```

#### **Nginx Configuration**
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/deployment-portal
```

```nginx
upstream backend {
    server 127.0.0.1:8080;
    # Add more backend servers for load balancing
    # server 127.0.0.1:8081;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/deployment-portal.crt;
    ssl_certificate_key /etc/ssl/private/deployment-portal.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # Root directory
    root /var/www/deployment-portal;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Session handling
        proxy_cookie_path / "/; Secure; HttpOnly; SameSite=Strict";
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Keep-alive
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ \.(env|config|ini)$ {
        deny all;
    }

    # Logging
    access_log /var/log/nginx/deployment-portal-access.log;
    error_log /var/log/nginx/deployment-portal-error.log;
}
```

### **Enable and Start Services**
```bash
# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/deployment-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start backend service
sudo systemctl daemon-reload
sudo systemctl enable deployment-portal-backend
sudo systemctl start deployment-portal-backend

# Verify services
sudo systemctl status deployment-portal-backend
sudo systemctl status nginx
```

---

## ⚖️ **Load Balancing & High Availability**

### **HAProxy Configuration**
```bash
# Install HAProxy
sudo apt install -y haproxy

# Configure HAProxy
sudo nano /etc/haproxy/haproxy.cfg
```

```haproxy
global
    daemon
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull

# Frontend for web traffic
frontend web_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/deployment-portal.pem
    redirect scheme https if !{ ssl_fc }
    default_backend web_servers

# Backend web servers
backend web_servers
    balance roundrobin
    option httpchk GET /health
    server web1 10.0.1.10:80 check
    server web2 10.0.1.11:80 check

# Frontend for API traffic
frontend api_frontend
    bind *:8080
    default_backend api_servers

# Backend API servers
backend api_servers
    balance leastconn
    option httpchk GET /api/services
    server api1 10.0.1.20:8080 check
    server api2 10.0.1.21:8080 check

# Statistics
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
```

### **Database High Availability**

#### **PostgreSQL Master-Slave Setup**
```bash
# On master server (primary)
sudo nano /etc/postgresql/15/main/postgresql.conf
```

```ini
# Master configuration
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/15/main/archive/%f'
```

```bash
# Create replication user
sudo -u postgres psql
```

```sql
CREATE USER replicator REPLICATION LOGIN ENCRYPTED PASSWORD 'replication_password';
```

```bash
# On slave server (replica)
sudo systemctl stop postgresql
sudo -u postgres pg_basebackup -h master-server-ip -D /var/lib/postgresql/15/main -U replicator -P -v -R -W
sudo systemctl start postgresql
```

---

## 🔒 **SSL/TLS Configuration**

### **Let's Encrypt Setup**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Custom SSL Certificate**
```bash
# Generate private key
sudo openssl genrsa -out /etc/ssl/private/deployment-portal.key 2048

# Generate certificate signing request
sudo openssl req -new -key /etc/ssl/private/deployment-portal.key -out /tmp/deployment-portal.csr

# Generate self-signed certificate (for testing)
sudo openssl x509 -req -days 365 -in /tmp/deployment-portal.csr -signkey /etc/ssl/private/deployment-portal.key -out /etc/ssl/certs/deployment-portal.crt

# Set permissions
sudo chmod 600 /etc/ssl/private/deployment-portal.key
sudo chmod 644 /etc/ssl/certs/deployment-portal.crt
```

---

## 📊 **Monitoring & Logging**

### **Log Management**

#### **Centralized Logging with rsyslog**
```bash
# Configure rsyslog
sudo nano /etc/rsyslog.d/30-deployment-portal.conf
```

```ini
# Deployment Portal logs
:programname, isequal, "deployment-portal" /var/log/deployment-portal/application.log
:programname, isequal, "deployment-portal" stop

# Nginx logs
$ModLoad imfile
$InputFileName /var/log/nginx/deployment-portal-access.log
$InputFileTag nginx-access:
$InputFileStateFile stat-nginx-access
$InputFileSeverity info
$InputFileFacility local0
$InputRunFileMonitor

$InputFileName /var/log/nginx/deployment-portal-error.log
$InputFileTag nginx-error:
$InputFileStateFile stat-nginx-error
$InputFileSeverity error
$InputFileFacility local0
$InputRunFileMonitor
```

#### **Log Rotation**
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/deployment-portal
```

```ini
/var/log/deployment-portal/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 deployment-portal deployment-portal
    postrotate
        sudo systemctl reload deployment-portal-backend
    endscript
}

/var/log/nginx/deployment-portal*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi
    endscript
    postrotate
        invoke-rc.d nginx reload >/dev/null 2>&1
    endscript
}
```

### **System Monitoring**

#### **Health Check Script**
```bash
# Create health check script
sudo nano /usr/local/bin/health-check.sh
```

```bash
#!/bin/bash

LOG_FILE="/var/log/deployment-portal/health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Check backend service
if curl -f -s http://localhost:8080/api/services > /dev/null; then
    echo "$TIMESTAMP: Backend service - OK" >> $LOG_FILE
else
    echo "$TIMESTAMP: Backend service - FAILED" >> $LOG_FILE
    # Send alert (email, Slack, etc.)
fi

# Check frontend
if curl -f -s http://localhost/ > /dev/null; then
    echo "$TIMESTAMP: Frontend service - OK" >> $LOG_FILE
else
    echo "$TIMESTAMP: Frontend service - FAILED" >> $LOG_FILE
fi

# Check database connection
if pg_isready -h localhost -p 5432 -U deployment_user > /dev/null; then
    echo "$TIMESTAMP: Database connection - OK" >> $LOG_FILE
else
    echo "$TIMESTAMP: Database connection - FAILED" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$TIMESTAMP: Disk usage critical: ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEM_USAGE > 85" | bc -l) )); then
    echo "$TIMESTAMP: Memory usage high: ${MEM_USAGE}%" >> $LOG_FILE
fi
```

```bash
# Make executable and schedule
sudo chmod +x /usr/local/bin/health-check.sh
sudo crontab -e
# Add: */5 * * * * /usr/local/bin/health-check.sh
```

---

## ⚡ **Performance Optimization**

### **JVM Tuning**
```bash
# Update service file with optimized JVM options
sudo nano /etc/systemd/system/deployment-portal-backend.service
```

```ini
[Service]
Environment=JAVA_OPTS=-Xmx4g -Xms2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+DisableExplicitGC -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/deployment-portal/
```

### **Database Connection Pooling**
```bash
# Add HikariCP configuration to application.properties
sudo nano /opt/deployment-portal/backend/config/application-production.properties
```

```properties
# HikariCP settings
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.connection-timeout=30000
```

### **Nginx Performance Tuning**
```bash
# Update nginx configuration
sudo nano /etc/nginx/nginx.conf
```

```nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Buffer sizes
    client_body_buffer_size 16K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 2 1k;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
}
```

---

## 🛡️ **Security Hardening**

### **Firewall Configuration**
```bash
# Configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if needed)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application port (only from trusted sources)
sudo ufw allow from 10.0.0.0/8 to any port 8080

# Enable firewall
sudo ufw --force enable
```

### **System Hardening**
```bash
# Disable root login
sudo passwd -l root

# Configure SSH
sudo nano /etc/ssh/sshd_config
```

```ini
# SSH hardening
Port 22
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 2
```

### **Application Security**
```bash
# Set file permissions
sudo find /opt/deployment-portal -type f -exec chmod 644 {} \;
sudo find /opt/deployment-portal -type d -exec chmod 755 {} \;
sudo chmod 600 /opt/deployment-portal/.env

# Secure log files
sudo chmod 640 /var/log/deployment-portal/*.log
sudo chown deployment-portal:adm /var/log/deployment-portal/*.log
```

---

## 🔄 **Deployment Automation**

### **Blue-Green Deployment Script**
```bash
# Create blue-green deployment script
sudo nano /opt/deployment-portal/scripts/blue-green-deploy.sh
```

```bash
#!/bin/bash
set -e

BLUE_PORT=8080
GREEN_PORT=8081
HEALTH_CHECK_URL="http://localhost"
NGINX_CONFIG="/etc/nginx/sites-available/deployment-portal"

# Function to check application health
check_health() {
    local port=$1
    curl -f -s $HEALTH_CHECK_URL:$port/api/services > /dev/null
}

# Determine current active environment
if grep -q "server 127.0.0.1:$BLUE_PORT" $NGINX_CONFIG; then
    CURRENT_ENV="blue"
    CURRENT_PORT=$BLUE_PORT
    NEW_ENV="green"
    NEW_PORT=$GREEN_PORT
else
    CURRENT_ENV="green"
    CURRENT_PORT=$GREEN_PORT
    NEW_ENV="blue"
    NEW_PORT=$BLUE_PORT
fi

echo "Current environment: $CURRENT_ENV ($CURRENT_PORT)"
echo "Deploying to: $NEW_ENV ($NEW_PORT)"

# Deploy to new environment
sudo systemctl stop deployment-portal-$NEW_ENV || true
# ... deployment logic ...
sudo systemctl start deployment-portal-$NEW_ENV

# Health check
sleep 30
if check_health $NEW_PORT; then
    echo "Health check passed for $NEW_ENV"
    
    # Switch traffic
    sudo sed -i "s/server 127.0.0.1:$CURRENT_PORT/server 127.0.0.1:$NEW_PORT/" $NGINX_CONFIG
    sudo nginx -t && sudo systemctl reload nginx
    
    echo "Traffic switched to $NEW_ENV"
    
    # Stop old environment
    sleep 10
    sudo systemctl stop deployment-portal-$CURRENT_ENV
    
    echo "Blue-green deployment completed successfully"
else
    echo "Health check failed for $NEW_ENV"
    sudo systemctl stop deployment-portal-$NEW_ENV
    exit 1
fi
```

---

*This comprehensive server deployment guide covers all aspects of production hosting for the Deployment Portal. Choose the appropriate deployment scenario based on your organization's size and requirements.*
