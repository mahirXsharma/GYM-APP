interface MarqueeProps {
  items?: string[];
  className?: string;
}

export const Marquee = ({
  items = [
    "STRENGTH & CONDITIONING",
    "20 SPOTS MAXIMUM",
    "LIVE REAL-TIME SEATS",
    "INSTANT WAITLIST PROMOTION",
    "CONFIDENTIAL PASSCODES",
    "ZERO NO-SHOW TOLERANCE",
    "HIGH-INTENSITY TRAINING",
    "COACH-LED SESSIONS",
  ],
  className = "",
}: MarqueeProps) => {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#C8FF2E] text-[#07070A] py-3.5 select-none -rotate-1 shadow-[0_10px_30px_rgba(200,255,46,0.25)] flex whitespace-nowrap ${className}`}
    >
      <div className="flex shrink-0 items-center gap-10 whitespace-nowrap animate-marquee pr-10">
        {items.map((item, index) => (
          <div key={`m1-${index}`} className="flex items-center gap-10 shrink-0 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase font-display whitespace-nowrap">
              {item}
            </span>
            <span className="text-black/40 text-sm">✦</span>
          </div>
        ))}
      </div>
      <div
        className="flex shrink-0 items-center gap-10 whitespace-nowrap animate-marquee pr-10"
        aria-hidden="true"
      >
        {items.map((item, index) => (
          <div key={`m2-${index}`} className="flex items-center gap-10 shrink-0 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase font-display whitespace-nowrap">
              {item}
            </span>
            <span className="text-black/40 text-sm">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};
