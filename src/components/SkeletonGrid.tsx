"use client";

export default function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="skeleton aspect-square w-full rounded-2xl"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
