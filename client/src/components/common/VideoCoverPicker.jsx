import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Image, Upload, Check, RefreshCw, AlertCircle, Film, Sparkles } from 'lucide-react';

/**
 * VideoCoverPicker: Instagram-style video cover selection component
 * Supports:
 * 1. Timeline scrubbing with immediate live canvas frame capture
 * 2. Visual filmstrip preview tiles across the video duration
 * 3. Custom image upload (JPG, PNG, WebP) with size/type validation
 * 4. High-resolution canvas extraction with fallback support
 */
export const VideoCoverPicker = ({
  videoSource,          // File, Blob URL, or remote video URL
  initialCoverUrl = '',  // Existing thumbnail URL (when editing)
  aspectRatio = '16:9',
  onCoverSelected,      // ({ blob, dataUrl, file, frameTime, type: 'frame' | 'custom' }) => void
}) => {
  const [activeTab, setActiveTab] = useState('frame'); // 'frame' | 'custom'
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentFrameTime, setCurrentFrameTime] = useState(0);
  const [capturedCoverUrl, setCapturedCoverUrl] = useState(initialCoverUrl);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [customFile, setCustomFile] = useState(null);
  const [filmstripFrames, setFilmstripFrames] = useState([]);
  const [isGeneratingFilmstrip, setIsGeneratingFilmstrip] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hiddenVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoObjectUrlRef = useRef(null);

  // Determine workable video URL from videoSource (File or string URL)
  const [videoSrcUrl, setVideoSrcUrl] = useState('');

  useEffect(() => {
    if (!videoSource) {
      setVideoSrcUrl('');
      return;
    }

    if (typeof videoSource === 'string') {
      setVideoSrcUrl(videoSource);
    } else if (videoSource instanceof File || videoSource instanceof Blob) {
      if (videoObjectUrlRef.current) {
        URL.revokeObjectURL(videoObjectUrlRef.current);
      }
      const url = URL.createObjectURL(videoSource);
      videoObjectUrlRef.current = url;
      setVideoSrcUrl(url);
    }

    return () => {
      if (videoObjectUrlRef.current) {
        URL.revokeObjectURL(videoObjectUrlRef.current);
        videoObjectUrlRef.current = null;
      }
    };
  }, [videoSource]);

  // Handle video metadata loaded: set duration and capture initial frame
  const handleLoadedMetadata = () => {
    const video = hiddenVideoRef.current;
    if (!video) return;

    const dur = video.duration || 0;
    setVideoDuration(dur);

    // Initial seek to 0.5s or 0 for cover frame
    const initialTime = dur > 1 ? 0.5 : 0;
    setCurrentFrameTime(initialTime);
    video.currentTime = initialTime;

    // Generate filmstrip samples
    generateFilmstrip(dur);
  };

  // Capture current video frame to canvas
  const captureFrameAtCurrentTime = useCallback(() => {
    const video = hiddenVideoRef.current;
    if (!video || !canvasRef.current || video.readyState < 2) return;

    try {
      setIsCapturing(true);
      setErrorMsg('');

      const canvas = canvasRef.current;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          setIsCapturing(false);
          if (blob) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            setCapturedBlob(blob);
            setCapturedCoverUrl(dataUrl);

            if (onCoverSelected) {
              onCoverSelected({
                blob,
                dataUrl,
                file: null,
                frameTime: video.currentTime,
                type: 'frame',
              });
            }
          }
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      setIsCapturing(false);
      console.warn('[VideoCoverPicker] Canvas capture error:', err.message);
      // If canvas tainted on cross-origin remote video, warn user
      setErrorMsg('Direct frame capture restricted on this media source. You can upload a custom cover image below.');
    }
  }, [onCoverSelected]);

  // When hidden video finishes seeking to slider time, capture the frame
  const handleSeeked = () => {
    captureFrameAtCurrentTime();
  };

  // Slider change handler
  const handleSliderChange = (e) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentFrameTime(targetTime);
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.currentTime = targetTime;
    }
  };

  // Generate 6 sample frames along video timeline for Instagram-style filmstrip
  const generateFilmstrip = async (dur) => {
    if (!dur || dur <= 0) return;
    setIsGeneratingFilmstrip(true);

    const count = 6;
    const intervals = [];
    for (let i = 0; i < count; i++) {
      intervals.push((dur / (count + 1)) * (i + 1));
    }

    try {
      // Create temporary offscreen video to scrub without interrupting main selector
      const offVideo = document.createElement('video');
      offVideo.crossOrigin = 'anonymous';
      offVideo.muted = true;
      offVideo.playsInline = true;
      offVideo.preload = 'auto';
      offVideo.src = videoSrcUrl;

      await new Promise((resolve) => {
        offVideo.onloadeddata = resolve;
        offVideo.onerror = resolve;
        setTimeout(resolve, 3000);
      });

      const offCanvas = document.createElement('canvas');
      offCanvas.width = 160;
      offCanvas.height = 90;
      const offCtx = offCanvas.getContext('2d');

      const frames = [];
      for (const t of intervals) {
        offVideo.currentTime = t;
        await new Promise((resolve) => {
          offVideo.onseeked = resolve;
          setTimeout(resolve, 600);
        });

        try {
          offCtx.drawImage(offVideo, 0, 0, 160, 90);
          frames.push({
            time: t,
            url: offCanvas.toDataURL('image/jpeg', 0.6),
          });
        } catch {
          // ignore CORS errors during thumbnail strip generation
        }
      }

      setFilmstripFrames(frames);
    } catch (err) {
      console.warn('Filmstrip generation failed:', err);
    } finally {
      setIsGeneratingFilmstrip(false);
    }
  };

  // Jump to specific filmstrip thumbnail
  const handleSelectFilmstripFrame = (t) => {
    setCurrentFrameTime(t);
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.currentTime = t;
    }
  };

  // Handle custom image file upload
  const handleCustomFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    setErrorMsg('');
    setCustomFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setCapturedCoverUrl(dataUrl);
      setCapturedBlob(file);

      if (onCoverSelected) {
        onCoverSelected({
          blob: file,
          dataUrl,
          file,
          frameTime: null,
          type: 'custom',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const formatTimecode = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}`;
  };

  const getAspectClass = (ratio) => {
    switch (ratio) {
      case '9:16':
        return 'aspect-[9/16] max-h-72';
      case '1:1':
        return 'aspect-square max-h-64';
      case '4:5':
        return 'aspect-[4/5] max-h-72';
      default:
        return 'aspect-video max-h-60';
    }
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Hidden processing video & canvas */}
      <video
        ref={hiddenVideoRef}
        src={videoSrcUrl}
        crossOrigin="anonymous"
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#B600A8]/20 border border-[#B600A8]/30 flex items-center justify-center text-[#B600A8]">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              Select Video Cover Frame
              <span className="text-[10px] font-mono text-[#BBCCD7] bg-white/5 px-2 py-0.5 rounded">
                Instagram-Style
              </span>
            </h4>
            <p className="text-[11px] text-[#A6A6A6]">
              Choose the exact moment from your video that visitors will see as the poster cover.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-lg border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('frame')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'frame'
                ? 'bg-[#B600A8] text-white font-medium shadow-sm'
                : 'text-[#A6A6A6] hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Pick Frame
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-[#B600A8] text-white font-medium shadow-sm'
                : 'text-[#A6A6A6] hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Custom
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Preview Box & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Cover Preview Card */}
        <div className="relative mx-auto w-full flex flex-col items-center justify-center bg-black/60 rounded-xl border border-white/10 p-2 overflow-hidden">
          <div className={`relative w-full ${getAspectClass(aspectRatio)} rounded-lg overflow-hidden bg-black flex items-center justify-center`}>
            {capturedCoverUrl ? (
              <img
                src={capturedCoverUrl}
                alt="Selected Cover Frame"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#6E6E6E] p-6 text-center">
                <Image className="w-10 h-10 mb-2 opacity-60" />
                <span className="text-xs">No cover selected</span>
              </div>
            )}

            {/* Overlaid Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
              <span className="text-[10px] font-semibold uppercase bg-emerald-500/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Check className="w-3 h-3" /> Cover Selected
              </span>
              {activeTab === 'frame' && (
                <span className="text-[10px] font-mono bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded">
                  {formatTimecode(currentFrameTime)}
                </span>
              )}
            </div>

            {isCapturing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-20">
                <RefreshCw className="w-6 h-6 text-[#B600A8] animate-spin" />
              </div>
            )}
          </div>

          <span className="text-[11px] text-[#A6A6A6] mt-2 font-mono">
            Aspect: {aspectRatio} • High-Res JPEG Export
          </span>
        </div>

        {/* Tab 1: Video Frame Scrubber & Filmstrip */}
        {activeTab === 'frame' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#BBCCD7] font-medium flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#B600A8]" />
                  Timeline Scrubber:
                </span>
                <span className="font-mono text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {formatTimecode(currentFrameTime)} / {formatTimecode(videoDuration)}
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="0"
                max={videoDuration || 10}
                step="0.05"
                value={currentFrameTime}
                onChange={handleSliderChange}
                disabled={!videoDuration}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#B600A8] focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-[#6E6E6E] mt-1 font-mono">
                <span>00:00.00 (Start)</span>
                <span>Drag to seek exact frame</span>
                <span>{formatTimecode(videoDuration)} (End)</span>
              </div>
            </div>

            {/* Instagram-Style Filmstrip Thumbnails */}
            <div>
              <span className="block text-[11px] text-[#A6A6A6] mb-2 font-medium">
                Snapshot Quick Picks:
              </span>
              {filmstripFrames.length > 0 ? (
                <div className="grid grid-cols-6 gap-1.5 p-1 bg-[#1A1A1A] rounded-xl border border-white/5">
                  {filmstripFrames.map((frame, idx) => {
                    const isSelected = Math.abs(currentFrameTime - frame.time) < 0.8;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectFilmstripFrame(frame.time)}
                        className={`relative aspect-video rounded-md overflow-hidden border transition-all duration-150 group ${
                          isSelected
                            ? 'border-[#B600A8] ring-2 ring-[#B600A8]/50 scale-105 z-10'
                            : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-102'
                        }`}
                      >
                        <img
                          src={frame.url}
                          alt={`Frame ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-white text-center py-0.5">
                          {Math.round(frame.time)}s
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : isGeneratingFilmstrip ? (
                <div className="py-4 text-center text-xs text-[#A6A6A6] flex items-center justify-center gap-2 bg-[#1A1A1A] rounded-xl">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B600A8]" />
                  Generating frame filmstrip...
                </div>
              ) : (
                <p className="text-[11px] text-[#6E6E6E] italic">
                  Move the scrubber above to choose any frame from your video.
                </p>
              )}
            </div>

            {/* Quick Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={captureFrameAtCurrentTime}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-[#B600A8]" />
                Re-capture Current Frame
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Image Upload */}
        {activeTab === 'custom' && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-[#BBCCD7]">
              Upload Custom Thumbnail Image
            </label>
            <div className="border-2 border-dashed border-white/15 hover:border-[#B600A8]/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#1A1A1A]/40 group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleCustomFileSelect(e.target.files[0])}
                className="hidden"
                id="customCoverInput"
              />
              <label htmlFor="customCoverInput" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-[#A6A6A6] group-hover:text-[#B600A8] mx-auto mb-2 transition-colors" />
                <span className="text-xs text-white font-medium block">
                  Click to select custom cover image
                </span>
                <span className="text-[11px] text-[#6E6E6E] block mt-1">
                  Supports JPEG, PNG, WebP (Max 10MB)
                </span>
              </label>
            </div>

            {customFile && (
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Image className="w-4 h-4 text-[#B600A8] shrink-0" />
                  <span className="text-white truncate font-medium">{customFile.name}</span>
                </div>
                <span className="text-[10px] text-[#A6A6A6] font-mono shrink-0 ml-2">
                  {(customFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCoverPicker;
