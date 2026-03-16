"use client";

import Link from "next/link";
import type { ProjectListItem } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProjectCardProps {
  project: ProjectListItem;
  href: string;
}

const formatBudget = (v: string) =>
  parseFloat(v).toLocaleString("el-GR", { minimumFractionDigits: 2 }) + " €";

export default function ProjectCard({ project, href }: ProjectCardProps) {
  return (
    <article className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all flex flex-col">
      {/* Image — clickable */}
      <Link href={href} className="relative h-44 bg-gray-100 shrink-0 block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image || project.pillar_image || `/images/j1-1.jpg`}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "/images/j1-1.jpg"; }}
        />
        <div className="absolute top-3 left-3">
          <StatusBadge istatId={project.istat_id} label={project.istat_title} />
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={href}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
        </Link>

        <div className="mt-3 space-y-1.5 text-xs text-gray-500 flex-1">
          <p>
            <span className="font-medium text-gray-700">Προϋπολογισμός: </span>
            {formatBudget(project.budget)}
          </p>
          <p>
            <span className="font-medium text-gray-700">Κατηγορία: </span>
            {project.typo_title}
          </p>
          {project.runits.length > 0 && (
            <p>
              <span className="font-medium text-gray-700">ΠΕ: </span>
              {project.runits.map((r) => r.title).join(", ")}
            </p>
          )}
        </div>

        <Link
          href={href}
          className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start"
        >
          Περισσότερα
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
