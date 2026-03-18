"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ROUTES, SITE } from "@/lib/config";

const navItems = [
  { label: "ΑΡΧΙΚΗ", href: ROUTES.home },
  {
    label: "ΕΡΓΑ",
    href: ROUTES.erga,
    children: [
      { label: "ΛΙΣΤΑ ΕΡΓΩΝ", href: ROUTES.erga },
      { label: "ΣΤΑΤΙΣΤΙΚΑ", href: ROUTES.statistikaErga },
    ],
  },
  { label: "ΑΝΟΙΚΤΑ ΔΕΔΟΜΕΝΑ", href: ROUTES.opendata },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="bg-primary-dark shadow-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-3 shrink-0">
            <Image
              src="/images/logo.png"
              alt={SITE.fullName}
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <p className="text-white text-xs font-light uppercase tracking-wider">
                  Εφαρμογή Έργων
                </p>
                <span className="text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Beta
                </span>
              </div>
              <p className="text-white text-sm font-bold uppercase tracking-wide">
                Περιφέρειας Πελοποννήσου
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative group">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label ? null : item.label
                      )
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                      isActive(item.href)
                        ? "text-white bg-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 pt-1 w-44 hidden group-hover:block">
                    <div className="bg-white rounded-md shadow-lg ring-1 ring-black/5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "text-white bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-white p-2 rounded-md hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3 border-t border-white/20 mt-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium rounded-md mt-1 ${
                    isActive(item.href)
                      ? "text-white bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-1.5 text-xs text-white/60 hover:text-white"
                  >
                    — {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
