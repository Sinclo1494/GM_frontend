export const components = {
  button: {
    primary:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition dark:bg-blue-500 dark:hover:bg-blue-400",

    primaryLarge:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition dark:bg-blue-500 dark:hover:bg-blue-400",

    secondary:
      "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition dark:border-dark-border dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary",

    success:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition dark:bg-green-500 dark:hover:bg-green-400",

    successLarge:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition dark:bg-green-500 dark:hover:bg-green-400",

    danger:
      "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30",
  },

  loginButton:
    "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 transition dark:bg-blue-500 dark:hover:bg-blue-400",

  loginCard:
    "w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-xl dark:border-dark-border dark:bg-dark-bg-secondary/80",

  card:
    "bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-dark-card dark:border-dark-border",

  cardHeader:
    "border-b border-slate-200 p-6 dark:border-dark-border",

  input:
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition dark:border-dark-border dark:bg-dark-input dark:text-dark-text-primary dark:placeholder:text-dark-text-secondary dark:focus:border-blue-400 dark:focus:ring-blue-900/50",

  select:
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition dark:border-dark-border dark:bg-dark-input dark:text-dark-text-primary dark:focus:border-blue-400 dark:focus:ring-blue-900/50",

  table: {
    wrapper:
      "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card",

    header:
      "bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider dark:bg-dark-bg-tertiary dark:text-dark-text-secondary",

    row:
      "border-b border-slate-100 hover:bg-slate-50 transition-colors dark:border-dark-border dark:hover:bg-dark-bg-tertiary",
  },

  modal:
    "bg-white rounded-xl shadow-xl p-6 max-w-5/6 w-full dark:bg-dark-card dark:text-dark-text-primary",

  navbar:
    "w-full bg-slate-900 text-white h-16 flex items-center px-6 dark:bg-dark-bg-primary",

  sidebar:
    "bg-slate-800 text-white w-72 h-full dark:bg-dark-bg-secondary",

  badge: {
    success:
      "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400",

    warning:
      "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",

    danger:
      "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },

  pageTitle: "text-2xl font-bold text-gray-800 dark:text-dark-text-primary",
  pageDescription: "text-sm text-gray-500 mt-1 dark:text-dark-text-secondary",
  sectionTitle: "text-lg font-semibold text-gray-800 dark:text-dark-text-primary",
  label: "block text-sm font-medium text-gray-700 mb-1 dark:text-dark-text-primary",
};
