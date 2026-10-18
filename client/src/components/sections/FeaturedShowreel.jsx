import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export const FeaturedShowreel = ({
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  posterUrl = 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1600&auto=format&fit=crop',
  title = "Kaushal Kumar — 2026 Director's Reel",
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasStarted(true);
      setIsLoading(true);
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsLoading(false);
          setHasError(true);
        });
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current && duration) {
      videoRef.current.currentTime = pos * duration;
      setProgress(pos * 100);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  return (
    <section id="showreel" className="py-20 relative bg-[#0C0C0C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Showreel 2026
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-3">
            Cinematic Showreel
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base max-w-2xl mx-auto mt-2">
            A montage of high-energy commercial edits, 3D motion graphics, anime cuts, and DaVinci Resolve color grades.
          </p>
        </FadeIn>

        {/* Video Player Container */}
        <FadeIn delay={0.2}>
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onClick={togglePlay}
            className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#141414] border border-white/10 shadow-2xl group cursor-pointer"
          >
            {/* Poster fallback image if not started */}
            {!hasStarted && (
              <img
                src={posterUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {/* Backdrop overlay */}
            <div
              className={`absolute inset-0 bg-black/40 z-20 transition-opacity duration-300 ${
                isPlaying && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            />

            {/* HTML5 Video Element (preload none to save bandwidth) */}
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              preload="none"
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="w-full h-full object-cover"
            />

            {/* Error Overlay */}
            {hasError && (
              <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                <p className="text-white font-medium">Video preview temporarily unavailable</p>
                <p className="text-xs text-[#A6A6A6] mt-1">Check network connection or try reloading</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasError(false);
                    if (videoRef.current) videoRef.current.load();
                  }}
                  className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs hover:bg-white/20 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            {/* Big Play Button on Poster */}
            {!isPlaying && !hasError && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full btn-contact-gradient flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1.5" />
                  )}
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress Bar */}
              <div
                onClick={handleSeek}
                className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer relative transition-all duration-200 mb-3"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#B600A8] to-[#BE4C00] rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs text-[#BBCCD7]"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                    <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <span className="text-xs font-mono text-[#A6A6A6]">
                    {videoRef.current ? formatTime(videoRef.current.currentTime) : '0:00'} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A6A6A6] hidden md:inline">1080p 60fps</span>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Toggle Fullscreen"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default FeaturedShowreel;
