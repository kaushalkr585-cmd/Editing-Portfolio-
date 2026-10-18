import React from 'react';
import { Check, Sparkles, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

const PACKAGES = [
  {
    id: 'starter',
    name: 'Creator & Social Package',
    subtitle: 'High retention edits for YouTube, TikTok & Reels',
    badge: null,
    pricingNote: 'Request a Custom Quote',
    turnaround: '2 - 3 Days',
    revisions: '2 Rounds of Revisions',
    deliverables: [
      'Up to 3 vertical shorts or 1 long-form cut',
      'Dynamic word-by-word animated captions',
      'Rhythm-matched sound effects and transitions',
      'Fast-paced pacing and hook optimization',
      'Color correction & audio leveling',
      '1080p 60fps social-ready delivery',
    ],
  },
  {
    id: 'pro',
    name: 'Commercial & SaaS Launch',
    subtitle: 'High-converting product demos & paid ads',
    badge: 'Recommended',
    pricingNote: 'Request a Custom Quote',
    turnaround: '3 - 5 Days',
    revisions: '3 Rounds of Revisions',
    deliverables: [
      'Full 60s product video / multi-format ad set',
      '3D device framing and UI screen animations',
      'Kinetic typography and feature callouts',
      'DaVinci Resolve film color science',
      'Multi-track audio mastering & licensed SFX',
      'Deliverables in 16:9, 9:16, and 1:1 ratios',
      'A/B test hook variations',
    ],
  },
  {
    id: 'bespoke',
    name: 'Signature Cinematic Production',
    subtitle: 'Architectural films, documentaries & AMVs',
    badge: null,
    pricingNote: 'Request a Custom Quote',
    turnaround: '5 - 7 Days',
    revisions: 'Flexible Within Scope',
    deliverables: [
      'Long-form cinematic narrative flow',
      'Advanced After Effects VFX & clean plate tracking',
      'Custom film print emulation & shot matching',
      'Deep foley design & sub-bass audio mastering',
      'Dedicated timestamped Frame.io review link',
      'Master ProRes 4444 uncompressed delivery',
    ],
  },
];

export const Pricing = ({ onSelectPackageForInquiry }) => {
  const handleSelectPackage = (pkg) => {
    if (onSelectPackageForInquiry) {
      onSelectPackageForInquiry(pkg.name);
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-24 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Investment & Packages
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">
            Service Packages
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base mt-3">
            Transparent deliverables, reliable turnaround schedules, and dedicated revision rounds tailored to your project goals.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PACKAGES.map((pkg, idx) => {
            const isPopular = pkg.badge !== null;
            return (
              <FadeIn key={pkg.id} delay={idx * 0.1} className="h-full">
                <div
                  className={`h-full bg-[#141414] rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    isPopular
                      ? 'border-2 border-[#B600A8] shadow-2xl shadow-[#B600A8]/20 bg-gradient-to-b from-[#18011F]/40 to-[#141414]'
                      : 'border border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-xs text-[#A6A6A6] mt-1">{pkg.subtitle}</p>

                    <div className="my-6 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#6E6E6E] uppercase tracking-wider block">Estimated Rate</span>
                        <span className="text-lg font-bold text-white">{pkg.pricingNote}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#6E6E6E] uppercase tracking-wider block">Timeline</span>
                        <span className="text-xs font-mono text-[#BBCCD7] flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-[#B600A8]" />
                          {pkg.turnaround}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#BBCCD7] block">
                        Included in this package:
                      </span>
                      {pkg.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2.5 text-xs text-[#E5E5E5]">
                          <div className="w-4 h-4 rounded-full bg-[#B600A8]/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-[#B600A8]" />
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#A6A6A6] mb-4">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{pkg.revisions}</span>
                    </div>

                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full py-3.5 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                        isPopular
                          ? 'btn-contact-gradient text-white shadow-lg'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      Request a Quote
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
