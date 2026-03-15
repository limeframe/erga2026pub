import { serverGetProjectById as getProjectById } from "@/lib/server-api";
import { ROUTES, API } from "@/lib/config";
import StatusBadge from "@/components/ui/StatusBadge";
import ProjectMapWrapper from "@/components/maps/ProjectMapWrapper";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await getProjectById(Number(id));
    return { title: data.infrastructure.title };
  } catch {
    return { title: "Μεγάλο Έργο" };
  }
}

const formatBudget = (v: string | null) =>
  v ? parseFloat(v).toLocaleString("el-GR", { minimumFractionDigits: 2 }) + " €" : "—";

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("el-GR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export default async function MegalaErgaSinglePage({ params }: Props) {
  const { id } = await params;

  let data;
  try {
    data = await getProjectById(Number(id));
  } catch {
    notFound();
  }

  const project = data.infrastructure;
  const lat = parseFloat(project.lat ?? "");
  const lon = parseFloat(project.lon ?? "");
  const hasMap = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={project.image || `${API.storageUrl}ergaImages/${project.typo_id}-1.jpg`}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <StatusBadge istatId={project.istat_id} label={project.istat_title} />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                ⭐ Μεγάλο Έργο
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                {project.title}
              </h1>
              {project.description && (
                <p className="mt-4 text-gray-600 leading-relaxed text-sm">
                  {project.description}
                </p>
              )}
            </div>

            {project.statuses && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  Κατάσταση Έργου
                </h3>
                <Image
                  src={project.statuses}
                  alt="Κατάσταση έργου"
                  width={600}
                  height={200}
                  className="w-full object-contain rounded"
                />
              </div>
            )}

            {hasMap && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  Τοποθεσία
                </h3>
                <ProjectMapWrapper
                  lat={lat}
                  lon={lon}
                  zoom={project.zoom ?? 14}
                  title={project.title}
                  kmlUrl={project.systemKML}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
                Στοιχεία Έργου
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-gray-500">Προϋπολογισμός</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">{formatBudget(project.budget)}</dd>
                </div>
                {project.contract && (
                  <div>
                    <dt className="text-xs text-gray-500">Συμβατικό Ποσό</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{formatBudget(project.contract)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500">Κατηγορία</dt>
                  <dd className="font-medium text-gray-800 mt-0.5">{project.typo_title}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Κατάσταση</dt>
                  <dd className="mt-0.5">
                    <StatusBadge istatId={project.istat_id} label={project.istat_title} />
                  </dd>
                </div>
                {project.runits?.length > 0 && (
                  <div>
                    <dt className="text-xs text-gray-500">Περιφερειακή Ενότητα</dt>
                    <dd className="font-medium text-gray-800 mt-0.5">
                      {project.runits.map((r) => r.title).join(", ")}
                    </dd>
                  </div>
                )}
                {project.municip_title && (
                  <div>
                    <dt className="text-xs text-gray-500">Δήμος</dt>
                    <dd className="font-medium text-gray-800 mt-0.5">{project.municip_title}</dd>
                  </div>
                )}
                {project.contractor && (
                  <div>
                    <dt className="text-xs text-gray-500">Ανάδοχος</dt>
                    <dd className="font-medium text-gray-800 mt-0.5">{project.contractor}</dd>
                  </div>
                )}
                {project.source_title && (
                  <div>
                    <dt className="text-xs text-gray-500">Πηγή Χρηματοδότησης</dt>
                    <dd className="font-medium text-gray-800 mt-0.5">{project.source_title}</dd>
                  </div>
                )}
                {project.armodia_title && (
                  <div>
                    <dt className="text-xs text-gray-500">Αρμόδια Υπηρεσία</dt>
                    <dd className="font-medium text-gray-800 mt-0.5">{project.armodia_title}</dd>
                  </div>
                )}
                {project.pillar_title && (
                  <div>
                    <dt className="text-xs text-gray-500">Πυλώνας</dt>
                    <dd className="font-medium text-gray-800 mt-0.5">{project.pillar_title}</dd>
                  </div>
                )}
                {project.emvlimatiko && (
                  <div>
                    <dt className="text-xs text-gray-500">Εμβληματικό</dt>
                    <dd className="mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Ναι
                      </span>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500">Τελευταία Ενημέρωση</dt>
                  <dd className="font-medium text-gray-800 mt-0.5">{formatDate(project.updated_at)}</dd>
                </div>
              </dl>
            </div>

            <Link
              href={ROUTES.megalaErga}
              className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              ← Επιστροφή στα Μεγάλα Έργα
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
