import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Copy,
  Check,
  Send,
  ArrowRight,
  FileText,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  Info,
  Loader2,
} from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export const AIAssistant = ({ onTransferBriefToContact, onSelectProject }) => {
  const [activeTab, setActiveTab] = useState('brief'); // 'brief' | 'match'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Brief Generator Form State
  const [briefInput, setBriefInput] = useState({
    projectType: 'SaaS & Product',
    platform: 'YouTube & Social Media (Multi-format)',
    audience: 'Tech founders, investors & digital professionals',
    desiredStyle: 'High-energy, 3D UI device framing, kinetic text & deep sound design',
    duration: '45 - 60 seconds',
    references: '',
    budget: '$500 - $1,500',
    deadline: 'Within 5 business days',
  });
  const [generatedBrief, setGeneratedBrief] = useState(null);

  // Matcher State
  const [matchQuery, setMatchQuery] = useState('');
  const [matchResults, setMatchResults] = useState(null);

  // Generate Brief Handler
  const handleGenerateBrief = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefInput),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedBrief(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to generate brief. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to AI assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Matcher Handler
  const handleMatch = async (e) => {
    e.preventDefault();
    if (!matchQuery.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: matchQuery }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMatchResults(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to analyze request.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to AI service.');
    } finally {
      setLoading(false);
    }
  };

  // Copy Brief to Clipboard
  const handleCopy = () => {
    if (!generatedBrief) return;
    const textToCopy = `
PROJECT BRIEF: ${generatedBrief.briefTitle}
----------------------------------------
• Type: ${generatedBrief.projectType}
• Target Platform: ${generatedBrief.platform}
• Target Audience: ${generatedBrief.targetAudience}
• Aspect Ratio: ${generatedBrief.aspectRatio}
• Target Duration: ${generatedBrief.targetDuration}
• Desired Visual Tone: ${generatedBrief.visualStyle}

HOOK & RETENTION STRATEGY:
${generatedBrief.hookStrategy?.map((h) => `• ${h}`).join('\n')}

RECOMMENDED PIPELINE:
${generatedBrief.recommendedWorkflow?.map((w) => `• ${w}`).join('\n')}

RECOMMENDED SERVICE:
${generatedBrief.recommendedService}

DELIVERABLE CHECKLIST:
${generatedBrief.checklist?.map((c) => `[ ] ${c}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Send Brief to Contact Form
  const handleTransferToContact = () => {
    if (!generatedBrief) return;
    if (onTransferBriefToContact) {
      onTransferBriefToContact(generatedBrief);
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="ai-assistant" className="py-24 bg-[#0C0C0C] relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#B600A8]/10 via-[#7621B0]/15 to-[#BE4C00]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#18011F] to-[#7621B0]/30 border border-[#B600A8]/30 text-white text-xs font-semibold mb-3 shadow-glow-magenta">
            <Cpu className="w-4 h-4 text-[#B600A8]" />
            <span>NVIDIA Nemotron Post-Production Assistant</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            AI Project Director
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base mt-3">
            Build a structured production blueprint or let our neural engine match your creative requirements with verified editing services and portfolio samples.
          </p>
        </FadeIn>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-full bg-[#141414] border border-white/10">
            <button
              onClick={() => setActiveTab('brief')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'brief'
                  ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-md'
                  : 'text-[#A6A6A6] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              AI Creative Brief Builder
            </button>
            <button
              onClick={() => setActiveTab('match')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'match'
                  ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-md'
                  : 'text-[#A6A6A6] hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              Service & Portfolio Matcher
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Brief Builder */}
        {activeTab === 'brief' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-[#141414] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B600A8]" />
                Project Parameters
              </h3>

              <form onSubmit={handleGenerateBrief} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                    Project Genre / Type
                  </label>
                  <select
                    value={briefInput.projectType}
                    onChange={(e) => setBriefInput({ ...briefInput, projectType: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  >
                    <option value="SaaS & Product">SaaS & Product Launch Video</option>
                    <option value="Real Estate">Luxury Real Estate Film</option>
                    <option value="AMVs">Anime Music Video (AMV)</option>
                    <option value="Movie Edits">Cinematic Movie Edit / Trailer</option>
                    <option value="Podcasts">Multi-Cam Podcast Show</option>
                    <option value="YouTube">YouTube Retention Documentary</option>
                    <option value="Reels & Shorts">Vertical Viral Reel / Short (9:16)</option>
                    <option value="Gaming">Gaming Highlight Montage</option>
                    <option value="Commercials">Direct-Response Brand Commercial</option>
                    <option value="Motion Graphics & VFX">Motion Graphics & 3D HUD</option>
                    <option value="Travel & Cinematic">Travel & Cinematic Film</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                    Primary Target Platform
                  </label>
                  <input
                    type="text"
                    value={briefInput.platform}
                    onChange={(e) => setBriefInput({ ...briefInput, platform: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="e.g. YouTube, Instagram Reels, Twitter, Paid Meta Ads"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                      Target Duration
                    </label>
                    <input
                      type="text"
                      value={briefInput.duration}
                      onChange={(e) => setBriefInput({ ...briefInput, duration: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                      placeholder="e.g. 45s, 60s, 8-12m"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                      Est. Timeline
                    </label>
                    <input
                      type="text"
                      value={briefInput.deadline}
                      onChange={(e) => setBriefInput({ ...briefInput, deadline: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                      placeholder="e.g. Within 5 days"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                    Desired Visual Vibe & Editing Style
                  </label>
                  <textarea
                    rows={2}
                    value={briefInput.desiredStyle}
                    onChange={(e) => setBriefInput({ ...briefInput, desiredStyle: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8] resize-none"
                    placeholder="e.g. Dark moody film look, punchy beat-sync cuts, kinetic typography"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                    Reference URLs or Competitors (Optional)
                  </label>
                  <input
                    type="text"
                    value={briefInput.references}
                    onChange={(e) => setBriefInput({ ...briefInput, references: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-full btn-contact-gradient text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synthesizing Project Brief...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Production Brief
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Output Column */}
            <div className="lg:col-span-7 bg-[#141414] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl min-h-[460px] flex flex-col justify-between">
              {generatedBrief ? (
                <div className="space-y-6">
                  {/* Top Bar with actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <span className="text-[10px] font-mono text-[#BBCCD7] uppercase bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                        {generatedBrief.isDemoFallback ? 'Intelligent Local Engine' : 'NVIDIA Nemotron Neural Output'}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-bold text-white mt-1">
                        {generatedBrief.briefTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>

                      <button
                        onClick={handleTransferToContact}
                        className="btn-contact-gradient px-4 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                      >
                        Use in Inquiry
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1A1A1A] p-3.5 rounded-xl text-xs border border-white/5">
                    <div>
                      <span className="text-[#6E6E6E] block">Ratio</span>
                      <span className="text-white font-medium">{generatedBrief.aspectRatio}</span>
                    </div>
                    <div>
                      <span className="text-[#6E6E6E] block">Duration</span>
                      <span className="text-white font-medium">{generatedBrief.targetDuration}</span>
                    </div>
                    <div>
                      <span className="text-[#6E6E6E] block">Service</span>
                      <span className="text-[#B600A8] font-medium truncate block">
                        {generatedBrief.recommendedService}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6E6E6E] block">Turnaround</span>
                      <span className="text-[#BBCCD7] font-medium">{generatedBrief.turnaroundEstimate}</span>
                    </div>
                  </div>

                  {/* Hook Strategy */}
                  <div>
                    <h5 className="text-xs uppercase font-bold tracking-wider text-[#BBCCD7] mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B600A8]" />
                      Hook & Retention Pacing Architecture
                    </h5>
                    <div className="space-y-1.5">
                      {generatedBrief.hookStrategy?.map((hook, hIdx) => (
                        <div key={hIdx} className="text-xs text-[#E5E5E5] bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                          {hook}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Pipeline */}
                  <div>
                    <h5 className="text-xs uppercase font-bold tracking-wider text-[#BBCCD7] mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#7621B0]" />
                      Post-Production Execution Stages
                    </h5>
                    <div className="space-y-1.5">
                      {generatedBrief.recommendedWorkflow?.map((step, sIdx) => (
                        <div key={sIdx} className="text-xs text-[#A6A6A6] flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Asset checklist */}
                  <div className="pt-3 border-t border-white/[0.08]">
                    <h5 className="text-xs uppercase font-bold tracking-wider text-[#BBCCD7] mb-2">
                      Client Asset Onboarding Checklist:
                    </h5>
                    <ul className="text-xs text-[#A6A6A6] space-y-1 list-disc list-inside">
                      {generatedBrief.checklist?.map((item, cIdx) => (
                        <li key={cIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#6E6E6E]">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[#A6A6A6]" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Your Custom Brief Will Appear Here</h4>
                  <p className="text-xs text-[#A6A6A6] max-w-sm">
                    Select your genre, duration, and stylistic preferences on the left and click Generate to produce a comprehensive editing blueprint.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Service Matcher */}
        {activeTab === 'match' && (
          <div className="max-w-4xl mx-auto bg-[#141414] border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#B600A8]" />
              Natural Language Project Matching
            </h3>
            <p className="text-xs sm:text-sm text-[#A6A6A6] mb-6">
              Describe what you are trying to produce in your own words. The assistant analyzes your scope against Kaushal's verified skills and catalog.
            </p>

            <form onSubmit={handleMatch} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                type="text"
                value={matchQuery}
                onChange={(e) => setMatchQuery(e.target.value)}
                placeholder="e.g. 'I need a fast-paced anime AMV with rhythm beat-sync and glowing impact frames for TikTok'"
                className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-[#6E6E6E] focus:outline-none focus:border-[#B600A8]"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-contact-gradient px-7 py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze Match
              </button>
            </form>

            {matchResults && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-[#E5E5E5] leading-relaxed">
                  <p className="font-medium text-white mb-1">Director's Assessment:</p>
                  <p className="text-[#A6A6A6]">{matchResults.analysis}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-[#BBCCD7] mb-3">
                    Recommended Editing Services:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchResults.recommendedServices?.map((svc, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5 flex flex-col justify-between">
                        <div>
                          <h5 className="font-bold text-white text-sm">{svc.title}</h5>
                          <p className="text-xs text-[#A6A6A6] mt-1">{svc.shortDescription}</p>
                        </div>
                        <span className="text-[11px] font-mono text-[#B600A8] mt-3 block">
                          Turnaround: {svc.turnaround}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {matchResults.matchingProjects && matchResults.matchingProjects.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-[#BBCCD7] mb-3">
                      Matching Portfolio References:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {matchResults.matchingProjects.map((proj, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => {
                            if (onSelectProject) onSelectProject(proj);
                            const el = document.getElementById('work');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/5 hover:border-[#B600A8]/50 transition-colors cursor-pointer group"
                        >
                          <img
                            src={proj.thumbnailUrl}
                            alt={proj.title}
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="p-3">
                            <span className="text-[9px] uppercase font-semibold text-[#B600A8]">
                              {proj.category}
                            </span>
                            <h6 className="text-xs font-bold text-white truncate mt-0.5">
                              {proj.title}
                            </h6>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AIAssistant;
