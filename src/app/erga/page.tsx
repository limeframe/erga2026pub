import {
  serverGetProjects as getProjects,
  serverGetIStats as getIStats,
  serverGetRUnits as getRUnits,
  serverGetPillars as getPillars,
} from "@/lib/server-api";
import { ROUTES } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";
import ProjectCard from "@/components/projects/ProjectCard";
import Pagination from "@/components/projects/Pagination";
import ProjectsFilter from "@/components/projects/ProjectsFilter";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Έργα" };

interface SearchParams {
  page?: string;
  istat?: string;
  runit?: string;
  pillar?: string;
}

export default async function ErgaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);

  const filters = { istat: sp.istat, runit: sp.runit, pillar: sp.pillar };

  const [projectsData, istatsRes, runitsRes, pillarsRes] = await Promise.all([
    getProjects(0, page, filters).catch(() => null),
    getIStats().catch(() => ({ data: [] })),
    getRUnits().catch(() => ({ data: [] })),
    getPillars().catch(() => ({ data: [] })),
  ]);

  const paginated = projectsData?.infrastructures;
  const filtered = paginated?.data ?? [];

  return (
    <div style={{ background: "#ECEBEA" }}>
      <PageHeader
        title="Έργων"
        titleHighlight="Λίστα"
        description="Αναζητήστε, φιλτράρετε και εξερευνήστε όλα τα έργα της Περιφέρειας Πελοποννήσου."
        image="/images/projects.png"
        className="bg-transparent"
      />

      <div className="pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <Suspense>
          <ProjectsFilter
            istats={istatsRes.data}
            runits={runitsRes.data}
            pillars={pillarsRes.data}
          />
        </Suspense>

        {/* Results info */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filtered.length} αποτελέσματα{" "}
            {paginated && (
              <span className="text-gray-400">
                (σελίδα {paginated.current_page} από {paginated.last_page})
              </span>
            )}
          </p>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={ROUTES.ergaSingle(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm">Δεν βρέθηκαν έργα με τα επιλεγμένα φίλτρα.</p>
          </div>
        )}

        {/* Pagination */}
        {paginated && (
          <Suspense>
            <Pagination
              currentPage={paginated.current_page}
              lastPage={paginated.last_page}
              total={paginated.total}
              perPage={paginated.per_page}
            />
          </Suspense>
        )}
        </div>
      </div>
    </div>
  );
}
