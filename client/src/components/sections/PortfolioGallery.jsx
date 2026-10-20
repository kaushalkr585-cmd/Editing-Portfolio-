import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Play, Clock, Eye, AlertCircle, Film, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../common/FadeIn';
import { ProjectModal } from './ProjectModal';
import { getOptimizedVideoUrl, getOptimizedThumbnailUrl, isTouchDevice, formatDuration } from '../../utils/videoUtils';
import { apiUrl } from '../../utils/api';

/**
 * Standardized High-Performance Portfolio Video Card
 * - Uniform 16:9 aspect ratio thumbnail across all cards regardless of native video ratio
 * - Equal height layout in every grid row with pinned bottom action bar
 * - Displays optimized Cloudinary thumbnail first with lazy loading (Zero upfront video download)
 * - On touch/mobile devices: keeps video unmounted to save 100% of mobile gallery bandwidth
 * - On desktop: loads a lightweight 720p muted preview only on intentional hover (debounced 150ms)
 * - Automatically pauses and releases decoder resources when scrolled out of viewport
 */
const PortfolioCard = ({ project, isHovered, onHoverStart, onHoverEnd, onClick }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // IntersectionObserver to track viewport visibility
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (!entry.isIntersecting && isHovered) {
          onHoverEnd();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isHovered, onHoverEnd]);

  // Video playback lifecycle management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered && isInView && !isTouch) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoReady(true))
          .catch(() => setIsVideoReady(false));
      }
    } else {
      video.pause();
      setIsVideoReady(false);
    }
  }, [isHovered, isInView, isTouch]);

  // Optimized URLs for mobile & desktop
  const optimizedThumbnail = getOptimizedThumbnailUrl(project.thumbnailUrl, { width: 800, quality: 'q_auto' });
  const optimizedVideoPreview = getOptimizedVideoUrl(project.videoUrl, { maxWidth: 720, quality: 'q_auto:eco' });

  return (
    <div
      ref={cardRef}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      className="group relative bg-[#141414] border border-white/[0.08] hover:border-[#B600A8]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#B600A8]/10 hover:-translate-y-1 cursor-pointer flex flex-col h-full w-full"
    >
      {/* 1. Standardized 16:9 Thumbnail / Video Preview Container */}
      <div className="relative w-full aspect-video bg-black overflow-hidden flex-shrink-0">
        {/* Saved Cloudinary Thumbnail - Always displayed first */}
        {project.thumbnailUrl ? (
          <img
            src={optimizedThumbnail}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isHovered && isVideoReady ? 'opacity-0' : 'opacity-100'
            }`}
          />
        ) : (
          <div className="absolute inset-0 bg-[#1A1A1A] flex items-center justify-center text-[#6E6E6E]">
            <Film className="w-10 h-10" />
          </div>
        )}

        {/* Lightweight Hover Preview Video - Mounted ONLY on desktop hover while in viewport */}
        {!isTouch && isHovered && isInView && project.videoUrl && (
          <video
            ref={videoRef}
            src={optimizedVideoPreview}
            preload="metadata"
            muted
            loop
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            onPlaying={() => setIsVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isVideoReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* 2 & 3. Badges: Category (Top-Left) & Native Aspect Ratio (Top-Right) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#BBCCD7] px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
            {project.category}
          </span>

          {project.aspectRatio && (
            <span className="text-[10px] font-mono font-medium bg-black/80 backdrop-blur-md text-[#A6A6A6] px-2 py-0.5 rounded border border-white/10 shadow-sm">
              {project.aspectRatio}
            </span>
          )}
        </div>

        {/* Center Play Button Overlay on Hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 gap-2">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
            Watch Master Edit
          </span>
        </div>

        {/* 4. Video Duration Badge (Bottom-Right) */}
        {project.duration && (
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
            <span className="text-[10px] font-mono bg-black/80 backdrop-blur-md text-white/90 px-2 py-0.5 rounded flex items-center gap-1 border border-white/10 shadow-sm">
              <Clock className="w-3 h-3 text-[#B600A8]" />
              {formatDuration(project.duration)}
            </span>
          </div>
        )}
      </div>

      {/* Structured Content Area with Equal Height Flex Distribution */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          {/* 5. Project Title - Consistent Top Alignment */}
          <h3 className="text-lg font-bold text-white group-hover:text-[#BBCCD7] transition-colors line-clamp-1 tracking-tight">
            {project.title}
          </h3>

          {/* 6. Description - Consistent 2-Line Height Container */}
          <div className="min-h-[2.5rem] mt-2">
            {project.description ? (
              <p className="text-xs text-[#A6A6A6] line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            ) : null}
          </div>

          {/* 7. Tags - Consistent Spacing Container */}
          <div className="min-h-[1.75rem] mt-3 flex items-center gap-1.5 overflow-hidden flex-wrap">
            {Array.isArray(project.tags) && project.tags.length > 0 ? (
              project.tags.slice(0, 3).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-[10px] text-[#8E8E8E] bg-white/[0.04] px-2 py-0.5 rounded border border-white/5"
                >
                  #{tag}
                </span>
              ))
            ) : null}
          </div>
        </div>

        {/* 8. Details Button - Pinned Directly to Bottom Edge of Every Card */}
        <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#6E6E6E] truncate max-w-[130px]">
            {project.client || 'Featured Cut'}
          </span>
          <div className="text-xs text-[#B600A8] group-hover:text-white font-medium flex items-center gap-1.5 transition-colors py-1 px-3 rounded-full bg-[#B600A8]/10 group-hover:bg-[#B600A8] border border-[#B600A8]/20 group-hover:border-transparent group-hover:shadow-glow-magenta">
            <span>Details</span>
            <Eye className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PortfolioGallery = ({ onSelectProjectForInquiry }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Work');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHoverId, setActiveHoverId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const hoverDebounceRef = useRef(null);

  // Fetch categories from backend API
  const fetchCategories = async () => {
    try {
      const res = await fetch(apiUrl('/api/categories'));
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
  };

  // Fetch projects from backend API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/projects'));
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProjects();
  }, []);

  // Filter projects based on dynamic category selection and search query
  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === 'All Work' ||
      project.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      project.categoryId === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(project.tags) && project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  const displayedProjects = filteredProjects.slice(0, visibleCount);

  // Single-video hover preview on desktop with 150ms debounce
  const handleHoverStart = useCallback((id) => {
    if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);
    hoverDebounceRef.current = setTimeout(() => {
      setActiveHoverId(id);
    }, 150);
  }, []);

  const handleHoverEnd = useCallback((id) => {
    if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);
    setActiveHoverId((current) => (current === id ? null : current));
  }, []);

  // Build category list for tabs: "All Work" + dynamic categories
  const categoryTabs = ['All Work', ...categories.map((c) => c.name)];

  return (
    <section id="work" className="py-24 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <FadeIn>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#B600A8] bg-[#B600A8]/10 px-3 py-1 rounded-full border border-[#B600A8]/20">
                Selected Works
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">
                Portfolio Gallery
              </h2>
              <p className="text-[#A6A6A6] text-sm sm:text-base mt-2 max-w-xl">
                Explore editing work across tailored creative genres. Tap any project to watch master edits with unmuted audio and high-definition details.
              </p>
            </FadeIn>
          </div>

          {/* Search Box */}
          {projects.length > 0 && (
            <FadeIn delay={0.2} className="w-full md:w-80">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, tool, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6E6E6E] focus:outline-none focus:border-[#B600A8] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#A6A6A6] hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </FadeIn>
          )}
        </div>

        {/* Dynamic Category Filter Tabs (Horizontally scrollable with zero page overflow) */}
        {categoryTabs.length > 1 && projects.length > 0 && (
          <FadeIn delay={0.15}>
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryTabs.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setVisibleCount(9);
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-glow-magenta'
                        : 'bg-[#141414] text-[#A6A6A6] hover:text-white hover:bg-[#1A1A1A] border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </FadeIn>
        )}

        {/* Content Display */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-pulse items-stretch">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-full min-h-[380px] bg-[#141414] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="w-full aspect-video bg-white/5" />
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-3.5 bg-white/5 rounded w-full" />
                    <div className="h-3.5 bg-white/5 rounded w-4/5" />
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex justify-between items-center">
                    <div className="h-3 bg-white/5 rounded w-20" />
                    <div className="h-6 bg-white/10 rounded-full w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <FadeIn>
            <div className="text-center py-20 sm:py-28 bg-[#141414]/60 rounded-3xl border border-white/[0.08] p-8 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#B600A8]/10 to-transparent blur-3xl pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#18011F] to-[#7621B0]/30 border border-[#7621B0]/40 flex items-center justify-center mx-auto mb-5 text-[#B600A8]">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                No projects uploaded yet.
              </h3>
              <p className="text-sm sm:text-base text-[#A6A6A6] mt-3 max-w-md mx-auto leading-relaxed">
                Portfolio projects are currently being curated. Check back soon for new video releases, or access the studio dashboard to publish your cuts.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  to="/admin"
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium border border-white/10 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#B600A8]" />
                  Upload In Admin Dashboard
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : displayedProjects.length === 0 ? (
          <div className="text-center py-20 bg-[#141414]/50 rounded-2xl border border-white/5 p-8 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-[#6E6E6E] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">
              No projects uploaded in this category yet.
            </h3>
            <p className="text-xs sm:text-sm text-[#A6A6A6] mt-1">
              Select another category or reset your filter to view all published work.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Work');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2 rounded-full bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Standardized Responsive Grid with Equal Height Stretched Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {displayedProjects.map((project, idx) => {
              const projectId = project._id || project.id;
              const isHovered = activeHoverId === projectId;
              return (
                <FadeIn key={projectId || idx} delay={idx * 0.05} className="h-full flex flex-col">
                  <PortfolioCard
                    project={project}
                    isHovered={isHovered}
                    onHoverStart={() => handleHoverStart(projectId)}
                    onHoverEnd={() => handleHoverEnd(projectId)}
                    onClick={() => setSelectedProject(project)}
                  />
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredProjects.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-8 py-3 rounded-full bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 text-white text-sm font-medium transition-all duration-200"
            >
              Load More Projects ({filteredProjects.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Detail Modal with Resource-Clean Video Player */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onInquire={(proj) => {
              if (onSelectProjectForInquiry) {
                onSelectProjectForInquiry(proj);
              } else {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        )}
      </div>
    </section>
  );
};

export default PortfolioGallery;
