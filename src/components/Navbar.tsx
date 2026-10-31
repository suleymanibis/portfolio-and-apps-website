"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Code2,
  FileText,
  FolderGit2,
  Layers,
  LayoutDashboard,
  Menu,
  User,
  X,
} from "lucide-react";
import type { Locale } from "@/types";
import { dictionaries, localePath, stripLocalePrefix } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

interface NavbarProps {
  siteName: string;
  locale?: Locale;
}

export function Navbar({ siteName, locale = "tr" }: NavbarProps) {
  const pathname = usePathname() || "/";
  const cleanPathname = stripLocalePrefix(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = dictionaries[locale]?.nav ?? dictionaries.tr.nav;

  const navLinks = [
    { baseHref: "/", label: t.home, icon: Code2 },
    { baseHref: "/apps", label: t.apps, icon: Layers },
    { baseHref: "/repos", label: t.repos, icon: FolderGit2 },
    { baseHref: "/articles", label: t.articles, icon: FileText },
    { baseHref: "/about", label: t.about, icon: User },
  ];

  const isActive = (baseHref: string) =>
    baseHref === "/"
      ? cleanPathname === "/"
      : cleanPathname.startsWith(baseHref);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href={localePath("/", locale)}
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900 dark:text-white group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt={siteName}
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl shadow-sm ring-1 ring-indigo-500/25 group-hover:scale-105 transition-transform"
          />
          {siteName.toLowerCase() === "suleymanibis.dev" ? (
            <span className="flex items-baseline">
              <span>suleyman</span>
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 bg-clip-text text-transparent">
                ibis
              </span>
              <span className="text-xs font-mono font-semibold text-indigo-500 dark:text-indigo-400 ml-0.5 -translate-y-1.5">
                .dev
              </span>
            </span>
          ) : (
            <span>{siteName}</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.baseHref);
            return (
              <Link
                key={link.baseHref}
                href={localePath(link.baseHref, locale)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
          <Link
            href="/admin"
            prefetch={false}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
              pathname.startsWith("/admin")
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t.admin}</span>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t.toggleMenu}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.baseHref);
            return (
              <Link
                key={link.baseHref}
                href={localePath(link.baseHref, locale)}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/admin"
            prefetch={false}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.adminPanel}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
