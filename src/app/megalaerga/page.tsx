import {
  serverGetProjects as getProjects,
  serverGetIStats as getIStats,
  serverGetRUnits as getRUnits,
  serverGetTypos as getTypos,
} from "@/lib/server-api";
import { ROUTES } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";
import ProjectCard from "@/components/projects/ProjectCard";
import Pagination from "@/components/projects/Pagination";
import ProjectsFilter from "@/components/projects/ProjectsFilter";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Μεγάλα Έργα" };

interface SearchParams {
  page?: string;
  istat?: string;
  runit?: string;
  typos?: string;
}

export default async function MegalaErgaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);

  const [projectsData, istatsRes, runitsRes, typosRes] = await Promise.all([
    getProjects(1, page).catch(() => null),
    getIStats().catch(() => ({ data: [] })),
    getRUnits().catch(() => ({ data: [] })),
    getTypos().catch(() => ({ data: [] })),
  ]);

  const paginated = projectsData?.infrastructures;
  const projects = paginated?.data ?? [];

  const filtered = projects.filter((p) => {
    if (sp.istat && String(p.istat_id) !== sp.istat) return false;
    if (sp.runit && !p.runits.some((r) => String(r.id) === sp.runit)) return false;
    if (sp.typos && String(p.typo_id) !== sp.typos) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Μεγάλων Έργων"
        titleHighlight="Λίστα"
        description="Τα μεγάλα και εμβληματικά έργα της Περιφέρειας Πελοποννήσου."
        image="/images/projects.png"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <Suspense>
          <ProjectsFilter
            istats={istatsRes.data}
            runits={runitsRes.data}
            typos={typosRes.data}
          />
        </Suspense>

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

        {filtered.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={ROUTES.megalaErgaSingle(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm">Δεν βρέθηκαν έργα με τα επιλεγμένα φίλτρα.</p>
          </div>
        )}

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
    </>
  );
}
