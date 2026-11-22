// Decorative elements inspired by Mongolian ornament (хээ):
// the өлзий (endless knot) and the алхан хээ (hammer/key) border.

export function Ulzii({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-16 -16 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform="rotate(45)">
        {/* woven lattice */}
        <path d="M-9 -6H9M-9 0H9M-9 6H9M-6 -9V9M0 -9V9M6 -9V9" />
        {/* corner loops */}
        <path d="M-9 -6A3 3 0 0 1 -9 0M9 0A3 3 0 0 1 9 6M-6 9A3 3 0 0 1 0 9M0 -9A3 3 0 0 1 6 -9" />
        <path d="M-9 0A3 3 0 0 0 -9 6M9 -6A3 3 0 0 0 9 0M0 9A3 3 0 0 0 6 9M-6 -9A3 3 0 0 0 0 -9" />
      </g>
    </svg>
  );
}

export function KeyBorder({ className }: { className?: string }) {
  return <div className={`key-border ${className ?? ""}`} aria-hidden="true" />;
}
