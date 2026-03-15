import Link from "next/link";
import { ROUTES } from "@/lib/config";

const cards = [
  {
    icon: "bi-bar-chart-line-fill",
    title: "Στατιστικά Έργων",
    description: "Αναλυτικά στατιστικά και γραφήματα για τα έργα που υλοποιεί η Περιφέρεια Πελοποννήσου.",
    href: ROUTES.statistikaErga,
    label: "Δείτε Στατιστικά",
  },
  {
    icon: "bi-list-ul",
    title: "Λίστα Έργων",
    description: "Περιηγηθείτε σε όλα τα έργα και τις δράσεις που υλοποιεί η Περιφέρεια Πελοποννήσου.",
    href: ROUTES.erga,
    label: "Δείτε Έργα",
  },
  {
    icon: "bi-cloud-arrow-down-fill",
    title: "Ανοικτά Δεδομένα",
    description: "Πρόσβαση στα ανοικτά δεδομένα και στο API της πλατφόρμας έργων της Περιφέρειας.",
    href: ROUTES.opendata,
    label: "Δείτε Δεδομένα",
  },
  {
    icon: "bi-info-circle-fill",
    title: "Πληροφορίες",
    description: "Μάθετε περισσότερα για την πλατφόρμα e-ΕΡΓΑ και τις δυνατότητές της.",
    href: "#",
    label: "Μάθετε Περισσότερα",
  },
];

export default function AdditionalInfo() {
  return (
    <section
      className="relative overflow-hidden py-24"
      style={{ background: "#162540" }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(155,194,227,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
            Εξερευνήστε την Πλατφόρμα
          </h2>
          <p className="mt-3 text-base text-white/70 max-w-xl mx-auto">
            Όλα τα εργαλεία για την παρακολούθηση και ενημέρωση σε ένα μέρος.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col gap-5 rounded-2xl p-7 border border-white/10 hover:border-white/25 transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(4px)" }}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <i
                    className={`bi ${card.icon}`}
                    style={{ fontSize: "1.4rem", color: "var(--color-secondary)" }}
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1 flex-1">
                  <h4 className="text-base font-semibold text-white leading-snug">
                    {card.title}
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-white/50 group-hover:text-white transition-colors pl-17">
                <span style={{ color: "var(--color-secondary)" }}>{card.label}</span>
                <i
                  className="bi bi-arrow-right transition-transform group-hover:translate-x-1"
                  style={{ color: "var(--color-secondary)" }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
