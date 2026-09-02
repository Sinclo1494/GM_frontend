import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import App from './App.tsx';
import PermissionProvider from './auth/PermissionProvider';
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
import UsersPage from './pages/UsersPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import './index.css';
import "./api/axios";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <PermissionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<App />}>
              <Route path="/admin/users" element={<ProtectedRoute permission="administration.users"><UsersPage /></ProtectedRoute>} />
              <Route path="/admin/journalisation" element={<ProtectedRoute permission="administration.journalisation"><Journalisation /></ProtectedRoute>} />
              <Route path="/reports/journal-materiel" element={<ProtectedRoute permission="analyse.journal_materiel"><JournalMateriel /></ProtectedRoute>} />
              <Route path="/reports/analyse-quantitative" element={<ProtectedRoute permission="analyse.quantitative"><AnalyseQuantitative /></ProtectedRoute>} />
              <Route path="/reports/analyse-exploitation" element={<ProtectedRoute permission="analyse.exploitation"><AnalyseExploitation /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute permission="analyse.dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="/Dashboard" element={<ProtectedRoute permission="analyse.dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/imports/pointage-csv" element={<ProtectedRoute permission="import.pointage"><PointageImportCsv /></ProtectedRoute>} />
              <Route path="/imports/gm-csv" element={<ProtectedRoute permission="import.grand_materiel"><GMImportCsv /></ProtectedRoute>} />
              <Route path="/imports/marque-csv" element={<ProtectedRoute permission="import.marque"><MarqueImportCsv /></ProtectedRoute>} />
              <Route path="/imports/type-marque-csv" element={<ProtectedRoute permission="import.type_marque"><TypeMarqueImportCsv /></ProtectedRoute>} />
              <Route path="/imports/sous-famille-csv" element={<ProtectedRoute permission="import.sous_famille"><SousFamilleImportCsv /></ProtectedRoute>} />
              <Route path="/imports/situation-affectation-csv" element={<ProtectedRoute permission="import.situation_affectation"><SituationAffectationImportCsv /></ProtectedRoute>} />
              <Route path="/imports/site-csv" element={<ProtectedRoute permission="import.site"><SiteImportCsv /></ProtectedRoute>} />
              <Route path="/imports/regularisation-gm-csv" element={<ProtectedRoute permission="import.regularisation"><RegularisationImportCsv /></ProtectedRoute>} />
              <Route path="/gestion/entreprises" element={<ProtectedRoute permission="gestion.entreprises"><EntreprisePage /></ProtectedRoute>} />
              <Route path="/gestion/filiales" element={<ProtectedRoute permission="gestion.filiales"><FilialePage /></ProtectedRoute>} />
              <Route path="/gestion/divisions" element={<ProtectedRoute permission="gestion.divisions"><DivisionPage /></ProtectedRoute>} />
              <Route path="/gestion/familles-structures" element={<ProtectedRoute permission="gestion.familles_structures"><FamilleStructuresPage /></ProtectedRoute>} />
              <Route path="/gestion/categories-gm" element={<ProtectedRoute permission="gestion.categories_gm"><CategorieGMPage /></ProtectedRoute>} />
              <Route path="/gestion/familles-materiel" element={<ProtectedRoute permission="gestion.familles_materiel"><FamilleMaterielPage /></ProtectedRoute>} />
              <Route path="/gestion/sous-familles-materiel" element={<ProtectedRoute permission="gestion.sous_familles_materiel"><SousFamilleMaterielPage /></ProtectedRoute>} />
              <Route path="/gestion/marques-materiel" element={<ProtectedRoute permission="gestion.marques_materiel"><MarqueMaterielPage /></ProtectedRoute>} />
              <Route path="/gestion/types-marque" element={<ProtectedRoute permission="gestion.types_marque"><TypeMarquePage /></ProtectedRoute>} />
              <Route path="/gestion/types-affectation" element={<ProtectedRoute permission="gestion.types_affectation"><TypeAffectationPage /></ProtectedRoute>} />
              <Route path="/gestion/types-situation" element={<ProtectedRoute permission="gestion.types_situation"><TypeSituationPage /></ProtectedRoute>} />
              <Route path="/gestion/types-etat-materiel" element={<ProtectedRoute permission="gestion.types_etat_materiel"><TypeEtatMaterielPage /></ProtectedRoute>} />
              <Route path="/gestion/sites" element={<ProtectedRoute permission="gestion.sites"><SitePage /></ProtectedRoute>} />
              <Route path="/gestion/grand-materiel" element={<ProtectedRoute permission="gestion.grand_materiel"><GrandMaterielPage /></ProtectedRoute>} />
              <Route path="/gestion/affectations" element={<ProtectedRoute permission="gestion.affectations"><AffectationMaterielPage /></ProtectedRoute>} />
              <Route path="/gestion/situations" element={<ProtectedRoute permission="gestion.situations"><SituationMaterielPage /></ProtectedRoute>} />
              <Route path="/gestion/pointages" element={<ProtectedRoute permission="gestion.pointages"><PointagePage /></ProtectedRoute>} />
              <Route path="/gestion/regularisations-gm" element={<ProtectedRoute permission="gestion.regularisations_gm"><RegularisationGMPage /></ProtectedRoute>} />
              <Route path="/gestion/regularisations-mois" element={<ProtectedRoute permission="gestion.regularisations_mois"><RegularisationMoisGM2Page /></ProtectedRoute>} />
            </Route>
          </Routes>
        </PermissionProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
