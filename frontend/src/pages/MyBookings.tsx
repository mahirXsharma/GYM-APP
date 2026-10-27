import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingsApi, type BookingItem, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { GlowCard } from "@/components/fx/GlowCard";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { StatusBadge } from "@/components/fx/StatusBadge";
import { Banner } from "@/components/fx/Banner";
import { Skeleton } from "@/components/fx/Skeleton";
import { RotateCw, Copy, Check, Calendar, Dumbbell, AlertCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";

export const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    document.title = "My Bookings · Gym Booking";
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await bookingsApi.getMyBookings(activeOnly);
      setBookings(data.bookings || []);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load your bookings. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeOnly]);

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    setFeedback(null);

    try {
      await bookingsApi.cancelBooking(bookingId);
      setFeedback({
        type: "success",
        text: "Booking cancelled successfully. If someone was waitlisted, they have been automatically promoted.",
      });
      await fetchBookings();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to cancel booking.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setCancellingId(null);
    }
  };

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const formatTicketDate = (isoString?: string) => {
    if (!isoString) return { day: "--", month: "---", weekday: "---", time: "--:--" };
    try {
      const d = new Date(isoString);
      return {
        day: d.getDate().toString().padStart(2, "0"),
        month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
        weekday: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
        time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      return { day: "--", month: "---", weekday: "---", time: "--:--" };
    }
  };

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[24px] bg-[#0E0E13]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-widest text-[#C8FF2E] uppercase">
            Reservation Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            View your workout session tickets, passcodes, and waitlist positions
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/sessions" id="mybookings-browse-sessions-link">
            <MagneticButton variant="ghost" size="sm" className="flex items-center gap-2">
              <Dumbbell className="w-3.5 h-3.5 text-[#C8FF2E]" />
              <span>Browse Sessions</span>
            </MagneticButton>
          </Link>

          <MagneticButton
            variant="ghost"
            size="sm"
            onClick={fetchBookings}
            disabled={loading}
            id="mybookings-refresh-button"
            className="flex items-center gap-2 text-neutral-300"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C8FF2E]" : ""}`} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </MagneticButton>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <Banner
          type={feedback.type}
          text={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Segmented Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#15151C] border border-white/[0.06]">
          <button
            type="button"
            id="filter-all-bookings"
            onClick={() => setActiveOnly(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              !activeOnly
                ? "bg-[#C8FF2E] text-[#07070A] shadow-[0_0_16px_rgba(200,255,46,0.4)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            type="button"
            id="filter-active-only"
            onClick={() => setActiveOnly(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeOnly
                ? "bg-[#C8FF2E] text-[#07070A] shadow-[0_0_16px_rgba(200,255,46,0.4)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Active Only
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#15151C] border border-white/[0.06]">
          <span className="text-[11px] font-medium text-neutral-500 pl-2 pr-1 hidden sm:inline">Sort:</span>
          <button
            type="button"
            id="bookings-sort-asc"
            onClick={() => setSortOrder("asc")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              sortOrder === "asc"
                ? "bg-[#C8FF2E] text-[#07070A] shadow-[0_0_12px_rgba(200,255,46,0.35)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Soonest First
          </button>
          <button
            type="button"
            id="bookings-sort-desc"
            onClick={() => setSortOrder("desc")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              sortOrder === "desc"
                ? "bg-[#C8FF2E] text-[#07070A] shadow-[0_0_12px_rgba(200,255,46,0.35)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Furthest Away
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && bookings.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-[22px] bg-[#0E0E13] border border-white/[0.06] flex flex-col md:flex-row gap-6 items-center"
            >
              <Skeleton className="h-24 w-28 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1 w-full">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <GlowCard className="p-8 text-center space-y-4 border-[#FF5A1F]/30 bg-[#FF5A1F]/5 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Failed to Load Bookings</h3>
            <p className="text-xs text-neutral-400">{error}</p>
          </div>
          <MagneticButton
            variant="volt"
            size="md"
            onClick={fetchBookings}
            id="mybookings-retry-button"
            className="mx-auto"
          >
            Try Again
          </MagneticButton>
        </GlowCard>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <GlowCard className="p-12 text-center space-y-4 max-w-lg mx-auto border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] text-neutral-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight">
              No Bookings Found
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {activeOnly
                ? "You don't have any active confirmed or waitlisted bookings."
                : "You haven't reserved any workout sessions yet. Browse available sessions to get started."}
            </p>
          </div>
          <Link to="/sessions">
            <MagneticButton variant="volt" size="md" className="mx-auto mt-2">
              Browse Available Sessions
            </MagneticButton>
          </Link>
        </GlowCard>
      )}

      {/* Bookings Ticket Cards List */}
      {!loading && !error && bookings.length > 0 && (() => {
        const sortedBookings = [...bookings].sort((a, b) => {
          const timeA = new Date(a.session?.scheduledFor || a.createdAt).getTime();
          const timeB = new Date(b.session?.scheduledFor || b.createdAt).getTime();
          return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        });

        return (
          <div className="space-y-5">
            {sortedBookings.map((booking) => {
              const isConfirmed = booking.status === "CONFIRMED";
              const isWaitlist = booking.status === "WAITING_LIST";
              const isAttended = booking.status === "ATTENDED";
              const isCancelled = booking.status === "CANCELLED";

            const canCancel = isConfirmed || isWaitlist;
            const isCancelling = cancellingId === booking.id;
            const isCopied = copiedId === booking.id;

            const { day, month, weekday, time } = formatTicketDate(booking.session?.scheduledFor);

            return (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full"
              >
                <div
                  className={`relative rounded-[22px] bg-[#0E0E13] border transition-all duration-300 overflow-hidden flex flex-col md:flex-row ${
                    isConfirmed
                      ? "border-[#C8FF2E]/30 shadow-[0_8px_30px_rgba(200,255,46,0.06)]"
                      : isWaitlist
                      ? "border-[#FFB020]/30 shadow-[0_8px_30px_rgba(255,176,32,0.06)]"
                      : isAttended
                      ? "border-[#3DD8FF]/30"
                      : "border-white/[0.05] opacity-60"
                  }`}
                >
                {/* Left Ticket Stub */}
                <div
                  className={`flex flex-col items-center justify-center p-6 md:w-36 shrink-0 text-center border-b md:border-b-0 md:border-r border-dashed ${
                    isCancelled ? "border-neutral-800 text-neutral-500" : "border-white/10"
                  } bg-[#15151C]/50 relative`}
                >
                  <span className="text-[11px] font-bold tracking-widest text-[#C8FF2E] uppercase">
                    {month}
                  </span>
                  <span
                    className={`text-4xl font-black font-display tracking-tight ${
                      isCancelled ? "line-through text-neutral-500" : "text-white"
                    }`}
                  >
                    {day}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">{weekday}</span>
                  <span className="text-xs font-mono font-bold text-neutral-300 mt-2 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {time}
                  </span>
                </div>

                {/* Right Ticket Body */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-5 relative">
                  {/* Attended Stamp */}
                  {isAttended && (
                    <div className="absolute top-4 right-6 -rotate-6 select-none pointer-events-none">
                      <div className="px-3 py-1 rounded-lg border-2 border-[#3DD8FF] text-[#3DD8FF] font-black text-xs font-display tracking-wider uppercase opacity-90 shadow-[0_0_16px_rgba(61,216,255,0.4)]">
                        CHECKED IN ✓
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Status & Identification */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={booking.status} />
                        <span className="text-xs font-mono text-neutral-400">
                          Booking #{booking.id}
                        </span>
                        <span className="text-xs font-mono text-neutral-500">
                          Session #{booking.sessionId}
                        </span>
                      </div>
                    </div>

                    {/* Admin View of Member details */}
                    {user?.isAdmin && booking.user && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                        <span className="text-neutral-400 font-medium">Reserved by: </span>
                        <span className="text-white font-bold">{booking.user.name}</span>
                        <span className="text-neutral-400 ml-1">({booking.user.email})</span>
                      </div>
                    )}

                    {/* Confirmed Passcode Box for Member */}
                    {!user?.isAdmin && isConfirmed && booking.code && (
                      <div className="p-4 rounded-xl bg-black/70 border border-[#C8FF2E]/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-wider uppercase text-[#C8FF2E]">
                            Attendance Passcode
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(booking.code!, booking.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 transition-colors"
                            aria-label="Copy passcode"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#C8FF2E]" />
                                <span className="text-[#C8FF2E] font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>

                        <motion.div
                          animate={isCopied ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2 py-1"
                        >
                          {booking.code.split("").map((c, idx) => (
                            <span
                              key={idx}
                              className={`w-8 h-9 rounded-lg bg-[#15151C] border flex items-center justify-center font-mono text-lg font-black transition-colors shadow-inner ${
                                isCopied
                                  ? "border-[#C8FF2E] text-[#C8FF2E] shadow-[0_0_12px_rgba(200,255,46,0.4)]"
                                  : "border-[#C8FF2E]/40 text-white"
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </motion.div>

                        <p className="text-xs text-neutral-400 font-sans">
                          Member must provide their passcode at check-in
                        </p>
                      </div>
                    )}

                    {/* Waitlist Status helper */}
                    {isWaitlist && (
                      <div className="p-3.5 rounded-xl bg-[#FFB020]/10 border border-[#FFB020]/20 text-xs text-[#FFB020] space-y-1 font-sans">
                        <p className="font-semibold">Waiting for a spot in this session...</p>
                        <p className="text-neutral-400">
                          If another member cancels, you will be automatically promoted and issued a passcode.
                        </p>
                      </div>
                    )}

                    {/* Cancelled Status helper */}
                    {isCancelled && (
                      <p className="text-xs text-neutral-500 font-sans">
                        This reservation was cancelled.
                      </p>
                    )}
                  </div>

                  {/* Cancel Button */}
                  {canCancel && (
                    <div className="pt-2 flex justify-end">
                      <MagneticButton
                        variant="ghost"
                        size="sm"
                        disabled={isCancelling}
                        onClick={() => handleCancel(booking.id)}
                        className="text-[#FF5A1F] hover:bg-[#FF5A1F]/10 border-[#FF5A1F]/30"
                      >
                        {isCancelling ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="inline-block w-3.5 h-3.5 border-2 border-[#FF5A1F] border-t-transparent rounded-full"
                            />
                            Cancelling...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel Reservation
                          </span>
                        )}
                      </MagneticButton>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      );
    })()}
    </div>
  );
};
