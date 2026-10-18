import React from 'react';
import { Film, ArrowUp, Youtube, Instagram, Twitter, Linkedin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080808] border-t border-white/[0.08] text-[#A6A6A6] text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B600A8] to-[#BE4C00] flex items-center justify-center p-0.5">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-wide block">
                KAUSHAL KUMAR
              </span>
              <span className="text-[11px] text-[#BBCCD7]">
                Creative Video Editor & Post-Production Director
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#F5F5F5]">
            <a href="#home" className="hover:text-[#B600A8] transition-colors">Home</a>
            <a href="#work" className="hover:text-[#B600A8] transition-colors">Work</a>
            <a href="#services" className="hover:text-[#B600A8] transition-colors">Services</a>
            <a href="#about" className="hover:text-[#B600A8] transition-colors">About</a>
            <a href="#ai-assistant" className="hover:text-[#B600A8] transition-colors">AI Director</a>
            <a href="#contact" className="hover:text-[#B600A8] transition-colors">Contact</a>
            <Link to="/admin" className="hover:text-white transition-colors text-xs text-[#6E6E6E]">Admin Portal</Link>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs transition-colors border border-white/5"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[#6E6E6E]">
            © {new Date().getFullYear()} Kaushal Kumar. All rights reserved. Cinematic editing for modern brands.
          </p>
          <p className="text-[11px] text-[#6E6E6E] flex items-center gap-1 justify-center">
            Designed for performance & cinematic impact
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
