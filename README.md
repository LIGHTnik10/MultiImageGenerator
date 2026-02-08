# Multi-Image Generator

Generate 5 **wildly different** images from a single prompt, pick your favorite, and iteratively refine — producing 5 new variations each round.

## How It Works

1. **Enter a prompt** — describe what you want to see
2. **5 images** are generated in parallel, each through a different style lens:
   | Style | What it produces |
   |---|---|
   | **Photorealistic** | DSLR-quality photograph with natural lighting |
   | **Anime / Illustration** | Vibrant cel-shaded anime key frame |
   | **Classical Oil Painting** | Renaissance/Baroque oil-on-canvas |
   | **3D / Sci-Fi Render** | Polished CG with neon accents |
   | **Ink & Minimalist** | Black sumi-e ink, high contrast, few strokes |
3. **Select one** image you like
4. **Refine** — 5 new images are generated that blend your chosen direction with all 5 style lenses
5. **Repeat** as many rounds as you want

## Supported Providers

Provide **at least one** API key. Images cycle across whichever providers are configured:

- **OpenAI** (DALL-E 3) — `OPENAI_API_KEY`
- **Google Gemini** (Imagen) — `GEMINI_API_KEY`
- **Flux via fal.ai** — `FAL_KEY`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your API key(s)
cp .env.example .env.local
# Then edit .env.local and add your keys

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **TypeScript**
