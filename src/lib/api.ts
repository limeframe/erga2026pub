import axios from "axios";
import Cookies from "js-cookie";
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
  LoginResponse,
  LawPage,
} from "./types";

// ─── Axios instance ───────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: API.baseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const xsrf = Cookies.get("XSRF-TOKEN");
  if (xsrf) config.headers["X-XSRF-TOKEN"] = xsrf;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/logout";
    }
    return Promise.reject(error);
  }
);

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

export async function exportProjects(filters: ExportFilters): Promise<Blob> {
  const res = await client.post("api/export-infrastructures", filters, {
    responseType: "blob",
  });
  return res.data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>("/login", { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data;
}

// ─── Legal ────────────────────────────────────────────────────────────────────
export async function getLawPages(): Promise<LawPage[]> {
  return get(`api/lawpages`);
}

export async function getLawPage(id: number): Promise<LawPage> {
  return get(`api/lawpages/${id}`);
}
