"use client";

import { GenerationRound } from "@/lib/types";
import { STYLE_VARIANTS } from "@/lib/styles";

interface Props {
  rounds: GenerationRound[];
  onViewRound: (roundNumber: number) => void;
  currentRound: number;
}

export default function RoundHistory({ rounds, onViewRound, currentRound }: Props) {
  if (rounds.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {rounds.map((round) => {
        const active = round.roundNumber === currentRound;
        const style = round.parentStyleId
          ? STYLE_VARIANTS.find((s) => s.id === round.parentStyleId)
          : null;

        return (
          <button
            key={round.roundNumber}
            onClick={() => onViewRound(round.roundNumber)}
            className="flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all"
            style={{
              borderColor: active
                ? style?.color ?? "var(--accent)"
                : "var(--border)",
              backgroundColor: active ? "var(--bg-elevated)" : "transparent",
            }}
          >
            <span className="font-semibold">Round {round.roundNumber}</span>
            {style && (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: style.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
