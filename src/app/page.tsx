"use client";

import { useState, useCallback } from "react";
import ImageCard from "@/components/ImageCard";
import SkeletonGrid from "@/components/SkeletonGrid";
import RoundHistory from "@/components/RoundHistory";
import { GeneratedImage, GenerationRound } from "@/lib/types";
import { STYLE_VARIANTS } from "@/lib/styles";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [rounds, setRounds] = useState<GenerationRound[]>([]);
  const [viewingRound, setViewingRound] = useState(1);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRoundData = rounds.find((r) => r.roundNumber === viewingRound);
  const latestRound = rounds.length > 0 ? rounds[rounds.length - 1].roundNumber : 0;
  const isViewingLatest = viewingRound === latestRound;

  const selectedImage = currentRoundData?.images.find(
    (img) => img.id === selectedImageId
  );

  const generate = useCallback(
    async (selectedStyleId?: string) => {
      const roundNumber = latestRound + 1;
      setLoading(true);
      setError(null);
      setSelectedImageId(null);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            round: roundNumber,
            selectedStyleId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }

        const newRound: GenerationRound = {
          roundNumber,
          prompt,
          parentImageId: selectedImageId,
          parentStyleId: selectedStyleId ?? null,
          images: data.images,
        };

        setRounds((prev) => [...prev, newRound]);
        setViewingRound(roundNumber);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setLoading(false);
      }
    },
    [prompt, latestRound, selectedImageId]
  );

  const handleGenerate = () => generate();

  const handleRefine = () => {
    if (!selectedImage) return;
    generate(selectedImage.styleId);
  };

  const handleReset = () => {
    setRounds([]);
    setViewingRound(1);
    setSelectedImageId(null);
    setError(null);
    setPrompt("");
  };

  const selectedStyle = selectedImage
    ? STYLE_VARIANTS.find((s) => s.id === selectedImage.styleId)
    : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-[#7c5cfc] via-[#ec4899] to-[#f59e0b] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Multi-Image Generator
        </h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Generate 5 wildly different images from one prompt. Pick your favorite, refine, repeat.
        </p>
      </div>

      {/* Prompt input */}
      <div className="mx-auto mb-8 max-w-2xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && prompt.trim() && !loading && rounds.length === 0) {
                handleGenerate();
              }
            }}
            placeholder="Describe what you want to see..."
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5 text-[var(--text)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            disabled={loading}
          />
          {rounds.length === 0 ? (
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="shrink-0 rounded-xl bg-[var(--accent)] px-6 py-3.5 font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3.5 font-semibold text-[var(--text)] transition-all hover:bg-[var(--bg-elevated)]"
            >
              New Prompt
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
          {error}
        </div>
      )}

      {/* Round history breadcrumb */}
      <RoundHistory
        rounds={rounds}
        onViewRound={setViewingRound}
        currentRound={viewingRound}
      />

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6">
          <p className="mb-4 text-center text-sm text-[var(--text-muted)]">
            Generating 5 unique variations — this takes a moment...
          </p>
          <SkeletonGrid />
        </div>
      )}

      {/* Image grid */}
      {!loading && currentRoundData && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Round {currentRoundData.roundNumber}
              {currentRoundData.parentStyleId && (
                <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                  refined from{" "}
                  <span
                    className="font-medium"
                    style={{
                      color:
                        STYLE_VARIANTS.find(
                          (s) => s.id === currentRoundData.parentStyleId
                        )?.color ?? "inherit",
                    }}
                  >
                    {
                      STYLE_VARIANTS.find(
                        (s) => s.id === currentRoundData.parentStyleId
                      )?.label
                    }
                  </span>
                </span>
              )}
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {currentRoundData.images.length} of 5 generated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {currentRoundData.images.map((img, i) => (
              <ImageCard
                key={img.id}
                image={img}
                selected={img.id === selectedImageId}
                onSelect={(id) =>
                  isViewingLatest &&
                  setSelectedImageId((prev) => (prev === id ? null : id))
                }
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Refine action bar */}
      {!loading && selectedImage && isViewingLatest && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-4">
            <div
              className="h-10 w-10 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedImage.url})` }}
            />
            <div>
              <p className="text-sm font-medium">
                Selected:{" "}
                <span style={{ color: selectedStyle?.color }}>
                  {selectedStyle?.label}
                </span>
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Generate 5 new variations based on this direction
              </p>
            </div>
            <button
              onClick={handleRefine}
              className="ml-4 rounded-xl px-6 py-2.5 font-semibold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: selectedStyle?.color ?? "var(--accent)" }}
            >
              Refine &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && rounds.length === 0 && !error && (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-6 flex max-w-md justify-center gap-3">
            {STYLE_VARIANTS.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3"
                style={{ flex: 1 }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[10px] font-medium text-[var(--text-muted)]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Each prompt generates 5 images across these distinct styles
          </p>
        </div>
      )}
    </main>
  );
}
