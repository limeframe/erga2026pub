// ─── Site Info ────────────────────────────────────────────────────────────────
export const SITE = {
  name: "e-ΕΡΓΑ",
  fullName: "Περιφέρεια Πελοποννήσου",
  description: "Δημόσια πλατφόρμα έργων και δράσεων της Περιφέρειας Πελοποννήσου",
  version: "2.0.0-beta.1",
  regionId: 1,
} as const;

// ─── API ───────────────────────────────────────────────────────────────────────
export const API = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://egra2026.test/",
  storageUrl: process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://egra2026.test/storage/",
} as const;

// ─── Theme — αλλάξτε εδώ τα χρώματα για ολόκληρη την εφαρμογή ─────────────
export const THEME = {
  // Κύρια χρώματα brand
  primary: "#233053",
  primaryDark: "#162c54",
  primaryLight: "#036EC5",
  secondary: "#9BC2E3",
  tertiary: "#D76F3E",

  // Χρώματα κατάστασης έργων (Tailwind classes)
  status: {
    warning: {
      label: "Υπό σχεδιασμό",
      badge: "bg-amber-100 text-amber-800 ring-amber-600/20",
      dot: "bg-amber-500",
    },
    info: {
      label: "Σε εξέλιξη",
      badge: "bg-sky-100 text-sky-800 ring-sky-600/20",
      dot: "bg-sky-500",
    },
    success: {
      label: "Ολοκληρωμένο",
      badge: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
      dot: "bg-emerald-500",
    },
    danger: {
      label: "Σε διακοπή",
      badge: "bg-red-100 text-red-800 ring-red-600/20",
      dot: "bg-red-500",
    },
    default: {
      label: "Άγνωστη κατάσταση",
      badge: "bg-gray-100 text-gray-800 ring-gray-600/20",
      dot: "bg-gray-400",
    },
  },
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  home: "/",
  erga: "/erga",
  ergaSingle: (id: number | string) => `/erga/${id}`,
  megalaErga: "/megalaerga",
  megalaErgaSingle: (id: number | string) => `/megalaerga/${id}`,
  statistikaErga: "/statistika/erga",
  statistikaMegala: "/statistika/megalaerga",
  opendata: "/opendata",
  login: "/login",
  logout: "/logout",
  dashboard: "/dashboard",
} as const;

// ─── Χάρτες ΠΕ ────────────────────────────────────────────────────────────────
export const PE_MAPS: Record<string, { image: string; label: string }> = {
  "Π.Ε. ΜΕΣΣΗΝΙΑΣ": {
    image: "/images/vector-maps/map-pe-messinias.png",
    label: "Μεσσηνίας",
  },
  "Π.Ε. ΑΡΚΑΔΙΑΣ": {
    image: "/images/vector-maps/map-pe-arkadias.png",
    label: "Αρκαδίας",
  },
  "Π.Ε. ΑΡΓΟΛΙΔΑΣ": {
    image: "/images/vector-maps/map-pe-argolidas.png",
    label: "Αργολίδας",
  },
  "Π.Ε. ΚΟΡΙΝΘΙΑΣ": {
    image: "/images/vector-maps/map-pe-korinthias.png",
    label: "Κορινθίας",
  },
  "Π.Ε. ΛΑΚΩΝΙΑΣ": {
    image: "/images/vector-maps/map-pe-lakonias.png",
    label: "Λακωνίας",
  },
  "ΠΕΡΙΦΕΡΕΙΑ ΠΕΛΟΠΟΝΝΗΣΟΥ": {
    image: "/images/vector-maps/perifereia-peloponnisou-map.jpg",
    label: "Πελοπόννησος",
  },
};
