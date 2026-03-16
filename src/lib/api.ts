import axios from "axios";
import { API, SITE } from "./config";
import type {
  HomeData,
  IStat,
  RUnit,
  RunitMapItem,
  Typos,
  BudgetRange,
  ProjectListResponse,
  ProjectSingleResponse,
  StatsResponse,
  LawPage,
} from "./types";

// ─── Axios instance ───────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: API.baseUrl,
  headers: { "Content-Type": "application/json" },
});

// ─── Helper ───────────────────────────────────────────────────────────────────
async function get<T>(path: string): Promise<T> {
  const res = await client.get<T>(path);
  return res.data;
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export async function getHomeData(): Promise<HomeData> {
  return get<HomeData>(`api/infrastructures/${SITE.regionId}/home`);
}

// ─── Lookups ──────────────────────────────────────────────────────────────────
export async function getIStats(): Promise<{ status: string; data: IStat[] }> {
  return get(`api/istats`);
}

export async function getRUnits(): Promise<{ status: string; data: RUnit[] }> {
  return get(`api/runits/${SITE.regionId}`);
}

export async function getRunitMap(): Promise<{ status: string; data: RunitMapItem[] }> {
  return get(`api/runits/${SITE.regionId}/map`);
}

export async function getTypos(): Promise<{ status: string; data: Typos[] }> {
  return get(`api/typos`);
}

export async function getBudgetRange(): Promise<BudgetRange> {
  return get(`api/getBudgetRange`);
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function getProjects(
  midline: 0 | 1,
  page = 1
): Promise<ProjectListResponse> {
  return get<ProjectListResponse>(
    `api/infrastructures/${SITE.regionId}/list/${midline}?page=${page}`
  );
}

export async function getProjectById(id: number): Promise<ProjectSingleResponse> {
  return get<ProjectSingleResponse>(`api/infrastructures/${id}`);
}

// ─── Statistics ───────────────────────────────────────────────────────────────
export async function getStats(midline: 0 | 1): Promise<StatsResponse> {
  return get<StatsResponse>(`api/stats/${SITE.regionId}/${midline}`);
}

// ─── Export ───────────────────────────────────────────────────────────────────
export interface ExportFilters {
  runit?: number[];
  istat?: number[];
  typo?: number[];
  pillar?: number[];
  min_budget?: number;
  max_budget?: number;
}

export async function getFilteredCounts(filters: {
  runit?: number[];
  istat?: number[];
}): Promise<{
  byTypo: Record<number, number>;
  byPillar: Record<number, number>;
  budgets: number[];
}> {
  const buildUrl = (page: number) => {
    const p = new URLSearchParams({ page: String(page) });
    filters.runit?.forEach((id) => p.append("runit[]", String(id)));
    filters.istat?.forEach((id) => p.append("istat[]", String(id)));
    return `api/infrastructures/${SITE.regionId}/list/0?${p.toString()}`;
  };

  const first = await client.get<ProjectListResponse>(buildUrl(1));
  const { data: page1, last_page } = first.data.infrastructures;

  let all = [...page1];
  if (last_page > 1) {
    const rest = await Promise.all(
      Array.from({ length: last_page - 1 }, (_, i) =>
        client.get<ProjectListResponse>(buildUrl(i + 2)).then((r) => r.data.infrastructures.data)
      )
    );
    all = all.concat(...rest);
  }

  const byTypo: Record<number, number> = {};
  const byPillar: Record<number, number> = {};
  const budgets: number[] = [];

  for (const item of all) {
    if (item.typo_id) byTypo[item.typo_id] = (byTypo[item.typo_id] ?? 0) + 1;
    if (item.pillar_id != null) byPillar[item.pillar_id] = (byPillar[item.pillar_id] ?? 0) + 1;
    const b = parseFloat(item.budget);
    if (!isNaN(b)) budgets.push(b);
  }

  return { byTypo, byPillar, budgets };
}

export async function exportProjects(filters: ExportFilters): Promise<Blob> {
  const res = await client.post("api/export-infrastructures", filters, {
    responseType: "blob",
  });
  return res.data;
}

// ─── Legal ────────────────────────────────────────────────────────────────────
export async function getLawPages(): Promise<LawPage[]> {
  return get(`api/lawpages`);
}

export async function getLawPage(id: number): Promise<LawPage> {
  return get(`api/lawpages/${id}`);
}
