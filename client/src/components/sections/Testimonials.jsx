import React from 'react';
import { Star, MessageSquareQuote, ShieldAlert } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

const DEMO_TESTIMONIALS = [
  {
    quote: "Kaushal's timing and sound design elevated our product launch video beyond our expectations. The retention numbers on our announcement tweet were our highest ever.",
    author: "Tech Startup Founder",
    role: "Verified Client • SaaS Launch Video",
    rating: 5,
    isPlaceholder: true,
  },
  {
    quote: "The color grade and pacing on our Malibu architectural film gave it the Hollywood look our high-net-worth clients demand. Flawless communication throughout.",
    author: "Luxury Real Estate Broker",
    role: "Verified Client • Architectural Cinematics",
    rating: 5,
    isPlaceholder: true,
  },
  {
    quote: "Finding an editor who understands beat-matching, velocity curves, and sound design at this level is rare. Delivered exactly what I envisioned.",
    author: "Digital Content Creator",
    role: "Verified Client • YouTube & Short-Form",
    rating: 5,
    isPlaceholder: true,
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono uppercase mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Demonstration Testimonial Placeholders</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Client Impressions
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base mt-3">
            Demonstration client placeholders. Real verified client reviews can be added via the secure Admin Dashboard.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {DEMO_TESTIMONIALS.map((t, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between h-full relative group hover:border-[#B600A8]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <MessageSquareQuote className="w-6 h-6 text-white/10 group-hover:text-[#B600A8]/40 transition-colors" />
                  </div>

                  <p className="text-sm text-[#F5F5F5] italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <h4 className="text-sm font-bold text-white">{t.author}</h4>
                  <p className="text-xs text-[#A6A6A6] mt-0.5">{t.role}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
