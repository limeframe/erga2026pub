"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type HomeLeafletMap from "./HomeLeafletMap";

const DynamicMap = dynamic(() => import("./HomeLeafletMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-gray-100"
      style={{ height: "700px" }}
    >
      <p className="text-gray-500">Φόρτωση χάρτη...</p>
    </div>
  ),
});

type Props = ComponentProps<typeof HomeLeafletMap>;

export default function HomeLeafletMapWrapper(props: Props) {
  return <DynamicMap {...props} />;
}
