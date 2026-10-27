import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Backdrop } from "./components/fx/Backdrop";
import { Cursor } from "./components/fx/Cursor";
import { AnimatePresence, motion } from "motion/react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import { SessionList } from "./pages/SessionList";
import { MyBookings } from "./pages/MyBookings";
import { AdminPage } from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative isolate min-h-screen bg-[#07070A] text-[#F4F4F6] flex flex-col font-sans">
          <Backdrop />
          <Cursor />
          <Navbar />
          <main id="main-content" className="flex-1 flex flex-col w-full" tabIndex={-1}>
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;