import { useRef, useState, type ButtonHTMLAttributes } from "react";
import { motion } from "motion/react";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "volt" | "ghost" | "ember" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const MagneticButton = ({
  children,
  variant = "volt",
  size = "md",
  className = "",
  disabled,
  ...props
}: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.15;
    const y = (clientY - (top + height / 2)) * 0.15;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const variantStyles = {
    volt: "bg-[#C8FF2E] text-[#07070A] font-bold hover:bg-[#d4ff4e] shadow-[0_0_24px_-4px_rgba(200,255,46,0.45)] hover:shadow-[0_0_32px_0px_rgba(200,255,46,0.65)]",
    ghost: "bg-transparent text-[#F4F4F6] border border-white/10 hover:border-white/30 hover:bg-white/[0.04]",
    ember: "bg-[#FF5A1F] text-white font-bold hover:bg-[#ff6e3b] shadow-[0_0_24px_-4px_rgba(255,90,31,0.5)]",
    outline: "bg-transparent text-[#C8FF2E] border border-[#C8FF2E]/40 hover:bg-[#C8FF2E]/10",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-full gap-1.5",
    md: "px-5 py-2.5 text-xs font-semibold rounded-full gap-2",
    lg: "px-7 py-3.5 text-sm font-bold rounded-full gap-2.5",
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 20, mass: 0.2 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center tracking-tight transition-colors duration-200 select-none overflow-hidden ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? "opacity-50 cursor-not-allowed shadow-none" : "cursor-pointer"
      } ${className}`}
      {...(props as any)}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden="true"
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
