import { useRef, useState, type ReactNode, type HTMLAttributes } from "react";
import { motion } from "motion/react";

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  tilt?: boolean;
}

export const GlowCard = ({
  children,
  className = "",
  glowColor = "rgba(200, 255, 46, 0.08)",
  tilt = false,
  ...props
}: GlowCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -6;
      const rotY = ((x - centerX) / centerX) * 6;
      setRotate({ x: rotX, y: rotY });
    }
  };

  const handlePointerLeave = () => {
    if (tilt) {
      setRotate({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={tilt ? { rotateX: rotate.x, rotateY: rotate.y } : undefined}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
      style={tilt ? { transformStyle: "preserve-3d", perspective: 1000 } : undefined}
      className={`group relative rounded-[20px] bg-[#0E0E13] border border-white/[0.08] p-6 transition-all duration-300 hover:border-white/[0.16] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] overflow-hidden ${className}`}
      {...(props as any)}
    >
      {/* Radial Spotlight Follower */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${glowColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
