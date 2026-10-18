import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export const Hero = () => {
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Cinematic Ambient Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#7621B0]/20 via-[#B600A8]/20 to-[#BE4C00]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -top-12 -left-20 w-96 h-96 bg-[#18011F]/60 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#BE4C00]/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
        {/* Availability Badge */}
        <FadeIn delay={0.1} y={-10}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-white/10 text-xs sm:text-sm text-[#F5F5F5] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-medium text-[#BBCCD7]">Available for Select Freelance Projects & Brands</span>
          </div>
        </FadeIn>

        {/* Main Headline */}
        <FadeIn delay={0.2} y={20}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[1.05] max-w-5xl text-white">
            I TURN RAW FOOTAGE INTO{' '}
            <span className="hero-heading block sm:inline">VISUAL EXPERIENCES.</span>
          </h1>
        </FadeIn>

        {/* Supporting Subtext */}
        <FadeIn delay={0.35} y={20}>
          <p className="mt-6 text-base sm:text-xl md:text-2xl text-[#A6A6A6] max-w-3xl font-light leading-relaxed">
            From cinematic edits to high-converting brand videos, I craft visuals that capture attention, communicate ideas, and leave an impression.
          </p>
        </FadeIn>

        {/* Action CTAs */}
        <FadeIn delay={0.5} y={20}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => handleScrollTo('work')}
              className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm sm:text-base hover:bg-neutral-200 transition-all duration-200 shadow-lg shadow-white/10 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Explore My Work
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleScrollTo('contact')}
              className="btn-contact-gradient px-8 py-3.5 rounded-full text-white font-semibold text-sm sm:text-base flex items-center gap-2"
            >
              Let's Work Together
            </button>

            <button
              onClick={() => handleScrollTo('showreel')}
              className="px-6 py-3.5 rounded-full bg-[#141414] hover:bg-[#1A1A1A] text-[#F5F5F5] border border-white/10 font-medium text-sm sm:text-base transition-all duration-200 flex items-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full bg-[#B600A8]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3 h-3 text-[#B600A8] fill-[#B600A8]" />
              </div>
              Watch Showreel
            </button>
          </div>
        </FadeIn>

        {/* Quick Capabilities Highlights */}
        <FadeIn delay={0.65} y={20}>
          <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-[#A6A6A6]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B600A8]" /> SaaS & Product Demos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7621B0]" /> Luxury Real Estate
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#BE4C00]" /> AMVs & Movie Cuts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#BBCCD7]" /> DaVinci Color Science
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
