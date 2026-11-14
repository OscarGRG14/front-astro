import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, isAuthenticated, useAuth } from '@/lib/auth'
import { AppLayout } from '@/components/AppLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import MetricsPage from '@/pages/MetricsPage'
import RecordsPage from '@/pages/RecordsPage'
import AlertsPage from '@/pages/AlertsPage'
import CrewPage from '@/pages/CrewPage'
import AstronautDetailPage from '@/pages/AstronautDetailPage'
import UsersPage from '@/pages/UsersPage'
import DevicesPage from '@/pages/DevicesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Mantiene los datos anteriores mientras re-fetcha: evita parpadeos
      // y estados vacíos si el backend se reinicia (nodemon) unos segundos
      placeholderData: keepPreviousData,
      retry: 1,
    },
  },
})

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}

/** Solo medic/admin (vistas de control) */
function CrewRoute() {
  const { user } = useAuth()
  return user?.role !== 'astronaut' ? <Outlet /> : <Navigate to="/app" replace />
}

/** Solo admin */
function AdminRoute() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/app" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="metrics" element={<MetricsPage />} />
                <Route path="records" element={<RecordsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route element={<CrewRoute />}>
                  <Route path="crew" element={<CrewPage />} />
                  <Route path="astronaut/:id" element={<AstronautDetailPage />} />
                </Route>
                <Route element={<AdminRoute />}>
                  <Route path="users" element={<UsersPage />} />
                  <Route path="devices" element={<DevicesPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
