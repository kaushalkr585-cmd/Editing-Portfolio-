import React, { useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Clock, Tag, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

export const ProjectModal = ({ project, onClose, onInquire }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  if (!project) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const getAspectClass = (ratio) => {
    switch (ratio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[70vh] mx-auto';
      case '1:1':
        return 'aspect-square max-h-[65vh] mx-auto';
      case '4:5':
        return 'aspect-[4/5] max-h-[70vh] mx-auto';
      default:
        return 'aspect-video w-full';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors border border-white/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player Box */}
        <div className="relative bg-black flex items-center justify-center overflow-hidden">
          <div className={getAspectClass(project.aspectRatio)}>
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={project.thumbnailUrl}
              autoPlay
              playsInline
              loop
              muted={isMuted}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Quick Player Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-1 rounded-full text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[10px] text-[#BBCCD7]">{isMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#A6A6A6]">
              <span>Ratio: {project.aspectRatio || '16:9'}</span>
              <span>•</span>
              <span>{project.duration || '0:30'}</span>
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs uppercase font-semibold text-[#B600A8] bg-[#B600A8]/10 px-2.5 py-0.5 rounded-full border border-[#B600A8]/20">
                  {project.category}
                </span>
                {project.isDemo && (
                  <span className="text-[10px] font-mono uppercase text-[#BBCCD7] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    Portfolio Demonstration
                  </span>
                )}
                {project.featured && (
                  <span className="text-[10px] font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">{project.title}</h3>
            </div>

            <button
              onClick={() => {
                onClose();
                onInquire(project);
              }}
              className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-sm font-semibold flex items-center gap-1.5 shadow-lg"
            >
              Inquire Similar Edit
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm sm:text-base text-[#A6A6A6] leading-relaxed">
            {project.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/[0.08] text-xs">
            <div>
              <span className="text-[#6E6E6E] block mb-1">Client / Project</span>
              <span className="text-white font-medium">{project.client || 'Client Project'}</span>
            </div>
            <div>
              <span className="text-[#6E6E6E] block mb-1">Duration</span>
              <span className="text-white font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#BBCCD7]" /> {project.duration || '0:30'}
              </span>
            </div>
            <div>
              <span className="text-[#6E6E6E] block mb-1">Native Aspect Ratio</span>
              <span className="text-white font-medium">{project.aspectRatio || '16:9'}</span>
            </div>
            <div>
              <span className="text-[#6E6E6E] block mb-1">Master Delivery</span>
              <span className="text-[#BBCCD7] font-medium">4K ProRes / Rec.709</span>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#6E6E6E]" />
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#1A1A1A] text-[#A6A6A6] px-2.5 py-1 rounded-md border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
