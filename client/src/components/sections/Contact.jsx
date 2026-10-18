import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, RefreshCw, Mail, MessageSquare, Clock, DollarSign, Sparkles } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export const Contact = ({ prefillData }) => {
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
            Ready to transform your raw footage or build your next viral video? Tell me about your goals, timelines, and vision.
          </p>
        </FadeIn>

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
