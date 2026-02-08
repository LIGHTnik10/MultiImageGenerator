import { Provider } from "./types";

// ---------- OpenAI (DALL-E 3 / GPT Image) ----------

async function generateWithOpenAI(prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const b64: string = json.data[0].b64_json;
  return `data:image/png;base64,${b64}`;
}

// ---------- Google Gemini (Imagen) ----------

async function generateWithGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const b64: string = json.predictions[0].bytesBase64Encoded;
  return `data:image/png;base64,${b64}`;
}

// ---------- Flux via fal.ai ----------

async function generateWithFal(prompt: string): Promise<string> {
  // Submit request
  const submitRes = await fetch("https://queue.fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: "square_hd",
      num_images: 1,
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`fal.ai error ${submitRes.status}: ${err}`);
  }

  const submitJson = await submitRes.json();

  // If the response already has images, return directly
  if (submitJson.images?.[0]?.url) {
    return submitJson.images[0].url;
  }

  // Otherwise poll the queue
  const requestId = submitJson.request_id;
  const statusUrl = submitJson.status_url || `https://queue.fal.run/fal-ai/flux/dev/requests/${requestId}/status`;
  const resultUrl = submitJson.response_url || `https://queue.fal.run/fal-ai/flux/dev/requests/${requestId}`;

  // Poll for completion (max 60s)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Key ${process.env.FAL_KEY}` },
    });
    const statusJson = await statusRes.json();

    if (statusJson.status === "COMPLETED") {
      const resultRes = await fetch(resultUrl, {
        headers: { Authorization: `Key ${process.env.FAL_KEY}` },
      });
      const resultJson = await resultRes.json();
      return resultJson.images[0].url;
    }

    if (statusJson.status === "FAILED") {
      throw new Error("fal.ai generation failed");
    }
  }

  throw new Error("fal.ai generation timed out");
}

// ---------- Provider router ----------

/** Returns available providers based on which env vars are set */
export function getAvailableProviders(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (process.env.GEMINI_API_KEY) providers.push("gemini");
  if (process.env.FAL_KEY) providers.push("fal");
  return providers;
}

/** Generate a single image with the given provider */
export async function generateImage(
  provider: Provider,
  prompt: string
): Promise<string> {
  switch (provider) {
    case "openai":
      return generateWithOpenAI(prompt);
    case "gemini":
      return generateWithGemini(prompt);
    case "fal":
      return generateWithFal(prompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
