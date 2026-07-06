import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import App from './App.tsx';
import Dashboard from './pages/Dashboard.tsx';
import AnalyseQuantitative from './pages/AnalyseQuantitative.tsx';
import AnalyseExploitation from './pages/AnalyseExploitation.tsx';

import './index.css';
import GrandMateriel from './pages/GrandMateriel.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<App />}>
            <Route
              path="/reports/analyse-quantitative"
              element={<ProtectedRoute><AnalyseQuantitative /></ProtectedRoute>}
            />
            <Route
              path="/reports/analyse-exploitation"
              element={<ProtectedRoute><AnalyseExploitation /></ProtectedRoute>}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>}
            />
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>}
            />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
