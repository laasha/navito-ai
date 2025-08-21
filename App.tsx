



import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import SettingsPage from './pages/SettingsPage';
import Modal from './components/Modal';
import ToastContainer from './components/ToastContainer';
import ProactiveAI from './components/ProactiveAI';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import RoutinePage from './pages/RoutinePage';
import QuarterlyReviewPage from './pages/QuarterlyReviewPage';
import { Sidebar } from './components/Sidebar';
import CoPilot from './components/CoPilot';
import CommandPage from './pages/CommandPage';
import PrintableTimelinePage from './pages/PrintableTimelinePage';
import { BrowserRouter } from "react-router-dom";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isZenMode, toggleZenMode, isAuthenticated, isRoutineMode, userSettings } = useAppContext();

  return (
      <HashRouter>
        <div className={`flex h-screen overflow-hidden ${isZenMode ? 'zen-mode' : ''} ${userSettings.theme}-theme`}>
          {isAuthenticated && !isZenMode && !isRoutineMode && <Sidebar />}
          <main className={`flex-1 overflow-y-auto ${!isAuthenticated || isRoutineMode ? '' : 'pl-20'}`}>
            <div className="p-4 sm:p-6 h-full">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  
                  <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
                  <Route path="/command" element={<ProtectedRoute><CommandPage /></ProtectedRoute>} />
                  <Route path="/routine/:type" element={<ProtectedRoute><RoutinePage /></ProtectedRoute>} />
                  <Route path="/review/quarterly" element={<ProtectedRoute><QuarterlyReviewPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/print/timeline" element={<ProtectedRoute><PrintableTimelinePage /></ProtectedRoute>} />

                  <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                 
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
          </main>
          
          {isAuthenticated && isZenMode && (
              <button
                onClick={toggleZenMode}
                className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-accent-color/80 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-accent-color transition-transform transform hover:scale-110"
                title="Zen რეჟიმიდან გამოსვლა"
              >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5"></path></svg>
              </button>
          )}

          <Modal />
          <ToastContainer />
          {isAuthenticated && <ProactiveAI />}
          {isAuthenticated && (
            <div className="fixed bottom-6 right-6 z-50">
                <CoPilot />
            </div>
           )}
        </div>
      </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <ModalProvider>
          <GoalProvider>
            <ThemeProvider>
              <BrowserRouter basename="/navito-ai">
                <AppContext />
              </BrowserRouter>
            </ThemeProvider>
          </GoalProvider>
        </ModalProvider>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;
