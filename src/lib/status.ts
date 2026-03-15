/**
 * Mapping istat_id → badge styles & colors.
 * Βασίζεται στο API: GET /api/istats
 *  1 = Προτεινόμενο  (teal)
 *  2 = Υπό σχεδιασμό (cyan)
 *  3 = Σε εξέλιξη    (green)
 *  4 = Ολοκληρωμένο  (blue)
 */

export interface StatusStyle {
  badge: string;
  dot: string;
  label: string;
  color: string;
}

const STATUS_MAP: Record<number, StatusStyle> = {
  1: {
    label: "Προτεινόμενο",
    color: "#14B8A6",
    badge: "bg-teal-100 text-teal-800 ring-teal-600/20",
    dot: "bg-teal-500",
  },
  2: {
    label: "Υπό σχεδιασμό",
    color: "#06B6D4",
    badge: "bg-cyan-100 text-cyan-800 ring-cyan-600/20",
    dot: "bg-cyan-500",
  },
  3: {
    label: "Σε εξέλιξη",
    color: "#22C55E",
    badge: "bg-green-100 text-green-800 ring-green-600/20",
    dot: "bg-green-500",
  },
  4: {
    label: "Ολοκληρωμένο",
    color: "#3B82F6",
    badge: "bg-blue-100 text-blue-800 ring-blue-600/20",
    dot: "bg-blue-500",
  },
};

const DEFAULT_STATUS: StatusStyle = {
  label: "Άγνωστη κατάσταση",
  color: "#9CA3AF",
  badge: "bg-gray-100 text-gray-800 ring-gray-600/20",
  dot: "bg-gray-400",
};

export function getStatusStyle(istatId: number | null | undefined): StatusStyle {
  if (istatId == null) return DEFAULT_STATUS;
  return STATUS_MAP[istatId] ?? DEFAULT_STATUS;
}

export function getStatusLabel(istatId: number | null | undefined, istatTitle?: string | null): string {
  if (istatTitle) return istatTitle;
  return getStatusStyle(istatId).label;
}

export function getStatusColor(istatId: number | null | undefined): string {
  return getStatusStyle(istatId).color;
}

/** Ordered list of all statuses — χρήσιμο για charts/maps/legends */
export const STATUS_LIST = [
  { istat: 1, key: "proposed",       ...STATUS_MAP[1] },
  { istat: 2, key: "under_planning", ...STATUS_MAP[2] },
  { istat: 3, key: "in_progress",    ...STATUS_MAP[3] },
  { istat: 4, key: "completed",      ...STATUS_MAP[4] },
] as const;
