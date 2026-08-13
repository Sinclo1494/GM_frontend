export const components = {
  button: {
    primary:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition",

    primaryLarge:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition",

    secondary:
      "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition",

    success:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition",

    successLarge:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition",

    danger:
      "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition",
  },

  loginButton:
    "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 transition",

  loginCard:
    "w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-xl",

  card:
    "bg-white rounded-xl shadow-sm border border-slate-200 p-6",

  cardHeader:
    "border-b border-slate-200 p-6",

  input:
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition",

  select:
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition",

  table: {
    wrapper:
      "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",

    header:
      "bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider",

    row:
      "border-b border-slate-100 hover:bg-slate-50 transition-colors",
  },

  modal:
    "bg-white rounded-xl shadow-xl p-6 max-w-5/6 w-full",

  navbar:
    "w-full bg-slate-900 text-white h-16 flex items-center px-6",

  sidebar:
    "bg-slate-800 text-white w-72 h-full",

  badge: {
    success:
      "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700",

    warning:
      "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700",

    danger:
      "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700",
  },

  pageTitle: "text-2xl font-bold text-gray-800",
  pageDescription: "text-sm text-gray-500 mt-1",
  sectionTitle: "text-lg font-semibold text-gray-800",
  label: "block text-sm font-medium text-gray-700 mb-1",
};
