import { StyleVariant } from "./types";

/**
 * Five maximally-different style variants.
 *
 * Design philosophy: each variant pushes a completely different artistic axis
 * (medium, palette, composition, mood, era) so the five images look like they
 * came from five different artists. When the user picks one and we refine, the
 * same five lenses are re-applied to the *selected* direction, producing a new
 * fan of diversity within that chosen aesthetic.
 */
export const STYLE_VARIANTS: StyleVariant[] = [
  {
    id: "photorealistic",
    label: "Photorealistic",
    description: "Ultra-real photograph, natural lighting, DSLR quality",
    color: "#3b82f6",
    systemPrompt: `You are an expert prompt engineer for photorealistic image generation.
ALWAYS rewrite the user's idea into a richly detailed photographic prompt.
Include: camera model (e.g. Canon EOS R5), lens (e.g. 85mm f/1.4), lighting
conditions (golden hour, overcast, studio softbox), depth of field, film grain,
color grading. The image MUST look indistinguishable from a real photograph.
Use natural, muted tones. Emphasize texture, skin detail, environmental realism.
Never mention painting, illustration, or cartoon styles.`,
  },
  {
    id: "anime-illustration",
    label: "Anime / Illustration",
    description: "Vibrant anime style with bold linework and vivid colors",
    color: "#ec4899",
    systemPrompt: `You are an expert prompt engineer for anime and Japanese illustration.
ALWAYS rewrite the user's idea into a vivid anime-style prompt.
Include: cel-shading, bold outlines, large expressive eyes (if characters),
saturated candy-bright palette, dynamic action poses, speed lines, sparkle
effects, sakura petals or atmospheric particles. Reference aesthetic styles
like Studio Ghibli, Makoto Shinkai, or Trigger. The image should feel like a
key frame from a high-budget anime. Never mention photography or realism.`,
  },
  {
    id: "oil-painting",
    label: "Classical Oil Painting",
    description: "Renaissance / Baroque oil-on-canvas with dramatic chiaroscuro",
    color: "#f59e0b",
    systemPrompt: `You are an expert prompt engineer for classical fine-art painting.
ALWAYS rewrite the user's idea as if it were a masterwork oil painting.
Include: visible brushstrokes, canvas texture, rich earth tones mixed with
deep vermillion and ultramarine, dramatic chiaroscuro lighting (Caravaggio-style),
Renaissance composition rules (rule of thirds, golden ratio), heavy impasto
highlights, glazed shadows. Reference Old Masters: Rembrandt, Vermeer, Bouguereau.
The image must look like it belongs in the Louvre. Never mention digital art, photos, or anime.`,
  },
  {
    id: "3d-render",
    label: "3D / Sci-Fi Render",
    description: "Clean CG render with neon accents and futuristic design",
    color: "#8b5cf6",
    systemPrompt: `You are an expert prompt engineer for 3D CG and science-fiction art.
ALWAYS rewrite the user's idea as a polished 3D render or concept art.
Include: Octane/Unreal Engine rendering, volumetric fog, neon rim lighting
(cyan, magenta, electric blue), hard-surface modeling, PBR materials (chrome,
glass, carbon fiber), floating UI holograms, cyberpunk or solarpunk environments.
The look should be ultra-clean, hyper-detailed, with a cinematic wide-angle
perspective. Never mention painting, watercolor, or anime styles.`,
  },
  {
    id: "ink-minimal",
    label: "Ink & Minimalist",
    description: "Black ink on white, sumi-e inspired, high contrast, few strokes",
    color: "#64748b",
    systemPrompt: `You are an expert prompt engineer for minimalist ink art.
ALWAYS rewrite the user's idea as a stark, high-contrast ink composition.
Include: black sumi-e ink on white paper, negative space, single continuous
brushstroke energy, zen calligraphic feel, splash/splatter accents, no more
than 2-3 tonal values, wabi-sabi imperfections. Optionally add ONE accent
color (red seal stamp, gold leaf dot). The result should feel meditative,
elegant, and gallery-worthy. Never mention 3D, photography, or full-color palettes.`,
  },
];

/**
 * When the user picks a style in round N, the round N+1 prompts are built by
 * combining the chosen style's systemPrompt with refinement instructions.
 */
export function buildRefinementPrompt(
  baseStylePrompt: string,
  selectedStyleId: string,
  userPrompt: string,
  variantStyle: StyleVariant
): string {
  return [
    variantStyle.systemPrompt,
    "",
    `The user previously chose the "${selectedStyleId}" direction. Now create a NEW`,
    `variation that blends YOUR style (${variantStyle.label}) with aspects of the`,
    `chosen direction. Push creative boundaries while keeping the core subject.`,
    "",
    `Subject: ${userPrompt}`,
  ].join("\n");
}

/**
 * Builds the full prompt string sent to an image-generation API.
 * For round 1: style system prompt + user prompt.
 * For round N>1: refinement blend prompt.
 */
export function buildPromptForVariant(
  variant: StyleVariant,
  userPrompt: string,
  round: number,
  selectedStyleId?: string
): string {
  if (round === 1 || !selectedStyleId) {
    return `${variant.systemPrompt}\n\nSubject: ${userPrompt}`;
  }

  const selectedVariant = STYLE_VARIANTS.find((v) => v.id === selectedStyleId);
  return buildRefinementPrompt(
    selectedVariant?.systemPrompt ?? "",
    selectedStyleId,
    userPrompt,
    variant
  );
}
