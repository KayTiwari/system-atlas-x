"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes } from "lucide-react";

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/build", label: "Build" },
  { href: "/components", label: "Components" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname() ?? "/";
  return (
    <header className="sticky top-0 z-40 border-b border-navy-700 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-brand text-white">
            <Boxes className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            System Atlas <span className="text-brand-cyan">X</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 rounded-md border border-navy-700 bg-navy-900 p-1">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-slate-600 hover:bg-paper-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
