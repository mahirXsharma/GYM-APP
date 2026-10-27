import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BannerProps {
  type: "success" | "error" | "notice";
  text: string;
  onDismiss?: () => void;
  className?: string;
}

export const Banner = ({ type, text, onDismiss, className = "" }: BannerProps) => {
  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      <motion.div
        role="alert"
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        className={`relative flex items-start justify-between gap-3 p-4 rounded-xl backdrop-blur-xl border text-xs sm:text-sm font-medium ${
          isSuccess
            ? "bg-[#C8FF2E]/10 border-[#C8FF2E]/30 text-[#C8FF2E] shadow-[0_0_24px_rgba(200,255,46,0.12)]"
            : "bg-[#FF5A1F]/10 border-[#FF5A1F]/30 text-[#FF5A1F] shadow-[0_0_24px_rgba(255,90,31,0.12)]"
        } ${className}`}
      >
        <div className="flex items-start gap-2.5 flex-1">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#C8FF2E]" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#FF5A1F]" />
          )}
          <div className="leading-snug break-words">
            <strong className="font-bold mr-1.5 font-display text-xs tracking-wider uppercase">
              {isSuccess ? "Success:" : "Notice:"}
            </strong>
            <span className="text-white/90">{text}</span>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 -mr-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
