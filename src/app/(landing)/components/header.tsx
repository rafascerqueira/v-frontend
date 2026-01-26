"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Funcionalidades" },
  { href: "#how-it-works", label: "Como Funciona" },
  { href: "#ai", label: "Inteligência Artificial" },
  { href: "#pricing", label: "Preços" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm"
          : "bg-transparent",
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/vendinhas.svg"
              alt="Vendinhas"
              width={140}
              height={32}
              className={cn(
                "transition-all duration-300",
                isScrolled ? "" : "brightness-0 invert",
              )}
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600",
                  isScrolled
                    ? "text-gray-600 dark:text-gray-300"
                    : "text-white/90 hover:text-white",
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className={cn(
                "text-sm font-medium transition-colors",
                isScrolled
                  ? "text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  : "text-white/90 hover:text-white",
              )}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all hover:scale-105"
            >
              Começar Grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X
                className={cn(
                  "h-6 w-6",
                  isScrolled ? "text-gray-900" : "text-white",
                )}
              />
            ) : (
              <Menu
                className={cn(
                  "h-6 w-6",
                  isScrolled ? "text-gray-900" : "text-white",
                )}
              />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-2 p-4 space-y-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <Link
                href="/login"
                className="block text-center text-gray-600 dark:text-gray-300 font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Começar Grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
