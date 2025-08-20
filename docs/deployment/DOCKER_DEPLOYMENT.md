# 🐳 Docker Deployment Guide

**Complete containerization and orchestration guide for Deployment Portal**

## 📋 **Table of Contents**
- [Container Architecture](#container-architecture)
- [Docker Setup](#docker-setup)
- [Single Container Deployment](#single-container-deployment)
- [Multi-Container with Docker Compose](#multi-container-with-docker-compose)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Container Registry](#container-registry)
- [Monitoring & Logging](#monitoring--logging)
- [Production Best Practices](#production-best-practices)

---

## 🏗️ **Container Architecture**

### **Single Node Architecture**
```
┌─────────────────────────────────────┐
│           Docker Host               │
│  ┌─────────────┐  ┌─────────────┐  │
│  │   Frontend  │  │   Backend   │  │
│  │   (Nginx)   │  │ (Spring Boot)│  │
│  │    :80      │  │    :8080    │  │
│  └─────────────┘  └─────────────┘  │
│           │               │         │
│  ┌─────────────────────────────┐   │
│  │       PostgreSQL        │   │
│  │       Container         │   │
│  │        :5432           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **Microservices Architecture**
```
    ┌─────────────────┐
    │   Load Balancer │
    │     (Nginx)     │
    └─────────┬───────┘
              │
    ┌─────────┴───────┐
    │                 │
┌───▼─────┐      ┌────▼────┐
│Frontend │      │ Frontend│
│Pod 1    │      │ Pod 2   │
└───┬─────┘      └────┬────┘
    │                 │
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │                 │
┌───▼─────┐      ┌────▼────┐
│Backend  │      │ Backend │
│Pod 1    │      │ Pod 2   │
└───┬─────┘      └────┬────┘
    │                 │
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │   Database      │
    │   (Persistent)  │
    └─────────────────┘
```

---

## 🐳 **Docker Setup**

### **Install Docker**
```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### **Docker Configuration**
```bash
# Create Docker daemon configuration
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "exec-opts": ["native.cgroupdriver=systemd"],
  "live-restore": true,
  "userland-proxy": false,
  "experimental": false,
  "metrics-addr": "127.0.0.1:9323",
  "experimental": true
}
```

```bash
# Restart Docker
sudo systemctl restart docker
sudo systemctl enable docker
```

---

## 📦 **Single Container Deployment**

### **Backend Dockerfile**
```dockerfile
# Create backend/Dockerfile
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY target/*.jar app.jar

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/services || exit 1

# Expose port
EXPOSE 8080

# Set JVM options
ENV JAVA_OPTS="-Xmx2g -Xms1g -XX:+UseG1GC"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### **Frontend Dockerfile**
```dockerfile
# Multi-stage build
# Stage 1: Build Angular application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build --prod

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist/* /usr/share/nginx/html/

# Create non-root user
RUN addgroup -g 101 -S nginx
RUN adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### **Nginx Configuration for Frontend**
```nginx
# Create default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Angular routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Build and Run Commands**
```bash
# Build backend image
cd backend
docker build -t deployment-portal-backend:latest .

# Build frontend image
cd ../frontend
docker build -t deployment-portal-frontend:latest .

# Run PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_DB=deployment_portal \
  -e POSTGRES_USER=deployment_user \
  -e POSTGRES_PASSWORD=secure_password \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15

# Run backend
docker run -d \
  --name backend \
  --link postgres:postgres \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/deployment_portal \
  -e SPRING_DATASOURCE_USERNAME=deployment_user \
  -e SPRING_DATASOURCE_PASSWORD=secure_password \
  -p 8080:8080 \
  deployment-portal-backend:latest

# Run frontend
docker run -d \
  --name frontend \
  --link backend:backend \
  -p 80:80 \
  deployment-portal-frontend:latest
```

---

## 🐙 **Multi-Container with Docker Compose**

### **docker-compose.yml**
```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15
    container_name: deployment-portal-db
    environment:
      POSTGRES_DB: deployment_portal
      POSTGRES_USER: deployment_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secure_password}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    networks:
      - deployment-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U deployment_user -d deployment_portal"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: deployment-portal-backend
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/deployment_portal
      SPRING_DATASOURCE_USERNAME: deployment_user
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-secure_password}
      JAVA_OPTS: "-Xmx2g -Xms1g -XX:+UseG1GC"
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - deployment-network
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/services"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: deployment-portal-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - deployment-network
    restart: unless-stopped
    volumes:
      - ./ssl:/etc/ssl/certs:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for Session Management (Optional)
  redis:
    image: redis:7-alpine
    container_name: deployment-portal-redis
    ports:
      - "6379:6379"
    networks:
      - deployment-network
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis_password}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Load Balancer (for multiple backend instances)
  load-balancer:
    image: nginx:alpine
    container_name: deployment-portal-lb
    ports:
      - "8090:80"
    volumes:
      - ./nginx/load-balancer.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    networks:
      - deployment-network
    restart: unless-stopped

networks:
  deployment-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### **Environment Configuration**
```bash
# Create .env file
cat > .env << EOF
# Database
DB_PASSWORD=secure_database_password_here
POSTGRES_DB=deployment_portal
POSTGRES_USER=deployment_user

# Redis
REDIS_PASSWORD=secure_redis_password_here

# Application
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8080

# SSL
SSL_ENABLED=true
EOF
```

### **Production Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - deployment-network
    restart: always
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  backend:
    image: your-registry.com/deployment-portal-backend:${IMAGE_TAG:-latest}
    environment:
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JAVA_OPTS: "-Xmx4g -Xms2g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError"
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 6G
          cpus: '2.0'
        reservations:
          memory: 3G
          cpus: '1.0'
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
    networks:
      - deployment-network
    secrets:
      - db_password
      - jwt_secret

  frontend:
    image: your-registry.com/deployment-portal-frontend:${IMAGE_TAG:-latest}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    networks:
      - deployment-network

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

### **Deployment Commands**
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3 --scale frontend=2

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Clean up
docker-compose down -v --remove-orphans
```

---

## ☸️ **Kubernetes Deployment**

### **Namespace Configuration**
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: deployment-portal
  labels:
    name: deployment-portal
```

### **ConfigMap**
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: deployment-portal-config
  namespace: deployment-portal
data:
  application.properties: |
    spring.profiles.active=kubernetes
    server.port=8080
    spring.datasource.url=jdbc:postgresql://postgres-service:5432/deployment_portal
    spring.jpa.hibernate.ddl-auto=validate
    logging.level.org.springframework.security=DEBUG
```

### **Secrets**
```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: deployment-portal-secrets
  namespace: deployment-portal
type: Opaque
data:
  # Base64 encoded values
  db-username: ZGVwbG95bWVudF91c2Vy  # deployment_user
  db-password: c2VjdXJlX3Bhc3N3b3Jk  # secure_password
  jwt-secret: eW91cl9qd3Rfc2VjcmV0X2hlcmU=  # your_jwt_secret_here
```

### **PostgreSQL Deployment**
```yaml
# postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: deployment-portal
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: deployment_portal
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: deployment-portal-secrets
              key: db-username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: deployment-portal-secrets
              key: db-password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        - name: init-script
          mountPath: /docker-entrypoint-initdb.d
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - deployment_user
            - -d
            - deployment_portal
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - deployment_user
            - -d
            - deployment_portal
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
      - name: init-script
        configMap:
          name: postgres-init

---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: deployment-portal
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: deployment-portal
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: fast-ssd
```

### **Backend Deployment**
```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: deployment-portal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry.com/deployment-portal-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: kubernetes
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: deployment-portal-secrets
              key: db-username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: deployment-portal-secrets
              key: db-password
        - name: JAVA_OPTS
          value: "-Xmx2g -Xms1g -XX:+UseG1GC"
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
        - name: logs-volume
          mountPath: /app/logs
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /api/services
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/services
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
      volumes:
      - name: config-volume
        configMap:
          name: deployment-portal-config
      - name: logs-volume
        emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: deployment-portal
spec:
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### **Frontend Deployment**
```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: deployment-portal
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry.com/deployment-portal-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        securityContext:
          runAsNonRoot: true
          runAsUser: 101
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: deployment-portal
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### **Ingress Configuration**
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: deployment-portal-ingress
  namespace: deployment-portal
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "16m"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: deployment-portal-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### **HorizontalPodAutoscaler**
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: deployment-portal
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: deployment-portal
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
```

### **Deployment Commands**
```bash
# Apply configurations
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml

# Check deployment status
kubectl get pods -n deployment-portal
kubectl get services -n deployment-portal
kubectl get ingress -n deployment-portal

# View logs
kubectl logs -f deployment/backend -n deployment-portal
kubectl logs -f deployment/frontend -n deployment-portal

# Scale manually
kubectl scale deployment backend --replicas=5 -n deployment-portal

# Rolling update
kubectl set image deployment/backend backend=your-registry.com/deployment-portal-backend:v2.0.0 -n deployment-portal
```

---

## 📦 **Container Registry**

### **Build and Push Script**
```bash
#!/bin/bash
# build-and-push.sh

REGISTRY="your-registry.com"
PROJECT="deployment-portal"
VERSION=${1:-latest}

# Build backend
echo "Building backend image..."
cd backend
docker build -t $REGISTRY/$PROJECT-backend:$VERSION .
docker push $REGISTRY/$PROJECT-backend:$VERSION

# Build frontend
echo "Building frontend image..."
cd ../frontend
docker build -t $REGISTRY/$PROJECT-frontend:$VERSION .
docker push $REGISTRY/$PROJECT-frontend:$VERSION

echo "Images pushed successfully:"
echo "- $REGISTRY/$PROJECT-backend:$VERSION"
echo "- $REGISTRY/$PROJECT-frontend:$VERSION"
```

### **CI/CD Pipeline (GitHub Actions)**
```yaml
# .github/workflows/docker-build.yml
name: Build and Push Docker Images

on:
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}

    - name: Build and push backend image
      uses: docker/build-push-action@v3
      with:
        context: ./backend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
        labels: ${{ steps.meta.outputs.labels }}

    - name: Build and push frontend image
      uses: docker/build-push-action@v3
      with:
        context: ./frontend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
        labels: ${{ steps.meta.outputs.labels }}
```

---

## 📊 **Monitoring & Logging**

### **Prometheus Configuration**
```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'deployment-portal-backend'
    static_configs:
      - targets: ['backend-service:8080']
    metrics_path: '/actuator/prometheus'
    
  - job_name: 'deployment-portal-frontend'
    static_configs:
      - targets: ['frontend-service:80']
    metrics_path: '/metrics'
```

### **Grafana Dashboard**
```json
{
  "dashboard": {
    "title": "Deployment Portal Monitoring",
    "panels": [
      {
        "title": "HTTP Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "hikaricp_connections_active",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "JVM Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "jvm_memory_used_bytes",
            "legendFormat": "{{area}}"
          }
        ]
      }
    ]
  }
}
```

### **ELK Stack Configuration**
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash/config:/usr/share/logstash/pipeline
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

---

## 🛡️ **Production Best Practices**

### **Security Best Practices**
```dockerfile
# Security-hardened Dockerfile example
FROM openjdk:17-jdk-slim

# Update packages and remove package manager
RUN apt-get update && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set secure permissions
WORKDIR /app
COPY target/*.jar app.jar
RUN chown -R appuser:appuser /app
USER appuser

# Drop all capabilities
USER 10001:10001

# Use specific tag, not latest
FROM openjdk:17.0.7-jdk-slim
```

### **Resource Management**
```yaml
# Resource limits and requests
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
    ephemeral-storage: "1Gi"
  limits:
    memory: "2Gi"
    cpu: "1000m"
    ephemeral-storage: "2Gi"
```

### **Health Checks and Probes**
```yaml
# Comprehensive health checks
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 30
```

### **Backup and Disaster Recovery**
```bash
#!/bin/bash
# backup-script.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
kubectl exec postgres-pod -- pg_dump -U deployment_user deployment_portal > $BACKUP_DIR/db_backup_$DATE.sql

# Application config backup
kubectl get configmap deployment-portal-config -o yaml > $BACKUP_DIR/config_backup_$DATE.yaml
kubectl get secret deployment-portal-secrets -o yaml > $BACKUP_DIR/secrets_backup_$DATE.yaml

# Compress and upload to cloud storage
tar -czf $BACKUP_DIR/full_backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE.*

# Upload to S3/GCS/Azure Blob
aws s3 cp $BACKUP_DIR/full_backup_$DATE.tar.gz s3://your-backup-bucket/
```

---

*This comprehensive Docker deployment guide covers containerization from development through production deployment with Kubernetes orchestration. Choose the deployment method that best fits your infrastructure and scaling requirements.*
