import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { clientRoutes, adminRoutes } from './routes';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<Loading message="Đang tải trang..." />}>
            <Routes>
              {/* Client routes */}
              {clientRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              
              {/* Admin routes */}
              {adminRoutes.map((route) => {
                // Admin login route không cần protection
                if (route.path === '/admin/login') {
                  return (
                    <Route key={route.path} path={route.path} element={route.element} />
                  );
                }
                // Các admin routes khác cần protection
                return (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        {route.element}
                      </ProtectedRoute>
                    }
                  >
                    {route.children?.map((child) => (
                      <Route
                        key={child.path || 'index'}
                        index={child.index}
                        path={child.path}
                        element={child.element}
                      />
                    ))}
                  </Route>
                );
              })}
            </Routes>
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;


