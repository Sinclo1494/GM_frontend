import React, { useEffect, useState, useMemo } from "react";
import {
  KpiCard,
  DonutChart,
  Section,
  StatusBadge,
  LoadingSpinner,
  ErrorBox,
  useDashboardFilters,
  filtersToParams,
  isAbortError,
  SITUATION_COLORS,
  PALETTE_VALUES,
  pct,
  fmtNumber,
  fmtMillions,
} from "../index";
import { useDashboardOverview } from "../DashboardOverviewContext";
import { DASHBOARD_TARGETS } from "../dashboardTargets";
import { getDashboardV2Situation } from "../../../../api/dashboardV2Services";
import type { DashboardV2Situation } from "../../../../types/dashboardV2";
import type { DashboardV2FilialeDistributionItem } from "../../../../types/dashboardV2";

function ApercuScreenImpl() {
  const filters = useDashboardFilters();
  // The overview is fetched once per filter set by the shell's provider.
  const { overview, loading, error, retry } = useDashboardOverview();
  const [situation, setSituation] = useState<DashboardV2Situation | null>(null);
  const [situationError, setSituationError] = useState<string | null>(null);
  const [showMethodo, setShowMethodo] = useState(false);

  const { codeFiliale, codeFamille, dateDebut, dateFin } = filters;
  const params = useMemo(
    () => filtersToParams(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeFiliale, codeFamille, dateDebut, dateFin],
  );

  useEffect(() => {
    let cancelled = false;
    getDashboardV2Situation<DashboardV2Situation>(params)
      .then((data) => {
        if (!cancelled) setSituation(data);
      })
      .catch((e: unknown) => {
        if (cancelled || isAbortError(e)) return;
        setSituationError(
          e instanceof Error ? e.message : "Erreur de chargement",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const gk = overview?.globalKpis;
  const mk = overview?.maintenanceKpis;
  const fk = overview?.financialKpis;
  const parcTotal = gk?.parc_total ?? 0;
  // Population actually covered by a situation row: the donut sums to it, and
  // the "% of parc" badges use it as denominator (materials without any
  // situation are simply unknown, not "0 %").
  const situationTotal = gk?.situation_total ?? 0;

  // Filiale distribution (only when no filiale filter is selected)
  const filialeDist: DashboardV2FilialeDistributionItem[] = overview?.filialeDistribution ?? [];
  const filialeDonutData = {
    labels: filialeDist.map((f) => f.libelle_filiale),
    values: filialeDist.map((f) => f.totalMateriel),
  };
  const filialeDonutTotal = filialeDist.reduce((sum, f) => sum + f.totalMateriel, 0);

  const situationDist = situation?.situationDistribution ?? [];
  const donutData = {
    labels: situationDist.map((s) => s.libelle_type_situation),
    values: situationDist.map((s) => s.count),
  };

  const donutColors = situationDist.map(
    (s) => SITUATION_COLORS[s.code_type_situation] ?? PALETTE_VALUES[0],
  );

  const pctOfParc = (value: number | undefined) =>
    situationTotal > 0 ? (Number(value ?? 0) / situationTotal) * 100 : 0;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox message={error} onRetry={retry} />;
  if (situationError) {
    return <ErrorBox message={situationError} onRetry={retry} />;
  }

  const TARGET_DISPO = DASHBOARD_TARGETS.disponibilite;
  const TARGET_TIP = DASHBOARD_TARGETS.tip;
  const TARGET_TAM = DASHBOARD_TARGETS.tam;
  const TARGET_TAMD = DASHBOARD_TARGETS.tamd;

  return (
    <div className="min-w-0">
      {/* PARC */}
      <Section title="PARC" accent="blue">
        <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 min-w-0">
            <DonutChart
              data={donutData}
              centerLabel={fmtNumber(
                situationDist.reduce((sum, s) => sum + (Number(s.count) || 0), 0),
              )}
              colors={donutColors}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
              {fmtNumber(situationTotal)} engins avec situation sur un parc de{" "}
              {fmtNumber(parcTotal)}
            </p>
          </div>
          <div className="min-w-0">
            <KpiCard
              title="Parc total"
              value={fmtNumber(parcTotal)}
              subtext={
                <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  {fmtNumber(situationTotal)} avec situation
                </span>
              }
              status="info"
            />
          </div>
          <div className="min-w-0">
            <KpiCard
              title="En service"
              value={fmtNumber(gk?.en_service)}
              subtext={
                <StatusBadge
                  ok={pctOfParc(gk?.en_service) >= DASHBOARD_TARGETS.partEnService}
                  labelKo={`< ${DASHBOARD_TARGETS.partEnService}%`}
                  labelOk={`≥ ${DASHBOARD_TARGETS.partEnService}%`}
                />
              }
              status={
                pctOfParc(gk?.en_service) >= DASHBOARD_TARGETS.partEnService
                  ? "success"
                  : "warning"
              }
            />
          </div>
          <div className="min-w-0">
            <KpiCard
              title="En chômage"
              value={fmtNumber(gk?.en_chomage)}
              subtext={
                <StatusBadge
                  ok={pctOfParc(gk?.en_chomage) < DASHBOARD_TARGETS.partEnChomage}
                  labelKo={`≥ ${DASHBOARD_TARGETS.partEnChomage}%`}
                  labelOk={`< ${DASHBOARD_TARGETS.partEnChomage}%`}
                />
              }
              status={
                pctOfParc(gk?.en_chomage) < DASHBOARD_TARGETS.partEnChomage
                  ? "success"
                  : "warning"
              }
            />
          </div>
          <div className="min-w-0">
            <KpiCard
              title="En panne"
              value={fmtNumber(gk?.en_panne)}
              subtext={
                <StatusBadge
                  ok={pctOfParc(gk?.en_panne) < DASHBOARD_TARGETS.partEnPanne}
                  labelKo={`≥ ${DASHBOARD_TARGETS.partEnPanne}%`}
                  labelOk={`< ${DASHBOARD_TARGETS.partEnPanne}%`}
                />
              }
              status={
                pctOfParc(gk?.en_panne) < DASHBOARD_TARGETS.partEnPanne
                  ? "success"
                  : "danger"
              }
            />
          </div>
        </div>
      </Section>

      {/* RÉPARTITION PAR FILIALE (affichée seulement quand aucune filiale n'est sélectionnée) */}
      {!filters.codeFiliale && filialeDist.length > 0 && (
        <Section title="Répartition du parc par filiale" accent="teal">
          <div className="grid grid-cols-1 gap-6 min-w-0 lg:grid-cols-3">
            <div className="lg:col-span-2 min-w-0">
              <DonutChart
                data={filialeDonutData}
                centerLabel={fmtNumber(filialeDonutTotal)}
              />
            </div>
            <div className="lg:col-span-1 min-w-0">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filialeDist.map((f) => (
                  <div
                    key={f.code_filiale}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{f.libelle_filiale}</span>
                    <span className="text-gray-600 dark:text-dark-text-secondary">
                      {fmtNumber(f.totalMateriel)} engins
                      {parcTotal > 0 && (
                        <>
                          {" "}
                          ({((f.totalMateriel / parcTotal) * 100).toFixed(1)}%)
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* RENDEMENT HORAIRE */}
      <Section title="RENDEMENT HORAIRE" accent="amber">
        <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="Potentiel (h)"
            value={fmtNumber(mk?.potentiel_total, 1)}
            status="info"
          />
          <KpiCard
            title={`Taux service % (vs ${DASHBOARD_TARGETS.tauxService}%)`}
            value={pct(mk?.taux_service)}
            subtext={
              <StatusBadge
                ok={(mk?.taux_service ?? 0) >= DASHBOARD_TARGETS.tauxService}
                labelOk={`≥ ${DASHBOARD_TARGETS.tauxService}%`}
                labelKo={`< ${DASHBOARD_TARGETS.tauxService}%`}
              />
            }
            status={
              mk && mk.taux_service >= DASHBOARD_TARGETS.tauxService
                ? "success"
                : "danger"
            }
          />
          <KpiCard
            title={`Taux chômage % (vs ${DASHBOARD_TARGETS.tauxChomage}%)`}
            // backend value: the frontend used to recompute heures_chomage /
            // potentiel_total, which is NaN when the potential is 0.
            value={pct(mk?.taux_chomage)}
            subtext={
              <StatusBadge
                ok={(mk?.taux_chomage ?? 0) < DASHBOARD_TARGETS.tauxChomage}
                labelOk={`< ${DASHBOARD_TARGETS.tauxChomage}%`}
                labelKo={`≥ ${DASHBOARD_TARGETS.tauxChomage}%`}
              />
            }
            status={
              mk && mk.taux_chomage < DASHBOARD_TARGETS.tauxChomage
                ? "success"
                : "danger"
            }
          />
          <KpiCard
            title={`Taux panne % (heures, vs ${DASHBOARD_TARGETS.tauxPanne}%)`}
            value={pct(mk?.taux_panne)}
            subtext={
              <StatusBadge
                ok={(mk?.taux_panne ?? 100) < DASHBOARD_TARGETS.tauxPanne}
                labelOk={`< ${DASHBOARD_TARGETS.tauxPanne}%`}
                labelKo={`≥ ${DASHBOARD_TARGETS.tauxPanne}%`}
              />
            }
            status={
              mk && mk.taux_panne < DASHBOARD_TARGETS.tauxPanne
                ? "success"
                : "danger"
            }
          />
          <KpiCard
            title={`Disponibilité % (vs ${TARGET_DISPO}%)`}
            value={pct(mk?.disponibilite)}
            subtext={
              <StatusBadge
                ok={(mk?.disponibilite ?? 0) >= TARGET_DISPO}
                labelOk={`≥ ${TARGET_DISPO}%`}
                labelKo={`< ${TARGET_DISPO}%`}
              />
            }
            status={
              mk && mk.disponibilite >= TARGET_DISPO ? "success" : "danger"
            }
          />
          <KpiCard
            title="Écart cible disponibilité"
            value={`${(mk?.disponibilite ?? 0) - TARGET_DISPO >= 0 ? "+" : ""}${((mk?.disponibilite ?? 0) - TARGET_DISPO).toFixed(1)} pt`}
            subtext={
              <StatusBadge
                ok={(mk?.disponibilite ?? 0) >= TARGET_DISPO}
                labelOk="Atteint"
                labelKo="En dessous"
              />
            }
            status={
              mk && mk.disponibilite >= TARGET_DISPO ? "success" : "danger"
            }
          />
        </div>
      </Section>

      {/* MAINTENANCE */}
      <Section title="MAINTENANCE" accent="red">
        <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title={`TMAD (vs ${TARGET_TAMD}%)`}
            value={pct(mk?.tamd)}
            subtext={
              <StatusBadge
                ok={(mk?.tamd ?? 0) >= TARGET_TAMD}
                labelOk={`≥ ${TARGET_TAMD}%`}
                labelKo={`< ${TARGET_TAMD}%`}
              />
            }
            status={mk && mk.tamd >= TARGET_TAMD ? "success" : "danger"}
          />
          <KpiCard
            title={`TIP (vs ${TARGET_TIP}%)`}
            value={pct(mk?.tip)}
            subtext={
              <StatusBadge
                ok={(mk?.tip ?? 100) <= TARGET_TIP}
                labelOk={`≤ ${TARGET_TIP}%`}
                labelKo={`> ${TARGET_TIP}%`}
              />
            }
            status={mk && mk.tip <= TARGET_TIP ? "success" : "danger"}
          />
          <KpiCard
            title={`TAM (vs ${TARGET_TAM}%)`}
            value={pct(mk?.tam)}
            subtext={
              <StatusBadge
                ok={(mk?.tam ?? 0) >= TARGET_TAM}
                labelOk={`≥ ${TARGET_TAM}%`}
                labelKo={`< ${TARGET_TAM}%`}
              />
            }
            status={mk && mk.tam >= TARGET_TAM ? "success" : "danger"}
          />
          <KpiCard
            title="Unités en panne"
            value={fmtNumber(mk?.en_panne)}
            status="danger"
          />
          <KpiCard
            title="Unités en réparation"
            value={fmtNumber(mk?.en_reparation)}
            status="warning"
          />
          <KpiCard
            title="Écart TMAD"
            value={`${(mk?.tamd ?? 0) - TARGET_TAMD >= 0 ? "+" : ""}${((mk?.tamd ?? 0) - TARGET_TAMD).toFixed(1)} pt`}
            subtext={
              <StatusBadge
                ok={(mk?.tamd ?? 0) >= TARGET_TAMD}
                labelOk="Atteint"
                labelKo="En dessous"
              />
            }
            status={mk && mk.tamd >= TARGET_TAMD ? "success" : "danger"}
          />
        </div>
      </Section>

      {/* FINANCIERS */}
      <Section title="FINANCIERS" accent="purple">
        <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="CA réalisé (M DA)"
            value={fmtMillions(fk?.caRealise)}
            subtext={
              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                Montants saisis : {fmtMillions(fk?.factService)}
              </span>
            }
            status="success"
          />
          <KpiCard
            title="Total facturé (M DA)"
            value={fmtMillions(fk?.totalFacture)}
            subtext={
              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                Chômage {fmtMillions(fk?.factChomage)} · Panne{" "}
                {fmtMillions(fk?.factPanne)}
              </span>
            }
            status="info"
          />
          <KpiCard
            title="CA potentiel (M DA)"
            value={fmtMillions(fk?.caPotentiel)}
            status="info"
          />
          <KpiCard
            title="Manque à gagner (M DA)"
            value={fmtMillions(fk?.manqueAGagner)}
            subtext={
              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                {Number(fk?.manqueAGagner ?? 0) >= 0
                  ? "Potentiel non atteint"
                  : "Facturé au-dessus du potentiel"}
              </span>
            }
            status={
              Number(fk?.manqueAGagner ?? 0) >= 0 ? "warning" : "success"
            }
          />
          <KpiCard
            title="Marge (M DA)"
            value={fmtMillions(fk?.marge)}
            subtext={
              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                Régularisation : {fmtMillions(fk?.totalRegularisation)}
              </span>
            }
            status={Number(fk?.marge ?? 0) >= 0 ? "success" : "danger"}
          />
          <KpiCard
            title="Écart cible MAG"
            // ecartCible is positive-is-good: the fleet billed less than its
            // potential. (The backend used to return the opposite sign, which
            // made a healthy KPI render red.)
            value={`${(fk?.ecartCible ?? 0) >= 0 ? "+" : ""}${(fk?.ecartCible ?? 0).toFixed(1)} %`}
            subtext={
              <StatusBadge
                ok={(fk?.ecartCible ?? 0) >= 0}
                labelOk="Sous la cible"
                labelKo="Au-dessus de la cible"
              />
            }
            status={(fk?.ecartCible ?? 0) >= 0 ? "success" : "danger"}
          />
        </div>
      </Section>

      {/* Méthodologie collapsible */}
      <Section title="" accent="gray">
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowMethodo(!showMethodo)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-dark-text-primary dark:hover:text-white"
          >
            <span>{showMethodo ? "▼" : "▶"}</span>
            Méthodologie
          </button>
          {showMethodo && (
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-dark-text-secondary">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Toutes les heures ci-dessous sont des <strong>heures</strong>{" "}
                  (Σ des pointages de la période) ; les parts d&apos;engins sont
                  calculées sur la <strong>population matériaux</strong> (parc ou
                  engins avec situation), jamais sur les heures.
                </li>
                <li>
                  <strong>Potentiel</strong> = Σ heures potentiel des pointages.
                </li>
                <li>
                  <strong>Disponibilité</strong> = (potentiel − heures panne) /
                  potentiel × 100.
                </li>
                <li>
                  <strong>TMAD</strong> (Taux Moyen de Disponibilité) = (potentiel
                  − heures panne − heures chômage) / potentiel × 100 : la
                  disponibilité réellement servie, chômage retiré.
                </li>
                <li>
                  <strong>TAM</strong> (Taux d&apos;Aptitude à la Maintenance) =
                  heures service / (potentiel − heures panne) × 100 : part du
                  temps hors panne qui a réellement été travaillée.
                </li>
                <li>
                  <strong>TIP</strong> (Taux d&apos;Indisponibilité pour Panne) =
                  heures panne / potentiel × 100. Il est donc identique au{" "}
                  <strong>taux de panne</strong> (heures), à la différence
                  près que TIP est l&apos;indicateur suivi par cible.
                </li>
                <li>
                  <strong>Taux de service</strong> = heures service / potentiel ×
                  100 ; <strong>taux de chômage</strong> = heures chômage /
                  potentiel × 100.
                </li>
                <li>
                  <strong>Rendement</strong> = disponibilité × taux
                  d&apos;utilisation / 100.
                </li>
                <li>
                  <strong>CA réalisé</strong> = Σ(montant_service saisi, sinon
                  heures service × taux de location) ; <strong>CA potentiel</strong>{" "}
                  = Σ(potentiel × taux de location).
                </li>
                <li>
                  <strong>Total facturé</strong> = CA réalisé + Σ montants
                  chômage + Σ montants panne ; <strong>marge</strong> = CA réalisé
                  − Σ régularisation.
                </li>
                <li>
                  <strong>Manque à gagner</strong> = CA potentiel − CA réalisé
                  (signé : négatif = facturé au-dessus du potentiel).{" "}
                  <strong>Écart cible</strong> = manque à gagner / CA potentiel ×
                  100, <strong>positif = favorable</strong>.
                </li>
                {mk?.note && <li>{mk.note}</li>}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

const ApercuScreen = React.lazy(() => Promise.resolve({ default: ApercuScreenImpl }));

export default ApercuScreen;
