import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ToastNotification";
import ErrorBoundary from "./components/ErrorBoundary";
import LiveChat from "./components/LiveChat";
import HomePage from "./components/HomePage";
import ContactPage from "./components/ContactPage";
import QuotePage from "./components/QuotePage";
import AdminDashboard from "./components/AdminDashboard";
import EnhancedAdminDashboard from "./components/EnhancedAdminDashboard";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/quote" element={<QuotePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
              <LiveChat />
            </div>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
