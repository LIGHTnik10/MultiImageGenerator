"use client";

import { GeneratedImage } from "@/lib/types";
import { STYLE_VARIANTS } from "@/lib/styles";

interface Props {
  image: GeneratedImage;
  selected: boolean;
  onSelect: (id: string) => void;
  index: number;
}

export default function ImageCard({ image, selected, onSelect, index }: Props) {
  const style = STYLE_VARIANTS.find((s) => s.id === image.styleId);

  return (
    <button
      onClick={() => onSelect(image.id)}
      className="img-fade-in group relative aspect-square w-full overflow-hidden rounded-2xl border-2 transition-all duration-200 focus:outline-none"
      style={{
        animationDelay: `${index * 100}ms`,
        opacity: 0,
        borderColor: selected ? style?.color ?? "#7c5cfc" : "var(--border)",
        boxShadow: selected
          ? `0 0 20px ${style?.color ?? "#7c5cfc"}40, 0 0 60px ${style?.color ?? "#7c5cfc"}20`
          : "none",
      }}
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={`Generated image - ${style?.label}`}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Hover / selected overlay */}
      <div
        className="absolute inset-0 flex flex-col items-start justify-end p-4 transition-opacity duration-200"
        style={{
          background: selected
            ? "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)"
            : "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
          opacity: selected ? 1 : undefined,
        }}
      >
        {/* Style badge */}
        <span
          className="mb-1 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: style?.color ?? "#666" }}
        >
          {style?.label}
        </span>
        <span className="text-xs text-gray-300">{style?.description}</span>
      </div>

      {/* Selection check */}
      {selected && (
        <div
          className="selected-ring absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: style?.color ?? "#7c5cfc" }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Provider tag */}
      <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-300 backdrop-blur-sm">
        {image.provider}
      </span>
    </button>
  );
}
