import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const SpaceProviderRegister = React.lazy(() => import('./pages/Auth/SpaceProviderRegister'));
const SearchPage = React.lazy(() => import('./pages/Search/SearchPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const ProviderDashboard = React.lazy(() => import('./pages/Provider/ProviderDashboard'));
const CreateParkingLot = React.lazy(() => import('./pages/Provider/CreateParkingLot'));
const ParkingLotDetails = React.lazy(() => import('./pages/ParkingLot/ParkingLotDetails'));
const BookingPage = React.lazy(() => import('./pages/Booking/BookingPage'));
const BookingDetails = React.lazy(() => import('./pages/Booking/BookingDetails'));
const ProfilePage = React.lazy(() => import('./pages/Profile/ProfilePage'));
const HowItWorks = React.lazy(() => import('./pages/Info/HowItWorks'));
const ListYourSpace = React.lazy(() => import('./pages/Info/ListYourSpace'));
const HelpCenter = React.lazy(() => import('./pages/Info/HelpCenter'));
const ContactUs = React.lazy(() => import('./pages/Info/ContactUs'));
const AboutUs = React.lazy(() => import('./pages/Info/AboutUs'));
const TermsOfService = React.lazy(() => import('./pages/Legal/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./pages/Legal/PrivacyPolicy'));
import LoadingSpinner from './components/UI/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    // Redirect based on user role
    if (user.role === 'space_provider') {
      return <Navigate to="/provider/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="search" element={<SearchPage />} />

              {/* Auth Routes */}
              <Route path="login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="register/space-provider" element={
                <PublicRoute>
                  <SpaceProviderRegister />
                </PublicRoute>
              } />

              {/* Protected Routes - Customer */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Protected Routes - Space Provider */}
              <Route path="provider/dashboard" element={
                <ProtectedRoute>
                  <ProviderDashboard />
                </ProtectedRoute>
              } />

              <Route path="provider/parking-lot/new" element={
                <ProtectedRoute>
                  <CreateParkingLot />
                </ProtectedRoute>
              } />

              {/* Public Pages */}
              <Route path="parking/:id" element={<ParkingLotDetails />} />
              <Route path="book/:id" element={<BookingPage />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="list-your-space" element={<ListYourSpace />} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="privacy" element={<PrivacyPolicy />} />

              {/* Protected Pages */}
              <Route path="booking/:id" element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <a href="/" className="text-blue-600 hover:text-blue-500">
                      Go back home
                    </a>
                  </div>
                </div>
              } />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
