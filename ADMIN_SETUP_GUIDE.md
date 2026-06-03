# 🚀 Complete Setup Guide - Admin Panel & Real-time Sync

This guide will walk you through setting up and running the complete admin system with real-time pickup confirmation synchronization.

## 📊 System Architecture

```
Frontend App (Expo) ──┐
                       ├─→ Backend (Node.js)  ←─→ Admin Panel (React)
Users get notified ←──┘
```

## ✅ What Was Added

### Backend Updates
- ✅ Pickup management endpoints (`/api/admin/pickups/*`)
- ✅ Status update API with push notifications
- ✅ Real-time sync between admin and frontend

### Admin Panel Features
- ✅ Dashboard with live statistics
- ✅ Pickup list view with filters
- ✅ Pickup detail modal
- ✅ One-click acceptance
- ✅ Status management (pending → accepted → completed → cancelled)
- ✅ Push notifications to users

## 🔧 Installation Steps

### Step 1: Backend Setup (Already Done!)

The backend has been updated with:
- New endpoints in `src/controllers/adminController.js`
- New routes in `src/routes/adminRoutes.js`

To verify backend is working:
```bash
cd Scrap-backend
npm start
# Should run on http://localhost:5000
```

### Step 2: Admin Panel Setup

```bash
cd Scrap-admin

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm run dev
```

Admin panel will be at: **http://localhost:3001**

### Step 3: Frontend App (No Changes Needed!)

The frontend app will automatically work because:
- ✅ It already polls for pickup updates
- ✅ Backend sends push notifications
- ✅ Status updates come through existing API

## 🎯 How Real-time Sync Works

### Scenario: Admin Confirms a Pickup

**Step 1:** Admin opens admin panel
```
GET /api/admin/pickups → Lists all pending pickups
```

**Step 2:** Admin clicks "Accept" button
```
PUT /api/admin/pickups/{id}/status
Body: { status: "accepted", adminNote: "..." }
```

**Step 3:** Backend updates database
```javascript
// In Database
Pickup.findByIdAndUpdate(id, { status: 'accepted' })
```

**Step 4:** Backend sends push notification
```javascript
// Sends Expo push notification to user
sendExpoPush(userPushToken, "Pickup Confirmed", "Your pickup has been accepted!", {...})
```

**Step 5:** User's phone app gets notification
```
📱 User sees: "Your pickup has been confirmed!"
```

**Step 6:** Frontend app updates status
```javascript
// When user opens app or API polls
GET /api/v1/pickups/{id}
Response: { status: "accepted", ... }

// UI shows: ✅ CONFIRMED
```

## 🧪 Testing the Complete Flow

### Test Setup:
1. **Terminal 1:** Start backend
   ```bash
   cd Scrap-backend
   npm start
   ```

2. **Terminal 2:** Start admin panel
   ```bash
   cd Scrap-admin
   npm install  # First time only
   npm run dev
   ```

3. **Terminal 3:** Start frontend (if testing with actual device)
   ```bash
   cd Scrap_frontend
   npm start
   ```

### Test Steps:
1. Create a pickup request from frontend app
2. Open admin panel at http://localhost:3001
3. Login with admin credentials
4. Click on the pending pickup
5. Click "Accept"
6. Check your frontend app - status should update!

## 📱 Admin Panel Features Explained

### Dashboard Tab
- Real-time statistics
- Pickup status breakdown
- User count
- Revenue tracking
- Auto-refreshes every 30 seconds

### Pickups Tab
- List all pickups with filtering
- Search by status (Pending, Accepted, Completed, Cancelled)
- Quick accept button
- View detailed pickup info
- Update status with notes
- See user details and contact info

### Users Tab
- View all registered users
- Contact information
- Join dates
- Quick email/call access

## 🔐 Setting Up Admin Credentials

To create an admin user, run:

```bash
cd Scrap-backend
node scripts/createAdmin.js
# Or manually:
node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@scrap.com',
    password: 'password123',
    phone: '9999999999',
    role: 'admin'
  });
  console.log('Admin created:', admin);
  process.exit(0);
}
createAdmin();
"
```

## 🔄 Auto-Refresh & Real-time Updates

### Admin Panel Refresh Rates:
- **Dashboard:** Every 30 seconds
- **Pickups List:** Every 20 seconds (can be manual)
- **Details Modal:** Manual refresh when you click View

### Frontend App Refresh:
- The app already polls for updates periodically
- Gets notified via push when admin confirms
- Status updates automatically

## 🌐 API Endpoints Used

### By Admin Panel:
```javascript
// Get all pickups
GET /api/admin/pickups?status=pending&page=1&limit=20

// Get pickup details
GET /api/admin/pickups/{id}

// Update status (MOST IMPORTANT!)
PUT /api/admin/pickups/{id}/status
{
  "status": "accepted|completed|cancelled",
  "adminNote": "Optional note"
}

// Get statistics
GET /api/admin/pickups/stats
GET /api/admin/stats

// Get users
GET /api/admin/users
```

## ✨ Key Features

### 1. One-Click Accept
```
Click "Accept" → Status changes → Push notification sent → Frontend shows confirmed
```

### 2. Status Management
```
pending → (accept) → accepted
       ↘ (cancel) ↙ cancelled
accepted → (complete) → completed
```

### 3. Admin Notes
```
Add notes when updating status
Visible in pickup details
Sent to users via notification
```

### 4. Filters & Search
```
Filter by status
Filter by date range
Search by user name/phone
Pagination for large datasets
```

## 🚨 Troubleshooting

### Admin can't login
- Check if backend is running
- Verify admin user exists in database
- Check email/password spelling

### Status update not working
- Check network tab for API errors
- Verify JWT token is valid
- Check admin role in database

### Frontend not getting notification
- Verify user has pushToken saved
- Check Expo credentials in backend
- Check user is logged in

### Real-time updates slow
- Increase refresh rate (edit seconds value)
- Check network latency
- Verify database connection speed

## 📚 File Structure Overview

```
Backend Changes:
├── src/controllers/adminController.js (UPDATED with pickup management)
└── src/routes/adminRoutes.js (UPDATED with new endpoints)

New Admin Panel:
Scrap-admin/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── PickupsPage.jsx (Main pickup management)
│   │   └── UsersPage.jsx
│   ├── components/
│   │   ├── Header.jsx (Navigation & layout)
│   │   └── PickupDetailModal.jsx
│   ├── services/api.js (API calls)
│   ├── context/AuthContext.jsx
│   ├── hooks/useNavigation.js
│   └── App.jsx
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎓 How to Use the Admin Panel

### For First-Time Users:
1. Navigate to `http://localhost:3001`
2. Login with admin credentials
3. Go to Pickups tab
4. Find a pending pickup
5. Click View
6. Click Accept
7. Check frontend app - it should show confirmed!

### For Daily Operations:
1. Monitor Dashboard for statistics
2. Go to Pickups → Filter by "pending"
3. Accept pickups as needed
4. Add notes if required
5. Mark as completed once picked up
6. Users get notified automatically

## 💡 Tips & Best Practices

1. **Keep Admin Panel Open** - Real-time updates mean you see new pickups immediately
2. **Use Filters** - Focus on pending pickups to accept
3. **Add Notes** - Help users understand any delays
4. **Monitor Statistics** - Track your operations performance
5. **Test Notifications** - Make sure users are getting updates

## 🔗 Integration Summary

| Component | Status | Flow |
|-----------|--------|------|
| Admin Panel Login | ✅ Complete | Email + Password → JWT Token |
| View Pickups | ✅ Complete | Real-time list with filters |
| Accept Pickup | ✅ Complete | Click → API Call → Notification → Frontend Update |
| User Notification | ✅ Complete | Expo Push → User's Phone |
| Frontend Sync | ✅ Complete | Auto-poll → Shows "Confirmed" |

## 🎉 You're All Set!

Everything is now configured for a complete admin system with real-time synchronization. When you accept a pickup in the admin panel, the user will:

1. ✅ Get a push notification on their phone
2. ✅ See the status updated to "Confirmed" in their app
3. ✅ Get schedule and pickup details

**Start the servers and test it out!** 🚀

---

## 📞 Quick Commands

```bash
# Start everything (in 3 terminals)
cd Scrap-backend && npm start              # Terminal 1
cd Scrap-admin && npm run dev               # Terminal 2
cd Scrap_frontend && npm start              # Terminal 3 (optional)

# Build for production
cd Scrap-admin && npm run build
```

---

Happy managing! 🚛✨
