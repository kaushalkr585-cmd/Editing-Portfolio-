// No hardcoded or dummy projects. Real projects will be uploaded and published via the Admin Dashboard.
export const seedProjects = [];

export const initialCategories = [
  { id: 'cat-saas', name: 'SaaS & Product', slug: 'saas-product', description: 'Product demos, UI animations, and software launch videos', order: 1 },
  { id: 'cat-real-estate', name: 'Real Estate', slug: 'real-estate', description: 'Luxury walkthroughs, architectural films, and drone cuts', order: 2 },
  { id: 'cat-amv', name: 'AMVs', slug: 'amvs', description: 'Anime music videos, velocity time-remapping, and beat sync', order: 3 },
  { id: 'cat-movie-edits', name: 'Movie Edits', slug: 'movie-edits', description: 'Cinematic trailers, scene retrospectives, and narrative pacing', order: 4 },
  { id: 'cat-podcasts', name: 'Podcast Edits', slug: 'podcast-edits', description: 'Multi-cam studio switching, audio leveling, and short clips', order: 5 },
  { id: 'cat-youtube', name: 'YouTube', slug: 'youtube', description: 'High-retention storytelling, visual chapter pacing, and hooks', order: 6 },
  { id: 'cat-reels-shorts', name: 'Reels & Shorts', slug: 'reels-shorts', description: 'Vertical 9:16 viral short-form edits for social platforms', order: 7 },
  { id: 'cat-gaming', name: 'Gaming', slug: 'gaming', description: 'Esports highlight reels, beat matching, and 3D camera tracking', order: 8 },
  { id: 'cat-commercials', name: 'Commercial Ads', slug: 'commercial-ads', description: 'Direct response brand commercials and video ad creatives', order: 9 },
  { id: 'cat-motion-vfx', name: 'Motion Graphics & VFX', slug: 'motion-graphics-vfx', description: 'Custom 2D/3D titles, HUD visualizers, and visual effects', order: 10 },
  { id: 'cat-travel', name: 'Travel & Cinematic', slug: 'travel-cinematic', description: 'Atmospheric travel films and film emulation grading', order: 11 },
  { id: 'cat-other', name: 'Other Projects', slug: 'other-projects', description: 'Custom video editing and post-production assignments', order: 12 },
];


export const seedServices = [
  {
    id: "srv-saas",
    title: "SaaS & Product Videos",
    category: "Commercial & Tech",
    shortDescription: "Turn complex software features into crisp, visually stunning product overviews and investor demos.",
    fullDescription: "Specialized video editing for software companies, web3 apps, and hardware startups. I transform Figma screens, screen recordings, and 3D renders into high-converting product videos, changelog updates, and investor pitch decks.",
    deliverables: [
      "Dynamic UI mockups and 3D device framing",
      "Kinetic typography for feature callouts",
      "Custom cursor animations and zoom smoothing",
      "Multiple format exports (16:9 web, 9:16 ads)",
      "High-energy licensed electronic or ambient score"
    ],
    keySkills: ["After Effects", "Premiere Pro", "UI Animation", "Sound Design"],
    turnaround: "3 - 5 business days",
    iconName: "MonitorPlay",
    order: 1
  },
  {
    id: "srv-real-estate",
    title: "Real Estate & Architecture",
    category: "Luxury & Commercial",
    shortDescription: "Cinematic drone and walkthrough edits that present luxury properties at their absolute finest.",
    fullDescription: "Elevate your property listings with high-end architectural editing. Combining smooth camera stabilization, sky replacements, interior window exposure blending, and atmospheric grading.",
    deliverables: [
      "FPV and standard drone speed-ramping",
      "Interior room-by-room stabilized flow",
      "Agent intro and branded title cards",
      "Location callouts and amenity overlays",
      "Vertical 9:16 reels for Instagram and TikTok"
    ],
    keySkills: ["Adobe Premiere Pro", "Cinematic Color Grading", "Speed Ramping", "Sky Replacement"],
    turnaround: "2 - 4 business days",
    iconName: "Home",
    order: 2
  },
  {
    id: "srv-amv",
    title: "Anime Music Videos (AMVs)",
    category: "Creative & Entertainment",
    shortDescription: "Frame-accurate beat matching, dynamic velocity graphs, and custom VFX transitions.",
    fullDescription: "For content creators and anime communities seeking world-class AMV productions. Focused on frame-perfect synchronization, visual flow, 3D camera projections, and emotive storytelling.",
    deliverables: [
      "Custom velocity curves and time remapping",
      "Masking, rotoscoping, and impact frames",
      "Glow, shake, chromatic aberration, and CC",
      "Audio glitch and SFX layering",
      "1080p / 4K 60fps high bitrate render"
    ],
    keySkills: ["After Effects", "RSMB", "Sapphire", "Audio Sync"],
    turnaround: "4 - 7 business days",
    iconName: "Flame",
    order: 3
  },
  {
    id: "srv-movie-edits",
    title: "Movie Edits & Trailers",
    category: "Cinematic",
    shortDescription: "Dramatic recuts, conceptual trailers, and cinematic retrospectives that evoke strong emotional resonance.",
    fullDescription: "Taking long-form cinematic footage and crafting high-tension narrative trailers or reflective tributes. Masterful attention to soundscapes, dialogue isolation, and thematic progression.",
    deliverables: [
      "Narrative arc and pacing restructuring",
      "Dialogue isolation and remastering",
      "Cinematic foley and sub-bass whooshes",
      "Anamorphic letterboxing and color balancing",
      "Custom cinematic title typography"
    ],
    keySkills: ["Pacing", "Storytelling", "Audio Mixing", "Cinematography"],
    turnaround: "3 - 6 business days",
    iconName: "Film",
    order: 4
  },
  {
    id: "srv-podcasts",
    title: "Podcast Editing & Multi-Cam",
    category: "Audio & Multi-Cam",
    shortDescription: "Seamless multi-camera switching, studio audio cleanup, and automated vertical short cutouts.",
    fullDescription: "Full-service podcast post-production for video podcasts. Includes intelligent speaker switching, removal of dead air and filler words, lower thirds, and repurposing into viral shorts.",
    deliverables: [
      "Multi-angle synchronization and switching",
      "Voice leveling, noise suppression, and de-reverb",
      "Animated lower thirds and guest handles",
      "3-5 viral vertical clips with animated captions",
      "Timestamped YouTube chapters"
    ],
    keySkills: ["Multi-Camera Editing", "iZotope RX", "Lower Thirds", "Shorts Repurposing"],
    turnaround: "2 - 3 business days",
    iconName: "Mic",
    order: 5
  },
  {
    id: "srv-youtube",
    title: "YouTube Videos & Retention",
    category: "Content Creation",
    shortDescription: "Data-backed retention editing with hooks, chapter visualizers, sound effects, and zero-fluff pacing.",
    fullDescription: "Designed for creators who want to skyrocket their Average View Duration (AVD). Every cut, zoom, sound effect, and graphic element is engineered to keep viewers glued to the screen.",
    deliverables: [
      "First 30-second high-impact retention hook",
      "Custom sound effects library integration",
      "Motion graphics for complex explanations",
      "Pacing optimization to prevent audience drop-off",
      "Rendered in full 4K with optimized YouTube bitrate"
    ],
    keySkills: ["Retention Theory", "Premiere Pro", "Sound Design", "Thumbnail Strategy"],
    turnaround: "3 - 5 business days",
    iconName: "Youtube",
    order: 6
  },
  {
    id: "srv-reels-shorts",
    title: "Reels, Shorts & TikToks",
    category: "Short-Form Social",
    shortDescription: "High-cadence vertical videos with viral pacing, engaging motion captions, and sound triggers.",
    fullDescription: "Short-form video dominates social discovery. I build vertical videos designed specifically for algorithmic reach on Instagram Reels, TikTok, and YouTube Shorts.",
    deliverables: [
      "Engaging first 3-second visual hooks",
      "Word-by-word animated captions with emojis",
      "B-roll cutaways and zooms every 2-3 seconds",
      "Trending audio integration and audio ducking",
      "Batch delivery options for weekly consistency"
    ],
    keySkills: ["CapCut Pro / Premiere", "Typography", "Fast Pacing", "Algorithmic Hooks"],
    turnaround: "1 - 2 business days",
    iconName: "Smartphone",
    order: 7
  },
  {
    id: "srv-gaming",
    title: "Gaming Montages & Highlights",
    category: "Gaming & Esports",
    shortDescription: "Esports-grade highlight reels with 3D camera pan, velocity graphs, and synchronized beat drops.",
    fullDescription: "Highlighting top plays in Valorant, CS:GO, Apex Legends, Call of Duty, and fighting games. Turn raw gameplay recordings into adrenaline-pumping cinematics.",
    deliverables: [
      "Frame-blended optical flow velocity ramping",
      "Kill reaction sound effects and 3D audio panning",
      "Cinematic replay cameras and spectator tools",
      "Custom team/clan branding overlays",
      "60fps high bitrate social and YouTube exports"
    ],
    keySkills: ["Twixtor", "Camera Tracking", "Beat Sync", "Sound Design"],
    turnaround: "3 - 5 business days",
    iconName: "Gamepad2",
    order: 8
  },
  {
    id: "srv-commercials",
    title: "Brand Commercials & Ad Creatives",
    category: "Marketing & Advertising",
    shortDescription: "High-converting performance ads and brand story pieces that drive clicks and sales.",
    fullDescription: "High-performing video creatives for Meta Ads, TikTok Ads, YouTube Pre-Roll, and brand awareness campaigns. Built around tested direct-response frameworks.",
    deliverables: [
      "Multiple hook variations (A/B testing ready)",
      "Clear call-to-action cards and end screens",
      "Color grading matched to brand guidelines",
      "Platform-specific aspect ratios (16:9, 1:1, 4:5, 9:16)",
      "Licensed royalty-free music and SFX"
    ],
    keySkills: ["Direct Response Ads", "Brand Identity", "Motion Design", "Color Grading"],
    turnaround: "3 - 5 business days",
    iconName: "Sparkles",
    order: 9
  },
  {
    id: "srv-motion-vfx",
    title: "Motion Graphics & VFX",
    category: "Visual Effects",
    shortDescription: "Custom 2D/3D title sequences, screen tracking, logo reveals, and futuristic interface overlays.",
    fullDescription: "Add production value with bespoke motion design. Whether you need realistic screen replacements, tracking titles into a 3D scene, or energetic logo stings.",
    deliverables: [
      "Custom 2D/3D title sequences and lower thirds",
      "Corner-pin screen tracking and cleanups",
      "Logo reveals and animated brand stings",
      "HUD interfaces, maps, and technical visualizers",
      "Alpha channel (ProRes 4444) transparent overlays"
    ],
    keySkills: ["After Effects", "Cinema 4D", "Mocha Pro", "Keying"],
    turnaround: "4 - 7 business days",
    iconName: "Wand2",
    order: 10
  },
  {
    id: "srv-color-sound",
    title: "Color Grading & Master Finishing",
    category: "Post-Production",
    shortDescription: "Film-look color grading, shot matching, dialogue isolation, and rich atmospheric soundscapes.",
    fullDescription: "Transform flat log footage into deep, cinematic imagery with Hollywood-grade color science. Combined with pristine audio mastering so your project looks and sounds like a theater release.",
    deliverables: [
      "Log to Rec.709 conversion and custom film print looks",
      "Shot-to-shot white balance and skin-tone matching",
      "Dynamic exposure relighting and vignette masks",
      "Dialogue cleanup, de-essing, and mastering to -14 LUFS",
      "Multi-layered foley, whooshes, risers, and impact hits"
    ],
    keySkills: ["Adobe Premiere Pro", "Adobe After Effects", "Color Correction & Cinematic Color Grading", "Audio Mastering"],
    turnaround: "2 - 4 business days",
    iconName: "Sliders",
    order: 11
  },
  {
    id: "srv-captions-thumbnails",
    title: "Captions, Subtitles & Custom Thumbnails",
    category: "Social Packaging",
    shortDescription: "Eye-catching click-worthy thumbnails and styled animated captions in 50+ languages.",
    fullDescription: "Complete packaging for social media domination. Includes stylized burned-in captions, SRT delivery for accessibility, and high CTR custom thumbnails designed in Photoshop.",
    deliverables: [
      "Kinetic karaoke-style word highlighting",
      "SRT / VTT closed caption files",
      "High-CTR YouTube and Facebook thumbnails (3 variations)",
      "Typography and color palette matched to brand",
      "Fast same-day turnaround option available"
    ],
    keySkills: ["Photoshop", "Typography", "Subtitling", "CTR Optimization"],
    turnaround: "1 - 2 business days",
    iconName: "Type",
    order: 12
  }
];

export const seedFaqs = [
  {
    question: "What is your typical turnaround time for a video edit?",
    answer: "Turnaround depends on project scope. Short-form Reels and TikToks are typically delivered within 24 to 48 hours. Long-form YouTube edits and commercial projects generally take 3 to 5 business days. Express same-day turnaround is available for urgent deadlines upon request."
  },
  {
    question: "How do we transfer large raw footage files?",
    answer: "You can share footage via Google Drive, Dropbox, Frame.io, WeTransfer, or a private Cloudinary/AWS S3 link. For ongoing clients, I provide a dedicated high-speed cloud upload portal where you can drop multi-gigabyte camera files directly."
  },
  {
    question: "What software and color grading tools do you use?",
    answer: "My core workflow runs on Adobe Premiere Pro (for precision cutting, pacing, sequencing, and timeline workflows) and Adobe After Effects (for complex motion graphics, tracking, VFX, and animation), with professional cinematic color grading and audio mastering."
  },
  {
    question: "How do revisions work?",
    answer: "All standard packages include 2 to 3 revision rounds. Review is handled smoothly via Frame.io or timestamped video review links, allowing you to click anywhere on the video frame and leave exact feedback without confusion."
  },
  {
    question: "Can you provide music licensing and sound effects?",
    answer: "Yes! I maintain active commercial licenses with leading music and SFX libraries (Artlist, Epidemic Sound, Musicbed). Every video comes with 100% royalty-free clearance for YouTube, Meta Ads, TikTok, and broadcast."
  },
  {
    question: "What if I need custom aspect ratios for multiple platforms?",
    answer: "I specialize in multi-platform formatting. I can deliver your master in 16:9 for YouTube/Web, 9:16 for Reels/Shorts, 1:1 for LinkedIn/Twitter, and 4:5 for Instagram feed, with reframed composition ensuring key subjects stay in focus."
  }
];

export const seedPricingPackages = [
  {
    id: "pkg-starter",
    title: "Essential Cut",
    subtitle: "For Creators & Small Brands",
    description: "Ideal for individual creators needing sharp, high-retention edits for social media, YouTube, or podcasts.",
    priceTag: "Starting from $250",
    isPopular: false,
    deliverables: [
      "Up to 5 minutes finished length",
      "Sound design & background music",
      "Basic color correction & balancing",
      "Dynamic captions & lower thirds",
      "2 rounds of revisions",
      "Delivery in 3 business days"
    ],
    ctaText: "Request a Quote",
    targetType: "YouTube / Social"
  },
  {
    id: "pkg-pro",
    title: "Commercial & Growth",
    subtitle: "Most Popular for Businesses",
    description: "Engineered for SaaS launches, high-conversion ad creatives, and high-production YouTube channels.",
    priceTag: "Starting from $550",
    isPopular: true,
    deliverables: [
      "Up to 15 minutes or multiple ad cuts",
      "Advanced motion graphics & 3D UI framing",
      "Cinematic film color grade & correction",
      "Full multi-track sound engineering & foley",
      "Multi-ratio exports (16:9 + 9:16 + 1:1)",
      "3 rounds of revisions",
      "Priority 48-hour turnaround available"
    ],
    ctaText: "Request a Quote",
    targetType: "Commercial / SaaS"
  },
  {
    id: "pkg-enterprise",
    title: "Signature Cinematic",
    subtitle: "For Premium Campaigns & Long-form",
    description: "Complete bespoke post-production for architectural films, documentary series, and brand commercials.",
    priceTag: "Custom Pricing",
    isPopular: false,
    deliverables: [
      "Full creative direction & storyboarding",
      "Custom After Effects VFX & CGI integration",
      "Multi-camera sync & studio audio mastering",
      "Dedicated Frame.io timestamped review portal",
      "Unlimited minor revisions within scope",
      "Expedited turnaround & dedicated support"
    ],
    ctaText: "Discuss Your Project",
    targetType: "Cinematic / Enterprise"
  }
];
