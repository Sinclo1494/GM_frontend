import { useState } from "react";
import DashboardV2Shell, {
  type DashboardTabId,
} from "../components/dashboard/v2/DashboardV2Shell";
import ApercuScreen from "../components/dashboard/v2/screens/ApercuScreen";
import SituationScreen from "../components/dashboard/v2/screens/SituationScreen";
import DisponibiliteScreen from "../components/dashboard/v2/screens/DisponibiliteScreen";
import MaintenanceScreen from "../components/dashboard/v2/screens/MaintenanceScreen";
import RendementScreen from "../components/dashboard/v2/screens/RendementScreen";
import FinancesScreen from "../components/dashboard/v2/screens/FinancesScreen";
import ParcScreen from "../components/dashboard/v2/screens/ParcScreen";

const SCREENS: { id: DashboardTabId; label: string }[] = [
  { id: "apercu", label: "APERÇU" },
  { id: "situation", label: "SITUATION" },
  { id: "disponibilite", label: "DISPONIBILITÉ" },
  { id: "maintenance", label: "MAINTENANCE" },
  { id: "rendement", label: "RENDEMENT" },
  { id: "finances", label: "FINANCIER" },
  { id: "parc", label: "PARC" },
];

/**
 * `/dashboard-v2` — same shell as `/reports/dashboard-v2`
 * (`pages/NewDashboard`): FilterBar + HealthBar + tabs + the lazy screens.
 * It used to render the screens bare, so its filters were frozen on whatever
 * had been persisted last and the health KPIs were invisible; the shell is now
 * shared instead of duplicated.
 */
export default function DashboardV2() {
  const [activeScreen, setActiveScreen] = useState<DashboardTabId>("apercu");

  return (
    <DashboardV2Shell
      title="Tableau de bord V2"
      subtitle="Vue opérationnelle sur parc matériel"
      tabs={SCREENS}
      activeTab={activeScreen}
      onTabChange={setActiveScreen}
      renderTab={() => {
        switch (activeScreen) {
          case "apercu":
            return <ApercuScreen />;
          case "situation":
            return <SituationScreen />;
          case "disponibilite":
            return <DisponibiliteScreen />;
          case "maintenance":
            return <MaintenanceScreen />;
          case "rendement":
            return <RendementScreen />;
          case "finances":
            return <FinancesScreen />;
          case "parc":
            return <ParcScreen />;
          default:
            return <ApercuScreen />;
        }
      }}
    />
  );
}
