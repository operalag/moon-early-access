'use client';

interface SlideProgressProps {
  total: number;
  current: number;
}

export default function SlideProgress({ total, current }: SlideProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`rounded-full transition-all duration-300 ${
            index === current
              ? 'w-2.5 h-2.5 bg-white'
              : 'w-1.5 h-1.5 bg-white/30'
          }`}
        />
      ))}
    </div>
  );
}
