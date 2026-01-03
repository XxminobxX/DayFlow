# DayFlow HRMS - API Documentation

Complete REST API reference for the DayFlow backend.

## Authentication

All API endpoints (except `/health`) require authentication via Firebase ID token.

### Headers

```
Authorization: Bearer <firebase-id-token>

# Or in development mode:
X-Firebase-UID: <dev-user-id>
```

### Getting Firebase ID Token

From the frontend (handled automatically by axios interceptor):

```javascript
const token = await auth.currentUser.getIdToken();
localStorage.setItem('firebaseIdToken', token);
// Token automatically added to all requests
```

### Unauthorized Response

```json
{
  "error": "Unauthorized"
}
```

Status: 401

## Base URL

```
http://localhost:5000/api
```

## Employee Endpoints

### Get Current User Profile

```
GET /employees/me
```

**Auth**: Required

**Response**: 200 OK

```json
{
  "id": "EMP-2026-0001",
  "firebaseUid": "firebase-uid-string",
  "email": "employee@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "position": "Software Engineer",
  "department": "Engineering",
  "role": "EMPLOYEE",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St",
  "createdAt": "2026-01-10T10:30:00Z",
  "attendance": [
    {
      "id": "att-123",
      "date": "2026-01-10",
      "status": "PRESENT",
      "checkInTime": "09:00 AM",
      "checkOutTime": "06:00 PM"
    }
  ]
}
```

### Update User Profile

```
PUT /employees/me
```

**Auth**: Required

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St"
}
```

**Response**: 200 OK

### Get All Employees

```
GET /employees
```

**Auth**: Required (Admin only)

**Response**: 200 OK - Array of employees

### Create New Employee

```
POST /employees
```

**Auth**: Required (Admin only)

**Request Body**:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1987654321",
  "position": "HR Manager",
  "department": "Human Resources",
  "dateOfBirth": "1995-05-20",
  "address": "456 Oak Ave"
}
```

**Response**: 201 Created

```json
{
  "message": "Employee created successfully",
  "employee": {
    "employeeId": "EMP-2026-0002",
    "firebaseUid": "firebase-uid-new-user",
    "email": "jane.smith@company.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "position": "HR Manager"
  },
  "credentials": {
    "temporaryPassword": "TempPass123!@#",
    "note": "Employee must change password on first login. Share this securely with the employee."
  }
}
```

### Get Employee By ID

```
GET /employees/:id
```

**Auth**: Required (Admin only)

**Response**: 200 OK - Employee object

### Update Employee

```
PUT /employees/:id
```

**Auth**: Required (Admin only)

**Request Body**: Same as profile update

**Response**: 200 OK

## Attendance Endpoints

### Get My Attendance

```
GET /attendance/my
```

**Auth**: Required

**Query Parameters**:
- `month` (optional): 1-12
- `year` (optional): 2026

**Response**: 200 OK - Array of attendance records

```json
[
  {
    "id": "att-123",
    "employeeId": "EMP-2026-0001",
    "date": "2026-01-10",
    "status": "PRESENT",
    "checkInTime": "09:00 AM",
    "checkOutTime": "06:00 PM",
    "remarks": "Working on API development"
  }
]
```

### Get All Attendance

```
GET /attendance
```

**Auth**: Required (Admin only)

**Query Parameters**:
- `employeeId` (optional): Filter by employee
- `month` (optional): 1-12
- `year` (optional): 2026

**Response**: 200 OK - Array of all attendance records

### Mark Attendance

```
POST /attendance/mark
```

**Auth**: Required

**Request Body**:

```json
{
  "status": "PRESENT",
  "checkInTime": "09:00 AM",
  "checkOutTime": "06:00 PM",
  "remarks": "Regular working day"
}
```

**Status Values**: `PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`

**Response**: 200 OK

### Update Attendance

```
PUT /attendance/:id
```

**Auth**: Required (Admin only)

**Request Body**: Same as mark attendance

**Response**: 200 OK

### Get Attendance Summary

```
GET /attendance/summary/my
```

**Auth**: Required

**Response**: 200 OK

```json
{
  "totalPresent": 18,
  "totalAbsent": 2,
  "totalLeave": 4,
  "totalHalfDay": 1,
  "attendancePercentage": 85.7
}
```

## Leave Endpoints

### Get My Leaves

```
GET /leaves/my
```

**Auth**: Required

**Query Parameters**:
- `status` (optional): `PENDING`, `APPROVED`, `REJECTED`

**Response**: 200 OK - Array of leave requests

```json
[
  {
    "id": "leave-123",
    "employeeId": "EMP-2026-0001",
    "leaveType": "PAID",
    "startDate": "2026-02-01",
    "endDate": "2026-02-05",
    "numberOfDays": 5,
    "reason": "Annual vacation",
    "remarks": null,
    "status": "PENDING",
    "createdAt": "2026-01-10T10:30:00Z",
    "approvedById": null,
    "approvalDate": null,
    "approvalComments": null
  }
]
```

### Apply for Leave

```
POST /leaves
```

**Auth**: Required

**Request Body**:

```json
{
  "leaveType": "PAID",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "numberOfDays": 5,
  "reason": "Annual vacation",
  "remarks": "Planned family trip"
}
```

**Leave Types**: `PAID`, `SICK`, `UNPAID`

**Response**: 201 Created

### Get All Leaves

```
GET /leaves
```

**Auth**: Required (Admin only)

**Query Parameters**:
- `status` (optional): `PENDING`, `APPROVED`, `REJECTED`
- `employeeId` (optional): Filter by employee

**Response**: 200 OK - Array of leave requests with employee info

### Update Leave Status

```
PUT /leaves/:id
```

**Auth**: Required (Admin only)

**Request Body**:

```json
{
  "status": "APPROVED",
  "approvalComments": "Approved as per policy"
}
```

**Status Values**: `APPROVED`, `REJECTED`

**Response**: 200 OK

```json
{
  "message": "Leave request approved successfully",
  "leave": {
    "id": "leave-123",
    "status": "APPROVED",
    "approvalDate": "2026-01-10T14:30:00Z",
    "approvalComments": "Approved as per policy"
  }
}
```

### Get Leave Statistics

```
GET /leaves/stats/my
```

**Auth**: Required

**Response**: 200 OK

```json
{
  "pending": 2,
  "approved": 5,
  "rejected": 1,
  "total": 8,
  "approvedDays": 15
}
```

## Payroll Endpoints

### Get My Payroll

```
GET /payroll/my
```

**Auth**: Required (Employees see own only)

**Response**: 200 OK - Array of payroll records (read-only)

```json
[
  {
    "id": "pay-123",
    "employeeId": "EMP-2026-0001",
    "month": 1,
    "year": 2026,
    "baseSalary": 50000,
    "allowances": 5000,
    "deductions": 8000,
    "netSalary": 47000
  }
]
```

### Get All Payroll

```
GET /payroll
```

**Auth**: Required (Admin only)

**Response**: 200 OK - Array of all payroll records

### Create Payroll

```
POST /payroll
```

**Auth**: Required (Admin only)

**Request Body**:

```json
{
  "employeeId": "EMP-2026-0001",
  "month": 1,
  "year": 2026,
  "baseSalary": 50000,
  "allowances": 5000,
  "deductions": 8000,
  "netSalary": 47000
}
```

**Response**: 201 Created

### Update Payroll

```
PUT /payroll/:id
```

**Auth**: Required (Admin only)

**Request Body**: Same as create payroll

**Response**: 200 OK

### Get Payroll Summary

```
GET /payroll/summary/my
```

**Auth**: Required

**Response**: 200 OK

```json
{
  "totalEarnings": 47000,
  "totalDeductions": 8000,
  "lastPaymentDate": "2026-01-05",
  "nextPaymentDate": "2026-02-05"
}
```

## Dashboard Endpoints

### Get Employee Dashboard

```
GET /dashboard/employee
```

**Auth**: Required

**Response**: 200 OK

```json
{
  "attendanceThisMonth": 18,
  "leaveBalance": 8,
  "lastSalary": 47000,
  "pendingLeaves": 2
}
```

### Get Admin Dashboard

```
GET /dashboard/admin
```

**Auth**: Required (Admin only)

**Response**: 200 OK

```json
{
  "totalEmployees": 25,
  "pendingApprovals": 3,
  "presentToday": 22,
  "absentToday": 2,
  "onLeaveToday": 1
}
```

## Health Check

```
GET /health
```

**Auth**: Not required

**Response**: 200 OK

```json
{
  "status": "ok",
  "message": "Dayflow Backend is running"
}
```

## Error Responses

### 400 Bad Request

Missing or invalid required fields

```json
{
  "error": "Missing required fields: firstName, lastName, email"
}
```

### 401 Unauthorized

Invalid or missing authentication token

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

User lacks permission for the endpoint

```json
{
  "error": "Only admins can create employees"
}
```

### 404 Not Found

Resource not found

```json
{
  "error": "Employee not found"
}
```

### 409 Conflict

Resource already exists (e.g., duplicate email)

```json
{
  "error": "Email already exists"
}
```

### 500 Internal Server Error

Server error

```json
{
  "error": "Failed to create employee: [error message]"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 500  | Server Error - Internal server error |

## Rate Limiting

Not currently implemented. Implement before production deployment.

## CORS

Frontend origins allowed:
- `http://localhost:3000` (development)
- `http://localhost:5173` (Vite development)
- Configure `CORS_ORIGIN` in `.env` for production

## Pagination

Not currently implemented. Add for large datasets:

```
GET /employees?page=1&limit=20
```

---

**API Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready
