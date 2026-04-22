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
                <ProfileProvider>
                <AuthProvider>
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
                    </Routes>
                  </Suspense>
                </AuthProvider>
                </ProfileProvider>
              </BrowserRouter>
            </DrawerLayerProvider>
          </DialogLayerProvider>
        </MenuLayerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
