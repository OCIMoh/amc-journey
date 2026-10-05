/** Soft ink-wash dog silhouette — matches entrance paw language. */
export function DogArt({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g className="animal-body" style={{ transformOrigin: "80px 95px" }}>
        {/* Tail */}
        <g className="animal-tail" style={{ transformOrigin: "28px 88px" }}>
          <path
            d="M34 92c-14-6-24-4-28 8 8-2 16 2 22 10 2-8 4-14 6-18z"
            fill="#1B4542"
            opacity="0.85"
          />
        </g>

        {/* Hind + body */}
        <ellipse cx="78" cy="102" rx="48" ry="32" fill="#1B4542" />
        <ellipse cx="78" cy="102" rx="48" ry="32" fill="#2F6F6A" opacity="0.35" />

        {/* Legs */}
        <g className="animal-leg-front" style={{ transformOrigin: "108px 118px" }}>
          <rect x="100" y="108" width="12" height="28" rx="6" fill="#1B4542" />
          <ellipse cx="106" cy="136" rx="9" ry="5" fill="#161C1B" />
        </g>
        <rect x="58" y="110" width="11" height="26" rx="5.5" fill="#1B4542" />
        <ellipse cx="63" cy="136" rx="8" ry="5" fill="#161C1B" />

        {/* Chest highlight */}
        <ellipse cx="92" cy="98" rx="18" ry="14" fill="#5A9A94" opacity="0.25" />

        {/* Head */}
        <g className="animal-head" style={{ transformOrigin: "118px 62px" }}>
          <ellipse cx="118" cy="62" rx="28" ry="26" fill="#1B4542" />
          <ellipse cx="118" cy="62" rx="28" ry="26" fill="#2F6F6A" opacity="0.3" />

          {/* Ears */}
          <g className="animal-ear-l" style={{ transformOrigin: "100px 42px" }}>
            <path
              d="M96 48c-4-18 2-28 12-28 2 10-2 22-6 30-2 0-4 0-6-2z"
              fill="#161C1B"
            />
            <path
              d="M100 46c-2-12 2-20 8-20 0 8-2 16-4 22z"
              fill="#5A8578"
              opacity="0.45"
            />
          </g>
          <g className="animal-ear-r" style={{ transformOrigin: "136px 42px" }}>
            <path
              d="M140 48c4-18-2-28-12-28-2 10 2 22 6 30 2 0 4 0 6-2z"
              fill="#161C1B"
            />
          </g>

          {/* Snout */}
          <ellipse cx="132" cy="70" rx="14" ry="11" fill="#D3E4E1" opacity="0.55" />
          <ellipse cx="138" cy="68" rx="5" ry="3.5" fill="#161C1B" />
          {/* Eyes */}
          <circle cx="112" cy="58" r="3.2" fill="#F3EEE4" />
          <circle cx="124" cy="56" r="3.2" fill="#F3EEE4" />
          <circle cx="112.8" cy="58.4" r="1.6" fill="#161C1B" />
          <circle cx="124.8" cy="56.4" r="1.6" fill="#161C1B" />
        </g>
      </g>
    </svg>
  );
}
