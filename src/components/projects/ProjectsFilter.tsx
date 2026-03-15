"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { IStat, RUnit, Pillar } from "@/lib/types";

interface ProjectsFilterProps {
  istats: IStat[];
  runits: RUnit[];
  pillars: Pillar[];
}

export default function ProjectsFilter({ istats, runits, pillars }: ProjectsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters = searchParams.has("istat") || searchParams.has("runit") || searchParams.has("pillar");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Φίλτρα</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:underline font-medium"
          >
            Καθαρισμός
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Κατάσταση */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Κατάσταση
          </label>
          <select
            value={searchParams.get("istat") ?? ""}
            onChange={(e) => updateFilter("istat", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="">Όλες</option>
            {istats.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* ΠΕ */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Περιφερειακή Ενότητα
          </label>
          <select
            value={searchParams.get("runit") ?? ""}
            onChange={(e) => updateFilter("runit", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="">Όλες</option>
            {runits.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        {/* Πυλώνας */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Πυλώνας
          </label>
          <select
            value={searchParams.get("pillar") ?? ""}
            onChange={(e) => updateFilter("pillar", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="">Όλοι</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
