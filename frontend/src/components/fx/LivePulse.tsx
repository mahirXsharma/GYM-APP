interface LivePulseProps {
  label?: string;
  className?: string;
}

export const LivePulse = ({ label = "LIVE", className = "" }: LivePulseProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C8FF2E]/10 border border-[#C8FF2E]/30 text-[#C8FF2E] text-[10px] font-bold tracking-wider uppercase select-none ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF2E] opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C8FF2E]" />
      </span>
      {label}
    </span>
  );
};
