"use client";

import { useState, useEffect, useMemo } from "react";
import { SITE } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";
import { exportProjects, getFilteredCounts } from "@/lib/api";
import type { FullStatsResponse } from "@/lib/types";

// ─── Wizard steps ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Περιφέρεια",  icon: "bi-geo-alt"           },
  { id: 2, label: "Κατάσταση",   icon: "bi-bookmark"           },
  { id: 3, label: "Κατηγορία",   icon: "bi-tag"                },
  { id: 4, label: "Μορφή",       icon: "bi-file-earmark"       },
  { id: 5, label: "Λήψη",        icon: "bi-download"           },
];

type Format = "xlsx" | "xml" | "csv";

const FORMATS = [
  { id: "xlsx" as Format, label: "Excel",  ext: ".xlsx", icon: "bi-file-earmark-spreadsheet-fill", available: true  },
  { id: "xml"  as Format, label: "XML",    ext: ".xml",  icon: "bi-file-earmark-code-fill",         available: false },
  { id: "csv"  as Format, label: "CSV",    ext: ".csv",  icon: "bi-file-earmark-text-fill",         available: false },
];

// istat_id → by_runit field
const ISTAT_KEY: Record<number, "proposed" | "under_planning" | "in_progress" | "completed"> = {
  1: "proposed",
  2: "under_planning",
  3: "in_progress",
  4: "completed",
};

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function fmtBudget(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} εκατ. €`;
  return `${(n / 1_000).toFixed(0)} χιλ. €`;
}

// ─── CheckChip ────────────────────────────────────────────────────────────────
function CheckChip({
  checked, onClick, label, badge, badgeDimmed, color, disabled,
}: {
  checked: boolean; onClick: () => void; label: string;
  badge?: number; badgeDimmed?: boolean; color?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all duration-150 text-left w-full ${
        checked
          ? "border-transparent text-white shadow-md"
          : disabled
          ? "opacity-30 cursor-not-allowed border-gray-100 bg-gray-50"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm"
      }`}
      style={checked ? { background: color || "var(--color-primary)" } : {}}
    >
      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
        checked ? "border-white/40 bg-white/20" : "border-gray-300 bg-white"
      }`}>
        {checked && <i className="bi bi-check text-xs" />}
      </span>
      <span className="flex-1 leading-tight">{label}</span>
      {badge !== undefined && badge >= 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[22px] text-center transition-all ${
          checked ? "bg-white/20 text-white" : badgeDimmed ? "bg-gray-50 text-gray-300" : "bg-gray-100 text-gray-500"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, idx) => (
        <div key={s.id} className="flex items-center flex-1 min-w-0">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              step === s.id
                ? "text-white shadow-md"
                : step > s.id
                ? "text-white"
                : "text-gray-400 bg-gray-100"
            }`}
            style={
              step === s.id
                ? { background: "var(--color-primary)" }
                : step > s.id
                ? { background: "rgba(35,48,83,0.45)" }
                : {}
            }
          >
            <i className={`bi ${step > s.id ? "bi-check-circle-fill" : s.icon}`} />
            <span className="hidden md:inline">{s.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 rounded ${step > s.id ? "bg-gray-300" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Nav buttons ──────────────────────────────────────────────────────────────
function NavButtons({
  step, onBack, onNext, nextLabel, nextDisabled, loading,
}: {
  step: number; onBack: () => void; onNext: () => void;
  nextLabel?: string; nextDisabled?: boolean; loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
      {step > 1 ? (
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
          <i className="bi bi-arrow-left" /> Πίσω
        </button>
      ) : <div />}
      <button
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ background: "var(--color-primary)" }}
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Εξαγωγή...</>
        ) : (
          <>{nextLabel ?? "Επόμενο"} <i className="bi bi-arrow-right" /></>
        )}
      </button>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, count }: { title: string; subtitle?: string; count?: number }) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {count !== undefined && (
          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ background: "var(--color-tertiary)" }}>
            {count} έργα
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OpendataPage() {
  const [step, setStep] = useState(1);
  const [stats, setStats] = useState<FullStatsResponse | null>(null);

  // Selections
  const [selRunits,  setSelRunits]  = useState<number[]>([]);
  const [selIstats,  setSelIstats]  = useState<number[]>([]);
  const [selTypos,   setSelTypos]   = useState<number[]>([]);
  const [selPillars, setSelPillars] = useState<number[]>([]);
  const [selBudget,  setSelBudget]  = useState<{ min: number; max: number | null } | null>(null);
  const [format,     setFormat]     = useState<Format>("xlsx");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [done,       setDone]       = useState(false);

  // Step 3 filtered counts
  const [filteredCounts, setFilteredCounts] = useState<{
    byTypo: Record<number, number>;
    byPillar: Record<number, number>;
    budgets: number[];
  } | null>(null);
  const [loadingStep3, setLoadingStep3] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://egra2026.test/"}api/stats/${SITE.regionId}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // ── Dependent counts ────────────────────────────────────────────────────────

  // Total count estimate for selected runits
  const runitTotal = useMemo(() => {
    if (!stats) return null;
    if (selRunits.length === 0) return stats.totals.projects;
    return stats.by_runit
      .filter((r) => selRunits.includes(r.runit_id))
      .reduce((s, r) => s + r.total, 0);
  }, [stats, selRunits]);

  // Istat counts: if runits selected → compute from by_runit, else use by_istat
  const istatCounts = useMemo(() => {
    if (!stats) return {};
    if (selRunits.length === 0) {
      return Object.fromEntries(stats.by_istat.map((s) => [s.istat_id, s.count]));
    }
    const filtered = stats.by_runit.filter((r) => selRunits.includes(r.runit_id));
    return Object.fromEntries(
      stats.by_istat.map((s) => {
        const key = ISTAT_KEY[s.istat_id];
        const count = key ? filtered.reduce((acc, r) => acc + (r[key] ?? 0), 0) : 0;
        return [s.istat_id, count];
      })
    );
  }, [stats, selRunits]);

  // After istat selection, estimate typo counts (approximated proportionally)
  const istatTotal = useMemo(() => {
    if (!stats) return null;
    if (selIstats.length === 0) return runitTotal;
    return stats.by_istat
      .filter((s) => selIstats.includes(s.istat_id))
      .reduce((acc, s) => acc + (istatCounts[s.istat_id] ?? s.count), 0);
  }, [stats, selIstats, istatCounts, runitTotal]);

  // Typo counts: shown as-is (no cross-dimensional data from API)
  const typoTotal = useMemo(() => {
    if (!stats) return null;
    if (selTypos.length === 0 && selPillars.length === 0) return istatTotal;
    let t = 0;
    if (selTypos.length > 0)
      t += stats.by_typo.filter((x) => selTypos.includes(x.typo_id)).reduce((a, x) => a + x.count, 0);
    if (selPillars.length > 0)
      t += stats.by_pillar.filter((x) => selPillars.includes(x.pillar_id)).reduce((a, x) => a + x.count, 0);
    return t;
  }, [stats, selTypos, selPillars, istatTotal]);

  const currentTotal = step === 1 ? runitTotal : step === 2 ? istatTotal : typoTotal;

  // Fetch filtered counts when entering step 3 with active filters
  useEffect(() => {
    if (step !== 3) return;
    if (selRunits.length === 0 && selIstats.length === 0) {
      setFilteredCounts(null);
      return;
    }
    setLoadingStep3(true);
    getFilteredCounts({
      runit: selRunits.length > 0 ? selRunits : undefined,
      istat: selIstats.length > 0 ? selIstats : undefined,
    })
      .then(setFilteredCounts)
      .catch(() => setFilteredCounts(null))
      .finally(() => setLoadingStep3(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Budget range counts from filtered projects
  const filteredBudgetCounts = useMemo(() => {
    if (!filteredCounts || !stats) return null;
    const result: Record<string, number> = {};
    for (const b of filteredCounts.budgets) {
      const range = stats.by_budget.find(
        (r) => b >= r.min && (r.max == null || b <= r.max)
      );
      if (range) result[range.range] = (result[range.range] ?? 0) + 1;
    }
    return result;
  }, [filteredCounts, stats]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      const blob = await exportProjects({
        ...(selRunits.length  ? { runit:   selRunits  } : {}),
        ...(selIstats.length  ? { istat:   selIstats  } : {}),
        ...(selTypos.length   ? { typo:    selTypos   } : {}),
        ...(selPillars.length ? { pillar:  selPillars } : {}),
        ...(selBudget ? { min_budget: selBudget.min,
          ...(selBudget.max != null ? { max_budget: selBudget.max } : {}) } : {}),
      });
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href    = url;
      a.download = `erga-${SITE.regionId}-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch {
      setError("Σφάλμα κατά την εξαγωγή. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1); setDone(false);
    setSelRunits([]); setSelIstats([]); setSelTypos([]);
    setSelPillars([]); setSelBudget(null); setFormat("xlsx");
    setError(""); setFilteredCounts(null);
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Δεδομένα"
        titleHighlight="Ανοικτά"
        description="Εξάγετε δεδομένα έργων της Περιφέρειας Πελοποννήσου βήμα-βήμα, επιλέγοντας τα φίλτρα που σας ενδιαφέρουν."
        image="/images/public-data.png"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <StepBar step={step} />

        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.09)" }}>

          {/* ══ Step 1: ΠΕ ══════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="p-8">
              <SectionHeader
                title="Περιφερειακή Ενότητα"
                subtitle="Επιλέξτε μία ή περισσότερες ΠΕ. Χωρίς επιλογή, λαμβάνονται έργα από όλες."
                count={runitTotal ?? undefined}
              />
              {stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {stats.by_runit.map((r) => (
                    <CheckChip
                      key={r.runit_id}
                      checked={selRunits.includes(r.runit_id)}
                      onClick={() => setSelRunits((p) => toggle(p, r.runit_id))}
                      label={r.runit_title}
                      badge={r.total}
                    />
                  ))}
                </div>
              ) : <Skeleton />}
              <NavButtons step={step} onBack={() => {}} onNext={() => setStep(2)} />
            </div>
          )}

          {/* ══ Step 2: Κατάσταση ═══════════════════════════════════════════ */}
          {step === 2 && (
            <div className="p-8">
              <SectionHeader
                title="Κατάσταση Έργου"
                subtitle={selRunits.length ? "Τα νούμερα αντικατοπτρίζουν μόνο τις επιλεγμένες ΠΕ." : "Επιλέξτε μία ή περισσότερες καταστάσεις."}
                count={istatTotal ?? undefined}
              />
              {stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.by_istat.map((s) => {
                    const cnt = istatCounts[s.istat_id] ?? 0;
                    return (
                      <CheckChip
                        key={s.istat_id}
                        checked={selIstats.includes(s.istat_id)}
                        onClick={() => setSelIstats((p) => toggle(p, s.istat_id))}
                        label={s.title}
                        badge={cnt}
                        badgeDimmed={cnt === 0}
                        color={s.chroma}
                        disabled={cnt === 0}
                      />
                    );
                  })}
                </div>
              ) : <Skeleton />}
              <NavButtons step={step} onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </div>
          )}

          {/* ══ Step 3: Κατηγορία + Πυλώνες + Προϋπολογισμός ═══════════════ */}
          {step === 3 && (
            <div className="p-8 space-y-10">
              <SectionHeader
                title="Κατηγορία & Πυλώνες"
                subtitle="Επιπλέον φίλτρα — μπορείτε να παραλείψετε."
                count={typoTotal ?? undefined}
              />

              {loadingStep3 ? (
                <Skeleton h={4} />
              ) : (
                <>
                  {/* Κατηγορία */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <i className="bi bi-tag" style={{ color: "var(--color-primary)" }} />
                      Κατηγορία Έργου
                    </p>
                    {stats ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {stats.by_typo
                          .map((t) => ({
                            ...t,
                            displayCount: filteredCounts
                              ? (filteredCounts.byTypo[t.typo_id] ?? 0)
                              : t.count,
                          }))
                          .filter((t) => !filteredCounts || t.displayCount > 0)
                          .map((t) => (
                            <CheckChip
                              key={t.typo_id}
                              checked={selTypos.includes(t.typo_id)}
                              onClick={() => setSelTypos((p) => toggle(p, t.typo_id))}
                              label={t.title}
                              badge={t.displayCount}
                            />
                          ))}
                      </div>
                    ) : <Skeleton h={3} />}
                  </div>

                  {/* Πυλώνες */}
                  {stats?.by_pillar && stats.by_pillar.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <i className="bi bi-layers" style={{ color: "var(--color-primary)" }} />
                        Πυλώνας Προτεραιότητας
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {stats.by_pillar
                          .map((p) => ({
                            ...p,
                            displayCount: filteredCounts
                              ? (filteredCounts.byPillar[p.pillar_id] ?? 0)
                              : p.count,
                          }))
                          .filter((p) => !filteredCounts || p.displayCount > 0)
                          .map((p) => {
                            const selected = selPillars.includes(p.pillar_id);
                            return (
                              <button
                                key={p.pillar_id}
                                onClick={() => setSelPillars((prev) => toggle(prev, p.pillar_id))}
                                className={`rounded-2xl overflow-hidden flex flex-col text-center transition-all ${
                                  selected
                                    ? "ring-4 shadow-lg"
                                    : "ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-sm"
                                }`}
                                style={selected ? { ringColor: "var(--color-primary)", outline: `3px solid var(--color-primary)` } : {}}
                              >
                                {/* Image area */}
                                <div
                                  className="w-full overflow-hidden relative"
                                  style={{ height: "110px", background: "#f0efed" }}
                                >
                                  {p.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={p.image}
                                      alt={p.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <i className="bi bi-image text-3xl text-gray-300" />
                                    </div>
                                  )}
                                  {/* Selected overlay */}
                                  {selected && (
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(35,48,83,0.55)" }}>
                                      <i className="bi bi-check-circle-fill text-white text-2xl" />
                                    </div>
                                  )}
                                </div>
                                {/* Content */}
                                <div className={`p-3 flex flex-col items-center gap-1 ${selected ? "bg-primary" : "bg-white"}`}
                                  style={selected ? { background: "var(--color-primary)" } : {}}>
                                  <span className={`text-xs font-semibold leading-snug ${selected ? "text-white" : "text-gray-800"}`}>{p.title}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                  }`}>{p.displayCount} έργα</span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Εύρος Προϋπολογισμού */}
                  {stats?.by_budget && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <i className="bi bi-currency-euro" style={{ color: "var(--color-primary)" }} />
                        Εύρος Προϋπολογισμού
                        {selBudget && (
                          <button onClick={() => setSelBudget(null)} className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                            <i className="bi bi-x-circle" /> Καθαρισμός
                          </button>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stats.by_budget
                          .map((b) => ({
                            ...b,
                            displayCount: filteredBudgetCounts
                              ? (filteredBudgetCounts[b.range] ?? 0)
                              : b.count,
                          }))
                          .filter((b) => !filteredBudgetCounts || b.displayCount > 0)
                          .map((b) => {
                            const selected = selBudget?.min === b.min && selBudget?.max === b.max;
                            return (
                              <button
                                key={b.range}
                                onClick={() => setSelBudget(selected ? null : { min: b.min, max: b.max })}
                                className={`px-4 py-2.5 rounded-xl border text-sm transition-all ${
                                  selected
                                    ? "border-transparent text-white shadow-md"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                }`}
                                style={selected ? { background: "var(--color-tertiary)" } : {}}
                              >
                                <span className="font-medium">{b.range}</span>
                                <span className={`ml-2 text-xs ${selected ? "text-white/70" : "text-gray-400"}`}>({b.displayCount})</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <NavButtons step={step} onBack={() => setStep(2)} onNext={() => setStep(4)} />
            </div>
          )}

          {/* ══ Step 4: Μορφή ═══════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="p-8">
              <SectionHeader title="Μορφή Αρχείου" subtitle="Επιλέξτε τη μορφή εξαγωγής." />
              <div className="grid grid-cols-3 gap-4 max-w-lg">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    disabled={!f.available}
                    onClick={() => f.available && setFormat(f.id)}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      !f.available
                        ? "opacity-40 cursor-not-allowed border-gray-100 bg-gray-50"
                        : format === f.id
                        ? "border-transparent text-white shadow-lg scale-[1.03]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    style={format === f.id && f.available ? { background: "var(--color-primary)" } : {}}
                  >
                    <i className={`bi ${f.icon} text-4xl`} style={{ color: format === f.id && f.available ? "white" : "#22C55E" }} />
                    <div>
                      <p className={`font-semibold text-sm ${format === f.id && f.available ? "text-white" : "text-gray-900"}`}>{f.label}</p>
                      <p className={`text-xs mt-0.5 ${format === f.id && f.available ? "text-white/60" : "text-gray-400"}`}>{f.ext}</p>
                    </div>
                    {!f.available && <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded-full">Σύντομα</span>}
                  </button>
                ))}
              </div>
              <NavButtons step={step} onBack={() => setStep(3)} onNext={() => setStep(5)} />
            </div>
          )}

          {/* ══ Step 5: Λήψη ════════════════════════════════════════════════ */}
          {step === 5 && !done && (
            <div className="p-8">
              <SectionHeader title="Επιβεβαίωση & Λήψη" subtitle="Ελέγξτε τις επιλογές σας." />

              <div className="rounded-2xl p-6 space-y-4 mb-6" style={{ background: "#F8F7F6" }}>
                {[
                  { icon: "bi-file-earmark", label: "Μορφή", value: FORMATS.find((f) => f.id === format)?.label + " (" + FORMATS.find((f) => f.id === format)?.ext + ")" },
                  { icon: "bi-geo-alt", label: "ΠΕ", value: selRunits.length === 0 ? "Όλες" : stats?.by_runit.filter((r) => selRunits.includes(r.runit_id)).map((r) => r.runit_title).join(", ") },
                  { icon: "bi-bookmark", label: "Κατάσταση", value: selIstats.length === 0 ? "Όλες" : stats?.by_istat.filter((s) => selIstats.includes(s.istat_id)).map((s) => s.title).join(", ") },
                  { icon: "bi-tag", label: "Κατηγορία", value: selTypos.length === 0 ? "Όλες" : stats?.by_typo.filter((t) => selTypos.includes(t.typo_id)).map((t) => t.title).join(", ") },
                  { icon: "bi-layers", label: "Πυλώνας", value: selPillars.length === 0 ? "Όλοι" : stats?.by_pillar.filter((p) => selPillars.includes(p.pillar_id)).map((p) => p.title).join(", ") },
                  { icon: "bi-currency-euro", label: "Προϋπολογισμός", value: selBudget ? stats?.by_budget.find((b) => b.min === selBudget.min)?.range ?? "—" : "Όλα τα εύρη" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3 text-sm">
                    <i className={`bi ${row.icon} mt-0.5 shrink-0`} style={{ color: "var(--color-primary)" }} />
                    <span className="text-gray-500 w-28 shrink-0">{row.label}</span>
                    <span className="text-gray-900 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
                  <i className="bi bi-exclamation-circle" /> {error}
                </div>
              )}

              <NavButtons
                step={step}
                onBack={() => setStep(4)}
                onNext={handleDownload}
                nextLabel="Λήψη Αρχείου"
                loading={loading}
              />
            </div>
          )}

          {/* ══ Success ══════════════════════════════════════════════════════ */}
          {step === 5 && done && (
            <div className="p-12 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#22C55E18" }}>
                <i className="bi bi-check-circle-fill text-4xl text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Η εξαγωγή ολοκληρώθηκε!</h2>
              <p className="text-sm text-gray-500">Το αρχείο έχει κατεβεί στον υπολογιστή σας.</p>
              <button
                onClick={resetWizard}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-all"
                style={{ background: "var(--color-primary)" }}
              >
                <i className="bi bi-arrow-repeat" /> Νέα Εξαγωγή
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function Skeleton({ h = 2 }: { h?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: h }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse bg-gray-100 rounded-xl" />
      ))}
    </div>
  );
}
