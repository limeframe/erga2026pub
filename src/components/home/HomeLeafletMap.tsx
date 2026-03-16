"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RunitMapItem, ProjectMapItem } from "@/lib/types";
import { ROUTES } from "@/lib/config";
import { STATUS_LIST } from "@/lib/status";

// ─── Ctrl+Scroll hint overlay ─────────────────────────────────────────────────
function ScrollControl() {
  const map = useMap();
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    map.scrollWheelZoom.disable();
    const container = map.getContainer();

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        map.scrollWheelZoom.enable();
        setShowHint(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        map.scrollWheelZoom.disable();
        setShowHint(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowHint(false), 1800);
      }
    };

    container.addEventListener("wheel", onWheel);
    return () => {
      container.removeEventListener("wheel", onWheel);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [map]);

  if (!showHint) return null;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 1000, pointerEvents: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.25)",
    }}>
      <div style={{
        background: "var(--color-primary)", color: "#fff", padding: "12px 22px",
        borderRadius: "10px", fontSize: "14px", fontWeight: 600,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{ fontSize: "20px" }}>⌃</span>
        Χρησιμοποιήστε <strong>Ctrl + Scroll</strong> για zoom
      </div>
    </div>
  );
}

// ─── Status config (από το κεντρικό status.ts) ────────────────────────────────
const STATUSES = STATUS_LIST;

const SATELLITE_RADIUS_PX = 110;

// ─── Icon builders ────────────────────────────────────────────────────────────
function makeTotalIcon(count: number, isActive: boolean, dimmed: boolean) {
  const size = 54;
  return L.divIcon({
    className: "",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${isActive ? "#fcb316" : "var(--color-primary)"};
        border:3px solid ${isActive ? "#e09c00" : "rgba(255,255,255,0.9)"};
        box-shadow:0 3px 12px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;opacity:${dimmed ? 0.3 : 1};
        transition:opacity 0.3s,background 0.3s;
      ">
        <span style="color:#fff;font-weight:700;font-size:16px;line-height:1;
          text-shadow:0 1px 2px rgba(0,0,0,0.4);">${count}</span>
      </div>`,
  });
}

function makeStatusIcon(count: number, color: string, delay: number) {
  const size = 44;
  return L.divIcon({
    className: "",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        border:2.5px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;
        animation:satPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both;
      ">
        <span style="color:#fff;font-weight:700;font-size:14px;line-height:1;">${count}</span>
      </div>`,
  });
}

// ─── Inner map component ──────────────────────────────────────────────────────
interface InnerProps {
  runitData: RunitMapItem[];
  istatColors: Record<number, string>;
  istatLabels: Record<number, string>;
}

function RunitCircles({ runitData, istatColors, istatLabels }: InnerProps) {
  const resolveColor = (istat: number, fallback: string) =>
    istatColors[istat] ?? fallback;
  const map = useMap();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [zoomKey, setZoomKey] = useState(0);

  const mainMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const satMarkersRef  = useRef<L.Marker[]>([]);
  const linesRef       = useRef<L.Polyline[]>([]);

  // Re-trigger satellite recalculation on zoom
  useEffect(() => {
    const handler = () => setZoomKey((k) => k + 1);
    map.on("zoomend", handler);
    return () => { map.off("zoomend", handler); };
  }, [map]);

  // Create main markers once per runitData
  useEffect(() => {
    mainMarkersRef.current.forEach((m) => m.remove());
    mainMarkersRef.current.clear();

    runitData.forEach((runit) => {
      const marker = L.marker([runit.latitude, runit.longitude], {
        icon: makeTotalIcon(runit.stats.total, false, false),
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindTooltip(
        `<strong>${runit.title}</strong><br/>Σύνολο: <b>${runit.stats.total}</b> έργα`,
        { direction: "top", offset: [0, -30], className: "leaflet-tt" }
      );

      marker.on("click", () =>
        setActiveId((prev) => (prev === runit.id ? null : runit.id))
      );

      mainMarkersRef.current.set(runit.id, marker);
    });

    return () => {
      mainMarkersRef.current.forEach((m) => m.remove());
      mainMarkersRef.current.clear();
    };
  }, [runitData, map]);

  // Update main marker icons when activeId changes
  useEffect(() => {
    mainMarkersRef.current.forEach((marker, id) => {
      const runit = runitData.find((r) => r.id === id);
      if (!runit) return;
      const isActive = id === activeId;
      const dimmed   = activeId !== null && !isActive;
      marker.setIcon(makeTotalIcon(runit.stats.total, isActive, dimmed));
    });
  }, [activeId, runitData]);

  // Manage satellite markers + lines
  useEffect(() => {
    satMarkersRef.current.forEach((m) => m.remove());
    satMarkersRef.current = [];
    linesRef.current.forEach((l) => l.remove());
    linesRef.current = [];

    if (activeId === null) return;
    const runit = runitData.find((r) => r.id === activeId);
    if (!runit) return;

    const centerLatLng = L.latLng(runit.latitude, runit.longitude);
    const centerPt = map.project(centerLatLng, map.getZoom());

    // Only statuses with count > 0
    const visible = STATUSES.filter((s) => runit.stats[s.key] > 0);
    const n = visible.length;

    visible.forEach((s, i) => {
      const count = runit.stats[s.key];
      const color = resolveColor(s.istat, s.color);

      // Evenly distribute around the circle, starting from top (-π/2)
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const satPt = L.point(
        centerPt.x + SATELLITE_RADIUS_PX * Math.cos(angle),
        centerPt.y + SATELLITE_RADIUS_PX * Math.sin(angle)
      );
      const satLatLng = map.unproject(satPt, map.getZoom());

      // Connecting line (dashed)
      const line = L.polyline([centerLatLng, satLatLng], {
        color,
        weight: 2,
        opacity: 0.65,
        dashArray: "5 6",
      }).addTo(map);
      linesRef.current.push(line);

      // Satellite marker with pop-in animation
      const delay = i * 0.07;
      const satMarker = L.marker(satLatLng, {
        icon: makeStatusIcon(count, color, delay),
        zIndexOffset: 2000,
      }).addTo(map);

      const popupLabel = istatLabels[s.istat] ?? s.label;
      // Info popup with "Εμφάνιση Έργων" button
      satMarker.bindPopup(
        `<div style="min-width:175px;font-family:system-ui,sans-serif;padding:2px 0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="width:10px;height:10px;border-radius:50%;
              background:${color};flex-shrink:0;display:inline-block;"></span>
            <strong style="font-size:13px;color:#111;">${popupLabel}</strong>
          </div>
          <p style="color:#777;font-size:11px;margin:0 0 4px;line-height:1.3;">${runit.title}</p>
          <p style="font-size:24px;font-weight:800;color:${color};margin:0 0 12px;line-height:1;">
            ${count}
            <span style="font-size:12px;font-weight:500;color:#666;">έργα</span>
          </p>
          <a href="${ROUTES.erga}?runit=${runit.id}&istat=${s.istat}"
             style="display:block;text-align:center;background:var(--color-primary);color:#fff;
               padding:8px 14px;border-radius:8px;text-decoration:none;
               font-size:12px;font-weight:600;letter-spacing:0.02em;">
            Εμφάνιση Έργων &rarr;
          </a>
        </div>`,
        { maxWidth: 220, className: "runit-popup", closeButton: false }
      );

      // Hover: open on mouseover, delayed close so user can move into popup
      let closeTimer: ReturnType<typeof setTimeout> | null = null;

      satMarker.on("mouseover", () => {
        if (closeTimer) clearTimeout(closeTimer);
        satMarker.openPopup();
      });
      satMarker.on("mouseout", () => {
        closeTimer = setTimeout(() => satMarker.closePopup(), 350);
      });
      satMarker.on("popupopen", (e) => {
        const el = e.popup.getElement();
        if (!el) return;
        el.addEventListener("mouseenter", () => {
          if (closeTimer) clearTimeout(closeTimer);
        });
        el.addEventListener("mouseleave", () => {
          closeTimer = setTimeout(() => satMarker.closePopup(), 350);
        });
      });

      satMarkersRef.current.push(satMarker);
    });

    return () => {
      satMarkersRef.current.forEach((m) => m.remove());
      satMarkersRef.current = [];
      linesRef.current.forEach((l) => l.remove());
      linesRef.current = [];
    };
  }, [activeId, runitData, map, zoomKey]);

  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface HomeLeafletMapProps {
  lat: number;
  lng: number;
  zoom: number;
  data: ProjectMapItem[];
  runitData: RunitMapItem[];
  istatColors?: Record<number, string>;
  istatLabels?: Record<number, string>;
  istatPluralLabels?: Record<number, string>;
}

export default function HomeLeafletMap({ lat, lng, zoom, runitData, istatColors = {}, istatLabels = {}, istatPluralLabels = {} }: HomeLeafletMapProps) {
  return (
    <div className="pt-28 pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="mx-auto max-w-2xl text-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52.04 56.45"
            fill="currentColor"
            className="mx-auto mb-6"
            style={{ height: "56px", width: "auto", color: "var(--color-body)" }}
          >
            <path d="M46.57,28.61l4.03-6.4-4.03-6.4h-20.14v12.8h20.14ZM28.58,53.06h-11.28v2.07h16.91v-2.07h-5.64ZM38.79,11.02l3.68-3.2-3.68-3.2h-12.37v6.39h12.37ZM27.92,3.31v-1.99h-4.32v50.42h4.32v-21.8h-2.16c-.36,0-.66-.3-.66-.66v-14.12c0-.37.3-.66.66-.66h2.16v-2.14h-2.16c-.36,0-.66-.3-.66-.66V3.97c0-.36.3-.66.66-.66h2.16ZM29.24,12.35v2.14h17.68c.26,0,.48.14.59.36l4.42,7.02c.14.22.13.5,0,.71l-4.44,7.05c-.12.2-.34.31-.56.31h0s-17.68,0-17.68,0v21.8h5.63c.37,0,.66.3.66.66v3.39c0,.37-.3.66-.66.66h-18.23c-.36,0-.66-.3-.66-.66v-3.39c0-.37.3-.66.66-.66h5.63v-31.17H5.11c-.18,0-.36-.08-.49-.22L.17,15.39c-.23-.25-.23-.63,0-.88l4.41-4.92c.12-.16.31-.27.53-.27h17.17V.66c0-.36.29-.66.66-.66h5.65c.37,0,.66.3.66.66v2.65h9.79c.18,0,.35.08.47.2l4.41,3.83c.31.27.3.74,0,1l-4.44,3.85c-.12.11-.28.16-.43.16h0s-9.79,0-9.79,0ZM1.54,14.94l3.85,4.3h16.88v-8.6H5.4l-3.85,4.3Z"/>
          </svg>
          <h2 className="text-3xl font-light tracking-tight text-gray-900 sm:text-4xl">
            Χάρτης Έργων
          </h2>
          <p className="mt-2 text-base text-gray-900">
            Κάντε κλικ σε μια Περιφερειακή Ενότητα για ανάλυση ανά κατάσταση
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-5 mb-5">
          {STATUSES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-sm text-gray-900">
              <span className="w-3 h-3 rounded-full" style={{ background: istatColors[s.istat] ?? s.color, display: "inline-block" }} />
              {istatPluralLabels[s.istat] ?? s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <MapContainer
          style={{ height: "700px", width: "100%" }}
          center={[lat, lng]}
          zoom={zoom}
          maxZoom={20}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
          />
          <ScrollControl />
          <RunitCircles runitData={runitData} istatColors={istatColors} istatLabels={istatLabels} />
        </MapContainer>
      </div>

      <style>{`
        @keyframes satPopIn {
          from { transform: scale(0) rotate(-90deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        .leaflet-tt {
          background: var(--color-primary) !important;
          color: #fff !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 5px 10px !important;
          font-size: 12px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
          white-space: nowrap;
        }
        .leaflet-tt.leaflet-tooltip-top::before {
          border-top-color: var(--color-primary) !important;
        }
        .runit-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18) !important;
          padding: 4px !important;
        }
        .runit-popup .leaflet-popup-content {
          margin: 14px 16px !important;
        }
        .runit-popup .leaflet-popup-tip {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
