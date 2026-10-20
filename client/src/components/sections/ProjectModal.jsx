import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Clock,
  Tag,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Loader2,
  Sparkles,
  Film
} from 'lucide-react';
import {
  getDeviceOptimizedVideoUrl,
  getOptimizedThumbnailUrl,
  getFallbackVideoUrl
} from '../../utils/videoUtils';

export const ProjectModal = ({ project, onClose, onInquire }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressTrackRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const waitingTimerRef = useRef(null);
  const hasFallbackBeenAttemptedRef = useRef(false);

  // Sound & Playback State - UNMUTED BY DEFAULT for intentional user click
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('portfolio_video_volume');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Unable to stream video from media delivery service.');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Video delivery URLs (stably memoized to prevent mid-stream reloads or resolution flips)
  const primaryVideoSrc = useMemo(() => {
    return getDeviceOptimizedVideoUrl(project?.videoUrl, false);
  }, [project?.videoUrl, project?._id, project?.id]);

  const fallbackVideoSrc = useMemo(() => {
    return getFallbackVideoUrl(project?.videoUrl);
  }, [project?.videoUrl]);

  const optimizedPoster = useMemo(() => {
    return getOptimizedThumbnailUrl(project?.thumbnailUrl, { width: 1200, quality: 'q_auto' });
  }, [project?.thumbnailUrl]);

  const [activeVideoSrc, setActiveVideoSrc] = useState(primaryVideoSrc);

  // Reset state when project changes
  useEffect(() => {
    setActiveVideoSrc(primaryVideoSrc);
    hasFallbackBeenAttemptedRef.current = false;
    setHasError(false);
    setIsLoading(true);
    setHasStarted(false);
    setIsPlaying(false);
    setAutoplayBlocked(false);
  }, [primaryVideoSrc]);

  // Clean resource release helper
  const releaseVideoResources = useCallback(() => {
    if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        video.removeAttribute('src'); // Stop ongoing buffer stream immediately
        video.load(); // Flush decoder buffer and hardware acceleration state
      } catch (err) {
        // Safe catch for detached DOM nodes
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    releaseVideoResources();
    onClose();
  }, [releaseVideoResources, onClose]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      releaseVideoResources();
    };
  }, [releaseVideoResources]);

  // Sync volume to video element and persist
  const handleVolumeChange = (newVol) => {
    const vol = Math.max(0, Math.min(1, newVol));
    setVolume(vol);
    localStorage.setItem('portfolio_video_volume', vol.toString());
    if (videoRef.current) {
      videoRef.current.volume = vol;
      if (vol === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (isMuted || volume === 0) {
      const restoreVol = volume > 0 ? volume : 0.8;
      videoRef.current.muted = false;
      videoRef.current.volume = restoreVol;
      setIsMuted(false);
      setVolume(restoreVol);
      setAutoplayBlocked(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasStarted(true);
      if (autoplayBlocked) {
        videoRef.current.muted = false;
        setIsMuted(false);
        setAutoplayBlocked(false);
      }
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('[ProjectModal] Playback toggle error:', err);
          }
          setIsLoading(false);
        });
    }
  };

  // Attempt unmuted play on mount (triggered by intentional user click)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = false;
    setIsMuted(false);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
          setIsLoading(false);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          // If browser policy strictly blocks unmuted autoplay without second interaction
          if (err.name === 'NotAllowedError') {
            console.info('[ProjectModal] Browser policy blocked unmuted autoplay; starting muted with unmute banner.');
            video.muted = true;
            setIsMuted(true);
            setAutoplayBlocked(true);
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                setHasStarted(true);
                setIsLoading(false);
              })
              .catch(() => setIsLoading(false));
          } else if (err.name !== 'AbortError') {
            console.warn('[ProjectModal] Video load/play error:', err);
            setIsLoading(false);
          }
        });
    }

    // Keyboard controls
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Fullscreen change listener across standard, WebKit (iOS/iPad/Safari), and vendor variants
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(fs);
    };

    const video = videoRef.current;
    const handleWebkitBegin = () => setIsFullscreen(true);
    const handleWebkitEnd = () => setIsFullscreen(false);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    if (video) {
      video.addEventListener('webkitbeginfullscreen', handleWebkitBegin);
      video.addEventListener('webkitendfullscreen', handleWebkitEnd);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', handleWebkitBegin);
        video.removeEventListener('webkitendfullscreen', handleWebkitEnd);
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(cur);
      setProgress((cur / dur) * 100);
      if (!hasStarted && cur > 0) {
        setHasStarted(true);
      }
    }
  };

  const handleWaiting = () => {
    if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
    waitingTimerRef.current = setTimeout(() => {
      setIsLoading(true);
    }, 300);
  };

  const handlePlaying = () => {
    if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
    setIsLoading(false);
    setIsPlaying(true);
    setHasStarted(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
    setIsLoading(false);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  // Comprehensive, intelligent error recovery and diagnostics
  const handleVideoError = () => {
    if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
    const mediaErr = videoRef.current?.error;

    // Code 1 = MEDIA_ERR_ABORTED: harmless abort when user pauses or switches source
    if (mediaErr && mediaErr.code === 1) {
      console.debug('[ProjectModal] Stream fetch aborted by user agent, ignoring.');
      return;
    }

    const errorDetails = {
      code: mediaErr?.code,
      message: mediaErr?.message,
      currentSrc: videoRef.current?.currentSrc,
      readyState: videoRef.current?.readyState,
      networkState: videoRef.current?.networkState,
    };
    console.warn('[ProjectModal] Video playback error caught:', errorDetails);

    // If fallback is available and hasn't been tried yet, try the clean fallback stream
    if (!hasFallbackBeenAttemptedRef.current && fallbackVideoSrc && fallbackVideoSrc !== activeVideoSrc) {
      console.info('[ProjectModal] Attempting automatic fallback to universal direct stream...');
      hasFallbackBeenAttemptedRef.current = true;
      setActiveVideoSrc(fallbackVideoSrc);
      if (videoRef.current) {
        videoRef.current.src = fallbackVideoSrc;
        videoRef.current.load();
        videoRef.current.play().catch((playErr) => {
          if (playErr.name !== 'AbortError') {
            console.warn('[ProjectModal] Fallback play error:', playErr);
          }
        });
      }
      return;
    }

    setIsLoading(false);
    setHasError(true);

    if (mediaErr?.code === 2) {
      setErrorMessage('Network connection lost while streaming video. Please check your internet connection.');
    } else if (mediaErr?.code === 3) {
      setErrorMessage('Video decoding error on this device. Tap retry to reload the compatibility stream.');
    } else if (mediaErr?.code === 4) {
      setErrorMessage('Video format is not supported or temporarily unavailable.');
    } else {
      setErrorMessage('Unable to stream video from media delivery service.');
    }
  };

  const handleSeek = (e) => {
    if (e) e.stopPropagation();
    const track = progressTrackRef.current;
    if (!track || !videoRef.current || !duration) return;

    const rect = track.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
    setProgress(pos * 100);
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    const container = containerRef.current;
    const video = videoRef.current;

    const isCurrentlyFullscreen = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      isFullscreen
    );

    if (!isCurrentlyFullscreen) {
      // 1. Try standard container fullscreen first (Desktop / Android Chrome)
      if (container && container.requestFullscreen) {
        container
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => {
            // Fallback to video element (mobile Safari / iOS)
            if (video && video.webkitEnterFullscreen) {
              video.webkitEnterFullscreen();
            } else if (video && video.requestFullscreen) {
              video.requestFullscreen().catch(() => {});
            }
          });
      } else if (container && container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (video && video.webkitEnterFullscreen) {
        // iOS Safari on iPhone strictly requires fullscreen directly on HTMLVideoElement
        video.webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else if (video && video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getAspectClass = (ratio) => {
    switch (ratio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[75vh] mx-auto';
      case '1:1':
        return 'aspect-square max-h-[70vh] mx-auto';
      case '4:5':
        return 'aspect-[4/5] max-h-[75vh] mx-auto';
      default:
        return 'aspect-video w-full max-h-[72vh]';
    }
  };

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={handleClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-[#121212] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Top Right Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/75 hover:bg-black text-white transition-all border border-white/10 shadow-lg hover:scale-105"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ==================================================== */}
        {/* CINEMATIC VIDEO PLAYER WITH UNMUTED AUDIO CONTROLS */}
        {/* ==================================================== */}
        <div
          className="relative bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none group"
          onClick={togglePlay}
        >
          {/* Aspect-constrained video wrapper */}
          <div className={`${isFullscreen ? 'w-full h-full max-h-screen' : getAspectClass(project.aspectRatio)} relative flex items-center justify-center`}>
            {/* Poster fallback image prior to first frame playback */}
            {!hasStarted && optimizedPoster && (
              <img
                src={optimizedPoster}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
              />
            )}

            <video
              ref={videoRef}
              src={activeVideoSrc}
              poster={optimizedPoster}
              preload="metadata"
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              loop
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={handleWaiting}
              onPlaying={handlePlaying}
              onCanPlay={handleCanPlay}
              onStalled={handleWaiting}
              onError={handleVideoError}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Autoplay Unmute Prompt Banner (if browser blocked unmuted start) */}
          {autoplayBlocked && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute top-4 left-4 z-30 px-3.5 py-1.5 rounded-full bg-[#B600A8]/90 hover:bg-[#B600A8] text-white text-xs font-semibold flex items-center gap-2 shadow-glow-magenta backdrop-blur-md animate-pulse cursor-pointer border border-white/20"
            >
              <VolumeX className="w-4 h-4" />
              <span>Tap to Enable Original Audio 🔊</span>
            </div>
          )}

          {/* Center Play/Pause Ripple Overlay */}
          {!isPlaying && !isLoading && !hasError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
              <div className="w-20 h-20 rounded-full btn-contact-gradient flex items-center justify-center shadow-2xl scale-100 hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Buffering Spinner */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none">
              <Loader2 className="w-10 h-10 text-[#B600A8] animate-spin" />
            </div>
          )}

          {/* Error Banner */}
          {hasError && (
            <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
              <p className="text-white font-medium">Video playback error</p>
              <p className="text-xs text-[#A6A6A6] mt-1 max-w-sm">{errorMessage}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHasError(false);
                  setIsLoading(true);
                  hasFallbackBeenAttemptedRef.current = false;
                  setActiveVideoSrc(primaryVideoSrc);
                  if (videoRef.current) {
                    videoRef.current.src = primaryVideoSrc;
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs hover:bg-white/20 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry Playback
              </button>
            </div>
          )}

          {/* FULL PLAYER CONTROLS OVERLAY */}
          <div
            className={`absolute bottom-0 inset-x-0 z-30 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrubber Progress Bar */}
            <div
              ref={progressTrackRef}
              onClick={handleSeek}
              className="w-full h-1.5 sm:h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer relative transition-all duration-150 mb-3"
            >
              <div
                className="h-full bg-gradient-to-r from-[#B600A8] via-[#891FB6] to-[#BE4C00] rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between text-white">
              {/* Left: Play/Pause, Volume Slider, Time */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>

                {/* Audio Volume Controls (Visible Slider + Dynamic Icon) */}
                <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-full border border-white/5">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-white hover:text-[#B600A8] transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-14 sm:w-20 h-1.5 accent-[#B600A8] bg-white/20 rounded-lg cursor-pointer"
                    aria-label="Volume slider"
                  />

                  <span className="text-[10px] font-mono text-[#BBCCD7] min-w-[28px] hidden sm:inline">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>

                {/* Time Display */}
                <span className="text-xs font-mono text-[#A6A6A6]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right: Aspect Ratio & Fullscreen */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] font-mono text-[#BBCCD7] bg-white/10 px-2 py-0.5 rounded border border-white/5">
                  {project.aspectRatio || '16:9'}
                </span>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 transition-colors"
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* METADATA & DETAILS SECTION */}
        {/* ==================================================== */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs uppercase font-semibold text-[#B600A8] bg-[#B600A8]/10 px-2.5 py-0.5 rounded-full border border-[#B600A8]/20">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="text-[10px] font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Featured Showreel
                  </span>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {project.title}
              </h3>
            </div>

            <button
              onClick={() => {
                handleClose();
                onInquire(project);
              }}
              className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform"
            >
              Inquire Similar Edit
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {project.description && (
            <p className="text-sm sm:text-base text-[#A6A6A6] leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/[0.08] text-xs">
            <div>
              <span className="text-[#6E6E6E] block mb-1">Client / Project</span>
              <span className="text-white font-medium">{project.client || 'Client Project'}</span>
            </div>
            <div>
              <span className="text-[#6E6E6E] block mb-1">Duration</span>
              <span className="text-white font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#BBCCD7]" /> {project.duration || formatTime(duration)}
              </span>
            </div>
            <div>
              <span className="text-[#6E6E6E] block mb-1">Aspect Ratio</span>
              <span className="text-white font-medium">{project.aspectRatio || '16:9'}</span>
            </div>
            <div>
              <span className="text-[#6E6E6E] block mb-1">Audio Master</span>
              <span className="text-emerald-400 font-medium">Stereo 48kHz (Original)</span>
            </div>
          </div>

          {/* Tags */}
          {Array.isArray(project.tags) && project.tags.length > 0 && (
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
