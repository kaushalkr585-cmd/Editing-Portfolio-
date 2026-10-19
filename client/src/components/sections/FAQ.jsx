import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

const FAQS = [
  {
    q: 'What is your typical turnaround time for a video edit?',
    a: 'Turnaround depends on project scope. Short-form Reels, TikToks, and YouTube Shorts are typically delivered within 24 to 48 hours. SaaS product demos and long-form YouTube documentary edits take 3 to 5 business days. Commercial architectural films take 4 to 7 business days. Express same-day turnaround is available for urgent deadlines.',
  },
  {
    q: 'How do we transfer large raw camera footage or screen recordings?',
    a: 'You can share footage via Google Drive, Dropbox, Frame.io, WeTransfer, or a private Cloudinary upload bucket. For enterprise clients with massive camera RAW files, high-speed chunked cloud upload links can be provided.',
  },
  {
    q: 'What post-production editing tools do you use?',
    a: 'My core workflow runs on Adobe Premiere Pro (for precision cutting, pacing, sequencing, and timeline workflows) and Adobe After Effects (for motion graphics, visual effects, compositing, 3D tracking, masking, kinetic typography, and animation), with professional color correction, cinematic color grading, and audio mastering.',
  },
  {
    q: 'How do project revisions and client feedback work?',
    a: 'Every package comes with 2 to 3 revision rounds included. Feedback is handled through Frame.io or timestamped video review portals, allowing you to pause at any second, draw on the video frame, and leave notes without any confusion.',
  },
  {
    q: 'Can you deliver multi-format cuts for YouTube, Instagram, and LinkedIn?',
    a: 'Yes! I specialize in multi-platform delivery. I will deliver your project in 16:9 for YouTube and desktop web, 9:16 for Reels/Shorts/TikTok, and 1:1 or 4:5 for Instagram feeds, intelligently re-framing camera shots to ensure the focal subject stays centered.',
  },
  {
    q: 'Are music tracks and sound effects cleared for commercial use?',
    a: '100% yes. I hold commercial lifetime licenses with leading audio libraries (Artlist, Epidemic Sound, Musicbed). Every delivered video is cleared against copyright strikes and approved for paid advertising on Meta, Google, TikTok, and broadcast.',
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#0C0C0C] relative border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">
            Got Questions?
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base mt-3">
            Everything you need to know about working with Kaushal Kumar on your next video project.
          </p>
        </FadeIn>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <FadeIn key={idx} delay={idx * 0.05}>
                <div
                  className={`rounded-2xl transition-all duration-200 border ${
                    isOpen
                      ? 'bg-[#141414] border-white/20 shadow-lg'
                      : 'bg-[#141414]/60 border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-white flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-[#B600A8] shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#A6A6A6] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#A6A6A6] leading-relaxed border-t border-white/[0.04] mt-1 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
