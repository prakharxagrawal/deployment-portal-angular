# 📚 API Reference Documentation

**Complete REST API documentation for the Deployment Portal**

## 📋 **Table of Contents**
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URLs and Versioning](#base-urls-and-versioning)
- [User Management APIs](#user-management-apis)
- [Deployment APIs](#deployment-apis)
- [Release Management APIs](#release-management-apis)
- [Authentication APIs](#authentication-apis)
- [System APIs](#system-apis)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [SDKs and Examples](#sdks-and-examples)

---

## 🌐 **Overview**

### **API Architecture**
The Deployment Portal provides a comprehensive REST API built with Spring Boot, featuring:
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Format**: All requests and responses use JSON
- **Session-Based Auth**: Secure session management with cookies
- **Role-Based Access**: Granular permissions for different user roles
- **Comprehensive Logging**: Full audit trail of all API operations

### **Supported Operations**
```
📝 CRUD Operations:
• CREATE: POST /api/{resource}
• READ: GET /api/{resource}
• UPDATE: PUT /api/{resource}/{id}
• DELETE: DELETE /api/{resource}/{id}

🔍 Query Operations:
• LIST: GET /api/{resource}
• SEARCH: GET /api/{resource}/search?query=
• FILTER: GET /api/{resource}?filter=
• PAGINATE: GET /api/{resource}?page=&size=
```

---

## 🔐 **Authentication**

### **Session-Based Authentication**
The API uses session-based authentication with HTTP cookies.

#### **Login Process**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "username": "john.doe",
    "email": "john.doe@company.com",
    "role": "ADMIN",
    "firstName": "John",
    "lastName": "Doe"
  },
  "sessionId": "JSESSIONID=ABC123...",
  "expiresIn": 1800
}
```

#### **Session Management**
```http
GET /api/auth/me
Cookie: JSESSIONID=ABC123...
```

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": 123,
    "username": "john.doe",
    "role": "ADMIN",
    "permissions": ["READ_ALL_DEPLOYMENTS", "MANAGE_USERS", "EDIT_RLM"]
  }
}
```

#### **Logout**
```http
POST /api/auth/logout
Cookie: JSESSIONID=ABC123...
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## 🌍 **Base URLs and Versioning**

### **Environment URLs**
```
🔧 Development: https://dev-deployment-portal.company.com/api/v1
🧪 Staging: https://staging-deployment-portal.company.com/api/v1
🚀 Production: https://deployment-portal.company.com/api/v1
```

### **API Versioning**
```
Current Version: v1
Base Path: /api/v1
Content-Type: application/json
Accept: application/json
```

### **Common Headers**
```http
Content-Type: application/json
Accept: application/json
Cookie: JSESSIONID=your_session_id
X-Requested-With: XMLHttpRequest
```

---

## 👥 **User Management APIs**

### **Get All Users**
```http
GET /api/v1/users
Authorization: Admin, SuperAdmin
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort field (default: lastName)
- `direction` (optional): Sort direction (ASC/DESC)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "username": "john.doe",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "DEVELOPER",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-08-20T14:22:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 45,
    "totalPages": 3
  }
}
```

### **Get User by ID**
```http
GET /api/v1/users/{id}
Authorization: Admin, SuperAdmin
```

**Response:**
```json
{
  "id": 1,
  "username": "john.doe",
  "email": "john.doe@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DEVELOPER",
  "department": "Engineering",
  "active": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-08-20T14:22:00Z",
  "deploymentCount": 23,
  "successRate": 95.7
}
```

### **Create User**
```http
POST /api/v1/users
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "username": "jane.smith",
  "email": "jane.smith@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "DEVELOPER",
  "department": "Engineering",
  "temporaryPassword": "temp_password_123"
}
```

**Response:**
```json
{
  "id": 46,
  "username": "jane.smith",
  "email": "jane.smith@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "DEVELOPER",
  "department": "Engineering",
  "active": true,
  "createdAt": "2024-08-20T15:30:00Z",
  "mustChangePassword": true
}
```

### **Update User**
```http
PUT /api/v1/users/{id}
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith-Johnson",
  "email": "jane.smith-johnson@company.com",
  "role": "ADMIN",
  "department": "Engineering Management"
}
```

### **Deactivate User**
```http
DELETE /api/v1/users/{id}
Authorization: SuperAdmin
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "userId": 46
}
```

---

## 🚀 **Deployment APIs**

### **Get All Deployments**
```http
GET /api/v1/deployments
Authorization: All roles (filtered by permissions)
```

**Query Parameters:**
- `page`: Page number
- `size`: Page size
- `status`: Filter by status (DRAFT, SUBMITTED, APPROVED, etc.)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)
- `requester`: Filter by requester ID
- `dateFrom`: Start date filter (ISO 8601)
- `dateTo`: End date filter (ISO 8601)

**Response:**
```json
{
  "content": [
    {
      "id": 1001,
      "title": "User Authentication Service v2.1.3",
      "description": "Deploy new authentication service with OAuth2 support",
      "status": "APPROVED",
      "priority": "HIGH",
      "requester": {
        "id": 5,
        "username": "john.doe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "application": "auth-service",
      "version": "2.1.3",
      "environment": "PRODUCTION",
      "createdAt": "2024-08-15T09:00:00Z",
      "updatedAt": "2024-08-16T14:30:00Z",
      "scheduledDate": "2024-08-22T02:00:00Z",
      "estimatedDuration": 120,
      "rlmId": "CHG-2024-001234",
      "readyForPerformance": true,
      "readyForProduction": true
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 156,
    "totalPages": 8
  }
}
```

### **Get Deployment by ID**
```http
GET /api/v1/deployments/{id}
Authorization: All roles (with appropriate access)
```

**Response:**
```json
{
  "id": 1001,
  "title": "User Authentication Service v2.1.3",
  "description": "Deploy new authentication service with OAuth2 support",
  "status": "APPROVED",
  "priority": "HIGH",
  "requester": {
    "id": 5,
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com"
  },
  "application": "auth-service",
  "version": "2.1.3",
  "environment": "PRODUCTION",
  "components": [
    "Authentication API",
    "User Database",
    "Session Manager"
  ],
  "deploymentSteps": [
    "Stop application services",
    "Backup current version",
    "Deploy new package",
    "Run database migrations",
    "Update configuration",
    "Start services",
    "Verify functionality"
  ],
  "rollbackPlan": [
    "Stop new services",
    "Restore database backup",
    "Deploy previous version",
    "Restart services",
    "Verify rollback success"
  ],
  "testingStrategy": "Automated unit tests + manual validation",
  "estimatedDuration": 120,
  "maintenanceWindow": 90,
  "businessImpact": "Minimal - authentication will be briefly unavailable",
  "createdAt": "2024-08-15T09:00:00Z",
  "updatedAt": "2024-08-16T14:30:00Z",
  "scheduledDate": "2024-08-22T02:00:00Z",
  "rlmId": "CHG-2024-001234",
  "readyForPerformance": true,
  "readyForProduction": true,
  "approvedBy": {
    "id": 3,
    "username": "admin.user",
    "firstName": "Admin",
    "lastName": "User"
  },
  "approvedAt": "2024-08-16T14:30:00Z",
  "attachments": [
    {
      "id": 101,
      "filename": "deployment-package-v2.1.3.jar",
      "size": 45678901,
      "uploadedAt": "2024-08-15T10:15:00Z"
    }
  ]
}
```

### **Create Deployment Request**
```http
POST /api/v1/deployments
Authorization: All roles
Content-Type: application/json

{
  "title": "Payment Service Hotfix v1.2.1",
  "description": "Critical fix for payment processing timeout issue",
  "priority": "CRITICAL",
  "application": "payment-service",
  "version": "1.2.1",
  "environment": "PRODUCTION",
  "components": ["Payment API", "Transaction Database"],
  "deploymentSteps": [
    "Scale down payment service instances",
    "Deploy hotfix package",
    "Update database connection timeout",
    "Scale up service instances",
    "Verify payment processing"
  ],
  "rollbackPlan": [
    "Revert to previous version v1.2.0",
    "Reset database timeout settings",
    "Restart all service instances"
  ],
  "testingStrategy": "Automated regression tests + payment flow validation",
  "estimatedDuration": 45,
  "maintenanceWindow": 30,
  "businessImpact": "Payment processing will be unavailable for 5-10 minutes",
  "scheduledDate": "2024-08-21T03:00:00Z",
  "prerequisites": [
    "Payment service health check passing",
    "Database backup completed",
    "Monitoring alerts configured"
  ]
}
```

**Response:**
```json
{
  "id": 1002,
  "title": "Payment Service Hotfix v1.2.1",
  "status": "DRAFT",
  "priority": "CRITICAL",
  "requester": {
    "id": 5,
    "username": "john.doe"
  },
  "createdAt": "2024-08-20T15:45:00Z",
  "message": "Deployment request created successfully"
}
```

### **Update Deployment Request**
```http
PUT /api/v1/deployments/{id}
Authorization: Creator (for drafts), Admin/SuperAdmin (for all)
Content-Type: application/json

{
  "title": "Payment Service Hotfix v1.2.1 - Updated",
  "description": "Critical fix for payment processing timeout issue - Added additional validation",
  "estimatedDuration": 60,
  "deploymentSteps": [
    "Scale down payment service instances",
    "Deploy hotfix package",
    "Update database connection timeout",
    "Run additional validation tests",
    "Scale up service instances",
    "Verify payment processing"
  ]
}
```

### **Submit Deployment for Approval**
```http
POST /api/v1/deployments/{id}/submit
Authorization: Creator
```

**Response:**
```json
{
  "success": true,
  "message": "Deployment request submitted for approval",
  "status": "SUBMITTED",
  "submittedAt": "2024-08-20T16:00:00Z"
}
```

### **Approve Deployment**
```http
POST /api/v1/deployments/{id}/approve
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "comments": "Approved after reviewing deployment plan and rollback procedures",
  "rlmId": "CHG-2024-001235"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deployment approved successfully",
  "status": "APPROVED",
  "approvedBy": "admin.user",
  "approvedAt": "2024-08-20T16:15:00Z",
  "rlmId": "CHG-2024-001235"
}
```

### **Mark Ready for Performance**
```http
POST /api/v1/deployments/{id}/ready-for-performance
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "comments": "Code review completed, unit tests passing, ready for performance testing"
}
```

### **Mark Ready for Production**
```http
POST /api/v1/deployments/{id}/ready-for-production
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "comments": "Performance tests passed, security validation completed, approved for production"
}
```

### **Request Changes**
```http
POST /api/v1/deployments/{id}/request-changes
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "comments": "Please provide more detailed rollback procedures and add security scan results",
  "requiredChanges": [
    "Enhanced rollback documentation",
    "Security scan results",
    "Performance impact assessment"
  ]
}
```

---

## 📦 **Release Management APIs**

### **Get All Releases**
```http
GET /api/v1/releases
Authorization: All roles
```

**Query Parameters:**
- `page`: Page number
- `size`: Page size
- `status`: Filter by status (PLANNING, DEVELOPMENT, TESTING, RELEASED)
- `application`: Filter by application

**Response:**
```json
{
  "content": [
    {
      "id": 201,
      "version": "2.1.0",
      "codename": "Aurora",
      "status": "RELEASED",
      "application": "auth-service",
      "releaseDate": "2024-08-15T00:00:00Z",
      "plannedDate": "2024-08-15T00:00:00Z",
      "releaseManager": {
        "id": 3,
        "username": "release.manager",
        "firstName": "Release",
        "lastName": "Manager"
      },
      "deploymentCount": 3,
      "successRate": 100.0,
      "features": [
        "OAuth2 integration",
        "Enhanced security",
        "Performance improvements"
      ],
      "bugFixes": [
        "Fixed session timeout issue",
        "Resolved memory leak",
        "Corrected validation errors"
      ]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 25,
    "totalPages": 2
  }
}
```

### **Create Release**
```http
POST /api/v1/releases
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "version": "2.2.0",
  "codename": "Boreas",
  "application": "auth-service",
  "plannedDate": "2024-09-15T00:00:00Z",
  "description": "Major update with new authentication methods",
  "features": [
    "LDAP integration",
    "Multi-factor authentication",
    "SSO support"
  ],
  "bugFixes": [
    "Performance optimization",
    "Security enhancements"
  ],
  "breakingChanges": [
    "API endpoint changes",
    "Configuration format update"
  ],
  "migrationNotes": "See migration guide for API changes"
}
```

### **Get Release Deployments**
```http
GET /api/v1/releases/{id}/deployments
Authorization: All roles
```

**Response:**
```json
{
  "releaseId": 201,
  "version": "2.1.0",
  "deployments": [
    {
      "id": 1001,
      "title": "Auth Service v2.1.0 - Development",
      "environment": "DEVELOPMENT",
      "status": "COMPLETED",
      "completedAt": "2024-08-10T14:00:00Z"
    },
    {
      "id": 1002,
      "title": "Auth Service v2.1.0 - Staging",
      "environment": "STAGING",
      "status": "COMPLETED",
      "completedAt": "2024-08-12T16:00:00Z"
    },
    {
      "id": 1003,
      "title": "Auth Service v2.1.0 - Production",
      "environment": "PRODUCTION",
      "status": "COMPLETED",
      "completedAt": "2024-08-15T02:00:00Z"
    }
  ]
}
```

---

## 🔑 **Authentication APIs**

### **Password Management**

#### **Change Password**
```http
POST /api/v1/auth/change-password
Authorization: All roles
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

#### **Reset Password (Admin)**
```http
POST /api/v1/auth/reset-password/{userId}
Authorization: Admin, SuperAdmin
Content-Type: application/json

{
  "temporaryPassword": "temp_password_123",
  "forceChange": true
}
```

### **Session Management**

#### **Get Active Sessions**
```http
GET /api/v1/auth/sessions
Authorization: SuperAdmin
```

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "ABC123...",
      "userId": 5,
      "username": "john.doe",
      "createdAt": "2024-08-20T10:00:00Z",
      "lastActivity": "2024-08-20T15:30:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "active": true
    }
  ],
  "totalSessions": 23,
  "activeSessions": 18
}
```

#### **Terminate Session**
```http
DELETE /api/v1/auth/sessions/{sessionId}
Authorization: SuperAdmin
```

---

## ⚙️ **System APIs**

### **System Health**
```http
GET /api/v1/system/health
Authorization: All roles
```

**Response:**
```json
{
  "status": "UP",
  "components": {
    "database": {
      "status": "UP",
      "details": {
        "connectionPool": "8/20 active",
        "responseTime": "2ms"
      }
    },
    "externalSystems": {
      "status": "UP",
      "details": {
        "itsm": "Connected",
        "ldap": "Connected",
        "smtp": "Connected"
      }
    },
    "storage": {
      "status": "UP",
      "details": {
        "diskSpace": "75% used",
        "uploadDirectory": "Available"
      }
    }
  },
  "timestamp": "2024-08-20T15:45:00Z"
}
```

### **System Information**
```http
GET /api/v1/system/info
Authorization: Admin, SuperAdmin
```

**Response:**
```json
{
  "application": {
    "name": "Deployment Portal",
    "version": "1.0.0",
    "buildTime": "2024-08-01T10:00:00Z",
    "gitCommit": "abc123def456"
  },
  "system": {
    "javaVersion": "17.0.8",
    "springBootVersion": "3.1.2",
    "uptime": "7 days, 14 hours, 32 minutes",
    "timezone": "UTC"
  },
  "database": {
    "vendor": "PostgreSQL",
    "version": "15.3",
    "schema": "deployment_portal",
    "migrations": "up-to-date"
  }
}
```

### **System Metrics**
```http
GET /api/v1/system/metrics
Authorization: Admin, SuperAdmin
```

**Response:**
```json
{
  "performance": {
    "requestsPerSecond": 45.2,
    "averageResponseTime": "125ms",
    "errorRate": "0.02%"
  },
  "resources": {
    "cpuUsage": "34%",
    "memoryUsage": "1.8GB / 4GB",
    "diskUsage": "45GB / 100GB"
  },
  "database": {
    "activeConnections": 8,
    "maxConnections": 20,
    "avgQueryTime": "12ms"
  },
  "users": {
    "totalUsers": 156,
    "activeUsers": 23,
    "activeSessions": 18
  }
}
```

---

## ❌ **Error Handling**

### **Standard Error Response Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title is required and cannot be empty"
      },
      {
        "field": "priority",
        "message": "Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL"
      }
    ],
    "timestamp": "2024-08-20T15:45:00Z",
    "path": "/api/v1/deployments",
    "requestId": "req_abc123def456"
  }
}
```

### **HTTP Status Codes**
```
✅ Success Codes:
• 200 OK - Request successful
• 201 Created - Resource created
• 204 No Content - Successful deletion

❌ Client Error Codes:
• 400 Bad Request - Invalid request data
• 401 Unauthorized - Authentication required
• 403 Forbidden - Insufficient permissions
• 404 Not Found - Resource not found
• 409 Conflict - Resource conflict
• 422 Unprocessable Entity - Validation error
• 429 Too Many Requests - Rate limit exceeded

🚨 Server Error Codes:
• 500 Internal Server Error - Server error
• 502 Bad Gateway - External service error
• 503 Service Unavailable - Service maintenance
• 504 Gateway Timeout - Request timeout
```

### **Error Codes Reference**
```
🔐 Authentication Errors:
• AUTH_REQUIRED - Authentication required
• INVALID_CREDENTIALS - Wrong username/password
• SESSION_EXPIRED - Session timeout
• ACCOUNT_LOCKED - Too many failed attempts

🚫 Authorization Errors:
• INSUFFICIENT_PERMISSIONS - Access denied
• ROLE_REQUIRED - Specific role needed
• RESOURCE_ACCESS_DENIED - Cannot access resource

📝 Validation Errors:
• VALIDATION_ERROR - Input validation failed
• REQUIRED_FIELD - Required field missing
• INVALID_FORMAT - Wrong data format
• DUPLICATE_VALUE - Value already exists

🔧 Business Logic Errors:
• DEPLOYMENT_NOT_EDITABLE - Cannot modify approved deployment
• INVALID_STATUS_TRANSITION - Status change not allowed
• DEPENDENCY_CONFLICT - Resource dependencies conflict
```

---

## 🚦 **Rate Limiting**

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1692547200
```

### **Rate Limit Policies**
```
📊 Standard Limits:
• Authenticated users: 1000 requests/hour
• Admin users: 2000 requests/hour
• Anonymous users: 100 requests/hour

🚨 Endpoint-Specific Limits:
• Login attempts: 5/minute per IP
• Password reset: 3/hour per user
• File uploads: 10/hour per user
• Bulk operations: 5/hour per user
```

### **Rate Limit Exceeded Response**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit: 1000/hour",
    "retryAfter": 3600,
    "timestamp": "2024-08-20T15:45:00Z"
  }
}
```

---

## 🛠️ **SDKs and Examples**

### **JavaScript/TypeScript Example**
```typescript
// TypeScript SDK example
class DeploymentPortalAPI {
  private baseUrl: string;
  private sessionId: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async getDeployments(params?: DeploymentQueryParams): Promise<PagedResponse<Deployment>> {
    const url = new URL(`${this.baseUrl}/deployments`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch deployments');
    }

    return response.json();
  }

  async createDeployment(deployment: CreateDeploymentRequest): Promise<Deployment> {
    const response = await fetch(`${this.baseUrl}/deployments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deployment),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to create deployment');
    }

    return response.json();
  }
}

// Usage example
const api = new DeploymentPortalAPI('https://deployment-portal.company.com/api/v1');

async function example() {
  try {
    // Login
    const user = await api.login('john.doe', 'password');
    console.log('Logged in as:', user.username);

    // Get deployments
    const deployments = await api.getDeployments({
      status: 'APPROVED',
      page: 0,
      size: 10
    });
    console.log('Found deployments:', deployments.content.length);

    // Create new deployment
    const newDeployment = await api.createDeployment({
      title: 'Test Deployment',
      description: 'Test deployment created via API',
      priority: 'MEDIUM',
      application: 'test-app',
      version: '1.0.0',
      environment: 'DEVELOPMENT'
    });
    console.log('Created deployment:', newDeployment.id);

  } catch (error) {
    console.error('API Error:', error);
  }
}
```

### **Python Example**
```python
import requests
from typing import Optional, Dict, Any

class DeploymentPortalAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """Login and establish session"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        response.raise_for_status()
        return response.json()
    
    def get_deployments(self, **params) -> Dict[str, Any]:
        """Get deployments with optional filtering"""
        response = self.session.get(
            f"{self.base_url}/deployments",
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def create_deployment(self, deployment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new deployment request"""
        response = self.session.post(
            f"{self.base_url}/deployments",
            json=deployment_data
        )
        response.raise_for_status()
        return response.json()
    
    def approve_deployment(self, deployment_id: int, comments: str = "", rlm_id: str = "") -> Dict[str, Any]:
        """Approve deployment (admin only)"""
        response = self.session.post(
            f"{self.base_url}/deployments/{deployment_id}/approve",
            json={"comments": comments, "rlmId": rlm_id}
        )
        response.raise_for_status()
        return response.json()

# Usage example
api = DeploymentPortalAPI('https://deployment-portal.company.com/api/v1')

# Login
user = api.login('admin.user', 'admin_password')
print(f"Logged in as: {user['user']['username']}")

# Get pending deployments
pending = api.get_deployments(status='SUBMITTED')
print(f"Pending deployments: {len(pending['content'])}")

# Approve first pending deployment (if any)
if pending['content']:
    deployment = pending['content'][0]
    result = api.approve_deployment(
        deployment['id'],
        comments="Approved via API",
        rlm_id="CHG-2024-API-001"
    )
    print(f"Approved deployment: {deployment['title']}")
```

### **cURL Examples**
```bash
#!/bin/bash

BASE_URL="https://deployment-portal.company.com/api/v1"
COOKIE_JAR="cookies.txt"

# Login
curl -c "$COOKIE_JAR" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"john.doe","password":"password"}' \
  "$BASE_URL/auth/login"

# Get my deployments
curl -b "$COOKIE_JAR" \
  "$BASE_URL/deployments?page=0&size=10"

# Create new deployment
curl -b "$COOKIE_JAR" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Deployment",
    "description": "Test deployment via cURL",
    "priority": "LOW",
    "application": "test-app",
    "version": "1.0.0",
    "environment": "DEVELOPMENT"
  }' \
  "$BASE_URL/deployments"

# Get deployment by ID
curl -b "$COOKIE_JAR" \
  "$BASE_URL/deployments/1001"

# Approve deployment (admin only)
curl -b "$COOKIE_JAR" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"comments":"Approved via API","rlmId":"CHG-2024-001"}' \
  "$BASE_URL/deployments/1001/approve"

# Logout
curl -b "$COOKIE_JAR" \
  -X POST \
  "$BASE_URL/auth/logout"

# Clean up
rm "$COOKIE_JAR"
```

---

*This comprehensive API documentation provides all the information needed to integrate with the Deployment Portal. For additional support or questions about specific endpoints, contact the development team or refer to the interactive API documentation at `/swagger-ui` when available.*
