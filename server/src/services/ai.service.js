import { seedServices, seedProjects } from '../data/seedData.js';

const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'nvidia/nemotron-4-340b-instruct';

/**
 * Call NVIDIA Nemotron API via OpenAI-compatible chat completions endpoint
 */
async function callNemotronAPI(messages, temperature = 0.3, maxTokens = 1500) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null; // Will trigger intelligent fallback
  }

  const endpoint = `${NVIDIA_BASE_URL.replace(/\/$/, '')}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages,
        temperature,
        top_p: 0.8,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Nemotron API Error] Status: ${response.status}: ${errText}`);
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[Nemotron Network Error] ${error.message}. Using intelligent creative fallback.`);
    return null;
  }
}

import { DataStore } from './dataStore.js';

/**
 * Deterministic local fallback generator for Creative Project Brief
 */
async function generateLocalBrief({ projectType, platform, audience, desiredStyle, duration, references, budget, deadline }) {
  const matchingService = seedServices.find(s => 
    s.title.toLowerCase().includes((projectType || '').toLowerCase()) || 
    s.category.toLowerCase().includes((projectType || '').toLowerCase())
  ) || seedServices[0];

  const publishedProjects = await DataStore.getProjects({ publishedOnly: true });
  const suggestedProjects = publishedProjects
    .filter(p => p.category?.toLowerCase().includes((projectType || '').toLowerCase()) || (Array.isArray(p.tags) && p.tags.some(t => (projectType || '').toLowerCase().includes(t.toLowerCase()))))
    .slice(0, 2);

  const referenceProjects = suggestedProjects.length > 0 
    ? suggestedProjects.map(p => `- ${p.title} (${p.category})`).join('\n')
    : `Custom ${projectType || 'creative'} assignment — crafted to your exact specifications.`;

  return {
    isDemoFallback: !process.env.NVIDIA_API_KEY,
    briefTitle: `${projectType || 'Creative Video'} Production & Editing Blueprint`,
    projectType: projectType || 'Video Editing',
    targetAudience: audience || 'Engaged digital consumers & decision-makers',
    platform: platform || 'YouTube & Social Media (Multi-format)',
    aspectRatio: platform?.toLowerCase().includes('reel') || platform?.toLowerCase().includes('short') || platform?.toLowerCase().includes('tiktok') ? '9:16 Vertical' : '16:9 Landscape',
    targetDuration: duration || '60 - 90 seconds',
    visualStyle: desiredStyle || 'High-energy, cinematic color grading, punchy sound design and kinetic typography',
    hookStrategy: [
      'First 0 - 3 Seconds: Dynamic match-cut or bold visual statement paired with high-impact riser and impact sound.',
      '3 - 15 Seconds: Introduce core value proposition or narrative conflict before audience attention drops.',
      'Core Pacing: Rhythm-matched cut rate calibrated to background audio BPM; subtle zooms every 2.5s to maintain engagement.',
      'Conclusion & CTA: Branded motion outro with clear call-to-action cards and audio sting.'
    ],
    recommendedWorkflow: [
      'Stage 1: Ingestion, proxy workflow & timeline rough-cut in Adobe Premiere Pro focusing on story cadence.',
      'Stage 2: Motion graphics, screen framing, kinetic subtitles, and visual accents in Adobe After Effects.',
      'Stage 3: Color Correction & Cinematic Color Grading (film emulation, contrast balancing, skin-tone preservation).',
      'Stage 4: Multi-track sound design (dialogue de-noising, foley, whooshes, stereo mastering to -14 LUFS).'
    ],
    recommendedService: matchingService.title,
    relevantPortfolioReferences: referenceProjects,
    turnaroundEstimate: deadline ? `Targeting ${deadline}` : matchingService.turnaround,
    budgetGuideline: budget || 'Contact for custom quote',
    checklist: [
      'High-res camera raw or clean screen recordings shared via Cloudinary / Drive',
      'Brand assets (Vector SVG logos, typography rules, color hex codes)',
      'Any custom music preferences or voiceover tracks'
    ]
  };
}

/**
 * Deterministic local fallback generator for Service & Project Recommendations
 */
async function generateLocalRecommendations(query) {
  const q = (query || '').toLowerCase();
  
  // Score services
  const scoredServices = seedServices.map(svc => {
    let score = 0;
    if (q.includes(svc.title.toLowerCase())) score += 10;
    if (q.includes(svc.category.toLowerCase())) score += 5;
    svc.deliverables.forEach(d => {
      if (q.includes(d.toLowerCase().slice(0, 10))) score += 2;
    });
    svc.keySkills.forEach(k => {
      if (q.includes(k.toLowerCase())) score += 3;
    });
    if ((q.includes('saas') || q.includes('software') || q.includes('app')) && svc.id === 'srv-saas') score += 15;
    if ((q.includes('real estate') || q.includes('house') || q.includes('property')) && svc.id === 'srv-real-estate') score += 15;
    if ((q.includes('anime') || q.includes('amv') || q.includes('manga')) && svc.id === 'srv-amv') score += 15;
    if ((q.includes('podcast') || q.includes('talk') || q.includes('interview')) && svc.id === 'srv-podcasts') score += 15;
    if ((q.includes('short') || q.includes('reel') || q.includes('tiktok') || q.includes('vertical')) && svc.id === 'srv-reels-shorts') score += 15;
    if ((q.includes('youtube') || q.includes('retention') || q.includes('vlog')) && svc.id === 'srv-youtube') score += 15;
    if ((q.includes('game') || q.includes('gaming') || q.includes('montage') || q.includes('valorant')) && svc.id === 'srv-gaming') score += 15;
    if ((q.includes('grade') || q.includes('color') || q.includes('sound') || q.includes('audio')) && svc.id === 'srv-color-sound') score += 15;
    if ((q.includes('commercial') || q.includes('ad') || q.includes('brand')) && svc.id === 'srv-commercials') score += 15;
    if ((q.includes('vfx') || q.includes('motion') || q.includes('after effects')) && svc.id === 'srv-motion-vfx') score += 15;
    return { service: svc, score };
  }).sort((a, b) => b.score - a.score);

  const topServices = (scoredServices[0].score > 0 ? scoredServices.slice(0, 2) : scoredServices.slice(0, 2)).map(s => s.service);

  // Score real published projects
  const publishedProjects = await DataStore.getProjects({ publishedOnly: true });
  const scoredProjects = publishedProjects.map(proj => {
    let score = 0;
    if (proj.category && q.includes(proj.category.toLowerCase())) score += 8;
    if (Array.isArray(proj.tags)) {
      proj.tags.forEach(t => {
        if (q.includes(t.toLowerCase())) score += 4;
      });
    }
    if (topServices.some(s => s.title.includes(proj.category) || (proj.category && proj.category.includes(s.title)))) score += 5;
    return { project: proj, score };
  }).sort((a, b) => b.score - a.score);

  const topProjects = scoredProjects.slice(0, 3).map(p => p.project);

  return {
    isDemoFallback: !process.env.NVIDIA_API_KEY,
    analysis: `Based on your request, your project requires high visual precision, tailored pacing, and platform-specific audio/visual polish. Here are the most relevant services and verified portfolio references from Kaushal's studio:`,
    recommendedServices: topServices,
    matchingProjects: topProjects,
    suggestedNextSteps: "You can click on any matching project below to inspect the video playback, or generate a tailored project brief with our AI Brief Builder to get an accurate quote."
  };
}

export const AIService = {
  /**
   * Generates a structured Creative Project Brief
   */
  generateProjectBrief: async (input) => {
    const { projectType, platform, audience, desiredStyle, duration, references, budget, deadline } = input;

    const systemPrompt = `You are an elite creative video producer and post-production director for Kaushal Kumar's video editing portfolio.
Kaushal is a master video editor specializing in SaaS & Product Videos, Real Estate, AMVs, Movie Edits, Podcasts, YouTube, Reels/Shorts, Gaming Montages, Commercials, Motion Graphics & VFX, and Color Grading/Sound Design.
Analyze the user's project request and return a structured JSON response matching this exact schema:
{
  "briefTitle": "string",
  "projectType": "string",
  "targetAudience": "string",
  "platform": "string",
  "aspectRatio": "string (e.g. 16:9, 9:16, 1:1, 4:5)",
  "targetDuration": "string",
  "visualStyle": "string",
  "hookStrategy": ["string", "string", "string"],
  "recommendedWorkflow": ["string", "string", "string"],
  "recommendedService": "string",
  "relevantPortfolioReferences": "string",
  "turnaroundEstimate": "string",
  "budgetGuideline": "string",
  "checklist": ["string", "string", "string"]
}
Only output valid JSON. Do not invent false guarantees or promise rendering 3D models or filming on location. Video editing and post-production only.`;

    const userPrompt = `Project Type: ${projectType || 'Not specified'}
Platform: ${platform || 'Not specified'}
Target Audience: ${audience || 'General'}
Desired Style: ${desiredStyle || 'Cinematic & dynamic'}
Target Duration: ${duration || '1-2 minutes'}
Reference Links / Notes: ${references || 'None provided'}
Budget Range: ${budget || 'Flexible'}
Deadline: ${deadline || 'Standard'}`;

    const apiResult = await callNemotronAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.2, 1200);

    if (apiResult) {
      try {
        const cleaned = apiResult.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return { ...parsed, isDemoFallback: false };
      } catch (err) {
        console.warn('[Nemotron Parse Error] Failed to parse JSON response. Falling back to structured generator.');
      }
    }

    return await generateLocalBrief(input);
  },

  /**
   * Generates Service and Portfolio Recommendations
   */
  recommendServices: async (query) => {
    const systemPrompt = `You are Kaushal Kumar's creative assistant. Recommend relevant video editing services and matching portfolio work based on the visitor's description.
Available Services:
${seedServices.map(s => `- ${s.title}: ${s.shortDescription}`).join('\n')}

Output valid JSON matching:
{
  "analysis": "2-3 sentences explaining why these services and approaches fit best",
  "recommendedServiceTitles": ["Service Title 1", "Service Title 2"],
  "suggestedNextSteps": "string"
}`;

    const apiResult = await callNemotronAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Visitor inquiry: "${query}"` }
    ], 0.2, 800);

    if (apiResult) {
      try {
        const cleaned = apiResult.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        const publishedProjects = await DataStore.getProjects({ publishedOnly: true });
        const matchedProjects = publishedProjects.filter(p =>
          matchedServices.some(s => s.title.includes(p.category) || (p.category && p.category.includes(s.title)))
        ).slice(0, 3);

        return {
          isDemoFallback: false,
          analysis: parsed.analysis,
          recommendedServices: matchedServices.length > 0 ? matchedServices : seedServices.slice(0, 2),
          matchingProjects: matchedProjects,
          suggestedNextSteps: parsed.suggestedNextSteps || "You can generate a detailed creative brief or submit a project inquiry below."
        };
      } catch (err) {
        console.warn('[Nemotron Parse Error] Recommendation JSON parse failed, using fallback.');
      }
    }

    return await generateLocalRecommendations(query);
  }
};
