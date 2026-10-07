/**
 * Single source of truth for every dashboard v2 target / threshold.
 *
 * The literals used to be copy-pasted in each screen (ApercuScreen, HealthBar,
 * DisponibiliteScreen, RendementScreen, FinancesScreen), which is how a screen
 * ended up comparing TMAD to 80 % while another compared it to 85 %.
 *
 * Convention: `*Max` targets are ceilings (below is good), the others are
 * floors (above is good). `dispoWarn` is the amber band used by the
 * disponibilité breakdown table when a `disponibilite` is neither at target nor
 * clearly broken.
 */
export const DASHBOARD_TARGETS = {
  disponibilite: 85, // %
  tamd: 80, // %
  tam: 65, // %
  tip: 15, // % max
  tauxService: 42, // %
  tauxPanne: 5, // % max
  tauxChomage: 20, // % max
  rendement: 60, // %
  dispoWarn: 70, // % fallback band for the breakdown table
  tauxAffectation: 70, // %
  partEnChomage: 50, // % max of parc
  partEnPanne: 10, // % max of parc
  partEnService: 70, // % of parc
} as const;

export type DashboardTargets = typeof DASHBOARD_TARGETS;
