import React, { useState } from 'react';
import { Mail, Instagram, Copy, Check, ExternalLink } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export const Contact = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('kaushalkr.585@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <section id="contact" className="py-24 bg-[#0C0C0C] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Start A Project
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">
            Let's Work Together
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Ready to transform your raw footage or build your next viral video? Reach out directly via Instagram or Email.
          </p>
        </FadeIn>

        {/* Direct Contact Channels: Option 1 (Instagram) & Option 2 (Email) */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Instagram */}
            <div className="bg-[#141414] border border-white/[0.08] hover:border-[#B600A8]/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#B600A8]/10 group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#18011F] to-[#B600A8]/30 border border-[#B600A8]/40 flex items-center justify-center text-[#B600A8] group-hover:scale-110 transition-transform shadow-glow-magenta">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Fastest Response
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#B600A8] transition-colors">
                  Instagram
                </h3>
                <p className="text-xs font-mono text-[#BBCCD7] mb-3">
                  @mystry.editz
                </p>
                <p className="text-xs sm:text-sm text-[#A6A6A6] leading-relaxed mb-6">
                  Message me directly on Instagram for quick project chats, turnaround estimates, sample references, and questions.
                </p>
              </div>
              <a
                href="https://www.instagram.com/mystry.editz/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#B600A8] to-[#7621B0] hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#B600A8]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Instagram className="w-4 h-4" />
                Contact Me on Instagram
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            {/* Option 2: Email */}
            <div className="bg-[#141414] border border-white/[0.08] hover:border-[#7621B0]/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#7621B0]/10 group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#18011F] to-[#7621B0]/30 border border-[#7621B0]/40 flex items-center justify-center text-[#BBCCD7] group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-[#BBCCD7]" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-[#BBCCD7] bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/10">
                    Studio Inbox
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#BBCCD7] transition-colors">
                  Studio Email
                </h3>
                {/* Clear Email Display with Copy Control */}
                <div className="inline-flex items-center gap-2 bg-[#1A1A1A] px-3.5 py-1.5 rounded-lg border border-white/10 mb-3">
                  <span className="text-xs font-mono text-white select-all">
                    kaushalkr.585@gmail.com
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    title="Copy email address"
                    className="text-[#A6A6A6] hover:text-white transition-colors p-1"
                    aria-label="Copy email address"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {copiedEmail && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Copied!
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#A6A6A6] leading-relaxed mb-6">
                  Send high-resolution footage links, Frame.io review requests, contract inquiries, or detailed project requirements.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="mailto:kaushalkr.585@gmail.com"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mail className="w-4 h-4 text-[#BBCCD7]" />
                  Email Me
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#BBCCD7] hover:text-white transition-colors flex items-center gap-1.5"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Contact;
