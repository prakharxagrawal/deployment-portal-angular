# 🛠️ Development Guide

**Comprehensive development guide for contributing to the Deployment Portal**

## 📋 **Table of Contents**
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Debugging & Troubleshooting](#debugging--troubleshooting)
- [Build & Deployment](#build--deployment)
- [Contributing Guidelines](#contributing-guidelines)
- [IDE Configuration](#ide-configuration)
- [Performance Guidelines](#performance-guidelines)

---

## 🚀 **Development Environment Setup**

### **Prerequisites**
```bash
# Required Software Versions
Java: OpenJDK 17 or higher
Node.js: 18.x or higher  
npm: 9.x or higher
PostgreSQL: 15.x or higher
Git: Latest version
Docker: Latest version (optional)
IDE: IntelliJ IDEA, VS Code, or Eclipse
```

### **Local Development Setup**

#### **1. Clone Repository**
```bash
# Clone the repository
git clone https://github.com/company/deployment-portal-angular.git
cd deployment-portal-angular

# Create feature branch
git checkout -b feature/your-feature-name
```

#### **2. Database Setup**
```bash
# Start PostgreSQL (if using Docker)
docker run --name postgres-dev \
  -e POSTGRES_DB=deployment_portal_dev \
  -e POSTGRES_USER=dev_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  -d postgres:15

# Or install PostgreSQL locally and create database
createdb deployment_portal_dev
psql deployment_portal_dev < database/schema.sql
psql deployment_portal_dev < database/test-data.sql
```

#### **3. Backend Setup**
```bash
cd backend/deployment-portal

# Copy configuration template
cp src/main/resources/application-dev.properties.template \
   src/main/resources/application-dev.properties

# Update database connection settings
nano src/main/resources/application-dev.properties

# Install dependencies and run
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### **4. Frontend Setup**
```bash
cd frontend/deployment-portal-frontend

# Install dependencies
npm install

# Start development server
npm start

# Application will be available at http://localhost:4200
```

### **Environment Configuration**

#### **Backend Configuration (application-dev.properties)**
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/deployment_portal_dev
spring.datasource.username=dev_user
spring.datasource.password=dev_password
spring.jpa.hibernate.ddl-auto=update

# Development Settings
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.springframework.security=DEBUG
logging.level.com.deploymentportal=DEBUG

# Session Configuration
server.servlet.session.timeout=30m
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false

# File Upload Settings
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB

# CORS Settings (for development)
cors.allowed-origins=http://localhost:4200
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
```

#### **Frontend Configuration (proxy.conf.json)**
```json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

---

## 📁 **Project Structure**

### **Overall Structure**
```
deployment-portal-angular/
├── backend/
│   └── deployment-portal/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/deploymentportal/
│       │   │   │   ├── Application.java
│       │   │   │   ├── config/
│       │   │   │   ├── controller/
│       │   │   │   ├── service/
│       │   │   │   ├── repository/
│       │   │   │   ├── model/
│       │   │   │   ├── dto/
│       │   │   │   ├── security/
│       │   │   │   └── util/
│       │   │   └── resources/
│       │   │       ├── application.properties
│       │   │       ├── application-dev.properties
│       │   │       ├── application-prod.properties
│       │   │       └── data.sql
│       │   └── test/
│       │       └── java/com/deploymentportal/
│       ├── pom.xml
│       └── target/
├── frontend/
│   └── deployment-portal-frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   ├── services/
│       │   │   ├── models/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── shared/
│       │   ├── assets/
│       │   ├── environments/
│       │   └── styles/
│       ├── package.json
│       ├── angular.json
│       ├── proxy.conf.json
│       └── dist/
├── docs/
├── scripts/
└── README.md
```

### **Backend Package Structure**
```java
com.deploymentportal/
├── Application.java                    // Main application class
├── config/                            // Configuration classes
│   ├── SecurityConfig.java
│   ├── DatabaseConfig.java
│   ├── CacheConfig.java
│   └── WebConfig.java
├── controller/                        // REST controllers
│   ├── DeploymentController.java
│   ├── UserController.java
│   ├── AuthController.java
│   └── SystemController.java
├── service/                          // Business logic
│   ├── DeploymentService.java
│   ├── UserService.java
│   ├── AuthService.java
│   └── impl/
├── repository/                       // Data access
│   ├── DeploymentRepository.java
│   ├── UserRepository.java
│   └── ReleaseRepository.java
├── model/                           // Entity models
│   ├── Deployment.java
│   ├── User.java
│   ├── Release.java
│   └── audit/
├── dto/                            // Data transfer objects
│   ├── request/
│   ├── response/
│   └── mapper/
├── security/                       // Security components
│   ├── CustomUserDetailsService.java
│   ├── SecurityUtils.java
│   └── AuthenticationEntryPoint.java
└── util/                          // Utility classes
    ├── DateUtils.java
    ├── ValidationUtils.java
    └── Constants.java
```

### **Frontend Structure**
```typescript
src/app/
├── app.component.ts                 // Root component
├── app.module.ts                   // Root module
├── app-routing.module.ts           // Main routing
├── components/                     // Feature components
│   ├── deployment/
│   │   ├── deployment-list/
│   │   ├── deployment-detail/
│   │   ├── deployment-form/
│   │   └── deployment.module.ts
│   ├── user/
│   ├── auth/
│   └── shared/
├── services/                       // Services
│   ├── deployment.service.ts
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── http-error.service.ts
├── models/                        // TypeScript interfaces
│   ├── deployment.model.ts
│   ├── user.model.ts
│   └── api-response.model.ts
├── guards/                        // Route guards
│   ├── auth.guard.ts
│   └── role.guard.ts
├── interceptors/                  // HTTP interceptors
│   ├── auth.interceptor.ts
│   └── error.interceptor.ts
├── pipes/                         // Custom pipes
│   ├── status.pipe.ts
│   └── date-format.pipe.ts
└── shared/                        // Shared components
    ├── header/
    ├── footer/
    ├── loading/
    └── confirm-dialog/
```

---

## 🔄 **Development Workflow**

### **Git Workflow**

#### **Branch Strategy**
```bash
# Main branches
main           # Production-ready code
develop        # Integration branch
release/*      # Release preparation
hotfix/*       # Critical fixes

# Feature branches
feature/*      # New features
bugfix/*       # Bug fixes
```

#### **Feature Development Process**
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/JIRA-123-user-management

# 2. Make changes and commit
git add .
git commit -m "feat: add user role management functionality

- Add role-based access control
- Implement role assignment UI
- Add validation for role changes
- Update tests for new functionality

Closes JIRA-123"

# 3. Push and create pull request
git push origin feature/JIRA-123-user-management

# 4. After review, merge to develop
git checkout develop
git pull origin develop
git merge --no-ff feature/JIRA-123-user-management
git push origin develop

# 5. Clean up feature branch
git branch -d feature/JIRA-123-user-management
git push origin --delete feature/JIRA-123-user-management
```

### **Commit Message Standards**
```bash
# Format: type(scope): description
#
# Types:
# feat: new feature
# fix: bug fix
# docs: documentation changes
# style: formatting changes
# refactor: code refactoring
# perf: performance improvements
# test: adding/updating tests
# chore: maintenance tasks

# Examples:
feat(auth): implement role-based access control
fix(deployment): resolve status update validation issue
docs(api): update endpoint documentation
refactor(service): extract common validation logic
test(controller): add integration tests for deployment API
```

### **Code Review Process**

#### **Pull Request Checklist**
```markdown
## Pull Request Checklist

### Code Quality
- [ ] Code follows project coding standards
- [ ] All new code has appropriate comments
- [ ] No debugging code or console.log statements
- [ ] Error handling is implemented properly
- [ ] Security considerations are addressed

### Testing
- [ ] Unit tests are written for new functionality
- [ ] Integration tests are updated if needed
- [ ] All tests pass locally
- [ ] Test coverage meets minimum requirements (80%)

### Documentation
- [ ] Code is self-documenting with clear variable names
- [ ] Complex logic is commented
- [ ] API documentation is updated
- [ ] User-facing changes are documented

### Database
- [ ] Database migrations are included if needed
- [ ] Database changes are backward compatible
- [ ] Performance impact is considered

### Security
- [ ] Input validation is implemented
- [ ] Authorization checks are in place
- [ ] No sensitive data in logs
- [ ] SQL injection prevention measures
```

---

## 📝 **Coding Standards**

### **Java/Spring Boot Standards**

#### **Class Structure**
```java
// Class header with proper documentation
/**
 * Service class for managing deployment operations.
 * Handles CRUD operations and business logic for deployments.
 *
 * @author Development Team
 * @version 1.0
 * @since 2024-01-01
 */
@Service
@Transactional
@Slf4j
public class DeploymentService {
    
    // Constants first
    private static final int MAX_DEPLOYMENT_TITLE_LENGTH = 200;
    private static final String DEFAULT_STATUS = "DRAFT";
    
    // Dependencies injection
    private final DeploymentRepository deploymentRepository;
    private final UserService userService;
    private final AuditService auditService;
    
    // Constructor injection (preferred)
    public DeploymentService(DeploymentRepository deploymentRepository,
                           UserService userService,
                           AuditService auditService) {
        this.deploymentRepository = deploymentRepository;
        this.userService = userService;
        this.auditService = auditService;
    }
    
    // Public methods first
    public Deployment createDeployment(CreateDeploymentRequest request) {
        validateRequest(request);
        
        Deployment deployment = mapToEntity(request);
        deployment.setRequester(getCurrentUser());
        deployment.setStatus(DeploymentStatus.DRAFT);
        
        Deployment saved = deploymentRepository.save(deployment);
        auditService.logCreation(saved);
        
        log.info("Created deployment: {} by user: {}", 
                saved.getId(), saved.getRequester().getUsername());
        
        return saved;
    }
    
    // Private methods last
    private void validateRequest(CreateDeploymentRequest request) {
        Assert.notNull(request, "Request cannot be null");
        Assert.hasText(request.getTitle(), "Title is required");
        Assert.isTrue(request.getTitle().length() <= MAX_DEPLOYMENT_TITLE_LENGTH,
                     "Title too long");
    }
    
    private User getCurrentUser() {
        return userService.getCurrentUser()
            .orElseThrow(() -> new UnauthorizedException("User not authenticated"));
    }
}
```

#### **Naming Conventions**
```java
// Classes: PascalCase
public class DeploymentService { }

// Methods: camelCase
public void createDeployment() { }

// Variables: camelCase
private String deploymentTitle;

// Constants: UPPER_SNAKE_CASE
private static final String DEFAULT_STATUS = "DRAFT";

// Packages: lowercase
package com.deploymentportal.service;

// Test classes: ClassNameTest
public class DeploymentServiceTest { }
```

### **TypeScript/Angular Standards**

#### **Component Structure**
```typescript
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Component for displaying deployment details
 * Handles view and edit modes for deployment information
 */
@Component({
  selector: 'app-deployment-detail',
  templateUrl: './deployment-detail.component.html',
  styleUrls: ['./deployment-detail.component.scss']
})
export class DeploymentDetailComponent implements OnInit, OnDestroy {
  // Inputs first
  @Input() deployment: Deployment | null = null;
  @Input() readonly: boolean = false;
  
  // Outputs next
  @Output() deploymentUpdate = new EventEmitter<Deployment>();
  @Output() statusChange = new EventEmitter<string>();
  
  // Public properties
  editMode = false;
  loading = false;
  error: string | null = null;
  
  // Private properties
  private destroy$ = new Subject<void>();
  
  constructor(
    private deploymentService: DeploymentService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.initializeComponent();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Public methods
  toggleEditMode(): void {
    if (!this.canEdit()) {
      return;
    }
    this.editMode = !this.editMode;
  }
  
  saveDeployment(): void {
    if (!this.deployment) {
      return;
    }
    
    this.loading = true;
    this.deploymentService.updateDeployment(this.deployment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.deploymentUpdate.emit(updated);
          this.editMode = false;
          this.notificationService.showSuccess('Deployment updated successfully');
        },
        error: (error) => {
          this.error = error.message;
          this.notificationService.showError('Failed to update deployment');
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
  
  // Private methods
  private initializeComponent(): void {
    // Initialization logic
  }
  
  private canEdit(): boolean {
    return this.authService.hasPermission('EDIT_DEPLOYMENT') && !this.readonly;
  }
}
```

#### **Service Structure**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Service for managing deployment operations
 * Handles HTTP communication with the backend API
 */
@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  private readonly baseUrl = '/api/v1/deployments';
  
  constructor(private http: HttpClient) {}
  
  getDeployments(params?: DeploymentQueryParams): Observable<PagedResponse<Deployment>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof DeploymentQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<PagedResponse<Deployment>>(this.baseUrl, { params: httpParams })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }
  
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
```

---

## 🧪 **Testing Guidelines**

### **Backend Testing**

#### **Unit Tests**
```java
@ExtendWith(MockitoExtension.class)
class DeploymentServiceTest {
    
    @Mock
    private DeploymentRepository deploymentRepository;
    
    @Mock
    private UserService userService;
    
    @Mock
    private AuditService auditService;
    
    @InjectMocks
    private DeploymentService deploymentService;
    
    @Test
    @DisplayName("Should create deployment successfully")
    void shouldCreateDeploymentSuccessfully() {
        // Given
        CreateDeploymentRequest request = CreateDeploymentRequest.builder()
            .title("Test Deployment")
            .description("Test description")
            .priority(Priority.MEDIUM)
            .build();
        
        User currentUser = new User();
        currentUser.setId(1L);
        currentUser.setUsername("testuser");
        
        Deployment savedDeployment = new Deployment();
        savedDeployment.setId(1L);
        savedDeployment.setTitle(request.getTitle());
        
        when(userService.getCurrentUser()).thenReturn(Optional.of(currentUser));
        when(deploymentRepository.save(any(Deployment.class))).thenReturn(savedDeployment);
        
        // When
        Deployment result = deploymentService.createDeployment(request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Deployment");
        assertThat(result.getRequester()).isEqualTo(currentUser);
        
        verify(deploymentRepository).save(argThat(deployment -> 
            deployment.getTitle().equals("Test Deployment") &&
            deployment.getStatus() == DeploymentStatus.DRAFT
        ));
        verify(auditService).logCreation(savedDeployment);
    }
    
    @Test
    @DisplayName("Should throw exception when request is null")
    void shouldThrowExceptionWhenRequestIsNull() {
        // When & Then
        assertThrows(IllegalArgumentException.class, 
                    () -> deploymentService.createDeployment(null));
    }
}
```

#### **Integration Tests**
```java
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class DeploymentControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Test
    @WithMockUser(username = "testuser", roles = {"ADMIN"})
    void shouldCreateDeploymentViaApi() {
        // Given
        CreateDeploymentRequest request = CreateDeploymentRequest.builder()
            .title("Integration Test Deployment")
            .description("Test via API")
            .priority(Priority.HIGH)
            .application("test-app")
            .version("1.0.0")
            .environment(Environment.DEVELOPMENT)
            .build();
        
        // When
        ResponseEntity<Deployment> response = restTemplate.postForEntity(
            "/api/v1/deployments", request, Deployment.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Integration Test Deployment");
        
        // Verify in database
        Deployment saved = entityManager.find(Deployment.class, response.getBody().getId());
        assertThat(saved).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(DeploymentStatus.DRAFT);
    }
}
```

### **Frontend Testing**

#### **Component Unit Tests**
```typescript
describe('DeploymentDetailComponent', () => {
  let component: DeploymentDetailComponent;
  let fixture: ComponentFixture<DeploymentDetailComponent>;
  let deploymentService: jasmine.SpyObj<DeploymentService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const deploymentServiceSpy = jasmine.createSpyObj('DeploymentService', ['updateDeployment']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasPermission']);

    await TestBed.configureTestingModule({
      declarations: [DeploymentDetailComponent],
      providers: [
        { provide: DeploymentService, useValue: deploymentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeploymentDetailComponent);
    component = fixture.componentInstance;
    deploymentService = TestBed.inject(DeploymentService) as jasmine.SpyObj<DeploymentService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable edit mode when user has permission', () => {
    // Given
    authService.hasPermission.and.returnValue(true);
    component.readonly = false;

    // When
    component.toggleEditMode();

    // Then
    expect(component.editMode).toBe(true);
  });

  it('should not enable edit mode when user lacks permission', () => {
    // Given
    authService.hasPermission.and.returnValue(false);

    // When
    component.toggleEditMode();

    // Then
    expect(component.editMode).toBe(false);
  });

  it('should save deployment successfully', fakeAsync(() => {
    // Given
    const mockDeployment = { id: 1, title: 'Test' } as Deployment;
    component.deployment = mockDeployment;
    deploymentService.updateDeployment.and.returnValue(of(mockDeployment));

    spyOn(component.deploymentUpdate, 'emit');

    // When
    component.saveDeployment();
    tick();

    // Then
    expect(deploymentService.updateDeployment).toHaveBeenCalledWith(mockDeployment);
    expect(component.deploymentUpdate.emit).toHaveBeenCalledWith(mockDeployment);
    expect(component.editMode).toBe(false);
  }));
});
```

#### **Service Tests**
```typescript
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

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve deployments', () => {
    // Given
    const mockResponse: PagedResponse<Deployment> = {
      content: [{ id: 1, title: 'Test' } as Deployment],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0
    };

    // When
    service.getDeployments().subscribe(response => {
      // Then
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/v1/deployments');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
```

### **Test Coverage Requirements**
```bash
# Minimum Coverage Targets
Backend (Java): 80% line coverage, 70% branch coverage
Frontend (TypeScript): 75% line coverage, 65% branch coverage

# Run coverage reports
mvn clean test jacoco:report  # Backend
npm run test:coverage        # Frontend
```

---

## 🐛 **Debugging & Troubleshooting**

### **Backend Debugging**

#### **Logging Configuration**
```properties
# Development logging levels
logging.level.root=INFO
logging.level.com.deploymentportal=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Console logging pattern
logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n

# File logging
logging.file.name=logs/application.log
logging.pattern.file=%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n
```

#### **Debug with IDE (IntelliJ)**
```java
// Set breakpoints in service methods
@Service
public class DeploymentService {
    
    public Deployment createDeployment(CreateDeploymentRequest request) {
        // Set breakpoint here to inspect request
        validateRequest(request);
        
        // Set breakpoint to inspect mapped entity
        Deployment deployment = mapToEntity(request);
        
        // Set breakpoint to inspect saved entity
        return deploymentRepository.save(deployment);
    }
}

// Use conditional breakpoints for specific scenarios
// Condition: request.getTitle().contains("debug")
```

#### **Database Query Debugging**
```java
// Enable SQL logging in application-dev.properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true

// Use @Query with named parameters for debugging
@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    
    @Query("SELECT d FROM Deployment d WHERE d.status = :status AND d.requester.id = :userId")
    List<Deployment> findByStatusAndRequester(@Param("status") DeploymentStatus status, 
                                            @Param("userId") Long userId);
}
```

### **Frontend Debugging**

#### **Browser Developer Tools**
```typescript
// Use console.log strategically (remove before commit)
export class DeploymentService {
  
  getDeployments(params?: DeploymentQueryParams): Observable<PagedResponse<Deployment>> {
    console.log('Getting deployments with params:', params);
    
    return this.http.get<PagedResponse<Deployment>>(this.baseUrl, { params })
      .pipe(
        tap(response => console.log('Deployments response:', response)),
        catchError(error => {
          console.error('Error getting deployments:', error);
          return throwError(() => error);
        })
      );
  }
}

// Use debugger statements for breakpoints
toggleEditMode(): void {
  debugger; // Browser will pause here
  this.editMode = !this.editMode;
}
```

#### **Angular DevTools**
```bash
# Install Angular DevTools browser extension
# Available for Chrome and Firefox

# Use for:
# - Component inspection
# - Change detection profiling  
# - Dependency injection debugging
# - Router state inspection
```

### **Network Debugging**

#### **HTTP Request/Response Debugging**
```typescript
// HTTP Interceptor for debugging
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Outgoing request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('Incoming response:', {
            status: event.status,
            url: event.url,
            body: event.body
          });
        }
      }),
      catchError(error => {
        console.error('HTTP Error:', error);
        return throwError(() => error);
      })
    );
  }
}
```

### **Common Issues & Solutions**

#### **CORS Issues**
```java
// Backend CORS configuration
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

#### **Session Issues**
```java
// Check session configuration
@Configuration
public class SessionConfig {
    
    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }
    
    @EventListener
    public void sessionCreated(HttpSessionCreatedEvent event) {
        log.debug("Session created: {}", event.getSession().getId());
    }
    
    @EventListener
    public void sessionDestroyed(HttpSessionDestroyedEvent event) {
        log.debug("Session destroyed: {}", event.getSession().getId());
    }
}
```

---

## 🏗️ **Build & Deployment**

### **Local Build Process**

#### **Backend Build**
```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package application
mvn package

# Skip tests for faster builds (use cautiously)
mvn package -DskipTests

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### **Frontend Build**
```bash
# Development build
npm run build

# Production build
npm run build:prod

# Build with specific environment
ng build --configuration=staging

# Analyze bundle size
npm run build:analyze
```

### **Build Optimization**

#### **Backend Optimization**
```xml
<!-- Maven optimization in pom.xml -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <layers>
            <enabled>true</enabled>
        </layers>
        <excludes>
            <exclude>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-configuration-processor</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>
```

#### **Frontend Optimization**
```json
// Angular.json optimization settings
{
  "projects": {
    "deployment-portal-frontend": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### **Docker Build**
```dockerfile
# Multi-stage Docker build
FROM maven:3.8-openjdk-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build:prod

FROM openjdk:17-jdk-slim AS runtime
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=frontend-build /app/dist /app/static
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

---

## 🤝 **Contributing Guidelines**

### **Code Contribution Process**

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/deployment-portal-angular.git
   cd deployment-portal-angular
   git remote add upstream https://github.com/company/deployment-portal-angular.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow coding standards
   - Write tests
   - Update documentation

4. **Test Changes**
   ```bash
   # Backend tests
   mvn test
   
   # Frontend tests  
   npm test
   npm run e2e
   ```

5. **Submit Pull Request**
   - Use pull request template
   - Include screenshots for UI changes
   - Reference related issues

### **Documentation Contributions**

- Update relevant documentation files
- Include code examples for new features
- Maintain consistency with existing style
- Review for grammar and clarity

---

## 💻 **IDE Configuration**

### **IntelliJ IDEA Setup**

#### **Code Style Settings**
```xml
<!-- Import code style settings -->
<!-- File > Settings > Editor > Code Style > Import Scheme -->
<code_scheme name="Deployment Portal">
  <option name="RIGHT_MARGIN" value="120" />
  <JavaCodeStyleSettings>
    <option name="CLASS_COUNT_TO_USE_IMPORT_ON_DEMAND" value="999" />
    <option name="NAMES_COUNT_TO_USE_IMPORT_ON_DEMAND" value="999" />
  </JavaCodeStyleSettings>
</code_scheme>
```

#### **Useful Plugins**
```
- Lombok Plugin
- Spring Boot Helper
- Angular and TypeScript
- SonarLint
- GitToolBox
- Database Navigator
```

### **VS Code Setup**

#### **Extensions**
```json
{
  "recommendations": [
    "vscjava.vscode-java-pack",
    "angular.ng-template",
    "ms-typescript.typescript",
    "esbenp.prettier-vscode",
    "sonarsource.sonarlint-vscode",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

#### **Settings**
```json
{
  "java.format.settings.url": "./java-formatter.xml",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

---

## ⚡ **Performance Guidelines**

### **Backend Performance**

#### **Database Optimization**
```java
// Use pagination for large datasets
@Query("SELECT d FROM Deployment d WHERE d.status = :status")
Page<Deployment> findByStatus(@Param("status") DeploymentStatus status, Pageable pageable);

// Use projections for summary views
public interface DeploymentSummary {
    Long getId();
    String getTitle();
    DeploymentStatus getStatus();
    LocalDateTime getCreatedAt();
}

// Optimize queries with specific fetching
@Query("SELECT d FROM Deployment d JOIN FETCH d.requester WHERE d.id = :id")
Optional<Deployment> findByIdWithRequester(@Param("id") Long id);
```

#### **Caching Strategy**
```java
@Service
public class DeploymentService {
    
    @Cacheable(value = "deployments", key = "#id")
    public Deployment getDeployment(Long id) {
        return deploymentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Deployment not found"));
    }
    
    @CacheEvict(value = "deployments", key = "#deployment.id")
    public Deployment updateDeployment(Deployment deployment) {
        return deploymentRepository.save(deployment);
    }
}
```

### **Frontend Performance**

#### **Lazy Loading**
```typescript
// Lazy load feature modules
const routes: Routes = [
  {
    path: 'deployments',
    loadChildren: () => import('./deployment/deployment.module').then(m => m.DeploymentModule)
  },
  {
    path: 'users', 
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  }
];
```

#### **OnPush Change Detection**
```typescript
@Component({
  selector: 'app-deployment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class DeploymentListComponent {
  @Input() deployments: Deployment[] = [];
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  updateData(newData: Deployment[]): void {
    this.deployments = newData;
    this.cdr.markForCheck();
  }
}
```

#### **Virtual Scrolling**
```typescript
// Use CDK virtual scrolling for large lists
<cdk-virtual-scroll-viewport itemSize="50" class="deployment-viewport">
  <div *cdkVirtualFor="let deployment of deployments" class="deployment-item">
    {{ deployment.title }}
  </div>
</cdk-virtual-scroll-viewport>
```

---

*This comprehensive development guide provides all the information needed to effectively contribute to the Deployment Portal project. Keep this documentation updated as the project evolves and new best practices emerge.*
