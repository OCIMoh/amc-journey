/** Soft ink-wash cat silhouette — same visual family as the dog and entrance paws. */
export function CatArt({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g className="animal-body" style={{ transformOrigin: "72px 95px" }}>
        {/* Tail — more expressive for the cat */}
        <g className="animal-tail" style={{ transformOrigin: "30px 100px" }}>
          <path
            d="M38 98c-16 2-26-10-28-24 10 6 18 10 22 22 4 6 6 8 6 2z"
            fill="#1B4542"
            opacity="0.9"
          />
          <path
            d="M18 78c-8-10-6-22 2-28 0 10 4 18 10 24-4 2-8 4-12 4z"
            fill="#2F6F6A"
            opacity="0.7"
          />
        </g>

        {/* Body */}
        <ellipse cx="74" cy="100" rx="40" ry="28" fill="#1B4542" />
        <ellipse cx="74" cy="100" rx="40" ry="28" fill="#2F6F6A" opacity="0.28" />
        <ellipse cx="86" cy="96" rx="14" ry="12" fill="#5A9A94" opacity="0.22" />

        {/* Legs */}
        <g className="animal-leg-front" style={{ transformOrigin: "98px 116px" }}>
          <rect x="92" y="108" width="9" height="26" rx="4.5" fill="#1B4542" />
          <ellipse cx="96.5" cy="134" rx="7" ry="4" fill="#161C1B" />
        </g>
        <rect x="56" y="110" width="8" height="24" rx="4" fill="#1B4542" />
        <ellipse cx="60" cy="134" rx="6.5" ry="4" fill="#161C1B" />

        {/* Head */}
        <g className="animal-head" style={{ transformOrigin: "108px 58px" }}>
          <ellipse cx="108" cy="60" rx="24" ry="22" fill="#1B4542" />
          <ellipse cx="108" cy="60" rx="24" ry="22" fill="#2F6F6A" opacity="0.28" />

          {/* Pointed ears */}
          <g className="animal-ear-l" style={{ transformOrigin: "92px 40px" }}>
            <path d="M88 52 L92 22 L108 48 Z" fill="#161C1B" />
            <path d="M92 48 L94 30 L104 46 Z" fill="#8CB5A7" opacity="0.4" />
          </g>
          <g className="animal-ear-r" style={{ transformOrigin: "124px 40px" }}>
            <path d="M128 52 L124 22 L108 48 Z" fill="#161C1B" />
            <path d="M124 48 L122 30 L112 46 Z" fill="#8CB5A7" opacity="0.35" />
          </g>

          {/* Eyes — slightly almond / curious */}
          <ellipse cx="100" cy="58" rx="4" ry="3.4" fill="#F3EEE4" />
          <ellipse cx="116" cy="56" rx="4" ry="3.4" fill="#F3EEE4" />
          <ellipse cx="100.6" cy="58.2" rx="1.5" ry="2.2" fill="#161C1B" />
          <ellipse cx="116.6" cy="56.2" rx="1.5" ry="2.2" fill="#161C1B" />

          {/* Nose + whisker marks */}
          <path d="M108 66 L104 70 L112 70 Z" fill="#E2DACB" />
          <path
            d="M90 66h-10M90 70h-9M126 64h10M126 68h9"
            stroke="#D3E4E1"
            strokeWidth="1"
            opacity="0.45"
          />
        </g>
      </g>
    </svg>
  );
}
