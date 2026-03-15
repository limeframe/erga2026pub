"use client";

import { useEffect } from "react";
import type { HomeStats } from "@/lib/types";
import { getStatusColor } from "@/lib/status";

interface CountersSectionProps {
  dataStats: HomeStats | null | undefined;
  istatColors?: Record<number, string>;
}

const safeCount = (n: number | undefined | null) => (n ?? 0).toString();

const COUNTERS = [
  { key: "proposed"      as const, istat: 1, label: "Προτεινόμενο", icon: "bi-bookmark-star" },
  { key: "under_planning"as const, istat: 2, label: "Υπό σχεδιασμό", icon: "bi-bookmark" },
  { key: "in_progress"   as const, istat: 3, label: "Σε εξέλιξη",    icon: "bi-bookmark-plus" },
  { key: "completed"     as const, istat: 4, label: "Ολοκληρωμένο",  icon: "bi-bookmark-check" },
];

export default function CountersSection({ dataStats, istatColors = {} }: CountersSectionProps) {
  const stats = dataStats ?? { proposed: 0, under_planning: 0, in_progress: 0, completed: 0 };
  const resolveColor = (istat: number) => istatColors[istat] ?? getStatusColor(istat);

  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>(".counter");
    counters.forEach((counter) => {
      const updateCount = () => {
        const target = counter.getAttribute("data-count");
        if (target) {
          const targetNumber = +target;
          const count = +counter.innerHTML;
          const increment = targetNumber / 100;
          if (count < targetNumber) {
            counter.innerHTML = Math.ceil(count + increment).toString();
            setTimeout(updateCount, 20);
          } else {
            counter.innerHTML = targetNumber.toString();
          }
        }
      };
      updateCount();
    });
  }, [stats]);

  return (
    <section className="pt-10 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COUNTERS.map(({ key, istat, label, icon }) => {
            const color = resolveColor(istat);
            return (
              <div key={key}>
                <div
                  className="bg-white rounded-2xl flex flex-col items-center py-6 px-4 text-center"
                  style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                >
                  <i className={`bi ${icon} text-4xl`} style={{ color }} />
                  <h2
                    className="counter text-3xl font-bold my-3"
                    data-count={safeCount(stats[key])}
                  >
                    0
                  </h2>
                  <p className="text-gray-900 text-base">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
