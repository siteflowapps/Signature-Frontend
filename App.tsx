
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { UserRole } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const LandingPage = React.lazy(() => import('./pages/landing/LandingPage'));
const Login = React.lazy(() => import('./pages/login/LoginPage'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const OutletList = React.lazy(() => import('./pages/OutletList'));
const OutletDetail = React.lazy(() => import('./pages/OutletDetail'));
const Invoices = React.lazy(() => import('./pages/Invoices'));
const Payouts = React.lazy(() => import('./pages/payouts/PayoutsPage'));
const TransactionDetail = React.lazy(() => import('./pages/payout/TransactionDetail'));
const AddUser = React.lazy(() => import('./pages/AddUser'));
const Users = React.lazy(() => import('./pages/Users'));
const UserDetail = React.lazy(() => import('./pages/UserDetail'));
const BusinessesList = React.lazy(() => import('./pages/BusinessesList'));
const AddBusiness = React.lazy(() => import('./pages/AddBusiness'));
const BusinessDetail = React.lazy(() => import('./pages/business-detail/BusinessDetailPage'));
const DistributorsList = React.lazy(() => import('./pages/DistributorsList'));
const AddDistributor = React.lazy(() => import('./pages/AddDistributor'));
const SlabsList = React.lazy(() => import('./pages/SlabsList'));
const Team = React.lazy(() => import('./pages/Team'));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'));
const LocationsPage = React.lazy(() => import('./pages/LocationsPage'));
const AseLookupPage = React.lazy(() => import('./pages/AseLookupPage'));
const DmLookupPage = React.lazy(() => import('./pages/DMLookupPage'));
const SupportTicketsPage = React.lazy(() => import('./pages/SupportTicketsPage'));
const StockReportsPage = React.lazy(() => import('./pages/StockReportsPage'));
const MyDistributorsPage = React.lazy(() => import('./pages/distributor/MyDistributorsPage'));
const SupportDashboard = React.lazy(() => import('./pages/support/SupportDashboard'));

const PageLoader: React.FC = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

// Use React.FC and PropsWithChildren to ensure TS correctly identifies JSX children
const ProtectedRoute: React.FC<React.PropsWithChildren<{ allowedRoles?: UserRole[] }>> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Wait for auth state to be resolved before making any redirect decisions
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Use React.FC and PropsWithChildren to ensure TS correctly identifies JSX children
const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/admin/login';

  // Public pages render without the portal shell
  if (isPublicPage) return <>{children}</>;

  // While auth is loading on a protected route, show a minimal loading state
  // to prevent the portal shell from flashing with default values
  if (isLoading) {
    return <PageLoader />;
  }

  // If not authenticated on a protected route, render children only (ProtectedRoute will redirect)
  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/businesses" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <BusinessesList />
            </ProtectedRoute>
          } />

          <Route path="/businesses/add" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <AddBusiness />
            </ProtectedRoute>
          } />

          <Route path="/businesses/:id" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <BusinessDetail />
            </ProtectedRoute>
          } />

          <Route path="/distributors" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.FINANCE_ADMIN, UserRole.BUSINESS_USER, UserRole.RBL, UserRole.SM, UserRole.SUPPORT]}>
              <DistributorsList />
            </ProtectedRoute>
          } />

          <Route path="/distributors/add" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN]}>
              <AddDistributor />
            </ProtectedRoute>
          } />

          <Route path="/slabs" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.FINANCE_ADMIN, UserRole.BUSINESS_USER, UserRole.RBL, UserRole.SM]}>
              <SlabsList />
            </ProtectedRoute>
          } />

          <Route path="/payouts" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN]}>
              <Payouts />
            </ProtectedRoute>
          } />

          <Route path="/payouts/settlement/:outletId/:month" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN]}>
              <TransactionDetail />
            </ProtectedRoute>
          } />

          <Route path="/outlets" element={
            <ProtectedRoute>
              <OutletList />
            </ProtectedRoute>
          } />

          <Route path="/stock-reports" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER, UserRole.FINANCE_ADMIN]}>
              <StockReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/outlets/:id" element={
            <ProtectedRoute>
              <OutletDetail />
            </ProtectedRoute>
          } />

          <Route path="/invoices" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <Invoices />
            </ProtectedRoute>
          } />

          <Route path="/add-user" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN]}>
              <AddUser />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.FINANCE_ADMIN, UserRole.BUSINESS_USER, UserRole.RBL, UserRole.SM]}>
              <Users />
            </ProtectedRoute>
          } />

          <Route path="/users/:id" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.FINANCE_ADMIN, UserRole.BUSINESS_USER, UserRole.RBL, UserRole.SM]}>
              <UserDetail />
            </ProtectedRoute>
          } />

          <Route path="/team" element={
            <ProtectedRoute allowedRoles={[UserRole.RBL, UserRole.SM]}>
              <Team />
            </ProtectedRoute>
          } />

          <Route path="/locations" element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS_USER]}>
              <LocationsPage />
            </ProtectedRoute>
          } />

          <Route path="/ase-lookup" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER]}>
              <AseLookupPage />
            </ProtectedRoute>
          } />

          <Route path="/dm-lookup" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN]}>
              <DmLookupPage />
            </ProtectedRoute>
          } />

          <Route path="/support-tickets" element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS_USER, UserRole.SUPPORT]}>
              <SupportTicketsPage />
            </ProtectedRoute>
          } />

          <Route path="/support-dashboard" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPPORT]}>
              <SupportDashboard />
            </ProtectedRoute>
          } />

          <Route path="/my-distributors" element={
            <ProtectedRoute allowedRoles={[UserRole.DISTRIBUTOR_MANAGER]}>
              <MyDistributorsPage />
            </ProtectedRoute>
          } />

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<div className="p-10 text-center text-slate-500">404 - Page Not Found</div>} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <AppRoutes />
              </Suspense>
            </Layout>
            <Toast />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
