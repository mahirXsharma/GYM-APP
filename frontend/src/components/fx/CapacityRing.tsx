import { motion } from "motion/react";

interface CapacityRingProps {
  capacity: number;
  seatsRemaining: number;
  size?: number;
  strokeWidth?: number;
}

export const CapacityRing = ({
  capacity,
  seatsRemaining,
  size = 56,
  strokeWidth = 4,
}: CapacityRingProps) => {
  const safeCapacity = Math.max(capacity, 1);
  const safeRemaining = Math.max(0, seatsRemaining);
  const booked = Math.max(0, safeCapacity - safeRemaining);
  const percentage = Math.min(100, Math.round((booked / safeCapacity) * 100));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isFull = safeRemaining === 0;
  const isUrgent = safeRemaining > 0 && safeRemaining <= 3;

  const ringColor = isFull
    ? "#FF5A1F"
    : isUrgent
    ? "#FF5A1F"
    : percentage > 75
    ? "#FFB020"
    : "#C8FF2E";

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`${booked} of ${safeCapacity} spots booked (${safeRemaining} remaining)`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[11px] font-bold">
        {isFull ? (
          <span className="text-[#FF5A1F] text-[10px] font-black tracking-tight">FULL</span>
        ) : (
          <span className="text-white text-xs">{safeRemaining}</span>
        )}
      </div>
    </div>
  );
};
