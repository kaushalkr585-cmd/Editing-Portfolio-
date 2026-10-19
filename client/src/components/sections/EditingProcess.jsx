import React, { useState, useRef } from 'react';
import { Film, Scissors, Sliders, Volume2, CheckCircle2, Sparkles, MoveHorizontal, Activity, Layers, Sun } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Raw Footage Ingestion',
    icon: Film,
    description: 'Cataloging multi-camera footage, creating lightweight editing proxies, synchronizing dual-system audio tracks, and organizing bin structures.',
    color: '#BBCCD7',
  },
  {
    step: '02',
    title: 'Editing & Pacing',
    icon: Scissors,
    description: 'Sculpting the narrative arc, testing opening retention hooks, time-remapping velocity curves, and matching rhythm to music beats.',
    color: '#7621B0',
  },
  {
    step: '03',
    title: 'Color Grading',
    icon: Sliders,
    description: 'Transforming flat Log profiles to Rec.709 with DaVinci Resolve color science, shot-to-shot matching, skin tone preservation, and cinematic film looks.',
    color: '#B600A8',
  },
  {
    step: '04',
    title: 'Sound Design & Foley',
    icon: Volume2,
    description: 'Multi-layer audio mixing: dialogue isolation, room tone leveling, whooshes, sub-bass impacts, and mastering for broadcast compliance.',
    color: '#BE4C00',
  },
  {
    step: '05',
    title: 'Final Master Output',
    icon: CheckCircle2,
    description: 'Master renders in uncompressed ProRes and platform-optimized H.264/H.265 in all required aspect ratios (16:9, 9:16, 1:1, 4:5).',
    color: '#10B981',
  },
];

export const EditingProcess = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <section id="process" className="py-24 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Creative Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">
            The 5-Stage Editing Process
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base mt-3">
            Every cut, transition, and audio hit is calculated to captivate your audience and tell an unforgettable story.
          </p>
        </FadeIn>

        {/* 5 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-20">
          {PROCESS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <FadeIn key={idx} delay={idx * 0.08}>
                <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 h-full flex flex-col justify-between hover:border-white/20 transition-colors group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[#A6A6A6] bg-white/5 px-2.5 py-1 rounded">
                        {step.step}
                      </span>
                      <Icon className="w-5 h-5 text-[#BBCCD7] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-[#A6A6A6] leading-relaxed">{step.description}</p>
                  </div>
                  <div
                    className="w-full h-1 mt-6 rounded-full opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: step.color }}
                  />
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Technical Color Grading Transformation Showcase */}
        <FadeIn delay={0.2}>
          <div className="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 sm:p-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-mono uppercase text-[#B600A8] tracking-widest bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
                Color Science & Grading
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                DaVinci Resolve Log-to-Rec.709 Pipeline
              </h3>
              <p className="text-xs sm:text-sm text-[#A6A6A6] mt-1">
                Drag the interactive slider to inspect dynamic range mapping, contrast compression, and color density calibration.
              </p>
            </div>

            {/* Slider visualizer */}
            <div
              ref={containerRef}
              onMouseDown={() => (isDragging.current = true)}
              onMouseUp={() => (isDragging.current = false)}
              onMouseLeave={() => (isDragging.current = false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onClick={(e) => handleMove(e.clientX)}
              className="relative aspect-[16/9] max-w-4xl mx-auto rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10 shadow-2xl bg-black"
            >
              {/* Graded Cinematic Master (Right / Bottom side) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0F051D] via-[#1A0B2E] to-[#2B0E1B] flex flex-col justify-between p-6 sm:p-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs uppercase font-mono font-bold bg-[#B600A8]/90 text-white px-3 py-1 rounded-full backdrop-blur-md shadow-md">
                    DaVinci Resolve Rec.709 Film Emulation
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#BBCCD7]">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-mono">Kodak 2383 LUT • High Contrast</span>
                  </div>
                </div>

                {/* Scope Visualizer Graphic */}
                <div className="space-y-4 my-auto">
                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                    <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-mono text-[#A6A6A6] block">Lift (Shadows)</span>
                      <span className="text-sm font-bold text-indigo-400 font-mono">0.02 • Deep Black</span>
                    </div>
                    <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-mono text-[#A6A6A6] block">Gamma (Midtones)</span>
                      <span className="text-sm font-bold text-fuchsia-400 font-mono">+0.14 • Warm Skin</span>
                    </div>
                    <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-mono text-[#A6A6A6] block">Gain (Highlights)</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">0.96 • Soft Roll-off</span>
                    </div>
                  </div>

                  {/* Waveform curve preview */}
                  <div className="h-16 w-full max-w-lg mx-auto flex items-end gap-1 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                    {[45, 60, 52, 78, 92, 85, 70, 62, 88, 95, 72, 60, 82, 90, 75, 68, 55, 74, 91, 84].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(to top, #7621B0, #B600A8, #BE4C00)`
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A6A6A6] border-t border-white/[0.08] pt-3">
                  <span>Color Space: DWG / Intermediate</span>
                  <span>Target: Rec.709 Gamma 2.4</span>
                </div>
              </div>

              {/* Raw S-Log Profile (Left / Clipped side) */}
              <div
                className="absolute inset-0 overflow-hidden bg-neutral-900 border-r border-white/30"
                style={{ width: `${sliderPosition}%` }}
              >
                <div
                  className="absolute inset-0 bg-[#222222] flex flex-col justify-between p-6 sm:p-10 filter saturate-50 brightness-110"
                  style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs uppercase font-mono font-bold bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full border border-white/10">
                      Raw S-Log3 / V-Log Flat Profile
                    </span>
                    <span className="text-xs font-mono text-neutral-400">14+ Stops Uncompressed</span>
                  </div>

                  <div className="space-y-4 my-auto">
                    <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto opacity-70">
                      <div className="p-3 bg-neutral-800/60 rounded-xl border border-white/5 text-center">
                        <span className="text-[10px] uppercase font-mono text-neutral-400 block">Lift (Flat)</span>
                        <span className="text-sm font-bold text-neutral-300 font-mono">0.25 Elevated</span>
                      </div>
                      <div className="p-3 bg-neutral-800/60 rounded-xl border border-white/5 text-center">
                        <span className="text-[10px] uppercase font-mono text-neutral-400 block">Gamma (Flat)</span>
                        <span className="text-sm font-bold text-neutral-300 font-mono">0.45 Low Contrast</span>
                      </div>
                      <div className="p-3 bg-neutral-800/60 rounded-xl border border-white/5 text-center">
                        <span className="text-[10px] uppercase font-mono text-neutral-400 block">Gain (Flat)</span>
                        <span className="text-sm font-bold text-neutral-300 font-mono">0.72 Clipped Protect</span>
                      </div>
                    </div>

                    <div className="h-16 w-full max-w-lg mx-auto flex items-end gap-1 px-4 py-2 bg-neutral-950/60 rounded-xl border border-white/5 opacity-60">
                      {[30, 32, 34, 38, 42, 40, 36, 35, 41, 44, 39, 37, 43, 45, 40, 38, 35, 39, 43, 41].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-neutral-500 rounded-t-sm"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800 pt-3">
                    <span>Input: Sony S-Gamut3.Cine / S-Log3</span>
                    <span>No Look Transform Applied</span>
                  </div>
                </div>
              </div>

              {/* Drag Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                  <MoveHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default EditingProcess;
