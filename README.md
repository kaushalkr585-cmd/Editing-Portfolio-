# 🎬 KAUSHAL KUMAR — Premium AI-Powered Video Editing Portfolio

A full-stack, production-grade video editing portfolio application engineered for high-converting client inquiries, multi-genre video playback, and AI-powered creative direction powered by **NVIDIA Nemotron** and **Cloudinary**.

---

## 🌟 Highlights & Capabilities

- **Cinematic Creative Studio Aesthetic**:
  - Dark luxury theme (`#0C0C0C` background, `#141414` surface) with refined violet (`#7621B0`), magenta (`#B600A8`), and warm orange (`#BE4C00`) accents.
  - Expressive **Kanit** typography (weights 300–900).
  - Responsive layout optimized for mobile screens (320px–430px), tablets (768px), laptops (1024px–1440px), and ultrawide displays (1920px+).

- **12 Configurable Editing Categories**:
  - SaaS & Product, Real Estate, AMVs, Movie Edits, Podcasts, YouTube, Reels & Shorts, Gaming, Commercials, Motion Graphics & VFX, Travel & Cinematic.
  - Strict preservation of native aspect ratios (**16:9**, **9:16**, **1:1**, **4:5**) without stretching or black distortion.
  - Soundless hover video preview on desktop with single-player enforcement; tap-to-play on mobile; full metadata inspection modal.

- **Figma-Accurate About Me Section**:
  - Exact preservation of the 4 decorative corner assets (Moon, Lego icon, p59_1, Group_134-1) with responsive positioning and graceful network fallbacks.
  - Custom `.hero-heading` gradient (`linear-gradient(180deg, #646973 0%, #BBCCD7 100%)`).
  - Progressive character/word scroll reveal powered by Framer Motion `useScroll` and `useTransform`.
  - Reusable `FadeIn` component with customizable delay, offsets, and styles.
  - Custom pill-shaped Contact Me gradient button (`linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)`).

- **Interactive 5-Stage Editing Pipeline**:
  - Raw Ingestion ➔ Pacing & Cuts ➔ DaVinci Resolve Color Science ➔ Sound Design & Foley ➔ Final Multi-Format Output.
  - Interactive draggable **Before-and-After Slider** comparing washed-out raw S-Log3 footage with a finished Hollywood color grade.

- **NVIDIA Nemotron AI Project Director**:
  - **Creative Brief Builder**: Ingests genre, platform, duration, and style to generate a structured production brief (hook strategies, pacing curves, timeline, asset checklist).
  - **Service & Portfolio Matcher**: Natural language matching recommending exact editing services and matching portfolio pieces.
  - **Transfer to Inquiry**: Seamlessly moves generated briefs directly into the contact form.
  - **Graceful Fallback Mode**: Intelligent local creative heuristics activate automatically when `NVIDIA_API_KEY` is not provided.

- **Cloudinary Video Engine**:
  - Secure backend signature generation for direct browser-to-cloud uploads.
  - Automatic poster frame extraction and responsive compression.
  - Complete zero-credential demo mode with high-res creative commons video streams.

- **Secure Studio Admin Portal (`/admin`)**:
  - Initial setup wizard to create primary admin credentials if none exist.
  - JWT Bearer token authentication and bcrypt password hashing.
  - Complete project CRUD with Cloudinary ID association, aspect ratio controls, featured flags, and draft/published toggles.
  - Live client inquiry inbox with status updating (`new`, `in_review`, `responded`, `archived`).
  - Site settings and headline customization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion v12, Lucide React, React Router v7 |
| **Backend** | Node.js, Express.js, Mongoose, Cloudinary SDK, Helmet, CORS, Rate-Limiting |
| **Database** | MongoDB Atlas (with automatic fallback to high-performance memory store) |
| **AI Director**| NVIDIA Nemotron (`nvidia/nemotron-4-340b-instruct`) via OpenAI-compatible API |
| **Media Delivery** | Cloudinary & CDN fallback streaming |

---

## 🚀 Quick Start & Development

### 1. Installation
Install all root, backend, and frontend dependencies:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
*(The application works 100% out-of-the-box in demo mode even with blank API keys!)*

### 3. Launch Development Servers
Run both Express backend (`:5000`) and Vite frontend (`:5173`) concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin Dashboard**: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 🧪 Testing

Run the automated integration test suite:
```bash
npm test
```
This tests:
- API health and project filtering across 12 categories
- Client inquiry validation and rejection of invalid data
- AI brief generation and natural language service matching
- Route security (blocking unauthorized admin mutations with 401)
- Admin setup, authentication, and full project CRUD cycles

---

## 🔐 Admin Setup & First Login

1. Navigate to `/admin` in your browser.
2. If no admin account exists, you will be prompted to create your primary administrator credentials:
   - **Username** (e.g. `kaushal`)
   - **Email** (e.g. `contact@kaushalkumar.com`)
   - **Password** (minimum 8 characters)
3. Once initialized, the setup endpoint locks automatically to prevent unauthorized account creation.

---

## ☁️ Connecting External Credentials

When you are ready to connect your production accounts:

### Cloudinary (`server/.env`)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### MongoDB Atlas (`server/.env`)
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/editing_portfolio?retryWrites=true&w=majority
```

### NVIDIA Nemotron (`server/.env`)
```env
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-4-340b-instruct
```

---

## 📦 Production Build & Deployment

To build the client for production and serve everything from Express:
```bash
npm run build
npm start
```
The Express server automatically serves the optimized, code-split client bundles from `client/dist` while handling SPA client routing.
