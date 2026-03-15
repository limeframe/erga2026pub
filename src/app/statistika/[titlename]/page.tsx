import { serverGetFullStats } from "@/lib/server-api";
import PageHeader from "@/components/ui/PageHeader";
import StatsCharts from "@/components/charts/StatsCharts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ titlename: string }>;
}

const VALID = {
  erga: { label: "Έργα" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { titlename } = await params;
  const entry = VALID[titlename as keyof typeof VALID];
  return { title: entry ? `Στατιστικά ${entry.label}` : "Στατιστικά" };
}

export default async function StatistikaPage({ params }: Props) {
  const { titlename } = await params;
  const entry = VALID[titlename as keyof typeof VALID];
  if (!entry) notFound();

  const data = await serverGetFullStats().catch(() => null);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-gray-500">
        Τα στατιστικά δεν είναι διαθέσιμα αυτή τη στιγμή.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Έργων"
        titleHighlight="Στατιστικά"
        description="Αναλυτικά γραφήματα και στοιχεία για τα έργα της Περιφέρειας Πελοποννήσου."
        image="/images/stats.png"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <StatsCharts data={data} />
      </div>
    </>
  );
}
