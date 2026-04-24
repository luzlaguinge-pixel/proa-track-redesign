import { lazy, type ReactNode, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@material-hu/mui/styles';
import { createHuGoTheme } from '@material-hu/theme/hugo';

import { DialogLayerProvider } from '@material-hu/components/layers/Dialogs';
import { DrawerLayerProvider } from '@material-hu/components/layers/Drawers';
import { MenuLayerProvider } from '@material-hu/components/layers/Menus';

import { HomePage } from './pages/Home';
import { AuthProvider, useAuth } from './providers/AuthContext';
import { ProfileProvider } from './providers/ProfileContext';
import { NotificationProvider } from './providers/NotificationContext';
import './i18n';

const LoginPage = lazy(() => import('./pages/Auth/Login'));
const InventoryList = lazy(() => import('./pages/Inventory/List'));
const InventoryDetail = lazy(() => import('./pages/Inventory/Detail'));
const PeopleList = lazy(() => import('./pages/People/List'));
const PeopleDetail = lazy(() => import('./pages/People/Detail'));
const CatalogList = lazy(() => import('./pages/Catalog/List'));
const MovementsList = lazy(() => import('./pages/Movements/List'));
const MyTeamList = lazy(() => import('./pages/MyTeam/List'));
const TeamInventoryList = lazy(() => import('./pages/TeamInventory/List'));
const MyMaterialsList = lazy(() => import('./pages/MyMaterials/List'));
const ConfirmationList = lazy(() => import('./pages/Confirmation/List'));
const TeamConfirmationsList = lazy(
  () => import('./pages/TeamConfirmations/List'),
);
const SolicitudesList = lazy(() => import('./pages/Solicitudes/List'));
const ReportsList = lazy(() => import('./pages/Reports/List'));
const FAQsList = lazy(() => import('./pages/FAQs/List'));
const NotificationsList = lazy(() => import('./pages/Notifications/List'));
const RoleManagement = lazy(() => import('./pages/Admin/Roles'));
const DebugPage = lazy(() => import('./pages/Debug'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  return <>{children}</>;
}

const theme = createHuGoTheme();
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MenuLayerProvider>
          <DialogLayerProvider>
            <DrawerLayerProvider>
              <BrowserRouter>
                <AuthProvider>
                  <ProfileProvider>
                    <NotificationProvider>
                      <Suspense fallback={null}>
                        <Routes>
                          <Route
                            path="/login"
                            element={<LoginPage />}
                          />
                          <Route
                            path="/"
                            element={
                              <ProtectedRoute>
                                <HomePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/inventory"
                            element={
                              <ProtectedRoute>
                                <InventoryList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/inventory/:id"
                            element={
                              <ProtectedRoute>
                                <InventoryDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/people"
                            element={
                              <ProtectedRoute>
                                <PeopleList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/people/:id"
                            element={
                              <ProtectedRoute>
                                <PeopleDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/catalog"
                            element={
                              <ProtectedRoute>
                                <CatalogList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/movements"
                            element={
                              <ProtectedRoute>
                                <MovementsList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/my-team"
                            element={
                              <ProtectedRoute>
                                <MyTeamList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/team-inventory"
                            element={
                              <ProtectedRoute>
                                <TeamInventoryList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/my-materials"
                            element={
                              <ProtectedRoute>
                                <MyMaterialsList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/my-confirmation"
                            element={
                              <ProtectedRoute>
                                <ConfirmationList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/team-confirmations"
                            element={
                              <ProtectedRoute>
                                <TeamConfirmationsList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/solicitudes"
                            element={
                              <ProtectedRoute>
                                <SolicitudesList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/reports"
                            element={
                              <ProtectedRoute>
                                <ReportsList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/faqs"
                            element={
                              <ProtectedRoute>
                                <FAQsList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/notifications"
                            element={
                              <ProtectedRoute>
                                <NotificationsList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/roles"
                            element={
                              <ProtectedRoute>
                                <RoleManagement />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/debug"
                            element={
                              <ProtectedRoute>
                                <DebugPage />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                      </Suspense>
                    </NotificationProvider>
                  </ProfileProvider>
                </AuthProvider>
              </BrowserRouter>
            </DrawerLayerProvider>
          </DialogLayerProvider>
        </MenuLayerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
