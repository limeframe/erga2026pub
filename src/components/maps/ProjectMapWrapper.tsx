"use client";

import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProjectMapProps {
  lat: number;
  lon: number;
  zoom?: number;
  title: string;
  kmlUrl?: string | null;
}

const ProjectMap = dynamic(() => import("./ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-2xl">
      <LoadingSpinner text="Φόρτωση χάρτη..." />
    </div>
  ),
});

export default function ProjectMapWrapper(props: ProjectMapProps) {
  return <ProjectMap {...props} />;
}
