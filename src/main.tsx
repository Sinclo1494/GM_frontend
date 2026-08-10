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
import PointageImportCsv from './pages/ImportPointageCSV.tsx';
import GMImportCsv from './pages/ImportGrandMaterielCSV.tsx';
import MarqueImportCsv from './pages/ImportMarqueCSV.tsx';
import TypeMarqueImportCsv from './pages/ImportTypeMarqueCSV.tsx';
import SousFamilleImportCsv from './pages/ImportSousFamilleCSV.tsx';
import SituationAffectationImportCsv from './pages/ImportSituationAffectationCSV.tsx';
import SiteImportCsv from './pages/ImportSiteCSV.tsx';
import RegularisationImportCsv from './pages/ImportRegularisationCSV.tsx';



import './index.css';
import JournalMateriel from './pages/JournalMateriel.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<App />}>
            <Route
              path="/reports/journal-materiel"
              element={<ProtectedRoute><JournalMateriel /></ProtectedRoute>}
            />
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
            <Route
              path="/imports/pointage-csv"
              element={
                <ProtectedRoute>
                  <PointageImportCsv />
                </ProtectedRoute>}
            />
            <Route
              path="/imports/gm-csv"
              element={
                <ProtectedRoute>
                  <GMImportCsv />
                </ProtectedRoute>}
            />
            <Route
              path="/imports/marque-csv"
              element={
                <ProtectedRoute>
                  <MarqueImportCsv />
                </ProtectedRoute>}
            />
            <Route
              path="/imports/type-marque-csv"
              element={
                <ProtectedRoute>
                  <TypeMarqueImportCsv />
                </ProtectedRoute>}
            />
            <Route
              path="/imports/sous-famille-csv"
              element={
                <ProtectedRoute>
                  <SousFamilleImportCsv />
                </ProtectedRoute>}
            />
            <Route
              path="/imports/situation-affectation-csv"
              element={
                <ProtectedRoute>
                  <SituationAffectationImportCsv />
                </ProtectedRoute>}
            />
            <Route
              path="/imports/site-csv"
              element={
                <ProtectedRoute>
                  <SiteImportCsv />
                </ProtectedRoute>}
            />
            <Route
              path="/imports/regularisation-gm-csv"
              element={
                <ProtectedRoute>
                  <RegularisationImportCsv />
                </ProtectedRoute>}
            />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
