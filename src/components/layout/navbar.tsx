"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wrench, Menu, X, Gauge, Box, Hammer, Bot } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/garage", label: "My Garage", icon: Gauge },
  { href: "/parts", label: "Parts", icon: Box },
  { href: "/build", label: "Build", icon: Hammer },
  { href: "/advisor", label: "AI Advisor", icon: Bot },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Wrench className="h-6 w-6 text-red-500 group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-red-500">Mod</span>
            <span className="text-white">Garage</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 bg-[#0d1117] border-white/10 p-0"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="flex items-center gap-2 p-6 border-b border-white/10">
                <Wrench className="h-5 w-5 text-red-500" />
                <span className="text-lg font-bold">
                  <span className="text-red-500">Mod</span>
                  <span className="text-white">Garage</span>
                </span>
              </div>

              {/* Mobile Links */}
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "text-red-500 bg-red-500/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
