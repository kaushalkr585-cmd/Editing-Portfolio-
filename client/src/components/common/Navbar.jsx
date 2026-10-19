import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Film, ArrowUpRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ['home', 'work', 'about', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Work', href: '#work', id: 'work' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0C0C0C]/85 backdrop-blur-md border-b border-white/[0.08] shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="group flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-wider text-white"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B600A8] to-[#BE4C00] flex items-center justify-center p-0.5 shadow-glow-magenta group-hover:scale-105 transition-transform duration-200">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="tracking-tight text-white group-hover:text-[#BBCCD7] transition-colors">
            KAUSHAL KUMAR
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#B600A8] font-medium bg-[#B600A8]/10 px-2 py-0.5 rounded border border-[#B600A8]/20 hidden sm:inline-block">
            Editor
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#141414]/70 p-1.5 rounded-full border border-white/[0.06] backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-[#A6A6A6] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.name}
                {link.badge && (
                  <span className="text-[9px] bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wide">
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/admin"
            title="Admin Dashboard"
            className="p-2 rounded-lg text-[#A6A6A6] hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
          >
            <Shield className="w-4 h-4" />
          </Link>

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="btn-contact-gradient text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1.5"
          >
            Let's Talk
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 border border-white/10"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0C0C]/98 border-b border-white/10 px-4 pt-4 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`block px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
                activeSection === link.id
                  ? 'bg-white/10 text-white'
                  : 'text-[#A6A6A6] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{link.name}</span>
              {link.badge && (
                <span className="text-[10px] bg-[#B600A8] text-white px-2 py-0.5 rounded-full font-semibold">
                  {link.badge}
                </span>
              )}
            </a>
          ))}

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="btn-contact-gradient text-center text-white py-3 rounded-full font-medium"
            >
              Let's Work Together
            </a>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-xs text-[#A6A6A6] hover:text-white py-2"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
