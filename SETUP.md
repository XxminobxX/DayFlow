# DayFlow HRMS - Complete Setup Guide

Complete step-by-step guide to set up and run the DayFlow Human Resource Management System locally or in production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Firebase Configuration](#firebase-configuration)
5. [Database Setup](#database-setup)
6. [Running Locally](#running-locally)
7. [Testing the System](#testing-the-system)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have installed:

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Firebase Account** ([Create Free Account](https://firebase.google.com/))
- A code editor (VS Code recommended)

Verify installations:

```bash
node --version    # Should be v16+
npm --version     # Should be v8+
psql --version    # Should be v12+
git --version     # Should be v2+
```

## Backend Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/XxminobxX/DayFlow.git
cd DayFlow
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/dayflow_db"

# Server
PORT=5000
NODE_ENV=development

# CORS Origins (for frontend communication)
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account.json"

# JWT (optional)
JWT_SECRET=your_secret_jwt_key_here
```

**Important**: Replace database credentials with your PostgreSQL username and password.

### Step 4: Get Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Settings (⚙️) → Service Accounts
3. Click "Generate New Private Key"
4. Save the JSON file as `backend/firebase-service-account.json`

**⚠️ SECURITY**: This file contains secrets. Add to `.gitignore` (already configured).

### Step 5: Set Up Database

Start PostgreSQL and create the database:

```bash
# Linux/Mac
psql -U postgres
# Windows (in PostgreSQL terminal)
```

In the PostgreSQL terminal:

```sql
CREATE DATABASE dayflow_db;
\q
```

### Step 6: Run Database Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with sample data
npm run prisma:seed
```

### Step 7: Start Backend Server

```bash
npm run dev
```

Expected output:
```
✅ Backend server running on port 5000
📦 Database connected successfully
```

Test the backend:
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","message":"Dayflow Backend is running"}
```

## Frontend Setup

### Step 1: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with Firebase credentials:

```env
# Get these from Firebase Console → Project Settings
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Backend API
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Dev mode (optional)
REACT_APP_USE_DEV_AUTH=false
```

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in XXX ms
➜  Local:   http://localhost:5000
➜  press h to show help
```

The frontend will open at `http://localhost:3000`

## Firebase Configuration

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Enter "DayFlow" as project name
4. Enable Google Analytics (optional)
5. Create project

### Enable Authentication

1. In Firebase Console → Authentication
2. Click "Get Started"
3. Enable **Email/Password** provider
4. Do NOT enable other providers
5. Set password requirements:
   - Minimum length: 8 characters
   - Require uppercase, numbers, special characters

### Get Firebase Credentials

1. Project Settings (⚙️) → General tab
2. Under "Your apps" section, copy the config values
3. Use these values in frontend `.env` file

### Create Test Admin User (Optional)

For testing, create an admin user directly in Firebase:

1. Firebase Console → Authentication → Users
2. Click "Add User"
3. Email: `admin@example.com`
4. Password: (create strong password)
5. Then create this user in the database via backend admin endpoint

## Database Setup

### Database Schema Overview

The system uses 4 main tables:

**Employees**
- id: System-generated (EMP-YYYY-0001)
- firebaseUid: Firebase authentication UID
- email, firstName, lastName
- phone, position, department
- role: ADMIN or EMPLOYEE

**Attendance**
- id, employeeId
- date (unique per employee)
- status: PRESENT, ABSENT, HALF_DAY, LEAVE
- checkInTime, checkOutTime

**LeaveRequests**
- id, employeeId
- startDate, endDate, numberOfDays
- leaveType: PAID, SICK, UNPAID
- status: PENDING, APPROVED, REJECTED

**Payroll**
- id, employeeId
- month, year (unique combination)
- baseSalary, allowances, deductions
- netSalary

## Running Locally

### Terminal 1: Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Access the System

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## Testing the System

### Test Admin User

Email: `admin@example.com`
Password: (set during Firebase user creation)
Role: ADMIN

### Test Employee User

Email: `employee@example.com`
Password: (set during admin creation via backend)
Role: EMPLOYEE

### Test Flow: Create Employee

1. Log in as admin
2. Go to "Employees" tab
3. Click "+ Create Employee"
4. Fill in details:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@company.com
   - Phone: +1234567890
   - Position: Software Engineer
   - Department: Engineering
5. Click "Create Employee & Generate Credentials"
6. Copy the temporary password
7. Log out and test login with new email/password

### Test Flow: Apply for Leave

1. Log in as employee
2. Go to "Leaves" tab
3. Click "Apply for Leave"
4. Fill details:
   - Leave Type: Paid Leave
   - Start Date: Select date
   - End Date: Select date
   - Reason: Annual vacation
5. Submit

### Test Flow: Approve Leave

1. Log in as admin
2. Go to "Leave Approvals" tab
3. Find pending leave request
4. Click "Approve" or "Reject"

## Deployment

### Deploy Backend

#### Using Heroku

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

cd backend

# Login to Heroku
heroku login

# Create new app
heroku create dayflow-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN="your-frontend-domain.com"
# Add Firebase service account JSON as variable

# Deploy
git push heroku main
```

#### Using DigitalOcean App Platform

1. Push code to GitHub
2. Go to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform/)
3. Create new app from GitHub repo
4. Configure environment variables
5. Deploy

### Deploy Frontend

#### Using Vercel

```bash
# Install Vercel CLI
npm install -g vercel

cd frontend

# Deploy
vercel
```

#### Using Netlify

```bash
cd frontend

# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir dist
```

#### Using GitHub Pages

```bash
cd frontend
npm run build

# Configure GitHub Pages in repository settings
# Point to /dist folder
```

## Troubleshooting

### Backend Won't Start

```bash
# Check if port 5000 is in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process and restart
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
psql -U postgres

# Check DATABASE_URL in .env is correct
# Format: postgresql://user:password@localhost:5432/database_name
```

### Firebase Authentication Fails

```bash
# Verify:
1. Service account JSON is in correct location
2. Firebase credentials are correct in frontend .env
3. Firebase project is active
4. Email/Password provider is enabled
```

### Frontend Can't Connect to Backend

```bash
# Check:
1. Backend is running on http://localhost:5000
2. REACT_APP_API_BASE_URL in frontend .env is correct
3. CORS is enabled in backend
4. Browser console for network errors
```

### Blank Screen or "Loading..." Stuck

```bash
# Clear cache and reload
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
2. Clear browser cache: DevTools → Application → Clear Storage
3. Check browser console for errors (F12)
```

## Security Checklist

Before deploying to production:

- [ ] Remove all `.env` files from git repository
- [ ] Verify `.gitignore` includes `.env`, `node_modules`, `dist`
- [ ] Firebase service account JSON not committed
- [ ] All secrets in environment variables only
- [ ] CORS origins restricted to production domain
- [ ] Database uses strong password
- [ ] Backend runs in `production` mode
- [ ] Frontend API uses HTTPS
- [ ] Firebase security rules configured
- [ ] Database backups enabled
- [ ] Error logs configured
- [ ] Rate limiting implemented

## Support & Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](./backend/README.md#api-endpoints)
- [Firebase Docs](https://firebase.google.com/docs)
- [Prisma Docs](https://www.prisma.io/docs/)

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready
