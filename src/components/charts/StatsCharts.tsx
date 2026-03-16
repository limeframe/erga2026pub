"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { FullStatsResponse } from "@/lib/types";
import { THEME } from "@/lib/config";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props { data: FullStatsResponse }

const fmtBudget = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} εκατ. €`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)} χιλ. €`;
  return `${n.toLocaleString("el-GR")} €`;
};

const fmtBudgetNoEur = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} εκατ.`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)} χιλ.`;
  return n.toLocaleString("el-GR");
};

const fmtEur = (n: number) =>
  n.toLocaleString("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const CARD_FONT = "var(--font-manrope), Manrope, system-ui, sans-serif";

export default function StatsCharts({ data }: Props) {
  const { totals, by_runit, by_istat, by_typo, by_budget, by_source, by_pillar } = data;

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalCards = [
    { label: "Σύνολο Έργων",         value: totals.projects.toString(),    icon: "bi-collection",        color: THEME.primary },
    { label: "Συνολικός Προϋπ.",      value: fmtBudgetNoEur(totals.budget), icon: "bi-currency-euro",     color: THEME.tertiary },
    { label: "Σε Εξέλιξη",           value: totals.in_progress.toString(), icon: "bi-arrow-repeat",      color: "#22C55E" },
    { label: "Ολοκληρωμένα",         value: totals.completed.toString(),   icon: "bi-check-circle-fill", color: "#3B82F6" },
  ];

  // ── by_istat lookup ───────────────────────────────────────────────────────
  const istatById = Object.fromEntries(by_istat.map((s) => [s.istat_id, s]));

  // ── by_istat donut ────────────────────────────────────────────────────────
  const istatSeries  = by_istat.map((s) => s.count);
  const istatLabels  = by_istat.map((s) => s.title_plural || s.title);
  const istatColors  = by_istat.map((s) => s.chroma || THEME.primary);

  // ── by_runit stacked bar ──────────────────────────────────────────────────
  const runitCategories = by_runit.map((r) => r.runit_title);
  const ISTAT_DEFS = [
    { key: "proposed"       as const, istat_id: 1, fallback: "Σε πρόταση",    fallbackColor: "#14B8A6" },
    { key: "under_planning" as const, istat_id: 2, fallback: "Υπό σχεδιασμό", fallbackColor: "#06B6D4" },
    { key: "in_progress"    as const, istat_id: 3, fallback: "Σε εξέλιξη",    fallbackColor: "#22C55E" },
    { key: "completed"      as const, istat_id: 4, fallback: "Ολοκληρωμένα",  fallbackColor: "#3B82F6" },
  ];
  const STATUS_KEYS = ISTAT_DEFS.map((def) => ({
    key:   def.key,
    label: istatById[def.istat_id]?.title_plural || def.fallback,
    color: istatById[def.istat_id]?.chroma       || def.fallbackColor,
  }));
  const runitSeries = STATUS_KEYS.map((sk) => ({
    name: sk.label,
    data: by_runit.map((r) => r[sk.key]),
    color: sk.color,
  }));

  // ── by_budget horizontal bar ──────────────────────────────────────────────
  const budgetLabels = by_budget.map((b) => b.range);
  const budgetValues = by_budget.map((b) => b.count);

  // ── by_typo donut ─────────────────────────────────────────────────────────
  const typoSeries = by_typo.map((t) => t.count);
  const typoLabels = by_typo.map((t) => t.title);

  // ── by_source bar ────────────────────────────────────────────────────────
  const sourceLabels = by_source.map((s) => s.title);
  const sourceValues = by_source.map((s) => s.count);

  const chartCard = (title: string, subtitle?: string) => (
    <div className="flex items-baseline justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
    </div>
  );

  return (
    <div className="space-y-8 mt-8">

      {/* ── Totals ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {totalCards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl p-6 flex flex-col gap-3"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)", borderTop: `4px solid ${c.color}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</span>
              <i className={`bi ${c.icon} text-xl`} style={{ color: c.color }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: c.color, fontFamily: CARD_FONT }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Κατάσταση + Ανά ΠΕ ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Donut κατάστασης */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {chartCard("Ανά Κατάσταση", `${totals.projects} έργα`)}
          <Chart
            type="donut"
            height={300}
            series={istatSeries}
            options={{
              chart: { fontFamily: CARD_FONT },
              labels: istatLabels,
              colors: istatColors,
              legend: { position: "bottom", fontSize: "13px", fontFamily: CARD_FONT },
              plotOptions: {
                pie: { donut: { size: "65%", labels: {
                  show: true,
                  total: { show: true, label: "Σύνολο", fontSize: "13px", fontFamily: CARD_FONT,
                    formatter: () => totals.projects.toString() },
                  value: { fontSize: "24px", fontWeight: 700, fontFamily: CARD_FONT },
                }}},
              },
              tooltip: { y: { formatter: (v) => `${v} έργα` } },
              stroke: { width: 2 },
              dataLabels: { style: { fontFamily: CARD_FONT } },
            }}
          />
        </div>

        {/* Stacked bar ανά ΠΕ */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {chartCard("Ανά Περιφερειακή Ενότητα")}
          <Chart
            type="bar"
            height={300}
            series={runitSeries}
            options={{
              chart: { stacked: true, toolbar: { show: false }, fontFamily: CARD_FONT },
              plotOptions: { bar: { horizontal: true, borderRadius: 3, borderRadiusApplication: "end" } },
              xaxis: { categories: runitCategories, labels: { style: { fontSize: "12px", fontFamily: CARD_FONT } } },
              yaxis: { labels: { style: { fontSize: "12px", fontFamily: CARD_FONT } } },
              legend: { position: "top", fontSize: "12px", fontFamily: CARD_FONT },
              grid: { strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
              tooltip: { shared: true, intersect: false, y: { formatter: (v) => `${v} έργα` } },
              dataLabels: { enabled: false },
            }}
          />
        </div>
      </div>

      {/* ── Κατανομή προϋπολογισμού + Κατηγορία ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {chartCard("Κατανομή Προϋπολογισμού", "αριθμός έργων ανά εύρος")}
          <Chart
            type="bar"
            height={280}
            series={[{ name: "Αριθμός Έργων", data: budgetValues }]}
            options={{
              chart: { toolbar: { show: false }, fontFamily: CARD_FONT },
              plotOptions: { bar: { horizontal: true, borderRadius: 4, borderRadiusApplication: "end",
                dataLabels: { position: "top" } } },
              colors: [THEME.secondary],
              xaxis: { categories: budgetLabels, labels: { style: { fontSize: "12px", fontFamily: CARD_FONT } } },
              yaxis: { labels: { style: { fontSize: "12px", fontFamily: CARD_FONT } } },
              grid: { strokeDashArray: 4 },
              dataLabels: { enabled: true, offsetX: 8, style: { fontSize: "12px", colors: ["#374151"], fontFamily: CARD_FONT } },
              tooltip: { y: { formatter: (v) => `${v} έργα` } },
            }}
          />
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {chartCard("Ανά Κατηγορία Έργου")}
          <Chart
            type="donut"
            height={280}
            series={typoSeries}
            options={{
              chart: { fontFamily: CARD_FONT },
              labels: typoLabels,
              colors: [THEME.primary, THEME.secondary, THEME.tertiary, "#14B8A6", "#06B6D4", "#8B5CF6", "#F59E0B", "#EC4899"],
              legend: { position: "bottom", fontSize: "12px", fontFamily: CARD_FONT },
              plotOptions: { pie: { donut: { size: "60%" } } },
              tooltip: { y: { formatter: (v) => `${v} έργα` } },
              stroke: { width: 2 },
            }}
          />
        </div>
      </div>

      {/* ── Πηγή χρηματοδότησης ── */}
      {by_source.length > 0 && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {chartCard("Ανά Πηγή Χρηματοδότησης")}
          <Chart
            type="bar"
            height={Math.max(200, by_source.length * 52)}
            series={[{ name: "Αριθμός Έργων", data: sourceValues }]}
            options={{
              chart: { toolbar: { show: false }, fontFamily: CARD_FONT },
              plotOptions: { bar: { horizontal: true, borderRadius: 4, borderRadiusApplication: "end",
                dataLabels: { position: "top" } } },
              colors: [THEME.primary],
              xaxis: { categories: sourceLabels, labels: { style: { fontSize: "12px", fontFamily: CARD_FONT } } },
              yaxis: { labels: { style: { fontSize: "12px", fontFamily: CARD_FONT }, maxWidth: 220 } },
              grid: { strokeDashArray: 4 },
              dataLabels: { enabled: true, offsetX: 8, style: { fontSize: "12px", colors: ["#374151"], fontFamily: CARD_FONT } },
              tooltip: { y: { formatter: (v, { dataPointIndex }) =>
                `${v} έργα — ${fmtEur(by_source[dataPointIndex]?.total_budget ?? 0)}` } },
            }}
          />
        </div>
      )}

      {/* ── Ανά ΠΕ αναλυτικός πίνακας ── */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Αναλυτικός Πίνακας ανά Περιφερειακή Ενότητα</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: THEME.primary }}>
              <tr>
                <th className="px-5 py-3 text-left text-white text-xs uppercase tracking-wide">Περιφερειακή Ενότητα</th>
                {STATUS_KEYS.map((sk) => (
                  <th key={sk.key} className="px-4 py-3 text-center text-xs uppercase tracking-wide" style={{ color: sk.color }}>
                    {sk.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-white text-xs uppercase tracking-wide">Σύνολο</th>
                <th className="px-4 py-3 text-right text-white text-xs uppercase tracking-wide">Προϋπολογισμός</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {by_runit.map((row) => (
                <tr key={row.runit_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{row.runit_title}</td>
                  {STATUS_KEYS.map((sk) => (
                    <td key={sk.key} className="px-4 py-3 text-center font-medium" style={{ color: sk.color }}>
                      {row[sk.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-bold text-gray-900">{row.total}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtBudget(row.total_budget)}</td>
                </tr>
              ))}
              <tr style={{ background: THEME.primary + "12" }} className="font-semibold">
                <td className="px-5 py-3 font-bold" style={{ color: THEME.primary }}>Σύνολο</td>
                {STATUS_KEYS.map((sk) => (
                  <td key={sk.key} className="px-4 py-3 text-center" style={{ color: sk.color }}>
                    {by_runit.reduce((a, r) => a + r[sk.key], 0)}
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-bold text-gray-900">{totals.projects}</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmtBudget(totals.budget)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Πυλώνες ── */}
      {by_pillar.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ανά Πυλώνα Προτεραιότητας</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {by_pillar.map((p) => (
              <div
                key={p.pillar_id}
                className="bg-white rounded-2xl overflow-hidden flex flex-col text-center"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
              >
                {/* Image area — fills full width, fixed height */}
                <div className="w-full overflow-hidden" style={{ height: "130px", background: "#f0efed" }}>
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="bi bi-image text-4xl text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{p.title}</p>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-2xl font-bold" style={{ color: THEME.primary }}>{p.count}</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--color-primary-dark)" }}>
                      {p.count === 1 ? "έργο" : "έργα"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "var(--color-primary-dark)" }}>
                    {fmtBudget(p.total_budget)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
