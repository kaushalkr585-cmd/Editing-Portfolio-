import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, RefreshCw, Mail, MessageSquare, Clock, DollarSign, Sparkles, Instagram, Copy, Check, ExternalLink } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export const Contact = ({ prefillData }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'SaaS & Product',
    budget: '',
    deadline: '',
    description: '',
    referenceLinks: '',
  });

  const [aiBriefAttached, setAiBriefAttached] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (prefillData) {
      if (prefillData.briefTitle) {
        // Came from AI Brief Generator
        setFormData((prev) => ({
          ...prev,
          projectType: prefillData.projectType || prev.projectType,
          budget: prefillData.budgetGuideline || prev.budget,
          deadline: prefillData.turnaroundEstimate || prev.deadline,
          description: `Generated AI Blueprint: ${prefillData.briefTitle}\nTarget Platform: ${prefillData.platform}\nDesired Tone: ${prefillData.visualStyle}\nRecommended: ${prefillData.recommendedService}`,
        }));
        setAiBriefAttached(prefillData);
      } else if (prefillData.title) {
        // Came from Project or Service card
        setFormData((prev) => ({
          ...prev,
          projectType: prefillData.category || prefillData.title || prev.projectType,
          description: `Inquiring about editing services similar to: "${prefillData.title}".`,
        }));
      } else if (typeof prefillData === 'string') {
        // String category name
        setFormData((prev) => ({
          ...prev,
          projectType: prefillData,
        }));
      }
    }
  }, [prefillData]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please provide your name.';
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.projectType.trim()) errors.projectType = 'Please select a project type.';
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = 'Please provide a description of at least 10 characters.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        aiBrief: aiBriefAttached,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please check your inputs and try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network communication error. Please check your internet connection or email directly.');
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      projectType: 'SaaS & Product',
      budget: '',
      deadline: '',
      description: '',
      referenceLinks: '',
    });
    setAiBriefAttached(null);
    setStatus('idle');
    setValidationErrors({});
  };

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
            Ready to transform your raw footage or build your next viral video? Reach out directly via Instagram or Email, or submit a detailed project inquiry below.
          </p>
        </FadeIn>

        {/* Direct Contact Channels: Option 1 (Instagram) & Option 2 (Email) */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Option 1: Instagram */}
            <div className="bg-[#141414] border border-white/[0.08] hover:border-[#B600A8]/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#B600A8]/10 group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#18011F] to-[#B600A8]/30 border border-[#B600A8]/40 flex items-center justify-center text-[#B600A8] group-hover:scale-110 transition-transform shadow-glow-magenta">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
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
                  <span className="text-[11px] font-mono font-medium text-[#BBCCD7] bg-white/[0.05] px-3 py-1 rounded-full border border-white/10">
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

        {/* Separator to Inquiry Form */}
        <div className="relative my-10 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative inline-block bg-[#0C0C0C] px-4 text-xs font-mono uppercase tracking-widest text-[#A6A6A6]">
            Or Send A Detailed Project Brief
          </div>
        </div>

        <FadeIn delay={0.15}>
          <div className="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            {status === 'success' ? (
              <div className="text-center py-12 px-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Inquiry Dispatched Successfully!
                </h3>
                <p className="text-sm text-[#A6A6A6] max-w-md mx-auto mb-8">
                  Thank you for reaching out. Your project details have been safely received. I will review your timeline and reach out within 24 business hours.
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  Submit Another Project Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {aiBriefAttached && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#18011F] to-[#7621B0]/20 border border-[#B600A8]/30 flex items-center justify-between text-xs text-[#BBCCD7]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B600A8]" />
                      <span>
                        AI Creative Brief Attached: <strong>{aiBriefAttached.briefTitle}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiBriefAttached(null)}
                      className="text-[10px] text-[#A6A6A6] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BBCCD7] mb-2">
                      Your Name <span className="text-[#B600A8]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#6E6E6E] focus:outline-none transition-colors ${
                        validationErrors.name ? 'border-red-500' : 'border-white/10 focus:border-[#B600A8]'
                      }`}
                    />
                    {validationErrors.name && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.name}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BBCCD7] mb-2">
                      Your Email Address <span className="text-[#B600A8]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#6E6E6E] focus:outline-none transition-colors ${
                        validationErrors.email ? 'border-red-500' : 'border-white/10 focus:border-[#B600A8]'
                      }`}
                    />
                    {validationErrors.email && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Project Type */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BBCCD7] mb-2">
                      Project Type <span className="text-[#B600A8]">*</span>
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                    >
                      <option value="SaaS & Product">SaaS & Product Video</option>
                      <option value="Real Estate">Real Estate & Architectural</option>
                      <option value="AMVs">Anime Music Video (AMV)</option>
                      <option value="Movie Edits">Movie Edit / Cinematic Trailer</option>
                      <option value="Podcasts">Multi-Cam Podcast Show</option>
                      <option value="YouTube">YouTube Retention Cut</option>
                      <option value="Reels & Shorts">Reels & Shorts (Vertical)</option>
                      <option value="Gaming">Gaming Montage</option>
                      <option value="Commercials">Brand Commercial</option>
                      <option value="Motion Graphics & VFX">Motion Graphics & VFX</option>
                      <option value="Travel & Cinematic">Travel & Cinematic</option>
                      <option value="Other">Other Custom Inquiry</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BBCCD7] mb-2">
                      Target Budget (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $500 - $1,500"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6E6E6E] focus:outline-none focus:border-[#B600A8]"
                    />
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BBCCD7] mb-2">
                      Target Deadline (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next Friday, 2 weeks"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6E6E6E] focus:outline-none focus:border-[#B600A8]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#BBCCD7] mb-2">
                    Project Vision & Details <span className="text-[#B600A8]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your footage, desired tone, pacing references, or specific deliverables needed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full bg-[#1A1A1A] border rounded-xl p-4 text-sm text-white placeholder-[#6E6E6E] focus:outline-none transition-colors ${
                      validationErrors.description ? 'border-red-500' : 'border-white/10 focus:border-[#B600A8]'
                    }`}
                  />
                  {validationErrors.description && (
                    <span className="text-[11px] text-red-400 mt-1 block">
                      {validationErrors.description}
                    </span>
                  )}
                </div>

                {/* Reference links */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#BBCCD7] mb-2">
                    Footage / Reference Links (Google Drive, Frame.io, YouTube, etc.)
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={formData.referenceLinks}
                    onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6E6E6E] focus:outline-none focus:border-[#B600A8]"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-[#A6A6A6]">
                    🔒 Direct inquiry directly delivered to Kaushal's studio inbox.
                  </span>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-contact-gradient w-full sm:w-auto px-10 py-3.5 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Transmitting Inquiry...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Project Inquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Contact;
