# 🚛 Scrap Admin Panel

Professional admin panel for managing scrap pickups with real-time updates and status management.

## ✨ Features

- **Dashboard** - Real-time statistics and overview
- **Pickup Management** - View, manage, and update pickup status
- **User Management** - Monitor and view all registered users
- **Real-time Updates** - Auto-refresh every 30 seconds
- **Status Tracking** - Track pickups through pending → accepted → completed/cancelled
- **Push Notifications** - Users get notified when their pickup is confirmed
- **Responsive Design** - Works on desktop and tablet
- **Professional UI** - Built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Running backend server on `http://localhost:5000`

### Installation

```bash
# Navigate to admin folder
cd Scrap-admin

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 Usage

### Login
- Email: `admin@scrap.com`
- Password: (set up admin user using backend script)

### Dashboard
- View overall statistics
- See pickup and scrap item counts
- Monitor total revenue

### Manage Pickups
1. Go to **Pickups** section
2. Filter by status (Pending, Accepted, Completed, Cancelled)
3. Click **View** to see pickup details
4. Click **Accept** to confirm pending pickups
5. Update status and add admin notes if needed

**When you confirm a pickup:**
- ✅ Status changes to "accepted"
- 📱 User gets push notification
- 🔄 Frontend app automatically updates

### View Users
- See all registered users
- Contact info (email, phone)
- Join date and activity

## 🔄 Real-time Sync

### How it works:
1. **Admin confirms pickup** → Backend updates status
2. **Backend sends push notification** → User's phone app receives it
3. **Frontend polls periodically** → Shows updated status
4. **Auto-refresh** → Admin panel refreshes every 30 seconds

### Pickup Status Flow:
```
pending → accepted → completed
                  → cancelled
```

## 📡 API Integration

All API calls go through `/api/admin/*` endpoints with JWT authentication.

### Key Endpoints:
```
GET    /api/admin/stats                 - Dashboard stats
GET    /api/admin/pickups              - List all pickups
GET    /api/admin/pickups/:id          - Get pickup details
PUT    /api/admin/pickups/:id/status   - Update pickup status
GET    /api/admin/pickups/stats        - Pickup statistics
GET    /api/admin/users                - List all users
```

## 🛠️ Technology Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide Icons** - Icons
- **Node.js/Express** - Backend

## 📁 Project Structure

```
Scrap-admin/
├── src/
│   ├── components/       - Reusable components
│   ├── context/          - Auth context
│   ├── hooks/            - Custom hooks
│   ├── pages/            - Page components
│   ├── services/         - API services
│   ├── App.jsx           - Main app
│   ├── main.jsx          - Entry point
│   └── index.css         - Styles
├── index.html            - HTML template
├── vite.config.js        - Vite config
├── tailwind.config.js    - Tailwind config
└── package.json          - Dependencies
```

## 🔐 Security

- JWT token-based authentication
- Secure password storage (bcrypt)
- Admin-only routes protected
- CORS enabled for cross-origin requests

## 🐛 Troubleshooting

### Admin panel not connecting to backend?
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify JWT token in localStorage

### Push notifications not working?
- Check user has valid Expo push token
- Verify backend has Expo credentials
- Check network connectivity

### Real-time updates not showing?
- Manual refresh with 🔄 button
- Check browser console for errors
- Verify API responses in Network tab

## 📝 Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Integration with Frontend

When admin confirms a pickup in this panel:

1. **Backend** updates Pickup status to "accepted"
2. **Backend** sends Expo push notification
3. **User's phone** receives notification
4. **Frontend app** shows "Pickup Confirmed" status
5. **User sees** "Confirmed" badge in their pickups list

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API responses
3. Ensure all environment variables are set

---

Built with ❤️ for Scrap Collection Service
