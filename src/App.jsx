import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

const Login = lazy(() => import('./auth/pages/Login.jsx'));
const Signup = lazy(() => import('./auth/pages/Signup.jsx'));
const ForgotPassword = lazy(() => import('./auth/pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./auth/pages/ResetPassword.jsx'));
const AuthCallback = lazy(() => import('./auth/pages/AuthCallback.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Navbar />}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      {!isDashboard && <Footer />}
    </>
  );
}
