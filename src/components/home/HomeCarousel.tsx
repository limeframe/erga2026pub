"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ProjectListItem } from "@/lib/types";
import { ROUTES } from "@/lib/config";
import { getStatusColor, getStatusLabel } from "@/lib/status";

interface HomeCarouselProps {
  data: ProjectListItem[];
  istatColors?: Record<number, string>;
  istatLabels?: Record<number, string>;
}

const formatBudget = (v: string) =>
  parseFloat(v).toLocaleString("el-GR", { minimumFractionDigits: 2 }) + " €";

function useVisibleCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCount(1);
      else if (window.innerWidth < 1024) setCount(2);
      else setCount(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

export default function HomeCarousel({ data, istatColors = {}, istatLabels = {} }: HomeCarouselProps) {
  const resolveColor = (istatId: number | null) =>
    istatId != null ? (istatColors[istatId] ?? getStatusColor(istatId)) : getStatusColor(null);

  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const visibleCount = useVisibleCount();

  const total = data.length;
  const gap = visibleCount === 1 ? 0 : visibleCount === 2 ? 24 : 32;
  const maxIndex = Math.max(0, total - visibleCount);

  // Μέτρηση πλάτους container για pixel-accurate translateX
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, total - visibleCount)));
  }, [visibleCount, total]);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(Math.min(Math.max(index, 0), maxIndex));
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating, maxIndex]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    if (total <= visibleCount) return;
    autoplayRef.current = setInterval(() => {
      setCurrent((c) => {
        const n = c + 1;
        return n > maxIndex ? 0 : n;
      });
    }, 4000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [total, maxIndex, visibleCount]);

  if (!data.length) return null;

  const dotCount = maxIndex + 1;
  const cardWidth = `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`;
  // Pixel-accurate offset: κάθε βήμα = (containerWidth + gap) / visibleCount
  const stepPx = containerWidth > 0 ? (containerWidth + gap) / visibleCount : 0;
  const translateX = `translateX(-${current * stepPx}px)`;

  return (
    <section className="bg-primary-dark py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 70 70"
            fill="currentColor"
            className="mx-auto mb-6"
            style={{ height: "56px", width: "auto", color: "white" }}
          >
            <path d="M45.53,52.91c-.23-.05-.47-.01-.67.11l-1.42.89.1-.13c-1.98,1.07-4.1,1.88-6.3,2.39-.41.09-.69.45-.69.87v2.62c0,.82-.67,1.49-1.5,1.49h-7.16c-.82,0-1.5-.67-1.5-1.49v-2.62c0-.42-.28-.77-.69-.87-2.7-.63-5.26-1.69-7.62-3.16-.36-.22-.81-.17-1.1.13l-1.85,1.85c-.56.56-1.55.56-2.11,0l-5.07-5.07c-.28-.28-.44-.66-.44-1.06s.16-.77.44-1.06l1.85-1.85c.3-.29.35-.75.13-1.1-1.47-2.36-2.53-4.92-3.16-7.63-.09-.41-.45-.69-.87-.69h-2.62c-.82,0-1.49-.67-1.49-1.49v-7.16c0-.82.67-1.5,1.49-1.5h2.62c.42,0,.77-.28.87-.69.62-2.7,1.69-5.26,3.16-7.62.22-.35.17-.81-.13-1.1l-1.85-1.85c-.28-.28-.44-.66-.44-1.06s.16-.78.44-1.06l5.07-5.07c.56-.57,1.55-.57,2.11,0l1.85,1.85c.3.29.75.35,1.1.13,2.35-1.47,4.92-2.53,7.62-3.16.4-.1.69-.45.69-.87v-2.62c0-.82.67-1.5,1.5-1.5h7.16c.82,0,1.5.67,1.5,1.5v2.62c0,.42.28.77.69.87,2.71.63,5.27,1.69,7.62,3.16.35.22.81.17,1.1-.13l1.85-1.85c.56-.57,1.55-.57,2.12,0l5.07,5.07c.28.28.44.66.44,1.06s-.16.77-.44,1.06l-1.85,1.85c-.3.29-.35.75-.13,1.1,1.47,2.36,2.53,4.92,3.16,7.63.09.4.46.69.87.69h2.62c.57,0,1.09.32,1.34.83.22.44.76.62,1.2.4.21-.1.37-.29.45-.51.08-.23.06-.47-.05-.68-.56-1.13-1.68-1.83-2.94-1.83h-1.92l-.06-.21c-.6-2.26-1.51-4.43-2.68-6.47l-.11-.19,1.36-1.35c.62-.62.96-1.44.96-2.32s-.34-1.7-.96-2.32l-5.07-5.07c-.62-.62-1.44-.96-2.32-.96s-1.7.34-2.32.96l-1.35,1.35-.19-.11c-2.01-1.16-4.19-2.07-6.47-2.68l-.21-.06v-1.92c0-1.81-1.47-3.28-3.28-3.28h-7.16c-1.81,0-3.28,1.47-3.28,3.28v1.92l-.21.06c-2.26.6-4.44,1.51-6.47,2.68l-.19.11-1.35-1.35c-.62-.62-1.44-.96-2.32-.96s-1.7.34-2.32.96l-5.07,5.07c-.62.62-.96,1.44-.96,2.32s.34,1.7.96,2.32l1.35,1.35-.11.19c-1.16,2.02-2.07,4.2-2.68,6.47l-.06.21h-1.92c-1.81,0-3.28,1.47-3.28,3.28v7.16c0,1.81,1.47,3.28,3.28,3.28h1.92l.06.21c.6,2.26,1.51,4.44,2.68,6.47l.11.19-1.35,1.35c-.62.62-.96,1.44-.96,2.32s.34,1.7.96,2.32l5.07,5.07c1.28,1.28,3.36,1.28,4.64,0l1.35-1.35.19.11c2.02,1.17,4.2,2.07,6.47,2.68l.21.06v1.92c0,1.81,1.47,3.28,3.28,3.28h7.16c1.81,0,3.28-1.47,3.28-3.28v-1.92l.21-.06c2.56-.69,5.01-1.75,7.26-3.16.2-.13.34-.32.4-.56.05-.23.01-.47-.11-.67-.13-.2-.32-.34-.56-.4h0Z"/>
            <path d="M50.57,28.19c.18.12.4.17.61.14h.06c.23-.06.43-.2.57-.39.13-.2.18-.44.13-.67-1.98-9.66-10.58-16.68-20.46-16.68-11.52,0-20.88,9.37-20.88,20.89s9.37,20.89,20.88,20.89c3.88,0,7.66-1.07,10.94-3.09.42-.26.55-.81.29-1.23-.26-.42-.81-.55-1.23-.29-3,1.85-6.46,2.82-10,2.82-10.53,0-19.1-8.57-19.1-19.1,0-5.09,1.99-9.89,5.6-13.5,3.61-3.61,8.4-5.6,13.5-5.6,9.03,0,16.9,6.41,18.71,15.25.05.23.19.44.39.57h0Z"/>
            <path d="M44.69,31.2c0,.24.1.46.28.63.17.16.38.23.63.24.24,0,.46-.1.63-.27.17-.17.26-.4.25-.64-.17-8.1-6.9-14.7-15-14.7s-15,6.73-15,15,6.73,15.01,15,15.01c3.71,0,7.26-1.37,10.02-3.85.37-.33.39-.9.07-1.26-.33-.36-.9-.4-1.26-.07-2.43,2.19-5.57,3.39-8.83,3.39-7.29,0-13.22-5.93-13.22-13.22s5.93-13.22,13.22-13.22,13.07,5.81,13.22,12.95Z"/>
            <path d="M65.78,33.26c-2.67-2.39-6.27-3.54-9.88-3.15-5.81.64-10.49,5.33-11.13,11.14-.38,3.4.59,6.73,2.72,9.36,1.45,1.8,2.35,3.83,2.59,5.89l.04.32h-2.07c-.49,0-.89.4-.89.89s.4.89.89.89h18.58c.49,0,.89-.4.89-.89s-.4-.89-.89-.89h-.68,0s-1.39,0-1.39,0l.03-.31c.22-2.13,1.04-4.07,2.36-5.61,1.96-2.29,3.05-5.21,3.05-8.22,0-3.59-1.54-7.03-4.22-9.43h0ZM65.6,49.74c-1.62,1.88-2.59,4.24-2.81,6.83l-.02.26h-4.53v-9.88l.23-.05c2.63-.53,4.53-2.86,4.53-5.54,0-.49-.4-.89-.89-.89s-.89.4-.89.89c0,2.13-1.73,3.87-3.87,3.87s-3.86-1.73-3.86-3.87c0-.49-.4-.89-.89-.89s-.89.4-.89.89c0,2.68,1.9,5.01,4.53,5.54l.23.05v9.88h-4.54l-.02-.26c-.23-2.48-1.27-4.93-3.01-7.08l-.1-.13h0c-1.76-2.25-2.55-5.05-2.23-7.92.55-4.99,4.57-9.01,9.56-9.56,3.14-.35,6.15.61,8.49,2.7,2.3,2.06,3.62,5.01,3.62,8.1,0,2.59-.93,5.09-2.62,7.05Z"/>
            <path d="M66.63,61.99h-7.19c-.49,0-.89.4-.89.89s.4.89.89.89h3.22l-.08.35c-.58,2.4-2.7,4.08-5.16,4.08h-.15c-2.46,0-4.59-1.68-5.16-4.08l-.08-.35h2.29c.49,0,.89-.4.89-.89s-.4-.89-.89-.89h-6.26c-.49,0-.89.4-.89.89s.4.89.89.89h2.16l.04.24c.56,3.47,3.51,5.98,7.01,5.98h.15c3.5,0,6.45-2.51,7.01-5.98l.04-.24h2.16c.49,0,.89-.4.89-.89s-.4-.89-.89-.89Z"/>
          </svg>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
            Σημαντικά Έργα
          </h2>
          <p className="mt-2 text-lg text-white/70">
            Δείτε κάποια από τα σημαντικότερα έργα που υλοποιεί η Περιφέρεια Πελοποννήσου
          </p>
        </div>

        {/* Slider track */}
        <div className="relative">
          <div className="overflow-hidden" ref={containerRef}>
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ gap: `${gap}px`, transform: translateX }}
            >
              {data.map((item) => {
                const href = ROUTES.ergaSingle(item.id);
                const color = resolveColor(item.istat_id);
                const label = item.istat_title
                  || (item.istat_id != null ? istatLabels[item.istat_id] : undefined)
                  || getStatusLabel(item.istat_id);
                return (
                  <article
                    key={item.id}
                    className="flex flex-col items-start justify-between shrink-0"
                    style={{ width: cardWidth }}
                  >
                    {/* Image */}
                    <div className="relative w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="aspect-video w-full rounded-2xl bg-white/10 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/j1-1.jpg";
                        }}
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                    </div>

                    {/* Content */}
                    <div className="flex w-full grow flex-col justify-between">
                      <div className="mt-6 flex flex-col gap-2">
                        <div>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: color + "28", color, border: `1px solid ${color}60` }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                            {label}
                          </span>
                        </div>
                        {item.pillar_title && (
                          <p className="text-xs text-white/50">{item.pillar_title}</p>
                        )}
                      </div>

                      <div className="group relative grow">
                        <h3 className="mt-3 text-lg/6 font-semibold text-white group-hover:text-white/80 line-clamp-2 transition-colors">
                          <Link href={href}>
                            <span className="absolute inset-0" />
                            {item.title}
                          </Link>
                        </h3>
                        {item.runits?.length > 0 && (
                          <p className="mt-2 text-sm line-clamp-1" style={{ color: "#23ace8" }}>
                            {item.runits.map((r) => r.title).join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-sm font-semibold" style={{ color: "var(--color-secondary)" }}>
                          {formatBudget(item.budget)}
                        </span>
                        <Link
                          href={href}
                          className="relative z-10 text-xs font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1"
                        >
                          Περισσότερα <i className="bi bi-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Arrows */}
          {total > visibleCount && (
            <>
              <button
                onClick={prev}
                disabled={current === 0}
                className="absolute -left-5 top-1/3 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
                aria-label="Προηγούμενο"
              >
                <i className="bi bi-chevron-left text-lg" />
              </button>
              <button
                onClick={next}
                disabled={current === maxIndex}
                className="absolute -right-5 top-1/3 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
                aria-label="Επόμενο"
              >
                <i className="bi bi-chevron-right text-lg" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {total > visibleCount && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Μετάβαση στο ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
