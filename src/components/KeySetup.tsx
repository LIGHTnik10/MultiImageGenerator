"use client";

import { useState } from "react";
import { ApiKeys } from "@/lib/keystore";

interface Props {
  onKeysSubmit: (keys: ApiKeys) => void;
}

const PROVIDERS = [
  {
    key: "openai" as const,
    label: "OpenAI",
    placeholder: "sk-...",
    color: "#3b82f6",
    description: "DALL-E 3 image generation",
  },
  {
    key: "gemini" as const,
    label: "Google Gemini",
    placeholder: "AIza...",
    color: "#f59e0b",
    description: "Imagen model",
  },
  {
    key: "fal" as const,
    label: "Flux (fal.ai)",
    placeholder: "fal key",
    color: "#8b5cf6",
    description: "Flux image generation",
  },
];

export default function KeySetup({ onKeysSubmit }: Props) {
  const [keys, setKeys] = useState<ApiKeys>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const hasAnyKey = Object.values(keys).some((v) => v?.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAnyKey) return;
    // Strip empty values
    const cleaned: ApiKeys = {};
    if (keys.openai?.trim()) cleaned.openai = keys.openai.trim();
    if (keys.gemini?.trim()) cleaned.gemini = keys.gemini.trim();
    if (keys.fal?.trim()) cleaned.fal = keys.fal.trim();
    onKeysSubmit(cleaned);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-[#7c5cfc] via-[#ec4899] to-[#f59e0b] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Multi-Image Generator
          </h1>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Enter at least one API key to get started. Keys are encrypted in
            your browser and deleted when you close this tab.
          </p>
        </div>

        {/* Security badge */}
        <div className="mx-auto mb-6 flex max-w-sm items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <svg
            className="h-5 w-5 shrink-0 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div className="text-xs text-emerald-300">
            <span className="font-semibold">AES-256-GCM encrypted</span> in
            sessionStorage. Keys never leave your browser except in API calls
            you initiate. Cleared on tab close.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {PROVIDERS.map((p) => (
              <div key={p.key}>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                  <span className="font-normal text-[var(--text-muted)]">
                    — {p.description}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showKeys[p.key] ? "text" : "password"}
                    value={keys[p.key] ?? ""}
                    onChange={(e) =>
                      setKeys((prev) => ({ ...prev, [p.key]: e.target.value }))
                    }
                    placeholder={p.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 pr-12 font-mono text-sm text-[var(--text)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowKeys((prev) => ({
                        ...prev,
                        [p.key]: !prev[p.key],
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    tabIndex={-1}
                  >
                    {showKeys[p.key] ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={!hasAnyKey}
            className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3.5 font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Generating
          </button>

          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            You can provide one key or all three. Images will cycle across
            whichever providers are configured.
          </p>
        </form>
      </div>
    </div>
  );
}
