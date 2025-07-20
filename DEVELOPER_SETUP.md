# Deployment Portal - Developer Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation & Setup](#installation--setup)
3. [Development Environment](#development-environment)
4. [Running the Application](#running-the-application)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

#### Hardware Requirements
- **CPU:** 2+ cores recommended
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** 2GB free space for development
- **Network:** Internet connection for dependency downloads

#### Software Requirements

**Required Software:**
- **Java 17 or higher** - Backend runtime
- **Node.js 18 or higher** - Frontend runtime
- **npm 9 or higher** - Package manager
- **Git** - Version control

**Recommended Software:**
- **Visual Studio Code** - Primary IDE
- **IntelliJ IDEA** - Alternative Java IDE
- **Maven 3.6+** - Build tool (or use wrapper)
- **Angular CLI 16+** - Frontend tooling
- **Postman** - API testing
- **Chrome/Firefox** - Modern browser with dev tools

### Installation Commands

#### Install Java 17
```bash
# Windows (using Chocolatey)
choco install openjdk17

# macOS (using Homebrew)
brew install openjdk@17

# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# Verify installation
java -version
javac -version
```

#### Install Node.js 18+
```bash
# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install Angular CLI
```bash
# Install globally
npm install -g @angular/cli@16

# Verify installation
ng version
```

#### Install Maven (Optional)
```bash
# Windows (using Chocolatey)
choco install maven

# macOS (using Homebrew)
brew install maven

# Ubuntu/Debian
sudo apt install maven

# Verify installation
mvn --version
```

---

## Installation & Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone <repository-url>
cd deployment-portal-angular

# Verify project structure
ls -la
# Should see: backend/, frontend/, README.md, etc.
```

### 2. Backend Setup

#### Navigate to Backend Directory
```bash
cd backend/deployment-portal
```

#### Verify Maven Configuration
```bash
# Check if Maven wrapper exists
ls -la mvnw*

# If Maven wrapper exists, use it
./mvnw --version

# If no wrapper, use system Maven
mvn --version
```

#### Install Backend Dependencies
```bash
# Using Maven wrapper (recommended)
./mvnw clean install

# Using system Maven
mvn clean install

# This will:
# - Download all dependencies
# - Compile the code
# - Run tests
# - Create JAR file in target/
```

#### Verify Backend Dependencies
```bash
# Check target directory
ls -la target/

# Should see:
# - deployment-portal-<version>.jar
# - classes/
# - test-classes/
```

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../../frontend/deployment-portal-frontend
```

#### Install Frontend Dependencies
```bash
# Install all npm dependencies
npm install

# This will:
# - Download all packages to node_modules/
# - Create package-lock.json
# - Set up Angular dependencies
```

#### Verify Frontend Dependencies
```bash
# Check installation
npm list --depth=0

# Verify Angular CLI
ng version

# Should show Angular 16+ and all packages
```

---

## Development Environment

### IDE Configuration

#### Visual Studio Code Setup

**Required Extensions:**
```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-java-pack
code --install-extension angular.ng-template
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
```

**VS Code Settings (.vscode/settings.json):**
```json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.server.launchMode": "Standard",
  "typescript.preferences.importModuleSpecifier": "relative",
  "angular.experimental-ivy": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "java.format.settings.url": "https://raw.githubusercontent.com/google/styleguide/gh-pages/eclipse-java-google-style.xml"
}
```

**Launch Configuration (.vscode/launch.json):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Launch Application",
      "request": "launch",
      "mainClass": "com.deploymentportal.Application",
      "projectName": "deployment-portal",
      "args": "",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "name": "Launch Angular",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/deployment-portal-frontend/node_modules/@angular/cli/bin/ng",
      "args": ["serve", "--host", "0.0.0.0", "--port", "4200"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/frontend/deployment-portal-frontend"
    }
  ]
}
```

#### IntelliJ IDEA Setup

**Import Project:**
1. Open IntelliJ IDEA
2. File → Open → Select `backend/deployment-portal/pom.xml`
3. Choose "Open as Project"
4. Wait for Maven import to complete
5. File → Project Structure → Project → Set SDK to Java 17

**Run Configuration:**
1. Run → Edit Configurations
2. Add → Application
3. Main class: `com.deploymentportal.Application`
4. Use classpath of module: `deployment-portal`
5. Working directory: `$MODULE_WORKING_DIR$`

### Environment Configuration

#### Backend Environment Files

**Create application-dev.properties:**
```properties
# backend/deployment-portal/src/main/resources/application-dev.properties

# Development-specific settings
server.port=8080
spring.profiles.active=dev

# H2 Database
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA settings
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Session settings
server.servlet.session.timeout=43200s

# Logging
logging.level.com.deploymentportal=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

#### Frontend Environment Files

**Update environment.ts:**
```typescript
// frontend/deployment-portal-frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  enableDebugLogs: true,
  mockData: false
};
```

**Update proxy.conf.json:**
```json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "headers": {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  }
}
```

---

## Running the Application

### Development Mode

#### Method 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend/deployment-portal

# Using Maven wrapper
./mvnw spring-boot:run

# Using system Maven
mvn spring-boot:run

# Using IDE
# Run the Application.java main method
```

**Terminal 2 - Frontend:**
```bash
cd frontend/deployment-portal-frontend

# Start development server
npm start

# Alternative command
ng serve

# With specific host/port
ng serve --host 0.0.0.0 --port 4200
```

#### Method 2: Using Scripts

**Create run-dev.sh (Linux/Mac):**
```bash
#!/bin/bash
# run-dev.sh

echo "Starting Deployment Portal in Development Mode..."

# Start backend in background
cd backend/deployment-portal
./mvnw spring-boot:run &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

# Start frontend
cd ../../frontend/deployment-portal-frontend
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:4200"
echo "H2 Console: http://localhost:8080/h2-console"

# Wait for user input to stop
read -p "Press Enter to stop all services..."

# Kill processes
kill $BACKEND_PID
kill $FRONTEND_PID
```

**Create run-dev.bat (Windows):**
```batch
@echo off
REM run-dev.bat

echo Starting Deployment Portal in Development Mode...

REM Start backend
cd backend\deployment-portal
start "Backend" cmd /k "mvnw spring-boot:run"

REM Wait and start frontend
timeout /t 10
cd ..\..\frontend\deployment-portal-frontend
start "Frontend" cmd /k "npm start"

echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
echo H2 Console: http://localhost:8080/h2-console

pause
```

### Production Mode

#### Backend Production Build
```bash
cd backend/deployment-portal

# Build production JAR
./mvnw clean package -Pprod

# Run production JAR
java -jar target/deployment-portal-*.jar --spring.profiles.active=prod
```

#### Frontend Production Build
```bash
cd frontend/deployment-portal-frontend

# Build for production
npm run build --prod

# Serve with simple HTTP server
npx http-server dist/deployment-portal-frontend -p 8081
```

### Accessing the Application

#### Development URLs
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080/api
- **H2 Console:** http://localhost:8080/h2-console
- **API Documentation:** http://localhost:8080/swagger-ui.html (if enabled)

#### Default Login Credentials
```
Superadmin:
  Username: superadmin
  Password: admin123

Admin:
  Username: admin1 (or admin2)
  Password: admin123

Developer:
  Username: dev1 (or dev2, dev3)
  Password: dev123
```

---

## Development Workflow

### Code Organization

#### Backend Code Structure
```
src/main/java/com/deploymentportal/
├── Application.java              # Main Spring Boot application
├── config/
│   └── SecurityConfig.java       # Security configuration
├── controller/
│   ├── AuthController.java       # Authentication endpoints
│   └── DeploymentController.java # Main REST controller
├── model/
│   ├── Deployment.java          # Main entity
│   ├── User.java               # User entity
│   ├── Service.java            # Service entity
│   └── Release.java            # Release entity
├── repository/
│   ├── DeploymentRepository.java # Data access layer
│   ├── UserRepository.java      # User data access
│   ├── ServiceRepository.java   # Service data access
│   └── ReleaseRepository.java   # Release data access
└── service/                     # Business logic layer (optional)
```

#### Frontend Code Structure
```
src/app/
├── app.component.ts              # Main application component
├── models/
│   ├── deployment.interface.ts   # Type definitions
│   ├── user.interface.ts         # User types
│   └── service.interface.ts      # Service types
├── services/
│   ├── auth.service.ts          # Authentication service
│   └── deployment.service.ts    # Data service
├── components/
│   ├── login/                   # Login component
│   ├── main-header/             # Header component
│   ├── main-toolbar/            # Filter toolbar
│   ├── request-list/            # Request list
│   ├── request-details/         # Request details
│   └── bottom-toolbar/          # Export toolbar
└── shared/                      # Shared utilities
```

### Git Workflow

#### Branch Strategy
```bash
# Main branches
main           # Production-ready code
develop        # Integration branch for features

# Feature branches
feature/name   # New features
bugfix/name    # Bug fixes
hotfix/name    # Emergency fixes
```

#### Commit Guidelines
```bash
# Commit message format
type(scope): description

# Types:
feat     # New feature
fix      # Bug fix
docs     # Documentation
style    # Code style changes
refactor # Code refactoring
test     # Adding tests
chore    # Maintenance

# Examples:
git commit -m "feat(auth): add session timeout handling"
git commit -m "fix(deployment): resolve production ready update issue"
git commit -m "docs(api): update REST endpoint documentation"
```

#### Development Process
```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-functionality

# 2. Make changes and commit
git add .
git commit -m "feat(feature): implement new functionality"

# 3. Push feature branch
git push origin feature/new-functionality

# 4. Create pull request to develop
# 5. After review, merge to develop
# 6. Deploy to staging for testing
# 7. Merge develop to main for production
```

### Code Standards

#### Backend Code Standards
```java
// Use proper Java naming conventions
public class DeploymentController {
    
    // Use meaningful variable names
    private final DeploymentRepository deploymentRepository;
    
    // Add proper documentation
    /**
     * Creates a new deployment request
     * @param deployment The deployment data
     * @param request HTTP request for session access
     * @return Response with success/error message
     */
    @PostMapping("/api/deployments")
    public ResponseEntity<Map<String, String>> createDeployment(
            @RequestBody Deployment deployment, 
            HttpServletRequest request) {
        // Implementation...
    }
}
```

#### Frontend Code Standards
```typescript
// Use TypeScript interfaces
export interface Deployment {
  id?: number;
  serialNumber: string;
  // ... other properties
}

// Use meaningful component names
@Component({
  selector: 'app-request-details',
  standalone: true,
  templateUrl: './request-details.component.html'
})
export class RequestDetailsComponent implements OnInit, OnDestroy {
  
  // Use proper lifecycle methods
  ngOnInit(): void {
    this.loadDeployment();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Testing

### Backend Testing

#### Unit Tests
```bash
cd backend/deployment-portal

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=DeploymentControllerTest

# Run with coverage
./mvnw test jacoco:report
```

#### Test Structure
```java
// src/test/java/com/deploymentportal/controller/DeploymentControllerTest.java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DeploymentControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testCreateDeployment() {
        // Given
        Deployment deployment = new Deployment();
        deployment.setService("test-service");
        
        // When
        ResponseEntity<String> response = restTemplate.postForEntity(
            "/api/deployments", deployment, String.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

#### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Transactional
class DeploymentIntegrationTest {
    
    @Autowired
    private DeploymentRepository repository;
    
    @Test
    void testFullDeploymentLifecycle() {
        // Test complete CRUD operations
    }
}
```

### Frontend Testing

#### Unit Tests
```bash
cd frontend/deployment-portal-frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

#### Test Structure
```typescript
// src/app/services/deployment.service.spec.ts
describe('DeploymentService', () => {
  let service: DeploymentService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeploymentService]
    });
    service = TestBed.inject(DeploymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should fetch deployments', () => {
    const mockDeployments = [/* mock data */];
    
    service.getAllDeployments().subscribe(deployments => {
      expect(deployments).toEqual(mockDeployments);
    });
    
    const req = httpMock.expectOne('/api/deployments');
    expect(req.request.method).toBe('GET');
    req.flush(mockDeployments);
  });
});
```

#### E2E Tests
```bash
# Install E2E testing tools
npm install --save-dev cypress

# Run E2E tests
npm run e2e
```

```typescript
// cypress/integration/deployment.spec.ts
describe('Deployment Portal E2E', () => {
  it('should login and create deployment', () => {
    cy.visit('/');
    cy.get('[data-cy=username]').type('dev1');
    cy.get('[data-cy=password]').type('dev123');
    cy.get('[data-cy=login]').click();
    
    cy.get('[data-cy=new-request]').click();
    cy.get('[data-cy=service]').type('test-service');
    cy.get('[data-cy=submit]').click();
    
    cy.contains('Request created successfully');
  });
});
```

---

## Debugging

### Backend Debugging

#### IDE Debugging
```java
// Set breakpoints in IntelliJ IDEA or VS Code
@PostMapping("/api/deployments")
public ResponseEntity<Map<String, String>> createDeployment(
        @RequestBody Deployment deployment, 
        HttpServletRequest request) {
    
    // Set breakpoint here
    logger.debug("Creating deployment: {}", deployment);
    
    // Debug session validation
    HttpSession session = request.getSession(false);
    // Set breakpoint here to inspect session
    
    return ResponseEntity.ok(/* response */);
}
```

#### Remote Debugging
```bash
# Start with remote debugging enabled
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar target/deployment-portal.jar

# Connect from IDE to localhost:5005
```

#### Logging Configuration
```properties
# application-dev.properties
logging.level.com.deploymentportal=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Console logging pattern
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

### Frontend Debugging

#### Browser DevTools
```typescript
// Add console logging
export class DeploymentService {
  getAllDeployments(search?: string): Observable<any[]> {
    console.log('Fetching deployments with search:', search);
    
    return this.http.get<any[]>(`${this.apiUrl}/deployments`, { params })
      .pipe(
        tap(data => console.log('Received deployments:', data)),
        catchError(error => {
          console.error('Error fetching deployments:', error);
          return throwError(error);
        })
      );
  }
}
```

#### Angular DevTools
```bash
# Install Angular DevTools browser extension
# Chrome: https://chrome.google.com/webstore/detail/angular-devtools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/angular-devtools/
```

#### Network Debugging
```typescript
// HTTP interceptor for debugging
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('HTTP Request:', req);
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('HTTP Response:', event);
        }
      })
    );
  }
}
```

### Database Debugging

#### H2 Console Access
```bash
# Access H2 console at: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:testdb
# Username: sa
# Password: (empty)
```

#### SQL Queries
```sql
-- Check deployment data
SELECT * FROM deployment ORDER BY date_requested DESC;

-- Check user sessions
SELECT * FROM users;

-- Check environment relationships
SELECT d.serial_number, de.environments 
FROM deployment d 
LEFT JOIN deployment_environments de ON d.id = de.deployment_id;
```

---

## Production Deployment

### Production Build

#### Backend Production Build
```bash
cd backend/deployment-portal

# Clean and build
./mvnw clean package -Pprod

# The JAR file will be in target/
ls -la target/deployment-portal-*.jar
```

#### Frontend Production Build
```bash
cd frontend/deployment-portal-frontend

# Install dependencies
npm ci

# Build for production
npm run build --prod

# Output will be in dist/
ls -la dist/deployment-portal-frontend/
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
# backend/deployment-portal/Dockerfile
FROM openjdk:17-jdk-slim

# Create app directory
WORKDIR /app

# Copy the JAR file
COPY target/deployment-portal-*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/auth/check || exit 1

# Run the application
CMD ["java", "-jar", "app.jar"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/deployment-portal-frontend/Dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build --prod

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist/deployment-portal-frontend /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend/deployment-portal
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=database
    depends_on:
      - database
    volumes:
      - ./logs:/app/logs

  frontend:
    build: ./frontend/deployment-portal-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  database:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=deploymentportal
      - MYSQL_USER=deployment_user
      - MYSQL_PASSWORD=deployment_pass
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Production Configuration

#### Environment Variables
```bash
# Production environment variables
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your-database-host
export DB_USERNAME=your-db-user
export DB_PASSWORD=your-db-password
export SSL_KEYSTORE_PATH=/etc/ssl/keystore.p12
export SSL_KEYSTORE_PASSWORD=your-keystore-password
```

#### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Handle Angular routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API calls to backend
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## Troubleshooting

### Common Issues

#### Backend Issues

**Issue: Application won't start**
```bash
# Check Java version
java -version

# Check if port 8080 is in use
netstat -tulpn | grep 8080

# Kill process using port 8080
sudo kill -9 $(lsof -t -i:8080)

# Check application logs
tail -f logs/deployment-portal.log
```

**Issue: Database connection failed**
```bash
# Verify H2 console access
curl http://localhost:8080/h2-console

# Check database URL in logs
grep -i "database" logs/deployment-portal.log

# Reset database
rm -rf data/ # If using file-based H2
```

**Issue: Session issues**
```java
// Debug session in controller
@GetMapping("/api/debug/session")
public ResponseEntity<Map<String, Object>> debugSession(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    Map<String, Object> info = new HashMap<>();
    
    if (session != null) {
        info.put("sessionId", session.getId());
        info.put("creationTime", new Date(session.getCreationTime()));
        info.put("lastAccessedTime", new Date(session.getLastAccessedTime()));
        info.put("maxInactiveInterval", session.getMaxInactiveInterval());
        info.put("user", session.getAttribute("user"));
    } else {
        info.put("session", "No active session");
    }
    
    return ResponseEntity.ok(info);
}
```

#### Frontend Issues

**Issue: Cannot connect to backend**
```bash
# Check proxy configuration
cat proxy.conf.json

# Verify backend is running
curl http://localhost:8080/api/auth/check

# Check browser network tab for CORS errors
# Open DevTools > Network > Look for failed requests
```

**Issue: Build failures**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Angular CLI version
ng version

# Update Angular CLI if needed
npm uninstall -g @angular/cli
npm install -g @angular/cli@16
```

**Issue: Runtime errors**
```typescript
// Enable detailed error logging
// In main.ts
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (!environment.production) {
  // Enable detailed error messages
  console.log('Development mode enabled');
}
```

#### Network Issues

**Issue: CORS errors**
```java
// Backend CORS configuration
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
public class DeploymentController {
    // Controller methods...
}
```

**Issue: Session cookies not working**
```typescript
// Frontend HTTP client configuration
@Injectable()
export class DeploymentService {
  constructor(private http: HttpClient) {
    // Ensure cookies are sent with requests
    this.http = http;
  }
  
  getAllDeployments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deployments`, {
      withCredentials: true // Important for session cookies
    });
  }
}
```

### Performance Issues

**Issue: Slow page load**
```typescript
// Frontend optimization
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class RequestListComponent {
  
  // Use trackBy for large lists
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
```

**Issue: Memory leaks**
```typescript
// Proper subscription management
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Debugging Tools

#### Backend Debugging Tools
```bash
# JVM monitoring
jps -l                    # List Java processes
jstack <pid>             # Thread dump
jmap -dump:file=heap.bin <pid>  # Heap dump

# Application monitoring
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
```

#### Frontend Debugging Tools
```bash
# Angular DevTools
# Install browser extension for component inspection

# Bundle analysis
npm install --save-dev webpack-bundle-analyzer
ng build --stats-json
npx webpack-bundle-analyzer dist/deployment-portal-frontend/stats.json
```

This developer setup guide provides comprehensive instructions for setting up, developing, testing, and deploying the Deployment Portal application.
