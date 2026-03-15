"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ProjectListItem } from "@/lib/types";
import { ROUTES } from "@/lib/config";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ProjectCarousel({ projects }: { projects: ProjectListItem[] }) {
  const [current, setCurrent] = useState(0);
  if (!projects.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + projects.length) % projects.length);
  const next = () => setCurrent((c) => (c + 1) % projects.length);
  const project = projects[current];

  const href = ROUTES.ergaSingle(project.id);

  const formatBudget = (v: string) =>
    parseFloat(v).toLocaleString("el-GR", { minimumFractionDigits: 2 }) + " €";

  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="relative h-56 md:h-full min-h-[240px] bg-gray-100">
          <Image
            src={project.image || `/images/j1-1.jpg`}
            alt={project.title}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/j1-1.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <StatusBadge istatId={project.istat_id} label={project.istat_title} />
            <h3 className="mt-3 text-lg font-bold text-gray-900 leading-snug line-clamp-3">
              {project.title}
            </h3>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-700">Προϋπολογισμός: </span>
                {formatBudget(project.budget)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Κατηγορία: </span>
                {project.typo_title}
              </p>
              <p>
                <span className="font-medium text-gray-700">ΠΕ: </span>
                {project.runits.map((r) => r.title).join(", ")}
              </p>
            </div>
          </div>
          <Link
            href={href}
            className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors self-start"
          >
            Μετάβαση
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow hover:bg-white transition-colors"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs text-white font-medium bg-black/40 px-2 py-0.5 rounded-full">
          {current + 1}/{projects.length}
        </span>
        <button
          onClick={next}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow hover:bg-white transition-colors"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
