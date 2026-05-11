import Link from "next/link"
import Image from "next/image"

const footerLinks = [
  { href: "#events", label: "Evenements" },
  { href: "#boutique", label: "Boutique" },
  { href: "#gallerie", label: "Gallerie" },
  { href: "#about", label: "A propos" },
  { href: "#agence", label: "Agence" },
]

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://twitter.com", label: "Twitter" },
  { href: "https://soundcloud.com", label: "Soundcloud" },
]

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Gallery strip */}
      <div className="grid grid-cols-4 md:grid-cols-6">
        <div className="relative aspect-square">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16-sv2nqRmmrxDUAaqYpbYgnncRZlQUG7.jpg"
            alt="Wêrê Klub moment"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-square">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17-UrbKBC6B3b2KDs0AB0XCNJbFa5OwpL.jpg"
            alt="Wêrê Klub moment"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-square hidden md:block">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03881-nMw58iEtc2t1wmSy5gK3IYl60cLrkh.jpg"
            alt="Wêrê Klub moment"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-square">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03740-FnFcxZrEU6kMPhGaLxhB5z4u848Hcj.jpg"
            alt="Wêrê Klub moment"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-square hidden md:block">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-BDtBp7L2ah2hgLILoajpURhJYiPvNQ.jpg"
            alt="Wêrê Klub moment"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-square">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03642-55QQlqz9fxkYmXgJpzV87D0jaYsMWA.jpg"
            alt="Wêrê Klub moment"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="px-6 py-16 md:px-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Brand */}
            <div className="space-y-6">
              <Link href="/" className="font-display text-3xl md:text-4xl font-black tracking-tight uppercase block">
                Wêrê Klub
              </Link>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs">
                Collectif musical basé à Abidjan. DJ Sets, Live Shows, Pop Up Store & Food.
              </p>
            </div>

            {/* Navigation */}
            <div className="space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-white/50">Navigation</h3>
              <nav className="flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Social */}
            <div className="space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-white/50">Suivez-nous</h3>
              <nav className="flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-4">
                <p className="text-xs text-white/50">Contact</p>
                <a href="mailto:contact@wereklub.com" className="text-sm hover:text-white/70 transition-colors">
                  contact@wereklub.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/50">
              &copy; {new Date().getFullYear()} Wêrê Klub. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-xs text-white/50">
              <span>LEHUBS</span>
              <span>BAAB</span>
              <span>N:ch</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
