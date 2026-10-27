import { CheckCircle2, Clock, CheckCheck, XCircle, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: "CONFIRMED" | "WAITING_LIST" | "ATTENDED" | "CANCELLED" | "NO_SHOW" | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge = ({ status, className = "", showIcon = true }: StatusBadgeProps) => {
  switch (status) {
    case "CONFIRMED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#C8FF2E]/10 text-[#C8FF2E] border border-[#C8FF2E]/30 select-none ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          CONFIRMED
        </span>
      );
    case "WAITING_LIST":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#FFB020]/10 text-[#FFB020] border border-[#FFB020]/30 select-none ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 animate-pulse" />}
          WAITLIST
        </span>
      );
    case "ATTENDED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#3DD8FF]/10 text-[#3DD8FF] border border-[#3DD8FF]/30 select-none ${className}`}
        >
          {showIcon && <CheckCheck className="w-3.5 h-3.5" />}
          ATTENDED ✓
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/[0.04] text-neutral-400 border border-white/10 select-none ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5" />}
          CANCELLED
        </span>
      );
    case "NO_SHOW":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30 select-none ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
          NO SHOW
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-white/5 text-neutral-300 border border-white/10 select-none ${className}`}
        >
          {status}
        </span>
      );
  }
};
