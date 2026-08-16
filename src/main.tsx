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
import Journalisation from './pages/Journalisation.tsx';
import EntreprisePage from './pages/EntreprisePage.tsx';
import FilialePage from './pages/FilialePage.tsx';
import DivisionPage from './pages/DivisionPage.tsx';
import FamilleStructuresPage from './pages/FamilleStructuresPage.tsx';
import CategorieGMPage from './pages/CategorieGMPage.tsx';
import FamilleMaterielPage from './pages/FamilleMaterielPage.tsx';
import SousFamilleMaterielPage from './pages/SousFamilleMaterielPage.tsx';
import MarqueMaterielPage from './pages/MarqueMaterielPage.tsx';
import TypeMarquePage from './pages/TypeMarquePage.tsx';
import TypeAffectationPage from './pages/TypeAffectationPage.tsx';
import TypeSituationPage from './pages/TypeSituationPage.tsx';
import TypeEtatMaterielPage from './pages/TypeEtatMaterielPage.tsx';
import SitePage from './pages/SitePage.tsx';
import GrandMaterielPage from './pages/GrandMaterielPage.tsx';
import AffectationMaterielPage from './pages/AffectationMaterielPage.tsx';
import SituationMaterielPage from './pages/SituationMaterielPage.tsx';
import PointagePage from './pages/PointagePage.tsx';
import RegularisationGMPage from './pages/RegularisationGMPage.tsx';
import RegularisationMoisGM2Page from './pages/RegularisationMoisGM2Page.tsx';

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
              path="/admin/journalisation"
              element={<ProtectedRoute><Journalisation /></ProtectedRoute>}
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

            <Route path="/gestion/entreprises" element={<ProtectedRoute><EntreprisePage /></ProtectedRoute>} />
            <Route path="/gestion/filiales" element={<ProtectedRoute><FilialePage /></ProtectedRoute>} />
            <Route path="/gestion/divisions" element={<ProtectedRoute><DivisionPage /></ProtectedRoute>} />
            <Route path="/gestion/familles-structures" element={<ProtectedRoute><FamilleStructuresPage /></ProtectedRoute>} />
            <Route path="/gestion/categories-gm" element={<ProtectedRoute><CategorieGMPage /></ProtectedRoute>} />
            <Route path="/gestion/familles-materiel" element={<ProtectedRoute><FamilleMaterielPage /></ProtectedRoute>} />
            <Route path="/gestion/sous-familles-materiel" element={<ProtectedRoute><SousFamilleMaterielPage /></ProtectedRoute>} />
            <Route path="/gestion/marques-materiel" element={<ProtectedRoute><MarqueMaterielPage /></ProtectedRoute>} />
            <Route path="/gestion/types-marque" element={<ProtectedRoute><TypeMarquePage /></ProtectedRoute>} />
            <Route path="/gestion/types-affectation" element={<ProtectedRoute><TypeAffectationPage /></ProtectedRoute>} />
            <Route path="/gestion/types-situation" element={<ProtectedRoute><TypeSituationPage /></ProtectedRoute>} />
            <Route path="/gestion/types-etat-materiel" element={<ProtectedRoute><TypeEtatMaterielPage /></ProtectedRoute>} />
            <Route path="/gestion/sites" element={<ProtectedRoute><SitePage /></ProtectedRoute>} />
            <Route path="/gestion/grand-materiel" element={<ProtectedRoute><GrandMaterielPage /></ProtectedRoute>} />
            <Route path="/gestion/affectations" element={<ProtectedRoute><AffectationMaterielPage /></ProtectedRoute>} />
            <Route path="/gestion/situations" element={<ProtectedRoute><SituationMaterielPage /></ProtectedRoute>} />
            <Route path="/gestion/pointages" element={<ProtectedRoute><PointagePage /></ProtectedRoute>} />
            <Route path="/gestion/regularisations-gm" element={<ProtectedRoute><RegularisationGMPage /></ProtectedRoute>} />
            <Route path="/gestion/regularisations-mois" element={<ProtectedRoute><RegularisationMoisGM2Page /></ProtectedRoute>} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
