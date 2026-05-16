import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AOS from "aos";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSetting";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 750,
      offset: 72,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => AOS.refresh());
    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.hash]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
