import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { sessionsApi, bookingsApi, type SessionItem, type BookingItem, ApiError } from "@/lib/api";
import { GlowCard } from "@/components/fx/GlowCard";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { CapacityRing } from "@/components/fx/CapacityRing";
import { LivePulse } from "@/components/fx/LivePulse";
import { Banner } from "@/components/fx/Banner";
import { Skeleton } from "@/components/fx/Skeleton";
import { RotateCw, Calendar, Clock, KeyRound, Ticket, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { motion } from "motion/react";

export const SessionList = () => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [myBookings, setMyBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingInProgressId, setBookingInProgressId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [copiedSessionId, setCopiedSessionId] = useState<number | null>(null);

  const copyPasscode = (code: string, sessionId: number) => {
    navigator.clipboard.writeText(code);
    setCopiedSessionId(sessionId);
    setTimeout(() => {
      setCopiedSessionId(null);
    }, 1500);
  };

  useEffect(() => {
    document.title = "Workout Sessions · Gym Booking";
  }, []);

  const loadData = async (quiet: boolean = false) => {
    if (!quiet) {
      setLoading(true);
      setError("");
    }
    try {
      const [sessionsData, bookingsData] = await Promise.all([
        sessionsApi.getSessions(),
        bookingsApi.getMyBookings(true),
      ]);

      const fetchedSessions = sessionsData.sessions || [];
      const fetchedBookings = bookingsData.bookings || [];

      setSessions(fetchedSessions);
      setMyBookings(fetchedBookings);
    } catch (err: any) {
      if (!quiet) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load workout sessions. Please check your network connection.");
        }
      }
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // 6-second live polling
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(true);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleBook = async (session: SessionItem) => {
    if (bookingInProgressId) return;

    const previousSessions = [...sessions];
    const previousBookings = [...myBookings];
    const isWaitlist = session.seatsRemaining <= 0;

    setBookingInProgressId(session.id);
    setFeedback(null);

    // Optimistic seats update
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === session.id) {
          return {
            ...s,
            seatsRemaining: Math.max(0, s.seatsRemaining - (isWaitlist ? 0 : 1)),
          };
        }
        return s;
      })
    );

    // Optimistic booking entry
    const optimisticBooking: BookingItem = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      userId: user?.id || 0,
      sessionId: session.id,
      status: isWaitlist ? "WAITING_LIST" : "CONFIRMED",
      code: isWaitlist ? null : "PENDING",
      session,
    };
    setMyBookings((prev) => [optimisticBooking, ...prev]);

    try {
      const res = await sessionsApi.bookSession(session.id);
      const confirmedBooking = res.booking;

      setMyBookings((prev) =>
        prev.map((b) => (b.sessionId === session.id ? confirmedBooking : b))
      );

      if (confirmedBooking.status === "WAITING_LIST") {
        setFeedback({
          type: "success",
          text: "This session is full. You have been added to the waiting list.",
        });
      } else {
        setFeedback({
          type: "success",
          text: `Booking confirmed! Your attendance passcode is: ${confirmedBooking.code || ""}`,
        });
      }
    } catch (err: any) {
      setSessions(previousSessions);
      setMyBookings(previousBookings);

      const errorMsg =
        err instanceof ApiError ? err.message : "Booking could not be completed. Rolled back.";
      setFeedback({
        type: "error",
        text: `Booking failed: ${errorMsg}`,
      });
    } finally {
      setBookingInProgressId(null);
    }
  };

  const formatSessionTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        timeStr: date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
        dateStr: date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        dayKey: date.toDateString(),
      };
    } catch {
      return { timeStr: "", dateStr: isoString, dayKey: isoString };
    }
  };

  const getDayLabel = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return "TODAY";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "TOMORROW";
      } else {
        return date
          .toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          })
          .toUpperCase();
      }
    } catch {
      return "UPCOMING";
    }
  };

  // Sort sessions: default is "asc" (closest / soonest session at the top)
  const sortedSessions = [...sessions].sort((a, b) => {
    const timeA = new Date(a.scheduledFor).getTime();
    const timeB = new Date(b.scheduledFor).getTime();
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });

  // Group sorted sessions by day
  const groupedSessions = sortedSessions.reduce((acc, session) => {
    const key = new Date(session.scheduledFor).toDateString();
    if (!acc[key]) {
      acc[key] = {
        label: getDayLabel(session.scheduledFor),
        date: session.scheduledFor,
        items: [],
      };
    }
    acc[key].items.push(session);
    return acc;
  }, {} as Record<string, { label: string; date: string; items: SessionItem[] }>);

  return (
    <div className="w-full flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[24px] bg-[#0E0E13]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <LivePulse label="6S LIVE SYNC" />
            <span className="text-[11px] font-mono text-neutral-400">
              {sessions.length} upcoming slots
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
            Workout Sessions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Coach-led high-intensity training with real-time seat availability
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/my-bookings" id="sessions-my-bookings-link">
            <MagneticButton variant="ghost" size="sm" className="flex items-center gap-2">
              <Ticket className="w-3.5 h-3.5 text-[#C8FF2E]" />
              <span>My Bookings ({myBookings.length})</span>
            </MagneticButton>
          </Link>

          <MagneticButton
            variant="ghost"
            size="sm"
            onClick={() => loadData(false)}
            disabled={loading}
            id="sessions-refresh-button"
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

      {/* Sessions Sorting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <span className="text-xs text-neutral-400 font-medium">
          Showing <strong className="text-white font-bold">{sessions.length}</strong> workout sessions
        </span>

        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#15151C] border border-white/[0.06]">
          <span className="text-[11px] font-medium text-neutral-500 pl-2 pr-1 hidden sm:inline">Sort:</span>
          <button
            type="button"
            id="session-sort-asc"
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
            id="session-sort-desc"
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
      {loading && sessions.length === 0 && (
        <div className="space-y-6">
          <div className="h-4 w-32 bg-white/[0.05] rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 rounded-[22px] bg-[#0E0E13] border border-white/[0.06] space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <Skeleton className="h-14 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-11 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <GlowCard className="p-8 text-center space-y-4 border-[#FF5A1F]/30 bg-[#FF5A1F]/5 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Connection Error</h3>
            <p className="text-xs text-neutral-400">{error}</p>
          </div>
          <MagneticButton
            variant="volt"
            size="md"
            onClick={() => loadData(false)}
            id="sessions-retry-button"
            className="mx-auto"
          >
            Try Again
          </MagneticButton>
        </GlowCard>
      )}

      {/* Empty State */}
      {!loading && !error && sessions.length === 0 && (
        <GlowCard className="p-12 text-center space-y-4 max-w-lg mx-auto border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] text-neutral-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight">
              No Upcoming Sessions
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              There are currently no active workout sessions scheduled. Check back shortly or refresh to check for openings.
            </p>
          </div>
          <MagneticButton
            variant="ghost"
            size="sm"
            onClick={() => loadData(false)}
            className="mx-auto"
          >
            Check Again
          </MagneticButton>
        </GlowCard>
      )}

      {/* Sessions Grouped by Day */}
      {!loading && !error && Object.keys(groupedSessions).length > 0 && (
        <div className="space-y-10">
          {Object.entries(groupedSessions).map(([dayKey, group]) => (
            <section key={dayKey} className="space-y-4">
              {/* Day Header Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-[#C8FF2E]" />
                <h2 className="text-sm font-black font-display tracking-widest text-white uppercase">
                  {group.label}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.1] to-transparent" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.items.map((session) => {
                  const { timeStr, dateStr } = formatSessionTime(session.scheduledFor);
                  const isFull = session.seatsRemaining <= 0;
                  const isUrgent = session.seatsRemaining > 0 && session.seatsRemaining <= 3;
                  const isBookingThis = bookingInProgressId === session.id;

                  const userBooking = myBookings.find(
                    (b) =>
                      b.sessionId === session.id &&
                      (b.status === "CONFIRMED" || b.status === "WAITING_LIST")
                  );
                  const isConfirmed = userBooking?.status === "CONFIRMED";
                  const isWaitlisted = userBooking?.status === "WAITING_LIST";

                  const bookedCount = Math.max(0, session.capacity - session.seatsRemaining);
                  const progressPercentage = Math.min(
                    100,
                    Math.round((bookedCount / session.capacity) * 100)
                  );

                  return (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="h-full"
                    >
                      <GlowCard
                        className={`relative flex flex-col justify-between p-6 transition-all duration-300 h-full ${
                          isConfirmed
                            ? "border-[#C8FF2E]/60 bg-[#C8FF2E]/[0.03] shadow-[0_0_28px_-6px_rgba(200,255,46,0.25)]"
                            : isWaitlisted
                            ? "border-[#FFB020]/50 bg-[#FFB020]/[0.03] shadow-[0_0_28px_-6px_rgba(255,176,32,0.2)]"
                            : isFull
                            ? "border-[#FF5A1F]/30 bg-[#FF5A1F]/[0.02]"
                            : "border-white/[0.08]"
                        }`}
                      >
                        {/* Top Ribbon for User Status */}
                        {isConfirmed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.7, y: -4 }}
                            animate={{ opacity: 1, scale: [1, 1.15, 1], y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute top-4 right-4 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8FF2E] text-[#07070A] text-[10px] font-black tracking-wider uppercase shadow-[0_0_16px_rgba(200,255,46,0.7)]"
                          >
                            <Sparkles className="w-3 h-3 fill-current" />
                            <span>You&apos;re In ✓</span>
                          </motion.div>
                        )}

                        {isWaitlisted && (
                          <div className="absolute top-4 right-4 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFB020] text-[#07070A] text-[10px] font-black tracking-wider uppercase">
                            <Clock className="w-3 h-3" />
                            <span>On Waitlist</span>
                          </div>
                        )}

                      <div className="space-y-4">
                        {/* Time & Capacity Ring Header */}
                        <div className="flex items-start justify-between gap-3 pt-1">
                          <div className="space-y-1">
                            <span className="text-neutral-400 text-xs font-medium flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                              {dateStr}
                            </span>
                            <div className="font-mono text-3xl font-black text-white tracking-tight tabular-nums">
                              {timeStr}
                            </div>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              Session #{session.id} · 60 MIN
                            </span>
                          </div>

                          <div className="pt-1">
                            <CapacityRing
                              capacity={session.capacity}
                              seatsRemaining={session.seatsRemaining}
                              size={58}
                              strokeWidth={4.5}
                            />
                          </div>
                        </div>

                        {/* Urgency Pill if ≤3 spots left */}
                        {isUrgent && !isConfirmed && !isWaitlisted && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF5A1F] text-xs font-bold animate-pulse">
                            <span>⚡</span>
                            <span>Only {session.seatsRemaining} spot{session.seatsRemaining > 1 ? "s" : ""} left</span>
                          </div>
                        )}

                        {/* Thin Capacity Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px] text-neutral-400">
                            <span>Capacity</span>
                            <span className="font-mono font-medium text-white">
                              {bookedCount} / {session.capacity} booked
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull
                                  ? "bg-[#FF5A1F]"
                                  : isUrgent
                                  ? "bg-[#FF5A1F]"
                                  : progressPercentage > 75
                                  ? "bg-[#FFB020]"
                                  : "bg-[#C8FF2E]"
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Passcode Panel (Member Confirmed Booking only) */}
                        {!user?.isAdmin && isConfirmed && userBooking?.code && (
                          <div className="p-3.5 rounded-xl bg-black/60 border border-[#C8FF2E]/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold tracking-wider uppercase text-[#C8FF2E] flex items-center gap-1">
                                <KeyRound className="w-3 h-3" />
                                <span>Check-In Passcode</span>
                              </span>

                              {userBooking.code !== "PENDING" && (
                                <button
                                  type="button"
                                  onClick={() => copyPasscode(userBooking.code!, session.id)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-300 hover:text-white px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/15 transition-colors cursor-pointer"
                                  title="Copy passcode"
                                  aria-label="Copy passcode"
                                >
                                  {copiedSessionId === session.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#C8FF2E]" />
                                      <span className="text-[#C8FF2E] font-bold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-neutral-400" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {userBooking.code === "PENDING" ? (
                              <div className="flex items-center gap-2 py-1">
                                <div className="h-6 w-32 bg-white/10 rounded animate-shimmer" />
                                <span className="text-xs text-neutral-400 italic">Generating code...</span>
                              </div>
                            ) : (
                              <motion.div
                                animate={copiedSessionId === session.id ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-1.5 py-1"
                              >
                                {userBooking.code.split("").map((char, index) => (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center justify-center w-7 h-8 rounded-lg bg-[#15151C] border font-mono text-base font-black transition-colors ${
                                      copiedSessionId === session.id
                                        ? "border-[#C8FF2E] text-[#C8FF2E] shadow-[0_0_12px_rgba(200,255,46,0.4)]"
                                        : "border-[#C8FF2E]/30 text-white"
                                    }`}
                                  >
                                    {char}
                                  </span>
                                ))}
                              </motion.div>
                            )}

                            <p className="text-[11px] text-neutral-400">
                              Show this code at check-in
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Action Button */}
                      <div className="pt-6">
                        {isConfirmed ? (
                          <button
                            type="button"
                            disabled
                            className="w-full h-11 rounded-full bg-[#C8FF2E]/10 border border-[#C8FF2E]/30 text-[#C8FF2E] font-bold text-xs uppercase tracking-wider cursor-default flex items-center justify-center gap-1.5"
                          >
                            <span>Reserved Spot ✓</span>
                          </button>
                        ) : isWaitlisted ? (
                          <button
                            type="button"
                            disabled
                            className="w-full h-11 rounded-full bg-[#FFB020]/10 border border-[#FFB020]/30 text-[#FFB020] font-bold text-xs uppercase tracking-wider cursor-default flex items-center justify-center gap-1.5"
                          >
                            <span>Waitlist Active</span>
                          </button>
                        ) : (
                          <MagneticButton
                            variant={isFull ? "ghost" : "volt"}
                            size="md"
                            disabled={isBookingThis}
                            onClick={() => handleBook(session)}
                            className="w-full flex items-center justify-center font-bold"
                          >
                            {isBookingThis ? (
                              <span className="flex items-center gap-2">
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                  className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                                />
                                Booking...
                              </span>
                            ) : isFull ? (
                              <span className="text-[#FFB020]">Join Waiting List</span>
                            ) : (
                              <span>Book Spot</span>
                            )}
                          </MagneticButton>
                        )}
                      </div>
                    </GlowCard>
                  </motion.div>
                );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};