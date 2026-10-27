export const Backdrop = () => {
  return (
    <>
      {/* Aurora Ambient Glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden isolate">
        {/* Volt Blob */}
        <div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#C8FF2E] opacity-[0.07] blur-[140px] animate-aurora-1 will-change-transform"
          aria-hidden="true"
        />

        {/* Ember Blob */}
        <div
          className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full bg-[#FF5A1F] opacity-[0.06] blur-[150px] animate-aurora-2 will-change-transform"
          aria-hidden="true"
        />

        {/* Cyan Ambient Blob */}
        <div
          className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[#3DD8FF] opacity-[0.05] blur-[140px] animate-aurora-3 will-change-transform"
          aria-hidden="true"
        />

        {/* Perspective Grid Floor */}
        <div
          className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />
      </div>

      {/* SVG Film Grain Overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-[60] opacity-[0.035] mix-blend-overlay"
        aria-hidden="true"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </>
  );
};
