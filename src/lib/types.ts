// ─── Lookups ──────────────────────────────────────────────────────────────────
export interface IStat {
  id: number;
  title: string;
  description?: string;
  chroma?: string;
}

export interface RUnit {
  id: number;
  title: string;
}

export interface Typos {
  id: number;
  title: string;
}

export interface Pillar {
  id: number;
  title: string;
  image?: string;
}

export interface BudgetRange {
  min: number;
  max: number;
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export interface HomeStats {
  proposed: number;
  under_planning: number;
  in_progress: number;
  completed: number;
}

export interface ProjectMapItem {
  id: number;
  title: string;
  budget: string;
  lat: string;
  lon: string;
  zoom: number;
  midline: 0 | 1;
  statusColor: StatusColor;
  statusText: string;
}

export interface HomeData {
  status: string;
  stats: HomeStats;
  highlightedProjects: ProjectListItem[];
  infrastructuresMap: ProjectMapItem[];
}

// ─── Runit Map ────────────────────────────────────────────────────────────────
export interface RunitMapStats {
  proposed: number;
  under_planning: number;
  in_progress: number;
  completed: number;
  total: number;
}

export interface RunitMapItem {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  stats: RunitMapStats;
}

// ─── Project List ─────────────────────────────────────────────────────────────
export type StatusColor = "warning" | "info" | "success" | "danger" | "default";

export interface ProjectListItem {
  id: number;
  title: string;
  budget: string;
  istat_id: number | null;
  istat_title: string | null;
  runits: RUnit[];
  typo_id: number;
  typo_title: string;
  municip_id: number | null;
  municip_title: string | null;
  source_id: number | null;
  source_title: string | null;
  armodia_id: number | null;
  armodia_title: string | null;
  pillar_id: number | null;
  pillar_title: string | null;
  pillar_image: string | null;
  lat: string | null;
  lon: string | null;
  zoom: number | null;
  midline: 0 | 1;
  statusColor: StatusColor;
  statusText: string;
  image: string;
}

export interface PaginatedProjects {
  current_page: number;
  data: ProjectListItem[];
  per_page: number;
  total: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface ProjectListResponse {
  infrastructures: PaginatedProjects;
}

// ─── Related Project (at root of single response) ─────────────────────────────
export interface RelatedProject {
  id: number;
  title: string;
  image: string | null;
  budget: string;
  istat_id: number | null;
  istat_title: string | null;
  istat_chroma: string | null;
  pillar_id: number | null;
  pillar_title: string | null;
  pillar_image: string | null;
}

// ─── Project Single ───────────────────────────────────────────────────────────
export interface ProjectSingle extends ProjectListItem {
  description: string | null;
  contract: string | null;
  contractor: string | null;
  emvlimatiko: boolean;
  progress: string | null;
  updated_at: string | null;
  systemKML: string | null;
  statuses: string | null;
  source: { id: number; title: string } | null;
  armodia: { id: number; title: string } | null;
  pillar: { id: number; title: string; image: string | null } | null;
}

export interface ProjectSingleResponse {
  infrastructure: ProjectSingle;
  related?: RelatedProject[];
}

// ─── Statistics (legacy) ──────────────────────────────────────────────────────
export interface StatByRunit {
  runit_id: number;
  runit_title: string;
  total_projects: number;
  istat1_projects: number;
  istat2_projects: number;
  istat3_projects: number;
  istat4_projects: number;
}

export interface StatsResponse {
  stats: StatByRunit[];
  stats2: Record<string, number>;
  stats3: Record<string, number>;
}

// ─── Statistics (new API: GET /api/stats/{regionId}) ──────────────────────────
export interface StatsTotals {
  projects: number;
  budget: number;
  completed: number;
  in_progress: number;
}

export interface StatsByRunit {
  runit_id: number;
  runit_title: string;
  total: number;
  proposed: number;
  under_planning: number;
  in_progress: number;
  completed: number;
  total_budget: number;
}

export interface StatsByIstat {
  istat_id: number;
  title: string;
  title_plural: string;
  chroma: string;
  count: number;
  total_budget: number;
}

export interface StatsByTypo {
  typo_id: number;
  title: string;
  count: number;
  total_budget: number;
}

export interface StatsByBudget {
  range: string;
  min: number;
  max: number | null;
  count: number;
}

export interface StatsBySource {
  source_id: number;
  title: string;
  count: number;
  total_budget: number;
}

export interface StatsByPillar {
  pillar_id: number;
  title: string;
  image: string;
  count: number;
  total_budget: number;
}

export interface FullStatsResponse {
  totals: StatsTotals;
  by_runit: StatsByRunit[];
  by_istat: StatsByIstat[];
  by_typo: StatsByTypo[];
  by_budget: StatsByBudget[];
  by_source: StatsBySource[];
  by_pillar: StatsByPillar[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = "guest" | "user" | "admin" | "client";

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

// ─── Legal ────────────────────────────────────────────────────────────────────
export interface LawPage {
  id: number;
  page_name: string;
  page_content: string;
  last_modified_at: string;
}

// ─── Filters (state) ──────────────────────────────────────────────────────────
export interface ProjectFilters {
  runit: string;
  istat: string;
  typos: string;
  page: number;
}
