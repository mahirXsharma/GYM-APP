import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import { SessionList } from "./pages/SessionList";
import { MyBookings } from "./pages/MyBookings";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
          <Navbar />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <Routes>
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
                path="/sessionList"
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
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;