# DayFlow HRMS - Frontend

Modern React-based frontend for the DayFlow Human Resource Management System.

## 🎯 Features

- ✅ Firebase Authentication (Email/Password only)
- ✅ Role-Based Access Control (Admin & Employee dashboards)
- ✅ Employee Management (Create employees - Admin only)
- ✅ Attendance Tracking
- ✅ Leave Management (Apply, Track, Approve)
- ✅ Payroll View (Read-only for employees)
- ✅ Admin Dashboard with KPIs
- ✅ Employee Dashboard with personal metrics

## 🔒 Security Features

- **No Self-Registration**: Employees cannot create their own accounts. Only HR/Admin can create employees.
- **Firebase Auth Only**: Frontend authenticates exclusively through Firebase (no password storage on frontend).
- **Backend Trust**: Backend verifies Firebase ID tokens and enforces role-based access control.
- **System-Generated IDs**: Employee IDs are system-generated and read-only in the UI.
- **Token Management**: Firebase ID tokens are securely attached to all API requests.

## 📋 Prerequisites

- Node.js 16+ and npm or yarn
- Firebase project account
- Backend server running on http://localhost:5000/api
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

### 1. Clone and Install

```bash
cd frontend
npm install
```

### 2. Configure Firebase

Create a `.env` file in the `frontend` folder with your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase project credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will open at `http://localhost:3000`

## 📝 Development

### Running in Dev Mode

For development without Firebase tokens, enable dev auth:

```env
REACT_APP_USE_DEV_AUTH=true
REACT_APP_DEV_FIREBASE_UID=dev-user-123
```

The backend will recognize the `X-Firebase-UID` header in development mode.

### Build for Production

```bash
npm run build
```

Outputs to `dist/` folder - ready to deploy to any static hosting service.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components (Login, Dashboards)
│   ├── context/           # React Context (Auth)
│   ├── services/          # API service functions
│   ├── styles/            # CSS files
│   ├── App.jsx            # Main app component
│   ├── firebase.js        # Firebase initialization
│   ├── firebaseConfig.js  # Firebase configuration
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔑 Authentication Flow

### Employee Login Flow

1. Employee enters email and password
2. Firebase authenticates via `signInWithEmailAndPassword()`
3. Firebase returns ID token
4. Frontend stores token in `localStorage`
5. Frontend fetches user profile from backend (`GET /api/employees/me`)
6. Token is included in all subsequent API requests via `Authorization: Bearer <token>`

### Admin Employee Creation Flow

1. Admin fills in employee details (form validates)
2. Admin clicks "Create Employee"
3. Backend:
   - Validates all required fields
   - Creates Firebase user via `admin.auth().createUser()`
   - Generates temporary password
   - Stores employee record in database with firebaseUid
   - Returns Employee ID and temporary password
4. Admin securely shares credentials with new employee
5. Employee logs in with their email and temporary password
6. Employee must change password on first login (Firebase feature)

## 📡 API Integration

### Interceptors

All API requests automatically include Firebase ID token:

```javascript
// Automatically added to all requests
Authorization: Bearer <firebase-id-token>

// In development (dev auth mode)
X-Firebase-UID: dev-user-123
```

### Error Handling

- **401 Unauthorized**: Token expired or invalid → User redirected to login
- **403 Forbidden**: User lacks permission for endpoint → Error message displayed
- **500 Server Error**: Backend error → Error message displayed

## 👤 User Roles

### Employee
- View own profile
- Check attendance
- Apply for leaves
- View leave status
- View own payroll (read-only)
- Track leave balance

### Admin
- View all employees
- Create new employees (generates Firebase users)
- View all attendance records
- Approve/Reject leave requests
- Manage payroll
- View admin dashboard with KPIs

## 🎨 UI/UX

- Clean, modern design with Lucide icons
- Responsive layout for desktop and mobile
- Glass-morphism inspired UI
- Dark theme support ready
- Smooth transitions and animations

## 🛠️ Technologies

- **React 18**: UI framework
- **React Router v6**: Client-side routing
- **Firebase SDK**: Authentication
- **Axios**: HTTP client
- **Lucide React**: Icon library
- **Vite**: Build tool and dev server
- **CSS3**: Styling

## ⚠️ Important Notes

1. **No Self-Registration**: The UI doesn't have a signup page. Only admins can create employees.
2. **Temporary Passwords**: Employees receive temporary passwords from admin. They must change on first login.
3. **Read-Only Employee ID**: Employee IDs are system-generated and cannot be changed.
4. **Backend Trust Model**: All authorization is enforced server-side. Never trust frontend claims.
5. **Environment Variables**: Never commit `.env` file to version control. Use `.env.example` template.

## 🚨 Troubleshooting

### "Failed to load profile after login"
- Check backend is running on correct port (5000)
- Verify `REACT_APP_API_BASE_URL` matches backend URL
- Check network tab in browser DevTools

### "Firebase initialization failed"
- Verify all Firebase credentials in `.env` are correct
- Firebase SDK might not be loading - check browser console
- Clear browser cache and reload

### "Employee ID not showing"
- Ensure user profile is fully loaded from backend
- Check network request to `GET /api/employees/me`

## 📦 Deployment

### Using Vercel

```bash
npm install -g vercel
vercel
```

### Using Netlify

```bash
npm run build
netlify deploy --prod --dir dist
```

### Using any static hosting

1. Build the project: `npm run build`
2. Upload `dist/` folder to your hosting service
3. Configure environment variables in hosting provider
4. Point domain to deployment

## 📄 License

Proprietary - DayFlow HRMS

## 👥 Support

For issues or questions, contact the development team.

---

**Last Updated**: January 2026
**Status**: Production Ready
