"use client";

import { useEffect, useState } from "react";
import { getHomeData, getRunitMap, getIStats } from "@/lib/api";
import type { HomeData, IStat, RunitMapItem } from "@/lib/types";
import { DefaultStats } from "@/lib/data";
import SummarySection from "./SummarySection";
import CountersSection from "./CountersSection";
import HomeCarousel from "./HomeCarousel";
import HomeDescription from "./HomeDescription";
import HomeLeafletMapWrapper from "./HomeLeafletMapWrapper";
import AdditionalInfo from "./AdditionalInfo";

export default function HomeClient() {
  const [data, setData] = useState<HomeData | null>(null);
  const [runitMapData, setRunitMapData] = useState<RunitMapItem[]>([]);
  const [istatColors, setIstatColors] = useState<Record<number, string>>({});
  const [istatLabels, setIstatLabels] = useState<Record<number, string>>({});
  const [istatPluralLabels, setIstatPluralLabels] = useState<Record<number, string>>({});

  useEffect(() => {
    getHomeData()
      .then(setData)
      .catch(() => {});

    getRunitMap()
      .then((res) => setRunitMapData(res.data))
      .catch(() => {});

    getIStats()
      .then((res) => {
        const colors: Record<number, string> = {};
        const labels: Record<number, string> = {};
        const plurals: Record<number, string> = {};
        res.data.forEach((istat: IStat) => {
          if (istat.chroma) colors[istat.id] = istat.chroma;
          if (istat.title) labels[istat.id] = istat.title;
          if (istat.title_plural) plurals[istat.id] = istat.title_plural;
        });
        setIstatColors(colors);
        setIstatLabels(labels);
        setIstatPluralLabels(plurals);
      })
      .catch(() => {});
  }, []);

  const stats = data?.stats ?? DefaultStats;
  const highlighted = data?.highlightedProjects ?? [];
  const mapData = data?.infrastructuresMap ?? [];

  return (
    <div>
      <SummarySection
        title="ΕΡΓΑ & ΔΡΑΣΕΙΣ"
        title2=""
        titlebr3="ΠΕΡΙΦΕΡΕΙΑΣ"
        titlebr4="ΠΕΛΟΠΟΝΝΗΣΟΥ"
        description="Μέσα από τη δημόσια πλατφόρμα e-ΕΡΓΑ της Περιφέρειας Πελοποννήσου, κάθε πολίτης έχει πλέον άμεση πρόσβαση στην πληροφορία για όλα τα έργα και τις δράσεις της Περιφέρειας μέσα από ένα εύχρηστο και λειτουργικό περιβάλλον."
        mapImage="/images/perifereia-peloponnisou-map.jpg"
      />

      <CountersSection dataStats={stats} istatColors={istatColors} istatPluralLabels={istatPluralLabels} />

      <HomeCarousel data={highlighted} istatColors={istatColors} istatLabels={istatLabels} />

      <HomeDescription />

      <HomeLeafletMapWrapper lat={37.5} lng={22.0} zoom={8} data={mapData} runitData={runitMapData} istatColors={istatColors} istatLabels={istatLabels} istatPluralLabels={istatPluralLabels} />

      <AdditionalInfo />
    </div>
  );
}
