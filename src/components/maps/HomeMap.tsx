"use client";

import { useEffect, useRef } from "react";
import type { ProjectMapItem } from "@/lib/types";
import { ROUTES } from "@/lib/config";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

interface HomeMapProps {
  items: ProjectMapItem[];
}

export default function HomeMap({ items }: HomeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css" as string);

      const map = L.map(mapRef.current!, {
        center: [37.4, 22.5],
        zoom: 8,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "/images/markericon.png",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
      });

      items.forEach((item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (!lat || !lon) return;
        const href = ROUTES.ergaSingle(item.id);

        L.marker([lat, lon], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:180px">
              <strong style="font-size:13px">${item.title}</strong>
              <p style="margin:4px 0 8px;font-size:12px;color:#555">${item.statusText}</p>
              <a href="${href}" style="color:var(--color-primary);font-size:12px;font-weight:600">Περισσότερα →</a>
            </div>`,
            { maxWidth: 260 }
          );
      });

      mapInstance.current = map;
    };

    init();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [items]);

  return (
    <div
      ref={mapRef}
      className="h-96 w-full rounded-2xl overflow-hidden shadow-md z-0"
    />
  );
}
