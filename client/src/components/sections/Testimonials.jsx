import React from 'react';

// Reusable Testimonials section: hides when no verified testimonials exist to prevent inventing client reviews.
export const Testimonials = ({ testimonials = [] }) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-24 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Client Impressions
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">
            Verified Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-[#141414] border border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between h-full">
              <p className="text-sm text-[#F5F5F5] italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <h4 className="text-sm font-bold text-white">{t.author}</h4>
                <p className="text-xs text-[#A6A6A6] mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
