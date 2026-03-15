/**
 * Server-side API calls — χρησιμοποιείται ΜΟΝΟ από Server Components.
 * Δεν χρησιμοποιεί localStorage/cookies (δεν υπάρχουν στον server).
 */

import { API, SITE } from "./config";
import type {
  ProjectListResponse,
  ProjectSingleResponse,
  StatsResponse,
  FullStatsResponse,
  IStat,
  RUnit,
  Typos,
  Pillar,
  BudgetRange,
} from "./types";

const BASE = API.baseUrl.endsWith("/") ? API.baseUrl : `${API.baseUrl}/`;

async function serverGet<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

export async function serverGetProjects(
  midline: 0 | 1,
  page = 1,
  filters?: { istat?: string; runit?: string; pillar?: string }
): Promise<ProjectListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (filters?.istat) params.set("istat", filters.istat);
  if (filters?.runit) params.set("runit", filters.runit);
  if (filters?.pillar) params.set("pillar", filters.pillar);
  return serverGet<ProjectListResponse>(
    `api/infrastructures/${SITE.regionId}/list/${midline}?${params.toString()}`
  );
}

export async function serverGetStats(midline: 0 | 1): Promise<StatsResponse> {
  return serverGet<StatsResponse>(`api/stats/${SITE.regionId}/${midline}`);
}

export async function serverGetFullStats(): Promise<FullStatsResponse> {
  return serverGet<FullStatsResponse>(`api/stats/${SITE.regionId}`);
}

export async function serverGetIStats(): Promise<{ status: string; data: IStat[] }> {
  return serverGet(`api/istats`);
}

export async function serverGetRUnits(): Promise<{ status: string; data: RUnit[] }> {
  return serverGet(`api/runits/${SITE.regionId}`);
}

export async function serverGetTypos(): Promise<{ status: string; data: Typos[] }> {
  return serverGet(`api/typos`);
}

export async function serverGetPillars(): Promise<{ status: string; data: Pillar[] }> {
  return serverGet(`api/pillars`);
}

export async function serverGetBudgetRange(): Promise<BudgetRange> {
  return serverGet(`api/getBudgetRange`);
}

export async function serverGetProjectById(id: number): Promise<ProjectSingleResponse> {
  return serverGet<ProjectSingleResponse>(`api/infrastructures/${id}`);
}
