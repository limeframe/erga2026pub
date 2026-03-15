"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type HomeMap from "./HomeMap";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const HomeMapDynamic = dynamic(() => import("./HomeMap"), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center bg-gray-50 rounded-2xl"><LoadingSpinner text="Φόρτωση χάρτη..." /></div>,
});

type Props = ComponentProps<typeof HomeMap>;

export default function HomeMapWrapper(props: Props) {
  return <HomeMapDynamic {...props} />;
}
