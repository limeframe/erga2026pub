import { serverGetProjectById as getProjectById } from "@/lib/server-api";
import { ROUTES, API } from "@/lib/config";
import StatusBadge from "@/components/ui/StatusBadge";
import ProjectMapWrapper from "@/components/maps/ProjectMapWrapper";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { RUnit, RelatedProject } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await getProjectById(Number(id));
    return { title: data.infrastructure.title };
  } catch {
    return { title: "Έργο" };
  }
}

const fmt = (v: string | null) =>
  v ? parseFloat(v).toLocaleString("el-GR", { minimumFractionDigits: 2 }) + " €" : null;

const fmtDate = (v: string | null) =>
  v
    ? new Date(v).toLocaleDateString("el-GR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

export default async function ErgaSinglePage({ params }: Props) {
  const { id } = await params;

  let data;
  try {
    data = await getProjectById(Number(id));
  } catch {
    notFound();
  }

  const p = data.infrastructure;
  const related = data.related ?? [];
  const lat = parseFloat(p.lat ?? "");
  const lon = parseFloat(p.lon ?? "");
  const hasMap = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
  const heroImage =
    p.image || p.pillar?.image || `${API.storageUrl}ergaImages/${p.typo_id}-1.jpg`;

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ══════════════════════════════════════════
          DARK HEADER
      ══════════════════════════════════════════ */}
      <div className="bg-primary-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-36">

          {/* Breadcrumb */}
          <Link
            href={ROUTES.erga}
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-6"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Έργα
          </Link>

          {/* Two-column hero */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">

            {/* ── Text side ── */}
            <div className="lg:col-span-3 flex flex-col gap-4">

              {/* Inline chips */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge istatId={p.istat_id} label={p.istat_title} />
                {p.emvlimatiko && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    ★ Εμβληματικό
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-light text-white leading-tight tracking-tight">
                {p.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-base text-white/60">
                {p.typo_title && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {p.typo_title}
                  </span>
                )}
                {(p.runits?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {p.runits.map((r: RUnit) => r.title).join(" · ")}
                    {p.municip_title && ` · ${p.municip_title}`}
                  </span>
                )}
                {p.pillar_title && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-secondary/80">{p.pillar_title}</span>
                  </span>
                )}
              </div>
            </div>

            {/* ── Image side ── */}
            <div className="lg:col-span-2">
              <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <Image
                  src={heroImage}
                  alt={p.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FLOATING STATS BAR (overlaps dark header)
      ══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Budget */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-6 flex flex-col items-center text-center gap-3">
            <img src="/images/budget.svg" alt="" className="w-12 h-12" style={{ filter: "brightness(0) saturate(100%) invert(9%) sepia(50%) saturate(700%) hue-rotate(196deg) brightness(85%)" }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-dark mb-2">
                Προϋπολογισμός
              </p>
              <p className="text-lg font-extrabold text-primary leading-tight">{fmt(p.budget) ?? "—"}</p>
            </div>
          </div>

          {/* Source */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-6 flex flex-col items-center text-center gap-3">
            <img src="/images/source.svg" alt="" className="w-12 h-12" style={{ filter: "brightness(0) saturate(100%) invert(9%) sepia(50%) saturate(700%) hue-rotate(196deg) brightness(85%)" }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-dark mb-2">
                Πηγή Χρηματοδότησης
              </p>
              <p className="text-sm font-extrabold text-primary-light leading-tight">
                {p.source_title ?? <span className="text-gray-300 font-normal text-sm">—</span>}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-6 flex flex-col items-center text-center gap-3">
            <img src="/images/status.svg" alt="" className="w-12 h-12" style={{ filter: "brightness(0) saturate(100%) invert(9%) sepia(50%) saturate(700%) hue-rotate(196deg) brightness(85%)" }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-dark mb-2.5">
                Κατάσταση
              </p>
              <StatusBadge istatId={p.istat_id} label={p.istat_title} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            {p.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <span className="inline-block w-5 h-0.5 rounded-full bg-primary" />
                  Περιγραφή
                </h2>
                <div
                  className="text-[15px] text-gray-700 leading-relaxed prose prose-p:my-2 max-w-none"
                  dangerouslySetInnerHTML={{ __html: p.description }}
                />
              </div>
            )}

            {/* Map */}
            {hasMap && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <span className="inline-block w-5 h-0.5 rounded-full bg-primary" />
                  Τοποθεσία στον Χάρτη
                </h2>
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <ProjectMapWrapper
                    lat={lat}
                    lon={lon}
                    zoom={p.zoom ?? 14}
                    title={p.title}
                    kmlUrl={p.systemKML}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <div className="space-y-4">

            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-primary px-5 py-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">
                  Στοιχεία Έργου
                </h3>
              </div>

              <dl className="divide-y divide-gray-50">
                {p.armodia_title && (
                  <div className="px-5 py-3.5 flex gap-3 items-start">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-primary-dark mb-1">Αρμόδια Υπηρεσία</dt>
                      <dd className="text-sm font-extrabold text-gray-800">{p.armodia_title}</dd>
                    </div>
                  </div>
                )}
                {p.contractor && (
                  <div className="px-5 py-3.5 flex gap-3 items-start">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-primary-dark mb-1">Ανάδοχος</dt>
                      <dd className="text-sm font-extrabold text-gray-800">{p.contractor}</dd>
                    </div>
                  </div>
                )}
                {p.emvlimatiko && (
                  <div className="px-5 py-3.5 flex gap-3 items-start">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-primary-dark mb-1">Χαρακτηρισμός</dt>
                      <dd className="text-sm font-extrabold text-amber-600">Εμβληματικό Έργο</dd>
                    </div>
                  </div>
                )}
                <div className="px-5 py-3 flex gap-3 items-start bg-gray-50/60">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-primary-dark mb-1">Τελευταία Ενημέρωση</dt>
                    <dd className="text-sm font-extrabold text-gray-700">{fmtDate(p.updated_at)}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Pillar visual card — removed */}

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ΣΧΕΤΙΚΑ ΕΡΓΑ — full-width section
      ══════════════════════════════════════════ */}
      {related.length > 0 && (
        <div className="w-full pt-20 pb-24" style={{ background: "#ECEBEA" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/shuffle.svg" alt="" className="mx-auto mb-5 w-10 h-10" style={{ filter: "brightness(0) saturate(100%) invert(9%) sepia(50%) saturate(700%) hue-rotate(196deg) brightness(85%)" }} />
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-gray-900">
                Σχετικά Έργα
              </h2>
              <p className="mt-3 text-base text-gray-600">
                Έργα με παρόμοιο αντικείμενο ή πυλώνα που ίσως σας ενδιαφέρουν
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((rel: RelatedProject) => (
                <Link
                  key={rel.id}
                  href={ROUTES.ergaSingle(rel.id)}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary/20 transition-all flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.image || rel.pillar_image || `/images/j1-1.jpg`}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {rel.istat_title && (
                      <div className="absolute top-3 left-3">
                        <StatusBadge istatId={rel.istat_id} label={rel.istat_title} />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {rel.title}
                    </h3>
                    <div className="mt-3 space-y-1 text-xs text-gray-500 flex-1">
                      <p>
                        <span className="font-semibold text-gray-700">Προϋπολογισμός: </span>
                        {parseFloat(rel.budget).toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
                      </p>
                      {rel.pillar_title && (
                        <p>
                          <span className="font-semibold text-gray-700">Πυλώνας: </span>
                          {rel.pillar_title}
                        </p>
                      )}
                    </div>
                    <span className="mt-4 text-xs font-semibold text-primary flex items-center gap-1 self-start">
                      Περισσότερα
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
