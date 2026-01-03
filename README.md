# DayFlow HRMS

**DayFlow** - A modern, production-ready Human Resource Management System built with React, Node.js, Firebase, and PostgreSQL.

## 🎯 Overview

DayFlow is a complete HRMS solution featuring:

- **Employee Management**: Create and manage employee records
- **Attendance Tracking**: Track employee attendance with check-in/out
- **Leave Management**: Apply for and approve leaves
- **Payroll Management**: Manage salary and payment records
- **Role-Based Access**: Separate dashboards for Admins and Employees
- **Firebase Authentication**: Secure email/password based authentication
- **Modern UI**: Clean, responsive React-based interface

## 🏗️ Architecture

### Tech Stack

**Backend**:
- Node.js + Express.js
- PostgreSQL with Prisma ORM
- Firebase Admin SDK
- REST API with role-based access control

**Frontend**:
- React 18 with React Router
- Firebase SDK for authentication
- Axios for API calls
- Vite for fast development

**Database**:
- PostgreSQL
- 4 main tables: Employees, Attendance, LeaveRequests, Payroll

### System Architecture

```
┌─────────────────────────────────────┐
│      Frontend (React)                │
│  - Login (Firebase Auth)             │
│  - Admin Dashboard                   │
│  - Employee Dashboard                │
│  - API Integration                   │
└─────────────────┬───────────────────┘
                  │ HTTP/REST + JWT
┌─────────────────┴───────────────────┐
│      Backend (Express.js)            │
│  - REST API Endpoints                │
│  - Firebase Token Verification       │
│  - Role-Based Authorization          │
│  - Database Operations               │
└─────────────────┬───────────────────┘
                  │ SQL
┌─────────────────┴───────────────────┐
│    PostgreSQL Database              │
│  - Employees                         │
│  - Attendance                        │
│  - Leave Requests                    │
│  - Payroll                           │
└──────────────────────────────────────┘
```

## 📁 Project Structure

```
DayFlow/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth & role middleware
│   │   ├── app.js            # Express app setup
│   │   └── index.js          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Database migrations
│   │   └── seed.js           # Sample data
│   ├── .env.example          # Environment template
│   ├── .gitignore            # Git ignore rules
│   ├── package.json          # Dependencies
│   └── README.md             # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── context/          # Auth context
│   │   ├── services/         # API services
│   │   ├── styles/           # CSS files
│   │   ├── App.jsx           # Main app
│   │   ├── firebase.js       # Firebase init
│   │   └── main.jsx          # Entry point
│   ├── .env.example          # Environment template
│   ├── .gitignore            # Git ignore rules
│   ├── index.html            # HTML template
│   ├── vite.config.js        # Vite config
│   ├── package.json          # Dependencies
│   └── README.md             # Frontend documentation
│
├── SETUP.md                  # Complete setup guide
├── API.md                    # API documentation
├── README.md                 # This file
└── .gitignore                # Root git ignore
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Firebase Account
- Git

### Installation

1. **Clone Repository**

```bash
git clone https://github.com/XxminobxX/DayFlow.git
cd DayFlow
```

2. **Backend Setup**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and Firebase credentials
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

3. **Frontend Setup** (in new terminal)

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

4. **Access System**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## 🔐 Key Security Features

✅ **No Self-Registration**: Only admins can create employee accounts
✅ **Firebase Auth**: Secure authentication without password storage
✅ **Server-Side Authorization**: All role checks enforced on backend
✅ **System-Generated IDs**: Employee IDs are read-only
✅ **CORS Protected**: Only whitelisted origins can access API
✅ **Environment Secrets**: All credentials in `.env` (never committed)
✅ **Token Verification**: Firebase ID tokens verified for every request

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and deployment guide
- **[API.md](./API.md)** - REST API reference
- **[backend/README.md](./backend/README.md)** - Backend documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend documentation

## 🧪 Testing

### Test Credentials

Admin User:
- Email: `admin@example.com`
- Password: (Set during setup)

Employee User (create via admin panel):
- Email: (as set by admin)
- Password: (temporary, generated by system)

### Test Scenarios

1. **Admin Login** → Create Employee → Generate Firebase User
2. **Employee Login** → View Dashboard → Apply Leave
3. **Admin Approval** → Approve/Reject Leave Requests
4. **Attendance** → Mark attendance, view records
5. **Payroll** → View salary information

## 🌐 Deployment

### Backend Deployment Options

- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

### Frontend Deployment Options

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

See [SETUP.md](./SETUP.md#deployment) for detailed deployment instructions.

## 📊 Database Schema

### Employees Table
```
- id (System-generated: EMP-YYYY-0001)
- firebaseUid (Firebase authentication UID)
- email (Unique)
- firstName, lastName
- phone, position, department
- role (ADMIN | EMPLOYEE)
- dateOfBirth, address
```

### Attendance Table
```
- id
- employeeId (FK)
- date (Unique per employee)
- status (PRESENT | ABSENT | HALF_DAY | LEAVE)
- checkInTime, checkOutTime
- remarks
```

### LeaveRequests Table
```
- id
- employeeId (FK)
- leaveType (PAID | SICK | UNPAID)
- startDate, endDate, numberOfDays
- reason, remarks
- status (PENDING | APPROVED | REJECTED)
- approvedById (FK to employee), approvalDate
```

### Payroll Table
```
- id
- employeeId (FK)
- month, year (Unique combination)
- baseSalary, allowances, deductions
- netSalary
```

## 🔄 API Flow

### Login Flow
```
User Email/Password
    ↓
Firebase Auth
    ↓
Firebase ID Token
    ↓
Store in localStorage
    ↓
Fetch User Profile (GET /employees/me)
    ↓
Display Dashboard (Admin or Employee based on role)
```

### Employee Creation Flow
```
Admin Form
    ↓
Validate Input
    ↓
Create Firebase User (admin.auth().createUser())
    ↓
Create Database Record with firebaseUid
    ↓
Generate Temporary Password
    ↓
Return Credentials to Admin
```

## 🛠️ Development

### Available Scripts

**Backend**:
```bash
npm run dev              # Development with nodemon
npm start                # Production
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed sample data
npm run prisma:studio    # Open Prisma Studio
```

**Frontend**:
```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in `.env`
   - Run migrations: `npm run prisma:migrate`

2. **Firebase Auth Error**
   - Verify Firebase credentials in `.env`
   - Check Email/Password provider is enabled
   - Service account JSON exists at correct path

3. **Frontend Can't Connect to Backend**
   - Backend must be running on port 5000
   - Check REACT_APP_API_BASE_URL in frontend `.env`
   - CORS must be enabled in backend

See [SETUP.md](./SETUP.md#troubleshooting) for detailed troubleshooting.

## 📝 License

Proprietary - DayFlow HRMS

## 👥 Authors

Developed by the DayFlow Team

## 📞 Support

For issues, questions, or suggestions, please contact the development team.

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: January 2026

## Checklist for Production Deployment

- [ ] Firebase project created and configured
- [ ] PostgreSQL database hosted and configured
- [ ] Environment variables set on hosting provider
- [ ] HTTPS/SSL enabled
- [ ] CORS origins configured for production domain
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Monitoring and alerts set up
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Documentation reviewed
- [ ] Team trained on system

---

**Ready to deploy?** Follow the [SETUP.md](./SETUP.md) guide for complete instructions.
