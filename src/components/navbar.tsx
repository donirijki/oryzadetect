import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Deteksi', href: '/deteksi' },
  { label: 'Informasi', href: '/informasi' },
  { label: 'Cara Kerja', href: '/cara-kerja' },
  { label: 'Tentang', href: '/tentang' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      setScrolled(currentScrollY > 20)
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHidden(true)
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false)
      }
      
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      style={{
        backgroundColor: scrolled ? 'rgba(2,8,4,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(26,53,32,0.8)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <Leaf className="w-6 h-6 text-[#22c55e]" />
          </motion.div>
          <span
            className="text-xl font-bold text-[#e8f5ec] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Oryza<span className="text-[#22c55e]">Detect</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative px-4 py-2 text-sm font-medium transition-colors group"
              style={{ color: isActive(link.href) ? '#22c55e' : 'rgba(232,245,236,0.7)' }}
            >
              <span className="relative z-10 group-hover:text-[#e8f5ec] transition-colors">
                {link.label}
              </span>
              {isActive(link.href) && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              {/* Active dot */}
              {isActive(link.href) && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#22c55e]"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Button
            asChild
            className="rounded-full font-semibold px-5 h-9 text-sm"
            style={{
              backgroundColor: '#22c55e',
              color: '#020804',
            }}
          >
            <Link to="/deteksi" className="flex items-center gap-2">
              Mulai Deteksi
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#e8f5ec', border: '1px solid rgba(26,53,32,0.6)' }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 p-0 border-l"
            style={{ backgroundColor: '#020804', borderColor: '#1a3520' }}
          >
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <div className="flex flex-col h-full p-6">
              {/* Logo in sheet */}
              <div className="flex items-center gap-2 mb-8">
                <Leaf className="w-5 h-5 text-[#22c55e]" />
                <span
                  className="text-lg font-bold text-[#e8f5ec]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Oryza<span className="text-[#22c55e]">Detect</span>
                </span>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-1 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                      style={{
                        backgroundColor: isActive(link.href) ? 'rgba(34,197,94,0.1)' : 'transparent',
                        color: isActive(link.href) ? '#22c55e' : 'rgba(232,245,236,0.7)',
                        border: isActive(link.href) ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                      }}
                    >
                      <span className="font-medium text-sm">{link.label}</span>
                      {isActive(link.href) && <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA */}
              <div className="mt-6">
                <Button
                  asChild
                  className="w-full rounded-xl font-semibold"
                  style={{ backgroundColor: '#22c55e', color: '#020804' }}
                >
                  <Link to="/deteksi" onClick={() => setMobileOpen(false)}>
                    Mulai Deteksi Sekarang
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
