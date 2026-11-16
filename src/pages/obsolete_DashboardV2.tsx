import { useCallback, useState } from "react";
import DashboardV2Shell, {
  type DashboardTabId,
} from "../components/dashboard/v2/DashboardV2Shell";
import ApercuScreen from "../components/dashboard/v2/screens/ApercuScreen";
import SituationScreen from "../components/dashboard/v2/screens/obsolete_SituationScreen";
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

const renderScreen = (tab: DashboardTabId) => {
  switch (tab) {
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
};

export default function DashboardV2() {
  const [activeScreen, setActiveScreen] = useState<DashboardTabId>("apercu");
  const renderTab = useCallback(() => renderScreen(activeScreen), [
    activeScreen,
  ]);

  return (
    <DashboardV2Shell
      title="Tableau de bord V2"
      subtitle="Vue opérationnelle sur le parc matériel"
      tabs={SCREENS}
      activeTab={activeScreen}
      onTabChange={setActiveScreen}
      renderTab={renderTab}
    />
  );
}