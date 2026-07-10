"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Settings, UtensilsCrossed, X } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/refeicoes", label: "Refeições", icon: UtensilsCrossed, exact: false },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, exact: false },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "text-zinc-600 hover:translate-x-0.5 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            <Icon
              aria-hidden
              className="size-4.5 shrink-0 transition-transform duration-150 group-hover:scale-110"
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-2.5 border-b border-zinc-200 px-5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-base">
        🥗
      </span>
      <span className="text-sm font-bold tracking-tight text-zinc-900">{APP_NAME}</span>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-4 z-40 flex size-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-zinc-200 bg-white lg:flex">
        {brand}
        {navigation}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 animate-fade-in bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 animate-slide-in-left flex-col bg-white shadow-xl">
            <div className="relative">
              {brand}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                aria-label="Fechar menu"
              >
                <X className="size-4.5" />
              </button>
            </div>
            {navigation}
          </aside>
        </div>
      )}
    </>
  );
}
