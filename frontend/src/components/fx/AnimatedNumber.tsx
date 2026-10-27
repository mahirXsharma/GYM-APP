import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  format?: (n: number) => string;
}

export const AnimatedNumber = ({
  value,
  className = "",
  format = (n) => Math.round(n).toString(),
}: AnimatedNumberProps) => {
  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, { damping: 24, stiffness: 200 });
  const displayVal = useTransform(springVal, (current) => format(current));

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return <motion.span className={className}>{displayVal}</motion.span>;
};
