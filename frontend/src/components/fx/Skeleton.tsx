interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.05] ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
        aria-hidden="true"
      />
    </div>
  );
};
