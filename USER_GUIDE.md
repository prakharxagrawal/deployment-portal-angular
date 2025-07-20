# Deployment Portal - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Navigation & Interface](#navigation--interface)
3. [Role-Specific Guides](#role-specific-guides)
4. [Features Deep Dive](#features-deep-dive)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## Getting Started

### Accessing the Application
1. Open your web browser
2. Navigate to: `http://localhost:4200`
3. You'll see the login screen

### First Time Login
Use one of these pre-configured accounts:

**Superadmin Access:**
- Username: `superadmin`
- Password: `admin123`

**Admin Access:**
- Username: `admin1` or `admin2`
- Password: `admin123`

**Developer Access:**
- Username: `dev1`, `dev2`, or `dev3`
- Password: `dev123`

### Session Management
- **Session Duration:** 12 hours
- **Auto-logout:** Sessions expire after 12 hours of inactivity
- **Cross-tab Support:** Login in one tab works across all tabs
- **Manual Logout:** Click the logout button in the top-right corner

---

## Navigation & Interface

### Main Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Header (User Info & Logout)             │
├─────────────────────────────────────────────────────────────┤
│ Filters: [Status▼] [Env▼] [Release▼] [Config▼] [Service▼]  │
│          [Prod Ready▼] [Team▼] [Clear] 🔍[Search] [Edit] [New]│
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│    Request List      │         Request Details             │
│                      │                                      │
│  ┌─────────────────┐ │  ┌─────────────────────────────────┐ │
│  │ MSDR0000030     │ │  │ Request Details                │ │
│  │ ml-pipeline...  │ │  │ #MSDR0000030        [Status]   │ │
│  │ Open            │ │  │                                │ │
│  │ Phoenix         │ │  │ CSI ID: 172033                 │ │
│  └─────────────────┘ │  │ Service: ml-pipeline-service   │ │
│  ┌─────────────────┐ │  │ Team: Phoenix                  │ │
│  │ MSDR0000029     │ │  │ ...                           │ │
│  │ api-security... │ │  │                                │ │
│  │ In Progress     │ │  │ RLM IDs:                       │ │
│  │ Crusaders       │ │  │ [DEV1] [DEV2] [UAT1]...       │ │
│  └─────────────────┘ │  └─────────────────────────────────┘ │
│                      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│           Export Options & Bottom Toolbar                   │
└─────────────────────────────────────────────────────────────┘
```

### Key Interface Elements

#### 🔍 Top Toolbar
- **Filters:** Dropdown menus for quick filtering
- **Search:** Universal search box for MSDR numbers, services, dates
- **Clear:** Resets all filters
- **Edit Request:** Opens edit dialog (role-dependent)
- **New Request:** Creates new deployment request (developers/superadmins)

#### 📋 Request List (Left Panel)
- Shows filtered list of deployment requests
- **Sort Order:** Latest requests at the top
- **Quick Info:** Serial number, service name, status, team
- **Color Coding:** Status-based color indicators
- **Click to Select:** Click any request to view details

#### 📄 Request Details (Right Panel)
- **Header:** Request number and status
- **Basic Info:** All request fields
- **Production Ready:** Checkbox for completed requests (role-dependent)
- **RLM IDs:** Environment-specific tracking IDs
- **Update Buttons:** Appear when changes are made (role-dependent)

#### ⬇️ Bottom Toolbar
- **Export Options:** CSV export with filtering
- **Status Indicators:** Current filter states

---

## Role-Specific Guides

### 🦸‍♂️ Superadmin Guide

**You have full access to everything in the system.**

#### Daily Tasks
1. **Monitor All Requests**
   - Review new requests from developers
   - Track progress of ongoing deployments
   - Ensure timely status updates

2. **System Administration**
   - Create requests for special scenarios
   - Override any restrictions when needed
   - Manage user access (manual process)

#### Creating a New Request
1. Click **"New Request"** button
2. Fill in all required fields:
   - **CSI ID:** Select from dropdown (172033, 172223, 169608)
   - **Service:** Type to search from 180+ services
   - **Request ID:** Enter business request ID
   - **Team:** Select development team
   - **Release:** Select release branch
   - **Environments:** Select target environments
   - **Config Request:** Check if this is a configuration request
3. Click **"Create Request"**
4. Request is created with "Open" status

#### Editing Any Request
1. Select request from list
2. Click **"Edit Request"** button
3. Modify any fields as needed
4. Click **"Save Changes"**
5. Changes are saved with updated timestamp

#### Managing Status & RLM IDs
1. Select request from list
2. In request details panel:
   - **Status:** Use dropdown to change status
   - **RLM IDs:** Edit any environment RLM ID
   - **Production Ready:** Check/uncheck for completed requests
3. Click **"Update Request"** when changes are made
4. Changes are saved immediately

#### Production Ready Management
1. Find completed requests (status = "Completed")
2. Select the request
3. Scroll to "Production Ready" section
4. Check/uncheck "Ready for Production"
5. Click **"Update"** button
6. Change is saved with audit trail

#### Exporting Data
1. Apply desired filters in top toolbar
2. Scroll to bottom toolbar
3. Set export-specific filters if needed
4. Click **"Export CSV"**
5. File downloads with all matching records

### 👨‍💼 Admin Guide

**Admins have extended privileges for managing deployments and creating releases.**

#### Admin Responsibilities
- Manage all deployment requests
- Create and manage releases  
- Export comprehensive reports
- Monitor system-wide deployment status
- Update deployment details and RLM IDs

#### Release Management

##### Creating Releases
1. **Access Release Creation**:
   - Click the "Create Release" button in the main interface
   - Only visible to Admin and Super Admin users

2. **Release Information**:
   - **Name**: Must follow YYYY-MM format (e.g., 2025-01, 2025-12)
   - **Description**: Provide a meaningful description
   - Names must be unique across the system

3. **Validation Rules**:
   - Name format is strictly enforced (YYYY-MM)
   - Year must be reasonable (2024-2030)
   - Month must be 01-12
   - Description cannot be empty

##### Managing Existing Releases
- Releases are displayed in reverse chronological order (newest first)
- Once created, releases cannot be deleted if they have associated deployments
- Release descriptions can be updated through the backend API

#### Daily Tasks
1. **Process Open Requests**
   - Review new requests from developers
   - Update status to "In Progress"
   - Begin deployment process

2. **Update RLM IDs**
   - Enter RLM IDs as deployments progress
   - Track deployment across environments
   - Ensure all required RLM IDs are captured

3. **Status Management**
   - Move requests through the pipeline
   - Update status based on deployment progress
   - Communicate with development teams

#### Processing Requests
1. Filter by **Status: "Open"** to see new requests
2. Select a request to review details
3. Change status to **"In Progress"** using dropdown
4. Click **"Update Request"** button
5. Begin deployment process

#### Managing RLM IDs
1. Select request in progress
2. In RLM IDs section, edit environment-specific IDs:
   - **UAT:** UAT1, UAT2, UAT3 (if requested)
   - **Performance:** PERF1, PERF2 (always visible)
   - **Production:** PROD1, PROD2 (always visible)
3. Click **"Update Request"** when changes are made
4. RLM IDs are saved immediately

#### Advanced Filtering and Export
1. **Date Range Exports**:
   - Use "From Date" and "To Date" for historical analysis
   - Covers deployments requested within the date range
   - Useful for monthly/quarterly reports

2. **Filtered Exports**:
   - Combine date ranges with other filters
   - Export specific release data
   - Team-specific deployment reports

#### Status Progression Workflow
```
Open → In Progress → Pending → Completed
```

**Typical Flow:**
1. **Open → In Progress:** Start deployment process
2. **Update RLM IDs:** As deployment progresses through environments
3. **In Progress → Pending:** Deployment complete, pending final verification
4. **Pending → Completed:** All testing passed, deployment successful

#### Monitoring & Reporting
1. Use filters to track specific deployments:
   - **Team filter:** Focus on specific development teams
   - **Environment filter:** Track specific environment deployments
   - **Release filter:** Monitor specific release deployments
2. Export filtered data for management reporting
3. Regular status updates to stakeholders

### 👨‍💻 Developer Guide

**You can create requests, edit your own requests (with restrictions), and mark your completed requests as production ready.**

#### Daily Tasks
1. **Submit New Deployment Requests**
   - Create requests for new features/fixes
   - Specify target environments
   - Provide all required information

2. **Monitor Your Requests**
   - Track progress of submitted requests
   - Respond to admin questions/issues
   - Mark completed deployments as production ready

3. **Team Collaboration**
   - Review team deployment pipeline
   - Coordinate with other developers
   - Plan release schedules

#### Creating a New Request
1. Click **"New Request"** button
2. Fill out the request form:

   **Required Fields:**
   - **CSI ID:** Select your project's CSI ID
   - **Service:** Search and select your service (autocomplete available)
   - **Request ID:** Enter your business/ticket request ID
   - **Team:** Select your development team
   - **Release:** Select target release

   **Environment Selection:**
   - Check environments where deployment is needed
   - **UAT:** UAT1, UAT2, UAT3
   - **Performance:** PERF1, PERF2
   - **Production:** PROD1, PROD2

   **Optional Fields:**
   - **Config Request:** Check if this involves configuration changes
   - **Config Request ID:** If config request, provide the config ID

3. Review all information
4. Click **"Create Request"**
5. Request is created with "Open" status

#### Editing Your Requests
**You can only edit your own requests when status is "Open" or "Pending"**

1. Filter to find your requests (search by your username)
2. Select your request
3. Click **"Edit Request"** button (only visible for your editable requests)
4. Modify fields as needed
5. Click **"Save Changes"**

**Editing Restrictions:**
- ❌ Cannot edit requests in "In Progress" or "Completed" status
- ❌ Cannot edit requests created by others
- ❌ Cannot change status directly
- ❌ Cannot edit RLM IDs

#### Marking Production Ready
**Only for your own completed requests**

1. Filter by **Status: "Completed"** and your username
2. Select your completed request
3. Scroll to "Production Ready" section
4. Check **"Ready for Production"** checkbox
5. Click **"Update"** button
6. Production ready flag is set with audit trail

**Requirements:**
- ✅ Request status must be "Completed"
- ✅ You must be the original requester
- ✅ Only you or superadmin can change this flag

#### Monitoring Your Requests
1. **Use Search:** Enter your username in universal search
2. **Filter by Team:** Select your team from team filter
3. **Track Status Changes:** Monitor as admins update status
4. **Communication:** Respond promptly to admin questions

#### Best Practices for Developers
1. **Complete Information:** Provide all required details upfront
2. **Clear Descriptions:** Use descriptive request IDs
3. **Environment Planning:** Only select environments you actually need
4. **Follow Up:** Monitor requests and respond to admin questions
5. **Production Ready:** Only mark as production ready when genuinely ready

---

## Features Deep Dive

### 🔍 Advanced Filtering

#### Status Filter
- **Open:** New requests awaiting processing
- **In Progress:** Currently being deployed
- **Pending:** Deployment complete, pending verification
- **Completed:** Fully processed and deployed

#### Environment Filter
- **UAT1, UAT2, UAT3:** User acceptance testing
- **PERF1, PERF2:** Performance testing
- **PROD1, PROD2:** Production environments

#### Team Filter
- **Phoenix:** Development Team Phoenix
- **Crusaders:** Development Team Crusaders
- **Transformers:** Development Team Transformers
- **Avengers:** Development Team Avengers
- **CRUD:** Development Team CRUD
- **Hyper Care:** Development Team Hyper Care

#### Service Filter
- **180+ Services:** All available services in aaa-bbb-ccc format
- **Autocomplete:** Type to search and filter
- **Examples:** api-gateway-service, user-management-service

#### Release Filter
- **Monthly Releases:** January through December
- **Feature Branches:** Special feature releases
- **Hotfix Branches:** Emergency fixes

#### Config Filter
- **Yes:** Configuration-only requests
- **No:** Regular deployment requests
- **All:** Both types (default)

#### Production Ready Filter
- **Yes:** Requests marked as production ready
- **No:** Requests not yet production ready
- **All:** All requests regardless of production ready status

### 🔍 Universal Search

**Search across multiple fields simultaneously:**

#### MSDR Numbers
- Search by complete serial number: `MSDR0000030`
- Partial search: `MSDR0000` or `030`
- Case insensitive

#### Service Names
- Full service name: `ml-pipeline-service`
- Partial name: `pipeline` or `ml-pipeline`
- Acronyms: `ml` matches ml-pipeline-service

#### Dates
- Date formats: `2024-07-18`, `July 18`, `18/07/2024`
- Relative dates: `today`, `yesterday`
- Month searches: `July`, `2024`

#### Combined Search
- Search combines all fields with OR logic
- Example: `MSDR0000030 pipeline July` finds requests matching any of these terms

### 📊 CSV Export Feature

#### Export Process
1. **Apply Filters:** Use main toolbar filters to narrow results
2. **Bottom Toolbar:** Additional export-specific filters
3. **Export Button:** Click "Export CSV" to download

#### Export Data Includes
- **All Request Fields:** Serial number, CSI ID, service, etc.
- **All RLM IDs:** Every environment RLM ID
- **Timestamps:** Date requested and modified
- **Status Information:** Current status and team
- **Production Ready:** Production readiness flag

#### Export Filters
**Main Toolbar Filters Apply to Export:**
- Status, Environment, Team, Service, Release, Config, Production Ready

**Bottom Toolbar Additional Filters:**
- **Release Filter:** Override main release filter for export
- **Environment Filter:** Override main environment filter for export
- **Team Filter:** Override main team filter for export

#### File Format
```csv
Serial Number,CSI ID,Service,Request ID,Environments,Team,Release,Status,Created By,Date Requested,Date Modified,RLM ID UAT1,RLM ID UAT2,RLM ID UAT3,RLM ID PERF1,RLM ID PERF2,RLM ID PROD1,RLM ID PROD2
MSDR0000030,172033,ml-pipeline-service,REQ030,"UAT1,PERF1,PROD1",Phoenix,December,Open,dev1,2024-07-18 15:00:00,2024-07-18 15:00:00,RLM-UAT1-030,,,RLM-PERF1-030,,RLM-PROD1-030,
```

### 🎯 Production Ready Process

#### Purpose
- **Quality Gate:** Formal approval before production deployment
- **Responsibility:** Original requester verifies readiness
- **Audit Trail:** Complete history of production ready changes

#### Workflow
1. **Prerequisite:** Request status must be "Completed"
2. **Authorization:** Only original requester or superadmin
3. **Action:** Check "Ready for Production" checkbox
4. **Confirmation:** Click "Update" button
5. **Audit:** Change logged with timestamp and user

#### Business Rules
- **Status Requirement:** Only completed requests
- **Role Restriction:** Original requester (developer) or superadmin
- **One-Way Process:** Can be checked/unchecked multiple times
- **Audit Trail:** Every change is logged
- **Persistence:** Flag persists across sessions

#### UI Behavior
- **Visibility:** Only shown for completed requests
- **Checkbox State:** Reflects current production ready status
- **Update Button:** Appears only when change is made
- **Unsaved Indicator:** Shows when changes are pending

---

## Troubleshooting

### Login Issues

**Problem:** Cannot login with provided credentials
**Solution:**
1. Verify username/password combination
2. Check caps lock
3. Try different user account
4. Contact system administrator

**Problem:** Session expired message
**Solution:**
1. Login again - sessions last 12 hours
2. Check system time
3. Clear browser cache if needed

### Interface Issues

**Problem:** Filters not working
**Solution:**
1. Click "Clear" button to reset filters
2. Refresh page (Ctrl+F5)
3. Check if data exists for selected filters

**Problem:** Request details not showing
**Solution:**
1. Click on request in left panel
2. Refresh page if needed
3. Check browser console for errors

**Problem:** Update buttons not appearing
**Solution:**
1. Verify you have permission to edit
2. Make actual changes to fields
3. Check request status restrictions

### Permission Issues

**Problem:** Cannot create new requests
**Solution:**
1. Verify you're logged in as developer or superadmin
2. Check "New Request" button in top toolbar
3. Contact admin if button is missing

**Problem:** Cannot edit production ready
**Solution:**
1. Verify request status is "Completed"
2. Confirm you're the original requester or superadmin
3. Check if checkbox is disabled

**Problem:** Cannot edit RLM IDs
**Solution:**
1. Verify you're logged in as admin or superadmin
2. Developers cannot edit RLM IDs
3. Check if fields are read-only

### Export Issues

**Problem:** CSV export not working
**Solution:**
1. Check browser popup blocker
2. Verify filters return results
3. Try clearing filters and exporting all
4. Check browser downloads folder

**Problem:** Export file is empty
**Solution:**
1. Applied filters may exclude all records
2. Click "Clear" to reset filters
3. Try export without filters

---

## FAQ

### General Questions

**Q: How long do sessions last?**
A: Sessions last 12 hours from login or last activity. You'll be automatically logged out after this time.

**Q: Can I use the system on mobile devices?**
A: Yes, the interface is responsive and works on tablets and smartphones.

**Q: How often is data updated?**
A: Data updates in real-time. When someone makes changes, they're immediately visible to all users.

### Request Management

**Q: Can I delete a request I created?**
A: No, requests cannot be deleted once created. Contact a superadmin if deletion is absolutely necessary.

**Q: What happens if I select the wrong environment?**
A: You can edit your request if status is "Open" or "Pending". If status is "In Progress" or "Completed", contact an admin.

**Q: How do I know when my request is complete?**
A: Monitor the status field. When it changes to "Completed", your deployment is finished.

**Q: Can I create requests for other team members?**
A: Yes, but the request will show your username as the creator. Consider having team members create their own requests.

### Roles & Permissions

**Q: Why can't I edit this request?**
A: Check the request status and creator. Developers can only edit their own requests when status is "Open" or "Pending".

**Q: Who can mark requests as production ready?**
A: Only the original requester (developer who created it) or a superadmin, and only when status is "Completed".

**Q: Why don't I see the "New Request" button?**
A: Only developers and superadmins can create requests. Admins cannot create new requests.

**Q: Can I change my role?**
A: No, roles are assigned by system administrators and cannot be self-modified.

### Technical Questions

**Q: What browsers are supported?**
A: Modern browsers including Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.

**Q: Why are some fields read-only?**
A: Field editability depends on your role and the request status. See the role-specific guides for details.

**Q: How do I report a bug or request a feature?**
A: Contact your system administrator with detailed information about the issue or requested feature.

**Q: Is my data saved automatically?**
A: No, you must click "Update" or "Save Changes" buttons to save modifications. Look for "unsaved changes" indicators.

### Data & Export

**Q: What data is included in CSV exports?**
A: All request fields, RLM IDs, timestamps, and metadata. The export includes everything visible in the interface.

**Q: Can I schedule automatic exports?**
A: No, exports are manual only. You need to initiate each export through the interface.

**Q: How far back does the data go?**
A: The system contains sample data going back several months. In production, it will contain all historical data.

**Q: Can I import data from other systems?**
A: No, the system doesn't support data import. All data must be entered through the interface or API.

This user guide covers all aspects of using the Deployment Portal. For additional support, contact your system administrator.
