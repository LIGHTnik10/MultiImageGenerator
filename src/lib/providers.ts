import { Provider, ClientKeys } from "./types";

// ---------- OpenAI (DALL-E 3 / GPT Image) ----------

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

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

async function generateWithFal(prompt: string, apiKey: string): Promise<string> {
  const submitRes = await fetch("https://queue.fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
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

  if (submitJson.images?.[0]?.url) {
    return submitJson.images[0].url;
  }

  const requestId = submitJson.request_id;
  const statusUrl = submitJson.status_url || `https://queue.fal.run/fal-ai/flux/dev/requests/${requestId}/status`;
  const resultUrl = submitJson.response_url || `https://queue.fal.run/fal-ai/flux/dev/requests/${requestId}`;

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    const statusJson = await statusRes.json();

    if (statusJson.status === "COMPLETED") {
      const resultRes = await fetch(resultUrl, {
        headers: { Authorization: `Key ${apiKey}` },
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

/** Returns available providers based on which keys the client sent */
export function getAvailableProviders(keys: ClientKeys): Provider[] {
  const providers: Provider[] = [];
  if (keys.openai) providers.push("openai");
  if (keys.gemini) providers.push("gemini");
  if (keys.fal) providers.push("fal");
  return providers;
}

function getKeyForProvider(provider: Provider, keys: ClientKeys): string {
  switch (provider) {
    case "openai": return keys.openai!;
    case "gemini": return keys.gemini!;
    case "fal":    return keys.fal!;
  }
}

/** Generate a single image with the given provider using client-supplied keys */
export async function generateImage(
  provider: Provider,
  prompt: string,
  keys: ClientKeys
): Promise<string> {
  const apiKey = getKeyForProvider(provider, keys);
  switch (provider) {
    case "openai":
      return generateWithOpenAI(prompt, apiKey);
    case "gemini":
      return generateWithGemini(prompt, apiKey);
    case "fal":
      return generateWithFal(prompt, apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
