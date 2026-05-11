"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "EVENEMENTS" },
  { href: "/boutique", label: "BOUTIQUE" },
  { href: "/galerie", label: "GALERIE" },
  { href: "/a-propos", label: "A PROPOS" },
  { href: "/agence", label: "AGENCE" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="font-display text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase">
          Wêrê Klub
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs tracking-widest transition-colors hover:text-foreground/70 ${
                pathname === link.href 
                  ? "border border-foreground px-4 py-2" 
                  : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm">0</span>
          </button>
        </nav>

        <div className="lg:hidden flex items-center gap-4">
          <button className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm">0</span>
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-foreground/10">
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm tracking-widest py-2 ${
                  pathname === link.href ? "font-bold" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
