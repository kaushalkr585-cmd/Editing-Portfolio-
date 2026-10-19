import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, RotateCcw, AlertCircle, Loader2, Film, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../common/FadeIn';
import { getDeviceOptimizedVideoUrl, getOptimizedThumbnailUrl } from '../../utils/videoUtils';
import { apiUrl } from '../../utils/api';

export const FeaturedShowreel = ({
  videoUrl = '',
  posterUrl = '',
  title = "Kaushal Kumar — Director's Cut",
}) => {
  const [activeVideoUrl, setActiveVideoUrl] = useState(videoUrl);
  const [activePosterUrl, setActivePosterUrl] = useState(posterUrl);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin session on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    fetch(apiUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const waitingTimeoutRef = useRef(null);

  // If no videoUrl prop provided, check settings and featured projects from backend
  useEffect(() => {
    if (!videoUrl) {
      // 1. Check site settings for showreelUrl
      fetch(apiUrl('/api/settings'))
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.showreelUrl) {
            setActiveVideoUrl(data.data.showreelUrl);
            if (data.data.showreelPoster) setActivePosterUrl(data.data.showreelPoster);
          } else {
            // 2. Otherwise check for any featured project
            fetch(apiUrl('/api/projects?featured=true'))
              .then((r) => r.json())
              .then((pData) => {
                if (pData.success && pData.data && pData.data.length > 0) {
                  const feat = pData.data[0];
                  setActiveVideoUrl(feat.videoUrl);
                  setActivePosterUrl(feat.thumbnailUrl || '');
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    } else {
      setActiveVideoUrl(videoUrl);
      setActivePosterUrl(posterUrl);
    }
  }, [videoUrl, posterUrl]);

  // Viewport IntersectionObserver: auto-pause when scrolled out of view to save mobile bandwidth
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && isPlaying && videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasStarted(true);
      setIsLoading(true);
      // Ensure intentional play enables sound
      if (videoRef.current.muted || isMuted) {
        videoRef.current.muted = false;
        videoRef.current.volume = volume > 0 ? volume : 1;
        setIsMuted(false);
      }
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name === 'NotAllowedError') {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(() => setIsLoading(false));
          } else {
            console.warn('Playback error:', err);
            setIsLoading(false);
            setHasError(true);
          }
        });
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
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVol) => {
    const vol = Math.max(0, Math.min(1, newVol));
    setVolume(vol);
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

  // If no video is uploaded/configured and the visitor is NOT logged in as admin:
  // Viewers CANNOT see this section!
  if (!activeVideoUrl && !isAdmin) {
    return null;
  }

  return (
    <section id="showreel" className="py-20 relative bg-[#0C0C0C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
            Director's Showcase
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-3">
            Featured Showreel
          </h2>
          <p className="text-[#A6A6A6] text-sm sm:text-base max-w-2xl mx-auto mt-2">
            A montage of high-energy commercial edits, 3D motion graphics, anime cuts, and cinematic color grades.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          {activeVideoUrl ? (
            /* Active Video Player when a video is configured/uploaded */
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onClick={togglePlay}
              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#141414] border border-white/10 shadow-2xl group cursor-pointer"
            >
              {!hasStarted && activePosterUrl && (
                <img
                  src={getOptimizedThumbnailUrl(activePosterUrl, { width: 1200 })}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              <div
                className={`absolute inset-0 bg-black/40 z-20 transition-opacity duration-300 ${
                  isPlaying && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              />

              <video
                ref={videoRef}
                src={getDeviceOptimizedVideoUrl(activeVideoUrl)}
                poster={getOptimizedThumbnailUrl(activePosterUrl, { width: 1200 })}
                preload="metadata"
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => {
                  if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
                  waitingTimeoutRef.current = setTimeout(() => setIsLoading(true), 400);
                }}
                onPlaying={() => {
                  if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
                  setIsLoading(false);
                }}
                onError={() => {
                  if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
                  setIsLoading(false);
                  setHasError(true);
                }}
                className="w-full h-full object-cover"
              />

              {hasError && (
                <div className="absolute inset-0 bg-black/85 z-30 flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                  <p className="text-white font-medium">Video preview temporarily unavailable</p>
                  <p className="text-xs text-[#A6A6A6] mt-1">Check video source or connection</p>
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

              <div
                className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
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

                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/5">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-white hover:text-[#B600A8] transition-colors"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : volume < 0.5 ? (
                          <Volume1 className="w-4 h-4 text-white" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white" />
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
                    </div>

                    <span className="text-xs font-mono text-[#A6A6A6]">
                      {videoRef.current ? formatTime(videoRef.current.currentTime) : '0:00'} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
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
          ) : (
            /* Clean Professional Empty State when no showreel video is configured (Admin Only) */
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#141414] to-[#0E0E0E] border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center p-8 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Admin Setup Mode • Hidden from Public Viewers
              </span>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#18011F] to-[#7621B0]/30 border border-[#7621B0]/40 flex items-center justify-center text-[#B600A8] mb-4">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Featured Showreel Ready For Upload
              </h3>
              <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2 max-w-md">
                Upload your latest showreel or mark any project as "Featured" in the Admin Dashboard to activate this player.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  to="/admin"
                  className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Set Showreel in Admin
                </Link>
                <a
                  href="#work"
                  className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                >
                  View Portfolio Gallery
                </a>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
};

export default FeaturedShowreel;
