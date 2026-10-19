import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Clock, Eye, AlertCircle, Film, Sparkles, Plus, ArrowUpRight, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../common/FadeIn';
import { ProjectModal } from './ProjectModal';

export const PortfolioGallery = ({ onSelectProjectForInquiry }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Work');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHoverId, setActiveHoverId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const videoRefs = useRef({});

  // Fetch categories from backend API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
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
      const res = await fetch('/api/projects');
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

  // Single-video hover preview on desktop
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
                Explore editing work across tailored creative genres. Hover over any video for dynamic preview or tap to view comprehensive master details.
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

        {/* Dynamic Category Filter Tabs */}
        {categoryTabs.length > 1 && projects.length > 0 && (
          <FadeIn delay={0.15}>
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10 no-scrollbar">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-[#141414] rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Clean Professional Empty State when no videos have been uploaded */
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

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#contact"
                  className="btn-contact-gradient px-7 py-3 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg"
                >
                  Start A Project Inquiry
                  <ArrowUpRight className="w-4 h-4" />
                </a>

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
          /* Empty state for filtered category/search */
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
          /* Grid of Real Projects */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {displayedProjects.map((project, idx) => {
              const isHovered = activeHoverId === project.id || activeHoverId === project._id;
              const projectId = project._id || project.id;
              return (
                <FadeIn key={projectId || idx} delay={idx * 0.05}>
                  <div
                    onMouseEnter={() => handleMouseEnter(projectId)}
                    onMouseLeave={() => handleMouseLeave(projectId)}
                    onClick={() => setSelectedProject(project)}
                    className="group relative bg-[#141414] border border-white/[0.08] hover:border-[#B600A8]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#B600A8]/10 cursor-pointer flex flex-col"
                  >
                    {/* Media Container with explicit aspect ratio */}
                    <div className={`relative w-full ${getCardAspectClass(project.aspectRatio)} bg-black overflow-hidden`}>
                      {/* Thumbnail Poster */}
                      {project.thumbnailUrl ? (
                        <img
                          src={project.thumbnailUrl}
                          alt={project.title}
                          loading="lazy"
                          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            isHovered ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1A1A1A] flex items-center justify-center text-[#6E6E6E]">
                          <Film className="w-10 h-10" />
                        </div>
                      )}

                      {/* Video Preview Loop on Desktop Hover */}
                      {project.videoUrl && (
                        <video
                          ref={(el) => (videoRefs.current[projectId] = el)}
                          src={project.videoUrl}
                          preload="none"
                          muted
                          loop
                          playsInline
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/75 backdrop-blur-md text-[#BBCCD7] px-2.5 py-1 rounded-full border border-white/10">
                          {project.category}
                        </span>

                        {project.aspectRatio && (
                          <span className="text-[10px] font-mono font-medium bg-black/75 backdrop-blur-md text-[#A6A6A6] px-2 py-0.5 rounded border border-white/10">
                            {project.aspectRatio}
                          </span>
                        )}
                      </div>

                      {/* Center Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Duration Badge */}
                      {project.duration && (
                        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
                          <span className="text-[10px] font-mono bg-black/80 backdrop-blur-md text-white/90 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#B600A8]" />
                            {project.duration}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#BBCCD7] transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-[#A6A6A6] mt-2 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {/* Tags & Action */}
                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {Array.isArray(project.tags) && project.tags.slice(0, 2).map((tag, tIdx) => (
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

        {/* Contact Call to Action */}
        <FadeIn delay={0.2}>
          <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#18011F] via-[#141414] to-[#18011F] border border-white/10 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-1/4 w-72 h-36 bg-[#B600A8]/10 blur-[80px] pointer-events-none rounded-full" />
            <h3 className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-tight mb-3">
              Have a project in mind? Let's create something cinematic.
            </h3>
            <p className="text-[#A6A6A6] text-sm sm:text-base max-w-xl mx-auto mb-8 font-light">
              Ready to elevate your content with high-retention pacing, DaVinci color grading, and dynamic storytelling? Let's connect directly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://www.instagram.com/mystry.editz/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#B600A8] to-[#7621B0] hover:opacity-95 text-white font-semibold text-sm transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                Contact Me on Instagram
              </a>
              <a
                href="mailto:kaushalkr.585@gmail.com"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              >
                <Mail className="w-4 h-4 text-[#BBCCD7]" />
                Email Me
              </a>
            </div>
          </div>
        </FadeIn>

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
