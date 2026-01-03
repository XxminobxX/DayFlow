# Dayflow HRMS - Backend API

Human Resource Management System built with Node.js, Express, and PostgreSQL.

## Quick Start

### Prerequisites
- Node.js & npm
- PostgreSQL running locally
- Database: `dayflow_db`

### Setup (2 minutes)

```bash
cd backend
npm install
npm run dev
```

**API Server**: `http://localhost:5000`  
**Health Check**: `http://localhost:5000/health`  
**Database UI**: `http://localhost:5555` (run `npx prisma studio`)

### Environment Variables
`.env` file already configured with:
```
DATABASE_URL=postgresql://postgres:database1000@localhost:5432/dayflow_db
PORT=5000
NODE_ENV=development
```

**Database Credentials:**
- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `database1000`
- Database: `dayflow_db`

## Database

**PostgreSQL** with **Prisma ORM v5.8.0**

### 4 Tables:
- **Employee** - Employee profiles with role-based access (ADMIN/EMPLOYEE)
- **Attendance** - Daily attendance tracking
- **LeaveRequest** - Leave applications & approvals (PENDING/APPROVED/REJECTED)
- **Payroll** - Salary & payment records

### Sample Data (Pre-seeded):
**Employees:**
- Admin: UID `admin-firebase-uid-001` (John Admin)
- Employee 1: UID `employee-firebase-uid-001` (Alice Johnson)
- Employee 2: UID `employee-firebase-uid-002` (Bob Smith)

**Attendance Records:** 8 sample records (various statuses: PRESENT, ABSENT, HALF_DAY, LEAVE)

**Leave Requests:** 3 records (1 PENDING, 1 APPROVED, 1 REJECTED)

**Payroll Records:** 2 salary records with breakdown

### View Database:
```bash
npx prisma studio
# Opens UI at http://localhost:5555
```
Judges can browse all tables and records directly.

## API Endpoints (28+)

**Base URL:** `http://localhost:5000/api`

### Health Check
- `GET http://localhost:5000/health` - Server status

### Employee Management (5 endpoints)
- `GET /employees/me` - Get my profile
- `PUT /employees/me` - Update my profile
- `GET /employees` - List all employees (Admin only)
- `GET /employees/:id` - Get employee by ID (Admin only)
- `PUT /employees/:id` - Update employee (Admin only)

### Attendance Management (5 endpoints)
- `GET /attendance/me` - Get my attendance
- `GET /attendance` - List all attendance (Admin only)
- `POST /attendance` - Mark attendance
- `PUT /attendance/:id` - Update attendance (Admin only)
- `GET /attendance/summary/monthly` - Get monthly summary

### Leave Management (5 endpoints)
- `GET /leaves/me` - Get my leaves
- `POST /leaves` - Apply for leave
- `GET /leaves` - List all leave requests (Admin only)
- `PUT /leaves/:id` - Approve/reject leave (Admin only)
- `GET /leaves/stats/summary` - Get leave statistics

### Payroll Management (5 endpoints)
- `GET /payroll/me` - Get my payroll
- `GET /payroll` - List all payroll (Admin only)
- `POST /payroll` - Create payroll (Admin only)
- `PUT /payroll/:id` - Update payroll (Admin only)
- `GET /payroll/summary/current` - Get payroll summary

### Dashboard (2 endpoints)
- `GET /dashboard/employee` - Employee dashboard
- `GET /dashboard/admin` - Admin dashboard

### Authentication
**Development Mode:** Add header to all requests:
```
X-Firebase-UID: admin-firebase-uid-001
```
or
```
X-Firebase-UID: employee-firebase-uid-001
```

**Test Credentials:**
- Admin UID: `admin-firebase-uid-001`
- Employee 1 UID: `employee-firebase-uid-001`
- Employee 2 UID: `employee-firebase-uid-002`

**Role-Based Access:**
- Admin can: view all records, approve leaves, manage payroll
- Employee can: view own records, apply leaves, view dashboard

## Quick Commands for Testing

```bash
# 1. Start Backend Server
npm run dev
# Server runs at http://localhost:5000

# 2. View & Test Database
npx prisma studio
# Opens database UI at http://localhost:5555

# 3. Reseed Database (if needed)
npm run seed

# 4. Database Migrations
npx prisma migrate dev
```

## How to Test APIs

1. **Start Backend:** `npm run dev`
2. **Open Postman** and import `Dayflow_HRMS_API.postman_collection.json`
3. **Add Header** to all requests: `X-Firebase-UID: admin-firebase-uid-001`
4. **Test Endpoints** using the URLs listed above

Example Test Request:
```
GET http://localhost:5000/api/employees/me
Header: X-Firebase-UID: employee-firebase-uid-001
```

Expected Response:
```json
{
  "id": "uuid",
  "firebaseUid": "employee-firebase-uid-001",
  "name": "Alice Johnson",
  "email": "alice@dayflow.com",
  "role": "EMPLOYEE",
  "position": "Software Developer"
}
```

## Project Architecture

### Folder Structure
```
backend/
├── src/
│   ├── controllers/          # 5 Controllers (23 methods, business logic)
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   └── dashboardController.js
│   ├── routes/               # 5 Routes (28+ endpoints)
│   │   ├── employees.js
│   │   ├── attendance.js
│   │   ├── leaves.js
│   │   ├── payroll.js
│   │   └── dashboard.js
│   ├── middleware/           # Authentication & Authorization
│   │   ├── firebaseAuth.js   # Firebase token verification
│   │   ├── role.js           # Role-based access control
│   │   └── devAuth.js        # Development auth (X-Firebase-UID header)
│   ├── app.js                # Express app configuration
│   └── index.js              # Server entry point
├── prisma/
│   ├── schema.prisma         # Database schema (4 models)
│   ├── seed.js               # Sample data generation
│   └── migrations/           # SQL migrations
├── .env                      # Environment variables (configured)
├── package.json              # Dependencies
└── README.md                 # This file
```

### Data Flow
```
Request → devAuth/firebaseAuth Middleware → roleMiddleware 
→ Controller Logic → Prisma ORM → PostgreSQL → Response
```

### Database Schema (Prisma)
```
Employee (4 fields + relations)
├── id (UUID)
├── firebaseUid (String, unique)
├── name, email, role
└── Relations: attendance, leaveRequests, payroll

Attendance (5 fields)
├── id (UUID)
├── employeeId (FK)
├── date, status, notes
└── Unique: (employeeId, date)

LeaveRequest (7 fields)
├── id (UUID)
├── employeeId, approvedById (FK)
├── startDate, endDate, leaveType, status
└── Unique: (employeeId, startDate, endDate)

Payroll (7 fields)
├── id (UUID)
├── employeeId (FK)
├── month, year, baseSalary, allowances, deductions, netSalary
└── Unique: (employeeId, month, year)
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma v5.8.0
- **Auth**: Firebase (development mode support)