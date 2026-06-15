import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import App from './App.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
