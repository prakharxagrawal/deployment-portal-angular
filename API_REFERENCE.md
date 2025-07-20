# Deployment Portal - API Reference

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication APIs](#authentication-apis)
3. [Deployment Management APIs](#deployment-management-apis)
4. [Supporting Data APIs](#supporting-data-apis)
5. [Export APIs](#export-apis)
6. [Error Handling](#error-handling)
7. [API Examples](#api-examples)

---

## API Overview

### Base Information
- **Base URL:** `http://localhost:8080/api`
- **Protocol:** HTTP/HTTPS
- **Authentication:** Session-based (cookies)
- **Content-Type:** `application/json`
- **Response Format:** JSON

### Global Headers
```http
Content-Type: application/json
Cookie: JSESSIONID=<session-id>
```

### HTTP Status Codes
- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Authentication APIs

### Login
Authenticates a user and creates a session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "username": "dev1",
    "role": "developer"
  },
  "message": "Login successful"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials"
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dev1",
    "password": "dev123"
  }'
```

### Logout
Invalidates the current session.

**Endpoint:** `POST /api/auth/logout`

**Request Body:** Empty

**Response (Success - 200):**
```json
{
  "message": "Logout successful"
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Cookie: JSESSIONID=<session-id>"
```

### Check Authentication
Validates the current session and returns user information.

**Endpoint:** `GET /api/auth/check`

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "username": "dev1",
    "role": "developer"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Unauthorized"
}
```

**Example:**
```bash
curl -X GET http://localhost:8080/api/auth/check \
  -H "Cookie: JSESSIONID=<session-id>"
```

---

## Deployment Management APIs

### Get All Deployments
Retrieves all deployment requests with optional search functionality.

**Endpoint:** `GET /api/deployments`

**Query Parameters:**
- `search` (optional) - Search term for filtering deployments

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "serialNumber": "MSDR0000030",
    "csiId": "172033",
    "service": "ml-pipeline-service",
    "requestId": "REQ030",
    "team": "Phoenix",
    "release": "December",
    "status": "Open",
    "createdBy": "dev1",
    "environments": ["DEV1", "UAT1", "PROD1"],
    "rlmIdDev1": "RLM-DEV1-030",
    "rlmIdDev2": null,
    "rlmIdDev3": null,
    "rlmIdUat1": "RLM-UAT1-030",
    "rlmIdUat2": null,
    "rlmIdUat3": null,
    "rlmIdPerf1": "RLM-PERF1-030",
    "rlmIdPerf2": "RLM-PERF2-030",
    "rlmIdProd1": "RLM-PROD1-030",
    "rlmIdProd2": "RLM-PROD2-030",
    "isConfig": false,
    "configRequestId": null,
    "dateRequested": "2024-07-18T15:00:00",
    "dateModified": "2024-07-18T15:00:00",
    "productionReady": false
  }
]
```

**Search Examples:**
```bash
# Get all deployments
curl -X GET http://localhost:8080/api/deployments \
  -H "Cookie: JSESSIONID=<session-id>"

# Search by MSDR number
curl -X GET "http://localhost:8080/api/deployments?search=MSDR0000030" \
  -H "Cookie: JSESSIONID=<session-id>"

# Search by service name
curl -X GET "http://localhost:8080/api/deployments?search=pipeline" \
  -H "Cookie: JSESSIONID=<session-id>"

# Search by date
curl -X GET "http://localhost:8080/api/deployments?search=2024-07-18" \
  -H "Cookie: JSESSIONID=<session-id>"
```

### Create Deployment
Creates a new deployment request.

**Endpoint:** `POST /api/deployments`

**Authorization:** Developers and Superadmins only

**Request Body:**
```json
{
  "csiId": "172033",
  "service": "ml-pipeline-service",
  "requestId": "REQ030",
  "team": "Phoenix",
  "release": "December",
  "environments": ["DEV1", "UAT1", "PROD1"],
  "isConfig": false,
  "configRequestId": null
}
```

**Response (Success - 200):**
```json
{
  "message": "Deployment created successfully"
}
```

**Response (Error - 401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (Error - 403):**
```json
{
  "error": "Only developers and superadmins can create deployments"
}
```

**Auto-Generated Fields:**
- `serialNumber` - Generated in MSDR0000XXX format
- `status` - Set to "Open"
- `createdBy` - Set to current user's username
- `dateRequested` - Set to current timestamp
- `dateModified` - Set to current timestamp

**Example:**
```bash
curl -X POST http://localhost:8080/api/deployments \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -d '{
    "csiId": "172033",
    "service": "user-management-service",
    "requestId": "REQ031",
    "team": "Crusaders",
    "release": "January",
    "environments": ["DEV2", "UAT2"],
    "isConfig": true,
    "configRequestId": "CONF031"
  }'
```

### Update Deployment
Updates an existing deployment request.

**Endpoint:** `PUT /api/deployments/{id}`

**Authorization:** Role-based with specific rules for production ready

**Request Body:**
```json
{
  "csiId": "172033",
  "service": "ml-pipeline-service",
  "requestId": "REQ030",
  "team": "Phoenix",
  "release": "December",
  "status": "In Progress",
  "environments": ["DEV1", "UAT1", "PROD1"],
  "rlmIdDev1": "RLM-DEV1-030-UPDATED",
  "rlmIdUat1": "RLM-UAT1-030-UPDATED",
  "rlmIdPerf1": "RLM-PERF1-030",
  "rlmIdPerf2": "RLM-PERF2-030",
  "rlmIdProd1": "RLM-PROD1-030",
  "rlmIdProd2": "RLM-PROD2-030",
  "isConfig": false,
  "configRequestId": null,
  "productionReady": true
}
```

**Response (Success - 200):**
```json
{
  "message": "Deployment updated"
}
```

**Response (Error - 400):**
```json
{
  "error": "Deployment not found"
}
```

**Response (Error - 403 - Production Ready):**
```json
{
  "error": "Only requester or super admin can mark as production ready"
}
```

**Response (Error - 400 - Production Ready Status):**
```json
{
  "error": "Can only mark as production ready when status is Completed"
}
```

**Update Rules:**

**Production Ready Updates:**
- Only original requester (createdBy) or superadmin can modify
- Only allowed when status is "Completed"
- Automatically updates `dateModified`

**Status Updates:**
- Only admins and superadmins can modify status
- Valid values: "Open", "In Progress", "Pending", "Completed"

**RLM ID Updates:**
- Only admins and superadmins can modify RLM IDs
- All RLM fields are editable

**Auto-Updated Fields:**
- `dateModified` - Set to current timestamp on any update
- Core fields preserved: `id`, `serialNumber`, `dateRequested`

**Example:**
```bash
curl -X PUT http://localhost:8080/api/deployments/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -d '{
    "status": "Completed",
    "rlmIdProd1": "RLM-PROD1-030-FINAL",
    "rlmIdProd2": "RLM-PROD2-030-FINAL",
    "productionReady": true
  }'
```

---

## Supporting Data APIs

### Get All Services
Retrieves all available services for deployment requests.

**Endpoint:** `GET /api/services`

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "name": "api-gateway-service",
    "description": "API Gateway Service"
  },
  {
    "id": 2,
    "name": "user-management-service",
    "description": "User Management Service"
  },
  {
    "id": 3,
    "name": "payment-processing-service",
    "description": "Payment Processing Service"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8080/api/services \
  -H "Cookie: JSESSIONID=<session-id>"
```

### Get All Releases
Retrieves all available release branches.

**Endpoint:** `GET /api/releases`

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "name": "January",
    "description": "January Release"
  },
  {
    "id": 2,
    "name": "February",
    "description": "February Release"
  },
  {
    "id": 3,
    "name": "March",
    "description": "March Release"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8080/api/releases \
  -H "Cookie: JSESSIONID=<session-id>"
```

### Create Release
Creates a new release. Admin and Super Admin only.

**Endpoint:** `POST /api/releases`

**Request Body:**
```json
{
  "name": "2025-01",
  "description": "January 2025 release"
}
```

**Validation Rules:**
- Name must follow YYYY-MM format (e.g., 2025-01, 2025-12)
- Year must be between 2024-2030
- Month must be 01-12
- Description cannot be empty
- Release names must be unique

**Response (Success - 201):**
```json
{
  "id": 10,
  "name": "2025-01", 
  "description": "January 2025 release"
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid release name format. Use YYYY-MM (e.g., 2025-01)"
}
```

**Response (Error - 409):**
```json
{
  "error": "Release with name '2025-01' already exists"
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/releases \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -d '{
    "name": "2025-01",
    "description": "January 2025 release"
  }'
```

---

## Export APIs

### Generate CSV Report
Generates and downloads a CSV report with deployment data.

**Endpoint:** `GET /api/reports/general`

**Query Parameters:**
- `release` (optional) - Filter by release name
- `environment` (optional) - Filter by environment name  
- `team` (optional) - Filter by team name
- `startDate` (optional) - Filter by date requested from (YYYY-MM-DD format)
- `endDate` (optional) - Filter by date requested to (YYYY-MM-DD format)

**Response Headers:**
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="deployment_report.csv"
```

**Response Body:** CSV file with deployment data

**CSV Format:**
```csv
Serial Number,CSI ID,Service,Request ID,Environments,Team,Release,Status,Created By,Date Requested,Date Modified,RLM ID DEV1,RLM ID DEV2,RLM ID DEV3,RLM ID UAT1,RLM ID UAT2,RLM ID UAT3,RLM ID PERF1,RLM ID PERF2,RLM ID PROD1,RLM ID PROD2
MSDR0000030,172033,ml-pipeline-service,REQ030,"DEV1,UAT1,PROD1",Phoenix,December,Open,dev1,2024-07-18T15:00:00,2024-07-18T15:00:00,RLM-DEV1-030,,,RLM-UAT1-030,,,RLM-PERF1-030,RLM-PERF2-030,RLM-PROD1-030,RLM-PROD2-030
```

**Filter Examples:**
```bash
# Export all deployments
curl -X GET http://localhost:8080/api/reports/general \
  -H "Cookie: JSESSIONID=<session-id>" \
  -o deployment_report.csv

# Export filtered by release
curl -X GET "http://localhost:8080/api/reports/general?release=December" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -o december_deployments.csv

# Export filtered by environment
curl -X GET "http://localhost:8080/api/reports/general?environment=PROD1" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -o prod1_deployments.csv

# Export filtered by team
curl -X GET "http://localhost:8080/api/reports/general?team=Phoenix" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -o phoenix_deployments.csv

# Export with multiple filters
curl -X GET "http://localhost:8080/api/reports/general?release=December&team=Phoenix&environment=PROD1" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -o filtered_deployments.csv

# Export with date range filter
curl -X GET "http://localhost:8080/api/reports/general?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -o yearly_deployments.csv

# Export with combined filters including date range
curl -X GET "http://localhost:8080/api/reports/general?release=2025-01&startDate=2024-01-01&endDate=2024-01-31&team=Phoenix" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -o january_phoenix_deployments.csv
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message describing what went wrong",
  "timestamp": "2024-07-18T15:00:00Z",
  "path": "/api/deployments/1"
}
```

### Common Error Scenarios

#### Authentication Errors
**401 Unauthorized - No Session:**
```json
{
  "error": "Unauthorized"
}
```

**401 Unauthorized - Invalid Credentials:**
```json
{
  "error": "Invalid credentials"
}
```

#### Authorization Errors
**403 Forbidden - Insufficient Role:**
```json
{
  "error": "Only developers and superadmins can create deployments"
}
```

**403 Forbidden - Production Ready Restriction:**
```json
{
  "error": "Only requester or super admin can mark as production ready"
}
```

#### Validation Errors
**400 Bad Request - Missing Required Field:**
```json
{
  "error": "Service name is required"
}
```

**400 Bad Request - Invalid Status:**
```json
{
  "error": "Invalid status value. Must be one of: Open, In Progress, Pending, Completed"
}
```

**400 Bad Request - Production Ready Status Restriction:**
```json
{
  "error": "Can only mark as production ready when status is Completed"
}
```

#### Resource Errors
**404 Not Found:**
```json
{
  "error": "Deployment not found"
}
```

#### Server Errors
**500 Internal Server Error:**
```json
{
  "error": "Internal server error occurred"
}
```

---

## API Examples

### Complete User Workflow Examples

#### Example 1: Developer Creating and Tracking a Deployment

**Step 1: Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dev1",
    "password": "dev123"
  }' \
  -c cookies.txt
```

**Step 2: Get Available Services**
```bash
curl -X GET http://localhost:8080/api/services \
  -b cookies.txt
```

**Step 3: Create New Deployment**
```bash
curl -X POST http://localhost:8080/api/deployments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "csiId": "172033",
    "service": "user-authentication-service",
    "requestId": "REQ-AUTH-2024-001",
    "team": "Phoenix",
    "release": "January",
    "environments": ["DEV1", "UAT1", "PROD1"],
    "isConfig": false
  }'
```

**Step 4: Check Request Status**
```bash
curl -X GET "http://localhost:8080/api/deployments?search=REQ-AUTH-2024-001" \
  -b cookies.txt
```

**Step 5: Mark as Production Ready (when completed)**
```bash
curl -X PUT http://localhost:8080/api/deployments/32 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "productionReady": true
  }'
```

#### Example 2: Admin Processing a Deployment

**Step 1: Admin Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "admin123"
  }' \
  -c admin_cookies.txt
```

**Step 2: Get Open Deployments**
```bash
curl -X GET "http://localhost:8080/api/deployments?search=Open" \
  -b admin_cookies.txt
```

**Step 3: Update Status to In Progress**
```bash
curl -X PUT http://localhost:8080/api/deployments/32 \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "status": "In Progress"
  }'
```

**Step 4: Update RLM IDs as Deployment Progresses**
```bash
curl -X PUT http://localhost:8080/api/deployments/32 \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "rlmIdDev1": "RLM-DEV1-AUTH-001",
    "rlmIdUat1": "RLM-UAT1-AUTH-001"
  }'
```

**Step 5: Mark as Completed**
```bash
curl -X PUT http://localhost:8080/api/deployments/32 \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "status": "Completed",
    "rlmIdProd1": "RLM-PROD1-AUTH-001"
  }'
```

#### Example 3: Generating Reports

**Generate Team-Specific Report:**
```bash
curl -X GET "http://localhost:8080/api/reports/general?team=Phoenix" \
  -b cookies.txt \
  -o phoenix_team_report.csv
```

**Generate Environment-Specific Report:**
```bash
curl -X GET "http://localhost:8080/api/reports/general?environment=PROD1" \
  -b cookies.txt \
  -o production_deployments.csv
```

**Generate Release Report:**
```bash
curl -X GET "http://localhost:8080/api/reports/general?release=January" \
  -b cookies.txt \
  -o january_release_report.csv
```

### JavaScript/TypeScript Examples

#### Angular Service Implementation
```typescript
@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Login
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      username,
      password
    }, { withCredentials: true });
  }

  // Get all deployments with search
  getAllDeployments(search?: string): Observable<Deployment[]> {
    const params = search ? { search } : {};
    return this.http.get<Deployment[]>(`${this.apiUrl}/deployments`, {
      params,
      withCredentials: true
    });
  }

  // Create deployment
  createDeployment(deployment: Partial<Deployment>): Observable<any> {
    return this.http.post(`${this.apiUrl}/deployments`, deployment, {
      withCredentials: true
    });
  }

  // Update deployment
  updateDeployment(id: number, deployment: Partial<Deployment>): Observable<any> {
    return this.http.put(`${this.apiUrl}/deployments/${id}`, deployment, {
      withCredentials: true
    });
  }

  // Export CSV
  exportCSV(filters: any): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/general`, {
      params: filters,
      responseType: 'blob',
      withCredentials: true
    });
  }
}
```

#### Usage in Component
```typescript
export class DeploymentComponent implements OnInit {
  deployments: Deployment[] = [];

  constructor(private deploymentService: DeploymentService) {}

  ngOnInit() {
    this.loadDeployments();
  }

  loadDeployments(search?: string) {
    this.deploymentService.getAllDeployments(search).subscribe({
      next: (deployments) => {
        this.deployments = deployments;
      },
      error: (error) => {
        console.error('Error loading deployments:', error);
      }
    });
  }

  createDeployment(deploymentData: Partial<Deployment>) {
    this.deploymentService.createDeployment(deploymentData).subscribe({
      next: () => {
        console.log('Deployment created successfully');
        this.loadDeployments(); // Refresh list
      },
      error: (error) => {
        console.error('Error creating deployment:', error);
      }
    });
  }

  updateDeployment(id: number, updates: Partial<Deployment>) {
    this.deploymentService.updateDeployment(id, updates).subscribe({
      next: () => {
        console.log('Deployment updated successfully');
        this.loadDeployments(); // Refresh list
      },
      error: (error) => {
        console.error('Error updating deployment:', error);
      }
    });
  }
}
```

### Python Examples

#### Using requests library
```python
import requests
import json

# Base configuration
base_url = "http://localhost:8080/api"
session = requests.Session()

# Login
def login(username, password):
    response = session.post(f"{base_url}/auth/login", json={
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        print("Login successful")
        return response.json()
    else:
        print("Login failed:", response.json())
        return None

# Get deployments
def get_deployments(search=None):
    params = {"search": search} if search else {}
    response = session.get(f"{base_url}/deployments", params=params)
    return response.json() if response.status_code == 200 else None

# Create deployment
def create_deployment(deployment_data):
    response = session.post(f"{base_url}/deployments", json=deployment_data)
    return response.json() if response.status_code == 200 else None

# Example usage
if __name__ == "__main__":
    # Login
    login("dev1", "dev123")
    
    # Get all deployments
    deployments = get_deployments()
    print(f"Found {len(deployments)} deployments")
    
    # Search deployments
    search_results = get_deployments("Phoenix")
    print(f"Found {len(search_results)} deployments for Phoenix team")
    
    # Create new deployment
    new_deployment = {
        "csiId": "172033",
        "service": "python-api-service",
        "requestId": "REQ-PY-001",
        "team": "Phoenix",
        "release": "February",
        "environments": ["DEV2", "UAT2"],
        "isConfig": False
    }
    result = create_deployment(new_deployment)
    print("Create result:", result)
```

This API reference provides comprehensive documentation for all endpoints in the Deployment Portal, including request/response formats, error handling, and practical examples in multiple programming languages.
