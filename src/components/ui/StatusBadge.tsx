import { getStatusStyle } from "@/lib/status";

export default function StatusBadge({
  istatId,
  label,
}: {
  istatId: number | null | undefined;
  label?: string | null;
}) {
  const s = getStatusStyle(istatId);
  const text = label || s.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {text}
    </span>
  );
}
