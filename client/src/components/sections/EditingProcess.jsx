import React, { useState, useRef } from 'react';
import { Film, Scissors, Sliders, Volume2, CheckCircle2, Sparkles, MoveHorizontal } from 'lucide-react';
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

        {/* Before and After Interactive Comparison */}
        <FadeIn delay={0.2}>
          <div className="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 sm:p-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-mono uppercase text-[#B600A8] tracking-widest bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
                Interactive Showcase
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                Color Grading Transformation
              </h3>
              <p className="text-xs sm:text-sm text-[#A6A6A6] mt-1">
                Drag the interactive slider to inspect the leap from raw washed-out S-Log3 footage to a deep, cinematic film finish.
              </p>
            </div>

            {/* Slider container */}
            <div
              ref={containerRef}
              onMouseDown={() => (isDragging.current = true)}
              onMouseUp={() => (isDragging.current = false)}
              onMouseLeave={() => (isDragging.current = false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onClick={(e) => handleMove(e.clientX)}
              className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10 shadow-2xl"
            >
              {/* After: Graded Version (Bottom layer) */}
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop"
                alt="Color Graded Master"
                className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-125 brightness-95"
              />
              <span className="absolute top-4 right-4 z-10 text-[10px] sm:text-xs uppercase font-mono font-bold bg-[#B600A8]/90 text-white px-3 py-1 rounded-full backdrop-blur-md shadow-md">
                Graded Master (DaVinci Resolve)
              </span>

              {/* Before: Raw Flat Log (Top layer clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop"
                  alt="Raw Flat Log Footage"
                  className="absolute inset-0 w-full h-full object-cover filter saturate-25 brightness-125 contrast-75 max-w-none"
                  style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
                />
                <span className="absolute top-4 left-4 z-10 text-[10px] sm:text-xs uppercase font-mono font-bold bg-black/80 text-[#BBCCD7] px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  Raw S-Log3 Profile
                </span>
              </div>

              {/* Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20"
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
