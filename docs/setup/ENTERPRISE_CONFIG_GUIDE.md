# Enterprise Database Configuration Guide

## Overview
This guide shows how to configure your Spring Boot application to work with the enterprise database schema (`enterprise_database_ddl.sql`).

## Database Schema Mapping

### Enterprise vs Application Table Names
| Application Entity | Enterprise Table | Schema |
|-------------------|------------------|---------|
| `users` | `DP_USERS` | DPOWNER |
| `services` | `DP_SERVICES` | DPOWNER |
| `releases` | `DP_RELEASES` | DPOWNER |
| `deployment` | `DP_DEPLOYMENT_REQUESTS` | DPOWNER |
| `deployment_environments` | `DP_DEPLOYMENT_ENVIRONMENTS` | DPOWNER |

## Application Configuration

### 1. Update `application.properties`
```properties
# Enterprise Database Configuration
spring.datasource.url=jdbc:oracle:thin:@your-host:1521:ORCL
# OR for PostgreSQL enterprise setup:
# spring.datasource.url=jdbc:postgresql://your-host:5432/deployment_portal

spring.datasource.username=DPSECID
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# JPA Configuration for Enterprise Schema
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.Oracle12cDialect
spring.jpa.properties.hibernate.default_schema=DPOWNER

# Enterprise naming strategy
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.hibernate.naming.implicit-strategy=org.hibernate.boot.model.naming.ImplicitNamingStrategyLegacyJpaImpl

# Connection Pool for Enterprise
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

### 2. Update Entity Annotations

#### User Entity (`User.java`)
```java
@Entity
@Table(name = "DP_USERS", schema = "DPOWNER")
public class User {
    @Id
    @Column(name = "USERNAME")
    private String username;
    
    @Column(name = "PASSWORD")
    private String password;
    
    @Column(name = "USER_ROLE")
    private String role;
    
    @Column(name = "IS_ACTIVE")
    private String isActive = "Y";
    
    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;
    
    @Column(name = "LAST_LOGIN")
    private LocalDateTime lastLogin;
}
```

#### Service Entity (`Service.java`)
```java
@Entity
@Table(name = "DP_SERVICES", schema = "DPOWNER")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_seq")
    @SequenceGenerator(name = "service_seq", sequenceName = "DPOWNER.SEQ_DP_SERVICES_ID", allocationSize = 1)
    @Column(name = "SERVICE_ID")
    private Long id;
    
    @Column(name = "SERVICE_NAME", unique = true, nullable = false)
    private String name;
    
    @Column(name = "SERVICE_CATEGORY")
    private String category;
    
    @Column(name = "SERVICE_DESCRIPTION")
    private String description;
    
    @Column(name = "IS_ACTIVE")
    private String isActive = "Y";
    
    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;
}
```

#### Release Entity (`Release.java`)
```java
@Entity
@Table(name = "DP_RELEASES", schema = "DPOWNER")
public class Release {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "release_seq")
    @SequenceGenerator(name = "release_seq", sequenceName = "DPOWNER.SEQ_DP_RELEASES_ID", allocationSize = 1)
    @Column(name = "RELEASE_ID")
    private Long id;
    
    @Column(name = "RELEASE_NAME", unique = true)
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Release name must be in YYYY-MM format")
    private String name;
    
    @Column(name = "RELEASE_DESCRIPTION")
    private String description;
    
    @Column(name = "RELEASE_STATUS")
    private String status = "PLANNED";
    
    @Column(name = "START_DATE")
    private LocalDate startDate;
    
    @Column(name = "END_DATE")
    private LocalDate endDate;
    
    @Column(name = "CREATED_BY")
    private String createdBy;
    
    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;
    
    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate;
}
```

#### Deployment Entity (`Deployment.java`)
```java
@Entity
@Table(name = "DP_DEPLOYMENT_REQUESTS", schema = "DPOWNER")
public class Deployment {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "deployment_seq")
    @SequenceGenerator(name = "deployment_seq", sequenceName = "DPOWNER.SEQ_DP_DEPLOYMENT_REQ_ID", allocationSize = 1)
    @Column(name = "REQUEST_ID")
    private Long id;
    
    @Column(name = "SERIAL_NUMBER", unique = true)
    private String serialNumber;
    
    @Column(name = "CSI_ID")
    private String csiId;
    
    @Column(name = "SERVICE_NAME")
    private String service;
    
    @Column(name = "BUSINESS_REQUEST_ID")
    private String requestId;
    
    @Column(name = "UPCOMING_BRANCH")
    private String upcomingBranch;
    
    @Column(name = "IS_CONFIG_REQUEST")
    private String isConfig = "N";
    
    @Column(name = "CONFIG_REQUEST_ID")
    private String configRequestId;
    
    @Column(name = "CONFIG_UPCOMING_BRANCH")
    private String upcomingConfigBranch;
    
    @Column(name = "RELEASE_BRANCH")
    private String releaseBranch;
    
    @Column(name = "DEVELOPMENT_TEAM")
    private String team;
    
    @Column(name = "REQUEST_STATUS")
    private String status = "OPEN";
    
    @Column(name = "RELEASE_NAME")
    private String release;
    
    @Column(name = "PRODUCTION_READY_FLAG")
    private String productionReady = "N";
    
    @Column(name = "CREATED_BY")
    private String createdBy;
    
    @Column(name = "CREATED_DATE")
    private LocalDateTime dateRequested;
    
    @Column(name = "MODIFIED_DATE")
    private LocalDateTime dateModified;
    
    @Column(name = "APPROVED_BY")
    private String approvedBy;
    
    @Column(name = "APPROVED_DATE")
    private LocalDateTime approvedDate;
    
    // Join with DP_RLM_TRACKING table for RLM IDs
    @OneToOne(mappedBy = "deployment", cascade = CascadeType.ALL)
    private RlmTracking rlmTracking;
    
    // Join with DP_DEPLOYMENT_ENVIRONMENTS for environments
    @OneToMany(mappedBy = "deployment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DeploymentEnvironment> environments;
}
```

### 3. Add New Entity Classes

#### RlmTracking Entity
```java
@Entity
@Table(name = "DP_RLM_TRACKING", schema = "DPOWNER")
public class RlmTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "rlm_seq")
    @SequenceGenerator(name = "rlm_seq", sequenceName = "DPOWNER.SEQ_DP_RLM_TRACKING_ID", allocationSize = 1)
    @Column(name = "RLM_TRACKING_ID")
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "REQUEST_ID")
    private Deployment deployment;
    
    @Column(name = "ENVIRONMENT_TYPE")
    private String environmentType;
    
    @Column(name = "RLM_ID_UAT1")
    private String rlmIdUat1;
    
    @Column(name = "RLM_ID_UAT2")
    private String rlmIdUat2;
    
    @Column(name = "RLM_ID_UAT3")
    private String rlmIdUat3;
    
    @Column(name = "RLM_ID_PERF1")
    private String rlmIdPerf1;
    
    @Column(name = "RLM_ID_PERF2")
    private String rlmIdPerf2;
    
    @Column(name = "RLM_ID_PROD1")
    private String rlmIdProd1;
    
    @Column(name = "RLM_ID_PROD2")
    private String rlmIdProd2;
    
    @Column(name = "UPDATED_BY")
    private String updatedBy;
    
    @Column(name = "UPDATED_DATE")
    private LocalDateTime updatedDate;
}
```

#### DeploymentEnvironment Entity
```java
@Entity
@Table(name = "DP_DEPLOYMENT_ENVIRONMENTS", schema = "DPOWNER")
public class DeploymentEnvironment {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "env_seq")
    @SequenceGenerator(name = "env_seq", sequenceName = "DPOWNER.SEQ_DP_DEPLOY_ENV_ID", allocationSize = 1)
    @Column(name = "ENVIRONMENT_ID")
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "REQUEST_ID")
    private Deployment deployment;
    
    @Column(name = "ENVIRONMENT_NAME")
    private String environmentName;
    
    @Column(name = "ENVIRONMENT_STATUS")
    private String environmentStatus = "PENDING";
    
    @Column(name = "RLM_ID")
    private String rlmId;
    
    @Column(name = "DEPLOYED_DATE")
    private LocalDateTime deployedDate;
    
    @Column(name = "DEPLOYED_BY")
    private String deployedBy;
    
    @Column(name = "ROLLBACK_FLAG")
    private String rollbackFlag = "N";
    
    @Column(name = "ROLLBACK_DATE")
    private LocalDateTime rollbackDate;
    
    @Column(name = "ROLLBACK_BY")
    private String rollbackBy;
}
```

## Repository Updates

### Update Repository Queries
```java
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = 'Y'")
    List<User> findActiveUsersByRole(@Param("role") String role);
    
    @Query("SELECT u FROM User u WHERE u.isActive = 'Y'")
    List<User> findAllActiveUsers();
}

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    @Query("SELECT d FROM Deployment d WHERE d.status = :status ORDER BY d.dateRequested DESC")
    List<Deployment> findByStatusOrderByDateRequestedDesc(@Param("status") String status);
    
    @Query("SELECT d FROM Deployment d WHERE d.createdBy = :username ORDER BY d.dateRequested DESC")
    List<Deployment> findByCreatedByOrderByDateRequestedDesc(@Param("username") String username);
}
```

## Migration Steps

### 1. Database Setup
```sql
-- Run the enterprise DDL script
sqlplus DPOWNER/password@your_database @enterprise_database_ddl.sql
```

### 2. Application Changes
1. Update all entity classes with enterprise column names
2. Add `@Table(schema = "DPOWNER")` to all entities
3. Update sequence generators for Oracle
4. Update repository queries to use enterprise column names

### 3. Testing
```java
// Test database connectivity
@Test
public void testDatabaseConnection() {
    List<User> users = userRepository.findAll();
    assertThat(users).isNotEmpty();
}

// Test enterprise constraints
@Test
public void testUserRoleConstraint() {
    User user = new User();
    user.setUsername("TEST_USER");
    user.setPassword("test123");
    user.setRole("INVALID_ROLE"); // Should fail constraint
    
    assertThrows(DataIntegrityViolationException.class, () -> {
        userRepository.save(user);
    });
}
```

## Environment-Specific Configuration

### Development
```properties
spring.profiles.active=dev
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=validate
```

### UAT
```properties
spring.profiles.active=uat
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate
spring.datasource.hikari.maximum-pool-size=10
```

### Production
```properties
spring.profiles.active=prod
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.leak-detection-threshold=60000
```

This configuration will allow your Spring Boot application to work seamlessly with the enterprise database schema while maintaining all existing functionality.
