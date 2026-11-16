import { useCallback, useState } from "react";
import DashboardV2Shell from "../components/dashboard/v2/DashboardV2Shell";
import type { DashboardTabId } from "../components/dashboard/v2/dashboardTabs";
import ApercuScreen from "../components/dashboard/v2/screens/ApercuScreen";
import DisponibiliteScreen from "../components/dashboard/v2/screens/DisponibiliteScreen";
import MaintenanceScreen from "../components/dashboard/v2/screens/MaintenanceScreen";
import RendementScreen from "../components/dashboard/v2/screens/RendementScreen";
import FinancesScreen from "../components/dashboard/v2/screens/FinancesScreen";
import ParcScreen from "../components/dashboard/v2/screens/ParcScreen";

const TABS: { id: DashboardTabId; label: string }[] = [
  { id: "apercu", label: "APERÇU" },
  { id: "disponibilite", label: "DISPONIBILITÉ" },
  { id: "maintenance", label: "MAINTENANCE" },
  { id: "rendement", label: "RENDEMENT" },
  { id: "finances", label: "FINANCES" },
  { id: "parc", label: "PARC" },
];

const renderScreen = (tab: DashboardTabId) => {
  switch (tab) {
    case "apercu":
      return <ApercuScreen />;
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

export default function NewDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("apercu");
  const renderTab = useCallback(() => renderScreen(activeTab), [activeTab]);

  return (
    <DashboardV2Shell
      title="Dashboard"
      subtitle="Vue opérationnelle le sur parc matériel"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTab={renderTab}
    />
  );
}
