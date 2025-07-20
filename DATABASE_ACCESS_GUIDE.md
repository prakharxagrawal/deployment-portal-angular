# Database Access Guide for Deployment Portal

## 🗄️ **Database Configuration Overview**

The Deployment Portal uses an **H2 in-memory database** for development and testing purposes. This guide provides comprehensive instructions for accessing and managing the database during runtime.

## 📊 **Database Schema**

The application uses the following main tables:
- **`users`** - User accounts and authentication
- **`deployments`** - Deployment request records
- **`releases`** - Available release versions
- **`services`** - Service/application definitions

## 🔧 **Method 1: H2 Web Console (Recommended)**

### **Prerequisites**
1. Ensure Spring Boot application is running:
   ```powershell
   cd c:\Users\agrpr\Desktop\deployment-portal-angular\backend\deployment-portal
   mvn spring-boot:run
   ```

### **Access Steps**
1. **Open H2 Console in Browser**:
   ```
   http://localhost:8080/h2-console
   ```

2. **Database Connection Settings**:
   - **JDBC URL**: `jdbc:h2:mem:deploymentdb`
   - **User Name**: `sa`
   - **Password**: (leave empty)
   - **Driver Class**: `org.h2.Driver`

3. **Click "Connect"** to access the database

### **What You Can Do**
- ✅ Browse all tables and data
- ✅ Execute SQL queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ View sample data loaded from `data.sql`
- ✅ Test database operations in real-time
- ✅ Debug data issues during development

### **Common SQL Queries**

#### **View All Tables**
```sql
SHOW TABLES;
```

#### **View All Users**
```sql
SELECT * FROM users;
```

#### **View All Deployments**
```sql
SELECT * FROM deployments ORDER BY date_requested DESC;
```

#### **View Deployments by Status**
```sql
SELECT * FROM deployments WHERE status = 'Open';
```

#### **View Deployments by User**
```sql
SELECT d.*, u.username 
FROM deployments d 
JOIN users u ON d.created_by = u.username 
WHERE u.username = 'john.doe';
```

#### **Count Deployments by Status**
```sql
SELECT status, COUNT(*) as count 
FROM deployments 
GROUP BY status;
```

## 🛠️ **Method 2: Alternative Database Tools**

### **Using DBeaver (External Tool)**
1. Download and install [DBeaver](https://dbeaver.io/)
2. Create new connection with H2 database
3. Use the same connection settings as above

### **Using IntelliJ IDEA Database Tool**
1. Open Database panel in IntelliJ
2. Add new H2 datasource
3. Use connection settings from above

## ⚙️ **Configuration Files**

### **Database Configuration** (`application.properties`)
```properties
# H2 Database Configuration
spring.datasource.url=jdbc:h2:mem:deploymentdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Console Configuration
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.defer-datasource-initialization=true

# SQL Script Configuration
spring.sql.init.mode=always
```

### **Security Configuration** (`SecurityConfig.java`)
The security configuration has been set up to allow H2 console access:

```java
.authorizeHttpRequests(authz -> authz
    .requestMatchers("/h2-console/**").permitAll()  // Allow H2 console access
    .requestMatchers("/api/**").permitAll()         // Allow API access
    .anyRequest().permitAll()  // Allow all requests for development
)
.headers(headers -> headers
    .frameOptions(frameOptions -> frameOptions.sameOrigin())  // Allow H2 console frames
    .httpStrictTransportSecurity(hstsConfig -> hstsConfig.disable())) // Disable HSTS
```

## 🚨 **Troubleshooting**

### **403 Forbidden Error**
If you get "Access to localhost was denied", ensure:
1. ✅ Spring Boot application is running
2. ✅ Security configuration allows H2 console access
3. ✅ Correct URL: `http://localhost:8080/h2-console`
4. ✅ CSRF is disabled for H2 console paths

### **Connection Failed**
If connection fails:
1. ✅ Verify JDBC URL: `jdbc:h2:mem:deploymentdb`
2. ✅ Username is `sa` (lowercase)
3. ✅ Password field is empty
4. ✅ Application is running on port 8080

### **No Data Visible**
If tables are empty:
1. ✅ Check if `data.sql` exists in `src/main/resources/`
2. ✅ Verify `spring.sql.init.mode=always` in properties
3. ✅ Check application logs for SQL execution errors

## 📝 **Sample Data**

The application loads initial data from `src/main/resources/data.sql`:

### **Sample Users**
- **john.doe** (developer role)
- **jane.smith** (admin role)
- **admin.user** (superadmin role)

### **Sample Deployments**
- Various deployment requests with different statuses
- Different environments (UAT1, UAT2, PERF, PROD)
- Multiple teams and services

### **Sample Releases**
- Release versions following YYYY-MM pattern
- Example: 2024-12, 2024-11, 2024-10

## 🔄 **Data Persistence Note**

⚠️ **Important**: H2 in-memory database data is **NOT persistent**. All data is lost when the application stops. This is intended for development and testing purposes.

For production deployment, consider switching to a persistent database like PostgreSQL or MySQL.

## 📚 **Related Documentation**

- [APPLICATION_OVERVIEW.md](./APPLICATION_OVERVIEW.md) - Business logic and features
- [API_REFERENCE.md](./API_REFERENCE.md) - REST API endpoints
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Development environment setup
- [COMMENTING_PROGRESS.md](./COMMENTING_PROGRESS.md) - Code documentation status

## 🤝 **Support**

If you encounter any database access issues:
1. Check the application logs for errors
2. Verify all configuration settings
3. Ensure the Spring Boot application is running properly
4. Try restarting the application if H2 console becomes unresponsive

---

**Created**: July 20, 2025  
**Last Updated**: July 20, 2025  
**Version**: 1.0
