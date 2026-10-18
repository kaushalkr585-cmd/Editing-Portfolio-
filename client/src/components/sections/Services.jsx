import React, { useState, useEffect } from 'react';
import {
  MonitorPlay,
  Home,
  Flame,
  Film,
  Mic,
  Youtube,
  Smartphone,
  Gamepad2,
  Sparkles,
  Wand2,
  Sliders,
  Type,
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

const ICON_MAP = {
  MonitorPlay: MonitorPlay,
  Home: Home,
  Flame: Flame,
  Film: Film,
  Mic: Mic,
  Youtube: Youtube,
  Smartphone: Smartphone,
  Gamepad2: Gamepad2,
  Sparkles: Sparkles,
  Wand2: Wand2,
  Sliders: Sliders,
  Type: Type,
};

export const Services = ({ onSelectServiceForInquiry }) => {
  const [services, setServices] = useState([]);
  const [activeServiceModal, setActiveServiceModal] = useState(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setServices(data.data);
        }
      })
      .catch((err) => console.warn('Could not load services from API:', err));
  }, []);

  const handleInquiry = (service) => {
    if (onSelectServiceForInquiry) {
      onSelectServiceForInquiry(service.title);
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-24 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Capabilities & Deliverables
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">
            Video Editing Services
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base mt-3">
            From Silicon Valley SaaS launch reels to frame-perfect anime AMVs and Hollywood-grade DaVinci Resolve color science.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, idx) => {
            const IconComponent = ICON_MAP[service.iconName] || Film;
            return (
              <FadeIn key={service.id || idx} delay={idx * 0.04}>
                <div className="bg-[#141414] border border-white/[0.08] hover:border-[#7621B0]/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#7621B0]/10 group">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18011F] to-[#7621B0]/30 border border-[#7621B0]/30 flex items-center justify-center text-[#B600A8] group-hover:scale-110 transition-transform duration-200">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono text-[#BBCCD7] bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B600A8]" />
                        {service.turnaround}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-[#BBCCD7] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2 leading-relaxed">
                      {service.shortDescription}
                    </p>

                    {/* Deliverables checklist */}
                    <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
                      <span className="text-[11px] uppercase tracking-wider text-[#6E6E6E] font-semibold block mb-1">
                        Core Deliverables:
                      </span>
                      {service.deliverables?.slice(0, 3).map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs text-[#E5E5E5]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B600A8] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key skills pills */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {service.keySkills?.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium bg-[#1A1A1A] text-[#8E8E8E] px-2 py-0.5 rounded border border-white/5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Action */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#BBCCD7]">
                      {service.pricingEstimate || 'Request a Quote'}
                    </span>
                    <button
                      onClick={() => handleInquiry(service)}
                      className="text-xs font-semibold text-white group-hover:text-[#B600A8] flex items-center gap-1.5 transition-colors"
                    >
                      Inquire Service
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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

export default Services;
