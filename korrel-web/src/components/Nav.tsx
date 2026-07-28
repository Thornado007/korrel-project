"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/wiki", label: "Wiki" },
  { href: "/services", label: "Service" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

/**
 * Sitewide header/nav.
 *
 * Horizontal links on desktop, hamburger-triggered dropdown on mobile.
 * Uses conditional rendering (not max-height hack) to guarantee cross-
 * browser compatibility with Tailwind v4.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the menu on Escape key.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="relative border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="text-lg font-medium tracking-tight">
          Korrel
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-6 text-sm text-muted sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-foreground ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-foreground"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-md sm:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            {open ? (
              <path
                d="M4 4L18 18M18 4L4 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6H19M3 11H19M3 16H19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu — conditionally rendered for reliability */}
      {open && (
        <nav
          id="mobile-nav"
          className="animate-menu-open flex flex-col gap-1 border-t border-border px-6 py-3 text-sm text-muted sm:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-2 py-3 transition-colors hover:bg-black/5 hover:text-foreground ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-foreground"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
