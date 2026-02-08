export type Provider = "openai" | "gemini" | "fal";

export interface StyleVariant {
  id: string;
  label: string;
  description: string;
  /** System-level prompt prefix injected before the user's prompt */
  systemPrompt: string;
  /** Visual badge color for the UI */
  color: string;
}

export interface GeneratedImage {
  id: string;
  url: string;        // base64 data URL or remote URL
  styleId: string;
  provider: Provider;
}

export interface GenerationRound {
  roundNumber: number;
  prompt: string;
  parentImageId: string | null;   // null for initial round
  parentStyleId: string | null;
  images: GeneratedImage[];
}

export interface GenerateRequest {
  prompt: string;
  /** If refining, which style was selected in the previous round */
  selectedStyleId?: string;
  /** Round number (1-based) */
  round: number;
}

export interface GenerateResponse {
  images: GeneratedImage[];
}
