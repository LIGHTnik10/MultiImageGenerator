import { NextRequest, NextResponse } from "next/server";
import { STYLE_VARIANTS, buildPromptForVariant } from "@/lib/styles";
import { generateImage, getAvailableProviders } from "@/lib/providers";
import { GeneratedImage, GenerateRequest, GenerateResponse } from "@/lib/types";

export const maxDuration = 120; // allow long generation times

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { prompt, selectedStyleId, round } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const providers = getAvailableProviders();
    if (providers.length === 0) {
      return NextResponse.json(
        {
          error:
            "No API keys configured. Set at least one of: OPENAI_API_KEY, GEMINI_API_KEY, FAL_KEY",
        },
        { status: 500 }
      );
    }

    // Generate 5 images in parallel — one per style variant
    const results = await Promise.allSettled(
      STYLE_VARIANTS.map(async (variant, idx) => {
        // Cycle through available providers
        const provider = providers[idx % providers.length];
        const fullPrompt = buildPromptForVariant(
          variant,
          prompt,
          round,
          selectedStyleId
        );

        const url = await generateImage(provider, fullPrompt);

        const img: GeneratedImage = {
          id: `${round}-${variant.id}-${Date.now()}`,
          url,
          styleId: variant.id,
          provider,
        };
        return img;
      })
    );

    const images: GeneratedImage[] = [];
    const errors: string[] = [];

    for (const r of results) {
      if (r.status === "fulfilled") {
        images.push(r.value);
      } else {
        errors.push(r.reason?.message ?? "Unknown error");
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: `All generators failed: ${errors.join("; ")}` },
        { status: 502 }
      );
    }

    const response: GenerateResponse = { images };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
