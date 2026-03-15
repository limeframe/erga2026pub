import Link from "next/link";
import Image from "next/image";
import { SITE, ROUTES } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Image
              src="/images/logo-full.png"
              alt={SITE.fullName}
              width={160}
              height={89}
              className="w-40 h-auto"
            />
            <p className="text-xs text-white/60">{SITE.description}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              Πλατφόρμα
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.erga} className="text-white/80 hover:text-white transition-colors">
                  Λίστα Έργων
                </Link>
              </li>
              <li>
                <Link href={ROUTES.statistikaErga} className="text-white/80 hover:text-white transition-colors">
                  Στατιστικά
                </Link>
              </li>
              <li>
                <Link href={ROUTES.opendata} className="text-white/80 hover:text-white transition-colors">
                  Ανοικτά Δεδομένα
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              Πληροφορίες
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Έκδοση 1.0.0-beta
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© {new Date().getFullYear()} {SITE.fullName}. Με επιφύλαξη παντός δικαιώματος.</span>
          <div className="flex gap-4">
            <Link href="/oroi-xrisis" className="hover:text-white transition-colors">Όροι χρήσης</Link>
            <span>|</span>
            <Link href="/politiki-cookies" className="hover:text-white transition-colors">Πολιτική Cookies</Link>
            <span>|</span>
            <Link href="/politiki-aporritou" className="hover:text-white transition-colors">Πολιτική Απορρήτου</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
