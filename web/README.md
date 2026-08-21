# EcoScrap Web Portal

A modern, responsive, production-ready MERN web application for **EcoScrap** — doorstep scrap collection, recycling, and instant payout platform.

---

## 🌟 Key Features

1. **Dynamic Hero & Live Scrap Value Estimator:**
   - Real-time scrap pricing calculations by item and weight.
   - 1-click booking direct from scrap calculator.
2. **Live Scrap Rate Card (`/rates`):**
   - Categorized by **Paper**, **Metal**, **IT & E-Waste**, **Large Appliances**, **Clothes**, and **Glass**.
   - Instant search and multi-item scrap basket estimator.
3. **4-Step Doorstep Pickup Booking Wizard (`/book-pickup`):**
   - Item Selection $\rightarrow$ Address auto-fill $\rightarrow$ Time slot picker $\rightarrow$ Celebratory confirmation & tracking ID generation.
4. **Real-time Order Tracking (`/track`):**
   - Live progression timeline: `Requested` $\rightarrow$ `Assigned` $\rightarrow$ `Out for Pickup` $\rightarrow$ `Collected` $\rightarrow$ `Completed`.
   - Assigned pickup hero details & direct phone contact.
5. **Scrapper Partner Onboarding Portal (`/partner`):**
   - Partner earnings calculator (₹25k-₹55k/mo).
   - Multi-step KYC registration form with vehicle selection.
6. **User Account & Addresses Dashboard (`/profile`):**
   - Saved address book, pickup history, and lifetime environmental impact metrics.
7. **Brand & Design Tokens:**
   - Forest & Emerald Green (`#1B5E20`, `#2E7D32`, `#4CAF50`), Plus Jakarta Sans typography, glassmorphic headers, and smooth micro-animations.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔗 Backend Connectivity
The web app is configured to proxy `/api` requests to the EcoScrap backend (`http://localhost:5000` or production on Render). It gracefully falls back to default rates and cached data when offline.
