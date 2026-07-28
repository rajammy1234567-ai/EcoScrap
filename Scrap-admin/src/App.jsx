import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header, Sidebar, LoadingSpinner } from "./components/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { PickupsPage } from "./pages/PickupsPage";
import { UsersPage } from "./pages/UsersPage";
import { RatesPage } from "./pages/RatesPage";
import { ScrappersPage } from "./pages/ScrappersPage";
import { HappyCustomersPage } from "./pages/HappyCustomersPage";
import { LoginPage } from "./pages/LoginPage";
import { useLocation } from "./hooks/useNavigation";

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (location) {
      case "/pickups":
        return <PickupsPage />;
      case "/rates":
        return <RatesPage />;
      case "/users":
        return <UsersPage />;
      case "/scrapers":
        return <ScrappersPage />;
      case "/happy-customers":
        return <HappyCustomersPage />;
      case "/dashboard":
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8">{renderPage()}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
