import { Link } from 'react-router-dom'
import { Leaf, Github, Mail, Instagram, Twitter } from 'lucide-react'

const footerLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Deteksi Penyakit', href: '/deteksi' },
  { label: 'Info Penyakit', href: '/informasi' },
  { label: 'Cara Kerja', href: '/cara-kerja' },
  { label: 'Tentang', href: '/tentang' },
]

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: '#020804',
        borderColor: '#1a3520',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10 items-start w-full">
          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
              <Leaf className="w-5 h-5 text-[#22c55e]" />
              <span
                className="text-lg font-bold text-[#e8f5ec]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Oryza<span className="text-[#22c55e]">Detect</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: '#6b9c7a' }}>
              Platform deteksi penyakit tanaman padi berbasis AI untuk mendukung pertanian presisi di Indonesia.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: '#6b9c7a' }}
            >
              Navigasi
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors hover:text-[#22c55e]"
                    style={{ color: 'rgba(232,245,236,0.6)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Media Sosial */}
          <div className="md:text-right">
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: '#6b9c7a' }}
            >
              Media Sosial
            </h4>
            <div className="flex gap-4 md:justify-end">
              <a
                href="https://www.instagram.com/donyrzkmn/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#22c55e]"
                style={{ color: '#6b9c7a' }}
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/donyzkirmn"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#22c55e]"
                style={{ color: '#6b9c7a' }}
                aria-label="Twitter / X"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/donirijki"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#22c55e]"
                style={{ color: '#6b9c7a' }}
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&to=donnyrizkyramadhan@gmail.com&su=OryzaDetect"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#22c55e]"
                style={{ color: '#6b9c7a' }}
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: '#1a3520' }}
        >
          <p className="text-xs" style={{ color: 'rgba(107,156,122,0.7)' }}>
            © {new Date().getFullYear()} OryzaDetect. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'rgba(107,156,122,0.7)' }}>
            Hasil deteksi bersifat referensi — konsultasikan ke ahli pertanian.
          </p>
        </div>
      </div>
    </footer>
  )
}
