# 🏗️ Architecture Documentation

**Complete system architecture and design documentation for the Deployment Portal**

## 📋 **Table of Contents**
- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Component Architecture](#component-architecture)
- [Data Architecture](#data-architecture)
- [Security Architecture](#security-architecture)
- [Integration Architecture](#integration-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Scalability & Performance](#scalability--performance)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)

---

## 🌐 **System Overview**

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Web Browser   │   Mobile App    │      API Clients           │
│   (Angular)     │   (Future)      │   (3rd Party Tools)        │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                        HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                    Nginx (Load Balancer)                       │
│          SSL Termination │ Static Content │ Reverse Proxy      │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                    Spring Boot Backend                         │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│   │Controllers  │ │  Services   │ │     Security Layer      │   │
│   │             │ │             │ │                         │   │
│   │ • REST APIs │ │ • Business  │ │ • Authentication        │   │
│   │ • Validation│ │   Logic     │ │ • Authorization         │   │
│   │ • Routing   │ │ • Data      │ │ • Session Management    │   │
│   │             │ │   Processing│ │ • Role-based Access     │   │
│   └─────────────┘ └─────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL Database                         │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│   │Primary DB   │ │   Replica   │ │      File Storage       │   │
│   │             │ │             │ │                         │   │
│   │ • User Data │ │ • Read      │ │ • Deployment Packages   │   │
│   │ • Deployments│ │   Replica   │ │ • Documents             │   │
│   │ • Audit Logs│ │ • Backup    │ │ • Attachments           │   │
│   │ • Config    │ │             │ │                         │   │
│   └─────────────┘ └─────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### **System Context**
The Deployment Portal operates within the enterprise ecosystem:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Enterprise Ecosystem                       │
│                                                                 │
│  ┌─────────────┐    ┌─────────────────────┐    ┌─────────────┐ │
│  │    LDAP     │────│   Deployment        │────│ ServiceNow  │ │
│  │ Active      │    │     Portal          │    │    ITSM     │ │
│  │ Directory   │    │                     │    │             │ │
│  └─────────────┘    └─────────────────────┘    └─────────────┘ │
│                               │                                 │
│  ┌─────────────┐              │              ┌─────────────┐    │
│  │  CI/CD      │──────────────┼──────────────│ Monitoring  │    │
│  │ Pipelines   │              │              │ Systems     │    │
│  │(Jenkins/Git)│              │              │(Prometheus) │    │
│  └─────────────┘              │              └─────────────┘    │
│                               │                                 │
│  ┌─────────────┐              │              ┌─────────────┐    │
│  │   Email     │──────────────┼──────────────│   Cloud     │    │
│  │   Server    │              │              │  Storage    │    │
│  │   (SMTP)    │              │              │  (S3/GCS)   │    │
│  └─────────────┘              │              └─────────────┘    │
│                               │                                 │
│                    ┌─────────────────────┐                     │
│                    │   Target Systems    │                     │
│                    │ (Production Servers)│                     │
│                    └─────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Architecture Principles**

### **Core Design Principles**

#### **1. Security First**
```
🔒 Security by Design:
• Zero-trust architecture
• Role-based access control (RBAC)
• Session-based authentication
• Input validation at all layers
• Audit logging for all operations
• Encrypted data transmission and storage
```

#### **2. Scalability**
```
📈 Horizontal Scaling:
• Stateless application design
• Database read replicas
• Load balancer distribution
• Microservice-ready architecture
• Container-based deployment
• Auto-scaling capabilities
```

#### **3. Reliability**
```
🛡️  High Availability:
• Database redundancy
• Application clustering
• Automated health checks
• Graceful degradation
• Circuit breaker patterns
• Comprehensive monitoring
```

#### **4. Maintainability**
```
🔧 Clean Architecture:
• Separation of concerns
• Dependency injection
• Standardized coding practices
• Comprehensive documentation
• Automated testing
• Continuous integration
```

### **SOLID Principles Implementation**
```
🏗️  Design Patterns:
• Single Responsibility: Each class has one purpose
• Open/Closed: Extensions without modifications
• Liskov Substitution: Interface-based design
• Interface Segregation: Focused interfaces
• Dependency Inversion: Abstraction over concretion
```

---

## 🧩 **Component Architecture**

### **Frontend Architecture (Angular)**

#### **Component Hierarchy**
```
┌─────────────────────────────────────────────────────────────────┐
│                        App Component                           │
│                     (Root Component)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Header    │ │    Login    │ │ Deployment  │ │  Report   │ │
│  │ Component   │ │ Component   │ │ Component   │ │Component  │ │
│  │             │ │             │ │             │ │           │ │
│  │ • Navigation│ │ • Auth Form │ │ • Request   │ │ • Charts  │ │
│  │ • User Menu │ │ • Validation│ │   Details   │ │ • Tables  │ │
│  │ • Logout    │ │ • Error     │ │ • Status    │ │ • Export  │ │
│  │             │ │   Handling  │ │   Tracking  │ │           │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **Service Layer Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                        Service Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │    Auth     │ │ Deployment  │ │   HTTP      │ │   Error   │ │
│  │  Service    │ │  Service    │ │ Interceptor │ │  Handler  │ │
│  │             │ │             │ │             │ │           │ │
│  │ • Login     │ │ • CRUD Ops  │ │ • Auth      │ │ • Global  │ │
│  │ • Session   │ │ • Status    │ │   Headers   │ │   Error   │ │
│  │ • Role      │ │   Updates   │ │ • Error     │ │   Catch   │ │
│  │   Check     │ │ • File      │ │   Handling  │ │ • User    │ │
│  │             │ │   Upload    │ │             │ │   Notify  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Backend Architecture (Spring Boot)**

#### **Layered Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Controller Layer                            │
├─────────────────────────────────────────────────────────────────┤
│ • REST Endpoints    • Request Validation    • Response Format  │
│ • HTTP Mapping      • Error Handling        • Status Codes     │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                              │
├─────────────────────────────────────────────────────────────────┤
│ • Business Logic    • Transaction Mgmt      • Data Processing  │
│ • Validation        • Security Checks       • External APIs    │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Repository Layer                             │
├─────────────────────────────────────────────────────────────────┤
│ • Data Access       • Query Optimization    • Entity Mapping   │
│ • CRUD Operations   • Custom Queries        • Caching          │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│ • PostgreSQL DB     • Connection Pooling    • Migrations       │
│ • Entity Models     • Relationships         • Constraints      │
└─────────────────────────────────────────────────────────────────┘
```

#### **Core Components**
```java
// Component Structure Example
@RestController
@RequestMapping("/api/v1/deployments")
public class DeploymentController {
    @Autowired
    private DeploymentService deploymentService;
    
    @Autowired
    private SecurityService securityService;
}

@Service
@Transactional
public class DeploymentService {
    @Autowired
    private DeploymentRepository deploymentRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AuditService auditService;
}

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    List<Deployment> findByRequesterAndStatus(User requester, DeploymentStatus status);
    
    @Query("SELECT d FROM Deployment d WHERE d.status = :status AND d.priority = :priority")
    List<Deployment> findByStatusAndPriority(@Param("status") DeploymentStatus status, 
                                           @Param("priority") Priority priority);
}
```

---

## 💾 **Data Architecture**

### **Database Schema Design**

#### **Entity Relationship Diagram**
```
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│      User       │    │     Deployment      │    │     Release     │
├─────────────────┤    ├─────────────────────┤    ├─────────────────┤
│ • id (PK)       │    │ • id (PK)           │    │ • id (PK)       │
│ • username      │◄───┤ • requester_id (FK) │    │ • version       │
│ • email         │    │ • title             │    │ • application   │
│ • role          │    │ • description       │    │ • status        │
│ • active        │    │ • status            │◄───┤ • release_date  │
│ • created_at    │    │ • priority          │    │ • created_at    │
└─────────────────┘    │ • application       │    └─────────────────┘
                       │ • version           │
                       │ • environment       │
                       │ • rlm_id           │
                       │ • ready_for_perf   │
                       │ • ready_for_prod   │
                       │ • created_at       │
                       │ • updated_at       │
                       └─────────────────────┘
                               │
                       ┌─────────────────────┐
                       │     Attachment      │
                       ├─────────────────────┤
                       │ • id (PK)           │
                       │ • deployment_id(FK) │
                       │ • filename          │
                       │ • file_path         │
                       │ • file_size         │
                       │ • uploaded_at       │
                       └─────────────────────┘
```

#### **Database Tables**

**Users Table**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('DEVELOPER', 'ADMIN', 'SUPERADMIN')),
    department VARCHAR(100),
    active BOOLEAN DEFAULT true,
    must_change_password BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Deployments Table**
```sql
CREATE TABLE deployments (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ROLLED_BACK')),
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    requester_id BIGINT NOT NULL REFERENCES users(id),
    approved_by_id BIGINT REFERENCES users(id),
    application VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    environment VARCHAR(20) NOT NULL 
        CHECK (environment IN ('DEVELOPMENT', 'STAGING', 'PRODUCTION')),
    components TEXT[], -- Array of component names
    deployment_steps TEXT[],
    rollback_plan TEXT[],
    testing_strategy TEXT,
    estimated_duration INTEGER, -- Duration in minutes
    maintenance_window INTEGER,
    business_impact TEXT,
    prerequisites TEXT[],
    rlm_id VARCHAR(50),
    ready_for_performance BOOLEAN DEFAULT false,
    ready_for_production BOOLEAN DEFAULT false,
    scheduled_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Audit Logs Table**
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Data Access Patterns**

#### **Repository Pattern Implementation**
```java
// Base Repository Interface
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {
    @Query("SELECT e FROM #{#entityName} e WHERE e.active = true")
    List<T> findAllActive();
    
    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND e.active = true")
    Optional<T> findActiveById(@Param("id") ID id);
}

// Deployment Repository with Custom Queries
@Repository
public interface DeploymentRepository extends BaseRepository<Deployment, Long> {
    
    // Find by user with role-based filtering
    @Query("SELECT d FROM Deployment d WHERE " +
           "(:userRole = 'SUPERADMIN' OR :userRole = 'ADMIN') OR " +
           "(d.requester.id = :userId)")
    Page<Deployment> findAccessibleByUser(@Param("userId") Long userId, 
                                         @Param("userRole") String userRole, 
                                         Pageable pageable);
    
    // Status-based queries
    List<Deployment> findByStatusOrderByCreatedAtDesc(DeploymentStatus status);
    
    // Priority and date filtering
    @Query("SELECT d FROM Deployment d WHERE " +
           "d.priority = :priority AND " +
           "d.createdAt BETWEEN :startDate AND :endDate")
    List<Deployment> findByPriorityAndDateRange(@Param("priority") Priority priority,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
}
```

#### **Database Performance Optimization**
```sql
-- Indexes for Performance
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_requester ON deployments(requester_id);
CREATE INDEX idx_deployments_created_at ON deployments(created_at);
CREATE INDEX idx_deployments_priority_status ON deployments(priority, status);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Partial Indexes for Active Records
CREATE INDEX idx_users_active_username ON users(username) WHERE active = true;
CREATE INDEX idx_deployments_active_status ON deployments(status) WHERE status != 'COMPLETED';
```

---

## 🔒 **Security Architecture**

### **Authentication & Authorization Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Login    │    │   Validate      │    │   Create        │
│   Credentials   │───►│   Against       │───►│   Session       │
│                 │    │   Database      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Store Session │    │   Set Session   │    │   Generate      │
│   in Memory     │◄───│   Cookie        │◄───│   Session ID    │
│                 │    │   (HttpOnly)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Request Processing                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Extract Session Cookie                                      │
│ 2. Validate Session in Memory/Database                         │
│ 3. Load User Details and Permissions                           │
│ 4. Check Role-Based Access for Endpoint                        │
│ 5. Process Request or Return 403 Forbidden                     │
└─────────────────────────────────────────────────────────────────┘
```

### **Role-Based Access Control (RBAC)**

#### **Permission Matrix**
```
┌─────────────────────┬───────────┬─────────┬─────────────┐
│     Operation       │ Developer │  Admin  │ Super Admin │
├─────────────────────┼───────────┼─────────┼─────────────┤
│ Create Deployment   │     ✅     │    ✅    │      ✅      │
│ View Own Deployments│     ✅     │    ✅    │      ✅      │
│ View All Deployments│     ❌     │    ✅    │      ✅      │
│ Edit RLM IDs        │     ❌     │    ✅    │      ✅      │
│ Approve Deployments │     ❌     │    ✅    │      ✅      │
│ Mark Ready for Perf │     ❌     │    ✅    │      ✅      │
│ Mark Ready for Prod │     ❌     │    ✅    │      ✅      │
│ Delete Deployments  │     ❌     │    ❌    │      ✅      │
│ Manage Users        │     ❌     │    ✅    │      ✅      │
│ System Config       │     ❌     │    ❌    │      ✅      │
│ View Audit Logs     │     ❌     │    ❌    │      ✅      │
└─────────────────────┴───────────┴─────────┴─────────────┘
```

#### **Security Implementation**
```java
// Security Configuration
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(5)
                .sessionRegistry(sessionRegistry())
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/login", "/api/system/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/deployments/**")
                    .hasAnyRole("DEVELOPER", "ADMIN", "SUPERADMIN")
                .requestMatchers(HttpMethod.POST, "/api/deployments")
                    .hasAnyRole("DEVELOPER", "ADMIN", "SUPERADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/deployments/*/approve")
                    .hasAnyRole("ADMIN", "SUPERADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/deployments/**")
                    .hasRole("SUPERADMIN")
                .requestMatchers("/api/admin/**")
                    .hasAnyRole("ADMIN", "SUPERADMIN")
                .requestMatchers("/api/system/**")
                    .hasRole("SUPERADMIN")
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf.disable()) // API-based, session auth
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                .contentTypeOptions(withDefaults())
                .httpStrictTransportSecurity(withDefaults())
            );
        
        return http.build();
    }
}

// Method-Level Security
@Service
public class DeploymentService {
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN') or @deploymentRepository.findById(#id).get().requester.id == authentication.principal.id")
    public Deployment getDeployment(Long id) {
        return deploymentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Deployment not found"));
    }
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public Deployment updateRlmId(Long deploymentId, String rlmId) {
        Deployment deployment = getDeployment(deploymentId);
        deployment.setRlmId(rlmId);
        return deploymentRepository.save(deployment);
    }
}
```

### **Data Security**

#### **Encryption Strategy**
```
🔐 Data Protection Layers:
• Transport Layer: TLS 1.3 for all communications
• Database: Encrypted at rest using database encryption
• Application: Sensitive fields encrypted using AES-256
• Passwords: BCrypt hashing with salt
• Sessions: Secure, HttpOnly, SameSite cookies
• Files: Encrypted storage for uploaded attachments
```

#### **Audit Logging**
```java
// Audit Aspect for Automatic Logging
@Aspect
@Component
public class AuditAspect {
    
    @Autowired
    private AuditService auditService;
    
    @AfterReturning(pointcut = "@annotation(Auditable)", returning = "result")
    public void logOperation(JoinPoint joinPoint, Object result) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        String operation = joinPoint.getSignature().getName();
        String entityType = extractEntityType(joinPoint);
        
        auditService.logAction(username, operation, entityType, result);
    }
    
    @Around("@annotation(AuditableUpdate)")
    public Object logUpdate(ProceedingJoinPoint joinPoint) throws Throwable {
        // Capture before state
        Object oldState = captureState(joinPoint);
        
        // Execute operation
        Object result = joinPoint.proceed();
        
        // Log changes
        auditService.logUpdate(oldState, result);
        
        return result;
    }
}
```

---

## 🔗 **Integration Architecture**

### **External System Integration**

#### **Integration Patterns**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Integration Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │    LDAP     │ │   ITSM      │ │    SMTP     │ │   CI/CD   │ │
│  │ Connector   │ │ Connector   │ │   Service   │ │   Hooks   │ │
│  │             │ │             │ │             │ │           │ │
│  │ • Auth      │ │ • RLM Sync  │ │ • Notif.    │ │ • Trigger │ │
│  │ • User      │ │ • Change    │ │ • Alerts    │ │ • Status  │ │
│  │   Sync      │ │   Mgmt      │ │ • Reports   │ │   Update  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **API Gateway Pattern**
```java
// External Service Integration
@Service
public class ExternalIntegrationService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;
    
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void syncWithITSM(Deployment deployment) {
        CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker("itsm");
        
        Supplier<String> decoratedSupplier = CircuitBreaker
            .decorateSupplier(circuitBreaker, () -> {
                ITSMRequest request = ITSMRequest.fromDeployment(deployment);
                ResponseEntity<ITSMResponse> response = restTemplate.postForEntity(
                    itsmConfig.getChangeRequestUrl(), request, ITSMResponse.class);
                return response.getBody().getChangeNumber();
            });
        
        String changeNumber = decoratedSupplier.get();
        deployment.setRlmId(changeNumber);
    }
    
    @EventListener
    public void handleDeploymentApproved(DeploymentApprovedEvent event) {
        asyncTaskExecutor.execute(() -> {
            try {
                syncWithITSM(event.getDeployment());
                notificationService.sendApprovalNotification(event.getDeployment());
            } catch (Exception e) {
                log.error("Failed to sync with external systems", e);
            }
        });
    }
}
```

### **Event-Driven Architecture**

#### **Application Events**
```java
// Event Publishing
@Service
public class DeploymentService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public Deployment approveDeployment(Long id, String adminComments) {
        Deployment deployment = getDeployment(id);
        deployment.setStatus(DeploymentStatus.APPROVED);
        deployment.setApprovedAt(LocalDateTime.now());
        
        Deployment saved = deploymentRepository.save(deployment);
        
        // Publish event for async processing
        eventPublisher.publishEvent(new DeploymentApprovedEvent(saved, adminComments));
        
        return saved;
    }
}

// Event Listeners
@Component
public class DeploymentEventListener {
    
    @EventListener
    @Async
    public void handleDeploymentCreated(DeploymentCreatedEvent event) {
        notificationService.notifyAdmins(event.getDeployment());
        metricsService.incrementDeploymentCount();
    }
    
    @EventListener
    @Async
    public void handleDeploymentApproved(DeploymentApprovedEvent event) {
        integrationService.syncWithITSM(event.getDeployment());
        workflowService.triggerNextStage(event.getDeployment());
    }
}
```

---

## 🚀 **Deployment Architecture**

### **Container Strategy**

#### **Docker Multi-Stage Build**
```dockerfile
# Frontend Build Stage
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build --prod

# Backend Build Stage
FROM maven:3.8-openjdk-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Production Stage
FROM openjdk:17-jdk-slim
WORKDIR /app

# Install nginx for frontend
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy built artifacts
COPY --from=backend-build /app/backend/target/*.jar app.jar
COPY --from=frontend-build /app/frontend/dist/* /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80 8080
CMD ["/start.sh"]
```

### **Kubernetes Deployment**

#### **Production Deployment Manifest**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment-portal
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: deployment-portal
  template:
    metadata:
      labels:
        app: deployment-portal
    spec:
      containers:
      - name: application
        image: deployment-portal:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## ⚡ **Scalability & Performance**

### **Performance Optimization Strategy**

#### **Database Optimization**
```java
// Connection Pool Configuration
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(600000);
        config.setConnectionTimeout(30000);
        config.setLeakDetectionThreshold(60000);
        return new HikariDataSource(config);
    }
    
    // Read Replica Configuration
    @Bean
    @Qualifier("readOnlyDataSource")
    public DataSource readOnlyDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:postgresql://read-replica:5432/deployment_portal")
            .build();
    }
}

// Query Optimization
@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    
    @Query(value = "SELECT d.* FROM deployments d " +
                   "WHERE d.status = :status " +
                   "ORDER BY d.priority DESC, d.created_at ASC " +
                   "LIMIT :limit", nativeQuery = true)
    List<Deployment> findTopPriorityDeployments(@Param("status") String status, 
                                               @Param("limit") int limit);
    
    // Use projections for summary views
    @Query("SELECT new com.deploymentportal.dto.DeploymentSummary(" +
           "d.id, d.title, d.status, d.priority, d.createdAt) " +
           "FROM Deployment d WHERE d.requester.id = :userId")
    List<DeploymentSummary> findSummaryByRequester(@Param("userId") Long userId);
}
```

#### **Caching Strategy**
```java
// Cache Configuration
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager
            .RedisCacheManagerBuilder
            .fromConnectionFactory(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration());
        return builder.build();
    }
    
    private RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}

// Cacheable Service Methods
@Service
public class DeploymentService {
    
    @Cacheable(value = "deployments", key = "#id")
    public Deployment getDeployment(Long id) {
        return deploymentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Deployment not found"));
    }
    
    @Cacheable(value = "user-deployments", key = "#userId + '_' + #status")
    public List<Deployment> getUserDeployments(Long userId, DeploymentStatus status) {
        return deploymentRepository.findByRequesterIdAndStatus(userId, status);
    }
    
    @CacheEvict(value = {"deployments", "user-deployments"}, allEntries = true)
    public Deployment updateDeployment(Deployment deployment) {
        return deploymentRepository.save(deployment);
    }
}
```

### **Auto-Scaling Configuration**
```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: deployment-portal-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: deployment-portal
  minReplicas: 3
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
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

---

## 🛠️ **Technology Stack**

### **Frontend Stack**
```
🎨 Frontend Technologies:
• Angular 19.2.14 - Core framework
• TypeScript 5.7.3 - Type-safe development
• Angular Material - UI component library
• RxJS - Reactive programming
• Angular CLI - Development tooling
• Webpack - Module bundling
• Sass/SCSS - CSS preprocessing
• Karma/Jasmine - Testing framework
```

### **Backend Stack**
```
⚙️ Backend Technologies:
• Java 17+ - Programming language
• Spring Boot 3.1.x - Application framework
• Spring Security - Authentication/Authorization
• Spring Data JPA - Data access layer
• Hibernate - ORM framework
• Maven - Build management
• JUnit 5 - Testing framework
• Mockito - Mocking framework
```

### **Database & Infrastructure**
```
💾 Data & Infrastructure:
• PostgreSQL 15+ - Primary database
• Redis - Caching and session store
• Nginx - Web server and load balancer
• Docker - Containerization
• Kubernetes - Container orchestration
• Prometheus - Monitoring and metrics
• Grafana - Visualization and dashboards
• ELK Stack - Logging and analysis
```

---

## 🎨 **Design Patterns**

### **Backend Patterns**

#### **Repository Pattern**
```java
// Generic Repository Interface
public interface BaseRepository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    T save(T entity);
    void deleteById(ID id);
}

// Specific Implementation
@Repository
public class DeploymentRepositoryImpl implements BaseRepository<Deployment, Long> {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public Optional<Deployment> findById(Long id) {
        return Optional.ofNullable(entityManager.find(Deployment.class, id));
    }
}
```

#### **Service Layer Pattern**
```java
// Service Interface
public interface DeploymentService {
    Deployment createDeployment(CreateDeploymentRequest request);
    Deployment approveDeployment(Long id, String comments);
    List<Deployment> getAccessibleDeployments(User user);
}

// Service Implementation
@Service
@Transactional
public class DeploymentServiceImpl implements DeploymentService {
    
    @Autowired
    private DeploymentRepository repository;
    
    @Autowired
    private SecurityService securityService;
    
    @Override
    public Deployment createDeployment(CreateDeploymentRequest request) {
        validateRequest(request);
        Deployment deployment = mapToEntity(request);
        deployment.setRequester(securityService.getCurrentUser());
        return repository.save(deployment);
    }
}
```

#### **Factory Pattern**
```java
// Notification Factory
@Component
public class NotificationFactory {
    
    public Notification createNotification(NotificationType type, Object data) {
        return switch (type) {
            case EMAIL -> new EmailNotification(data);
            case SMS -> new SmsNotification(data);
            case SLACK -> new SlackNotification(data);
            case IN_APP -> new InAppNotification(data);
            default -> throw new IllegalArgumentException("Unknown notification type: " + type);
        };
    }
}
```

### **Frontend Patterns**

#### **Component Pattern**
```typescript
// Smart Component (Container)
@Component({
  selector: 'app-deployment-list',
  template: `
    <app-deployment-filter 
      (filterChange)="onFilterChange($event)">
    </app-deployment-filter>
    
    <app-deployment-table 
      [deployments]="deployments$ | async"
      [loading]="loading$ | async"
      (deploymentSelect)="onDeploymentSelect($event)">
    </app-deployment-table>
  `
})
export class DeploymentListComponent implements OnInit {
  deployments$ = this.store.select(selectDeployments);
  loading$ = this.store.select(selectLoading);
  
  constructor(private store: Store, private router: Router) {}
  
  ngOnInit() {
    this.store.dispatch(loadDeployments());
  }
  
  onFilterChange(filter: DeploymentFilter) {
    this.store.dispatch(setFilter({ filter }));
  }
  
  onDeploymentSelect(deployment: Deployment) {
    this.router.navigate(['/deployments', deployment.id]);
  }
}

// Dumb Component (Presentational)
@Component({
  selector: 'app-deployment-table',
  template: `
    <table mat-table [dataSource]="deployments">
      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let deployment">
          <a (click)="selectDeployment(deployment)">
            {{ deployment.title }}
          </a>
        </td>
      </ng-container>
      <!-- More columns -->
    </table>
  `
})
export class DeploymentTableComponent {
  @Input() deployments: Deployment[] = [];
  @Input() loading: boolean = false;
  @Output() deploymentSelect = new EventEmitter<Deployment>();
  
  selectDeployment(deployment: Deployment) {
    this.deploymentSelect.emit(deployment);
  }
}
```

#### **Service Pattern**
```typescript
// HTTP Service
@Injectable()
export class DeploymentService {
  private readonly baseUrl = '/api/v1/deployments';
  
  constructor(private http: HttpClient) {}
  
  getDeployments(params?: DeploymentQueryParams): Observable<PagedResponse<Deployment>> {
    return this.http.get<PagedResponse<Deployment>>(this.baseUrl, { params })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }
  
  createDeployment(deployment: CreateDeploymentRequest): Observable<Deployment> {
    return this.http.post<Deployment>(this.baseUrl, deployment)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error('Something went wrong'));
  }
}
```

---

*This comprehensive architecture documentation provides the foundation for understanding, maintaining, and extending the Deployment Portal system. Regular updates to this documentation ensure it remains aligned with system evolution and best practices.*
