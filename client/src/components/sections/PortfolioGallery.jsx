import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Filter, Sparkles, Clock, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';
import { ProjectModal } from './ProjectModal';

export const CATEGORIES = [
  'All Work',
  'SaaS & Product',
  'Real Estate',
  'AMVs',
  'Movie Edits',
  'Podcasts',
  'YouTube',
  'Reels & Shorts',
  'Gaming',
  'Commercials',
  'Motion Graphics & VFX',
  'Travel & Cinematic',
];

export const PortfolioGallery = ({ onSelectProjectForInquiry }) => {
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Work');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHoverId, setActiveHoverId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const videoRefs = useRef({});

  // Fetch projects from backend API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && data.data) {
        setProjects(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch projects, using empty or fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on category and search query
  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === 'All Work' ||
      project.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const displayedProjects = filteredProjects.slice(0, visibleCount);

  // Handle single-video hover preview
  const handleMouseEnter = (id) => {
    setActiveHoverId(id);
    const video = videoRefs.current[id];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const handleMouseLeave = (id) => {
    if (activeHoverId === id) {
      setActiveHoverId(null);
    }
    const video = videoRefs.current[id];
    if (video) {
      video.pause();
    }
  };

  // Compute container aspect ratio class
  const getCardAspectClass = (aspectRatio) => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16]';
      case '1:1':
        return 'aspect-square';
      case '4:5':
        return 'aspect-[4/5]';
      default:
        return 'aspect-video';
    }
  };

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
                Explore editing work across 12 distinct genres. Hover over any video for dynamic preview or tap to view comprehensive master details.
              </p>
            </FadeIn>
          </div>

          {/* Search Box */}
          <FadeIn delay={0.2} className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by genre, tool, keyword..."
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
        </div>

        {/* 12 Category Filter Tabs */}
        <FadeIn delay={0.15}>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(8);
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

        {/* Grid of Projects */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-[#141414] rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="text-center py-20 bg-[#141414]/50 rounded-2xl border border-white/5 p-8">
            <AlertCircle className="w-12 h-12 text-[#6E6E6E] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No projects found</h3>
            <p className="text-sm text-[#A6A6A6] mt-1">
              Try adjusting your search query or selecting a different category tab.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Work');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-white/10 text-white text-xs hover:bg-white/20"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {displayedProjects.map((project, idx) => {
              const isHovered = activeHoverId === project.id;
              return (
                <FadeIn key={project.id || idx} delay={idx * 0.05}>
                  <div
                    onMouseEnter={() => handleMouseEnter(project.id)}
                    onMouseLeave={() => handleMouseLeave(project.id)}
                    onClick={() => setSelectedProject(project)}
                    className="group relative bg-[#141414] border border-white/[0.08] hover:border-[#B600A8]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#B600A8]/10 cursor-pointer flex flex-col"
                  >
                    {/* Media Container with explicit aspect ratio */}
                    <div className={`relative w-full ${getCardAspectClass(project.aspectRatio)} bg-black overflow-hidden`}>
                      {/* Thumbnail Poster */}
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          isHovered ? 'opacity-0' : 'opacity-100'
                        }`}
                      />

                      {/* Video Preview Loop on Desktop Hover */}
                      <video
                        ref={(el) => (videoRefs.current[project.id] = el)}
                        src={project.videoUrl}
                        preload="none"
                        muted
                        loop
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/75 backdrop-blur-md text-[#BBCCD7] px-2.5 py-1 rounded-full border border-white/10">
                          {project.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {project.aspectRatio && (
                            <span className="text-[10px] font-mono font-medium bg-black/75 backdrop-blur-md text-[#A6A6A6] px-2 py-0.5 rounded border border-white/10">
                              {project.aspectRatio}
                            </span>
                          )}
                          {project.isDemo && (
                            <span className="text-[9px] font-medium bg-[#BE4C00]/80 text-white px-2 py-0.5 rounded">
                              Demo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Center Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Duration Badge */}
                      <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
                        <span className="text-[10px] font-mono bg-black/80 backdrop-blur-md text-white/90 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B600A8]" />
                          {project.duration || '0:30'}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#BBCCD7] transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[#A6A6A6] mt-2 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Tags & Action */}
                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {project.tags?.slice(0, 2).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] text-[#8E8E8E] bg-white/[0.04] px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-[#B600A8] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Details <Eye className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
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

        {/* Detail Modal */}
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
