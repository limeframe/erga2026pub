"use client";

import { useEffect, useRef } from "react";

interface ProjectMapProps {
  lat: number;
  lon: number;
  zoom?: number;
  title: string;
  kmlUrl?: string | null;
}

export default function ProjectMap({ lat, lon, zoom = 14, title, kmlUrl }: ProjectMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css" as string);

      const map = L.map(mapRef.current!, { center: [lat, lon], zoom });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "/images/markericon.png",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
      });

      if (kmlUrl) {
        try {
          const omnivore = (await import("@mapbox/leaflet-omnivore")).default;
          const layer = omnivore.kml(kmlUrl).addTo(map);
          layer.on("ready", () => {
            const bounds = (layer as import("leaflet").FeatureGroup).getBounds();
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
          });
        } catch {
          L.marker([lat, lon], { icon }).addTo(map).bindPopup(title);
        }
      } else {
        L.marker([lat, lon], { icon }).addTo(map).bindPopup(title).openPopup();
      }

      mapInstance.current = map;
    };

    init();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [lat, lon, zoom, title, kmlUrl]);

  return <div ref={mapRef} className="h-80 w-full rounded-2xl overflow-hidden z-0" />;
}
