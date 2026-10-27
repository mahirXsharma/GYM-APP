import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { adminApi, sessionsApi, type SessionItem, type BookingItem, ApiError } from "@/lib/api";
import { GlowCard } from "@/components/fx/GlowCard";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { StatusBadge } from "@/components/fx/StatusBadge";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { Banner } from "@/components/fx/Banner";
import { Skeleton } from "@/components/fx/Skeleton";
import {
  RotateCw,
  Plus,
  Minus,
  Users,
  ScanLine,
  ShieldAlert,
} from "lucide-react";

interface CreateSessionForm {
  scheduledFor: string;
  capacity: number;
}

interface CheckInForm {
  code: string;
}

export const AdminPage = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [sessionBookings, setSessionBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  const [createFeedback, setCreateFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [checkInFeedback, setCheckInFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    document.title = "Command Center · Gym Booking";
  }, []);

  const {
    register: registerSession,
    handleSubmit: handleSessionSubmit,
    reset: resetSessionForm,
    setValue: setSessionValue,
    watch: watchSession,
    clearErrors: clearSessionErrors,
    formState: { errors: sessionErrors, isSubmitting: isCreatingSession },
  } = useForm<CreateSessionForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      capacity: 20,
    },
  });

  const currentCapacity = watchSession("capacity") ?? 20;

  const {
    register: registerCheckIn,
    handleSubmit: handleCheckInSubmit,
    reset: resetCheckInForm,
    clearErrors: clearCheckInErrors,
    formState: { errors: checkInErrors, isSubmitting: isCheckingIn },
  } = useForm<CheckInForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setSessionsError("");
    try {
      const data = await sessionsApi.getSessions(true);
      const list = data.sessions || [];
      setSessions(list);

      if (list.length > 0 && !selectedSessionId) {
        setSelectedSessionId(list[0].id);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to load sessions.";
      setSessionsError(msg);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchSessionBookings = async (sessionId: number) => {
    setLoadingBookings(true);
    setBookingsError("");
    try {
      const data = await adminApi.getAllBookings();
      const matching = (data.bookings || []).filter((b) => b.sessionId === sessionId);
      setSessionBookings(matching);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to load attendees.";
      setBookingsError(msg);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionBookings(selectedSessionId);
    }
  }, [selectedSessionId]);

  const onCreateSession = async (data: CreateSessionForm) => {
    setCreateFeedback(null);
    try {
      const isoDate = new Date(data.scheduledFor).toISOString();
      const res = await adminApi.createSession({
        scheduledFor: isoDate,
        capacity: Number(data.capacity) || 20,
      });

      setCreateFeedback({
        type: "success",
        text: `Session created successfully for ${new Date(res.session.scheduledFor).toLocaleString()} with ${res.session.capacity} capacity.`,
      });
      resetSessionForm({ capacity: 20, scheduledFor: "" });
      await fetchSessions();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to create session.";
      setCreateFeedback({ type: "error", text: msg });
    }
  };

  const onCheckIn = async (data: CheckInForm) => {
    setCheckInFeedback(null);
    try {
      const res = await adminApi.markAttendance(data.code.trim().toUpperCase());
      setCheckInFeedback({
        type: "success",
        text: res.message || `Attendance verified successfully! Booking #${res.booking.id} marked as ATTENDED.`,
      });
      resetCheckInForm({ code: "" });
      if (selectedSessionId) {
        await fetchSessionBookings(selectedSessionId);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to verify attendance.";
      setCheckInFeedback({ type: "error", text: msg });
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return isoString;
    }
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const selectedBookedCount = selectedSession
    ? Math.max(0, selectedSession.capacity - selectedSession.seatsRemaining)
    : 0;

  const getInitials = (name?: string) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[24px] bg-[#0E0E13]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF5A1F] text-[10px] font-black tracking-wider uppercase">
              <ShieldAlert className="w-3 h-3" />
              ADMIN PRIVILEGES
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Backend v1.0 Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Create scheduled workout sessions, monitor attendee rosters, and scan passcodes
          </p>
        </div>

        <MagneticButton
          variant="ghost"
          size="sm"
          onClick={fetchSessions}
          disabled={loadingSessions}
          id="admin-refresh-button"
          className="flex items-center gap-2 text-neutral-300 self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loadingSessions ? "animate-spin text-[#C8FF2E]" : ""}`} />
          <span>{loadingSessions ? "Refreshing..." : "Refresh Sessions"}</span>
        </MagneticButton>
      </div>

      {/* KPI Tiles Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlowCard className="p-5 border-white/[0.08]">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider block">
            Total Sessions
          </span>
          <div className="text-3xl font-black font-display text-white mt-1">
            <AnimatedNumber value={sessions.length} />
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Active and archived records
          </span>
        </GlowCard>

        <GlowCard className="p-5 border-white/[0.08]">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider block">
            Selected Session Booked
          </span>
          <div className="text-3xl font-black font-display text-[#C8FF2E] mt-1">
            <AnimatedNumber value={selectedBookedCount} />
            <span className="text-neutral-500 text-lg font-normal"> / {selectedSession?.capacity || 20}</span>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Session #{selectedSessionId || "—"} confirmed reservations
          </span>
        </GlowCard>

        <GlowCard className="p-5 border-white/[0.08]">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider block">
            Remaining Seats
          </span>
          <div className="text-3xl font-black font-display text-white mt-1">
            <AnimatedNumber value={selectedSession?.seatsRemaining || 0} />
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Available spots before waitlist triggers
          </span>
        </GlowCard>
      </div>

      {/* Sessions Error Banner */}
      {sessionsError && (
        <Banner
          type="error"
          text={`Session Loading Error: ${sessionsError}`}
          onDismiss={() => setSessionsError("")}
        />
      )}

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Create Session Card */}
          <GlowCard className="p-6 sm:p-7 border-white/[0.08] space-y-5">
            <div className="space-y-1 border-b border-white/[0.08] pb-3">
              <span className="text-[11px] font-mono text-[#C8FF2E] font-bold tracking-widest uppercase">
                01 · SCHEDULING
              </span>
              <h2 className="text-xl font-black font-display text-white uppercase tracking-tight">
                Create Session
              </h2>
              <p className="text-xs text-neutral-400">
                Schedule a future workout date/time and define capacity limits
              </p>
            </div>

            {createFeedback && (
              <Banner
                type={createFeedback.type}
                text={createFeedback.text}
                onDismiss={() => setCreateFeedback(null)}
              />
            )}

            <form onSubmit={handleSessionSubmit(onCreateSession)} className="space-y-4" noValidate>
              {/* Date & Time */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-scheduledFor"
                  className="block text-xs font-semibold text-neutral-300"
                >
                  Session Date & Time (Future)
                </label>
                <div className="relative">
                  <input
                    id="admin-scheduledFor"
                    type="datetime-local"
                    disabled={isCreatingSession}
                    style={{ colorScheme: "dark" }}
                    className={`w-full h-11 px-3.5 rounded-xl bg-[#15151C] border text-white text-sm focus:outline-none transition-all ${
                      sessionErrors.scheduledFor
                        ? "border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
                        : "border-white/10 focus:border-[#C8FF2E] focus:ring-1 focus:ring-[#C8FF2E]"
                    }`}
                    {...registerSession("scheduledFor", {
                      required: "Scheduled date and time is required.",
                      validate: (val) => {
                        const selected = new Date(val);
                        if (isNaN(selected.getTime())) return "Please select a valid date.";
                        if (selected <= new Date()) return "Session must be scheduled in the future.";
                        return true;
                      },
                      onChange: () => {
                        if (sessionErrors.scheduledFor) clearSessionErrors("scheduledFor");
                      },
                    })}
                  />
                </div>
                {sessionErrors.scheduledFor && (
                  <p className="text-xs text-[#FF5A1F] flex items-center gap-1.5 mt-1 font-medium" role="alert">
                    <span>⚠</span> {sessionErrors.scheduledFor.message}
                  </p>
                )}
              </div>

              {/* Capacity with Steppers */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-capacity"
                  className="block text-xs font-semibold text-neutral-300"
                >
                  Capacity (Default 20, Range 1–100)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, Number(currentCapacity) - 1);
                      setSessionValue("capacity", next, { shouldValidate: true });
                    }}
                    disabled={isCreatingSession || Number(currentCapacity) <= 1}
                    className="w-11 h-11 rounded-xl bg-[#15151C] border border-white/10 hover:border-white/30 text-white flex items-center justify-center transition-colors disabled:opacity-40"
                    aria-label="Decrease capacity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    id="admin-capacity"
                    type="number"
                    min="1"
                    max="100"
                    disabled={isCreatingSession}
                    className={`flex-1 h-11 px-3.5 text-center font-mono font-bold rounded-xl bg-[#15151C] border text-white text-sm focus:outline-none transition-all ${
                      sessionErrors.capacity
                        ? "border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
                        : "border-white/10 focus:border-[#C8FF2E] focus:ring-1 focus:ring-[#C8FF2E]"
                    }`}
                    {...registerSession("capacity", {
                      required: "Capacity is required.",
                      min: { value: 1, message: "Capacity must be at least 1." },
                      max: { value: 100, message: "Capacity cannot exceed 100." },
                      onChange: () => {
                        if (sessionErrors.capacity) clearSessionErrors("capacity");
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(100, Number(currentCapacity) + 1);
                      setSessionValue("capacity", next, { shouldValidate: true });
                    }}
                    disabled={isCreatingSession || Number(currentCapacity) >= 100}
                    className="w-11 h-11 rounded-xl bg-[#15151C] border border-white/10 hover:border-white/30 text-white flex items-center justify-center transition-colors disabled:opacity-40"
                    aria-label="Increase capacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {sessionErrors.capacity && (
                  <p className="text-xs text-[#FF5A1F] flex items-center gap-1.5 mt-1 font-medium" role="alert">
                    <span>⚠</span> {sessionErrors.capacity.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <MagneticButton
                  type="submit"
                  disabled={isCreatingSession}
                  variant="volt"
                  size="md"
                  className="w-full flex items-center justify-center font-bold"
                >
                  {isCreatingSession ? "Creating Session..." : "Publish Session"}
                </MagneticButton>
              </div>
            </form>
          </GlowCard>

          {/* 2. Check-In Terminal Card */}
          <GlowCard className="p-6 sm:p-7 border-white/[0.08] space-y-5 relative overflow-hidden">
            {/* Terminal Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8FF2E] to-transparent opacity-60" />

            <div className="space-y-1 border-b border-white/[0.08] pb-3">
              <span className="text-[11px] font-mono text-[#3DD8FF] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5" />
                02 · FRONT DESK VERIFICATION
              </span>
              <h2 className="text-xl font-black font-display text-white uppercase tracking-tight">
                Check-In Scanner
              </h2>
              <p className="text-xs text-neutral-400">
                Enter the member&apos;s 8-character passcode to mark attendance
              </p>
            </div>

            {checkInFeedback && (
              <Banner
                type={checkInFeedback.type}
                text={checkInFeedback.text}
                onDismiss={() => setCheckInFeedback(null)}
              />
            )}

            <form onSubmit={handleCheckInSubmit(onCheckIn)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-checkInCode"
                  className="block text-xs font-semibold text-neutral-300"
                >
                  Passcode (8 characters)
                </label>
                <div className="relative">
                  <input
                    id="admin-checkInCode"
                    type="text"
                    placeholder="e.g. 7F3B9A1C"
                    maxLength={16}
                    disabled={isCheckingIn}
                    className={`w-full h-12 px-4 rounded-xl bg-[#15151C] border text-white font-mono uppercase text-lg tracking-widest placeholder:text-neutral-600 focus:outline-none transition-all ${
                      checkInErrors.code
                        ? "border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
                        : "border-white/10 focus:border-[#C8FF2E] focus:ring-1 focus:ring-[#C8FF2E]"
                    }`}
                    {...registerCheckIn("code", {
                      required: "Passcode is required.",
                      minLength: { value: 6, message: "Code must be at least 6 characters." },
                      onChange: () => {
                        if (checkInErrors.code) clearCheckInErrors("code");
                      },
                    })}
                  />
                </div>
                {checkInErrors.code && (
                  <p className="text-xs text-[#FF5A1F] flex items-center gap-1.5 mt-1 font-medium" role="alert">
                    <span>⚠</span> {checkInErrors.code.message}
                  </p>
                )}
                <p className="text-[11px] text-neutral-500 pt-1 font-sans">
                  * Check-in is valid during the 1-hour window of the active session.
                </p>
              </div>

              <div className="pt-2">
                <MagneticButton
                  type="submit"
                  disabled={isCheckingIn}
                  variant="volt"
                  size="md"
                  className="w-full flex items-center justify-center font-bold"
                >
                  {isCheckingIn ? "Verifying..." : "Verify & Mark Attended"}
                </MagneticButton>
              </div>
            </form>
          </GlowCard>
        </div>

        {/* Right Column (7 Cols) - Attendee Roster */}
        <div className="lg:col-span-7">
          <GlowCard className="p-6 sm:p-7 border-white/[0.08] space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header & Session Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#C8FF2E] font-bold tracking-widest uppercase">
                    03 · ROSTER
                  </span>
                  <h2 className="text-xl font-black font-display text-white uppercase tracking-tight">
                    Attendee List
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Live roster of confirmed and waitlisted members
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="admin-select-session"
                    className="text-xs font-semibold text-neutral-400 shrink-0"
                  >
                    Session:
                  </label>
                  <select
                    id="admin-select-session"
                    value={selectedSessionId || ""}
                    onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                    className="bg-[#15151C] border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#C8FF2E] max-w-[220px]"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0E0E13]">
                        #{s.id} · {formatDate(s.scheduledFor)} ({s.seatsRemaining} left)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Session Summary Chips */}
              {selectedSession && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#15151C]/60 rounded-xl border border-white/[0.06] text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Session ID</span>
                    <span className="font-mono font-bold text-white">#{selectedSession.id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Scheduled</span>
                    <span className="font-semibold text-white">{formatDate(selectedSession.scheduledFor)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Capacity</span>
                    <span className="font-mono font-bold text-white">{selectedSession.capacity} spots</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Remaining</span>
                    <span className="font-mono font-bold text-[#C8FF2E]">{selectedSession.seatsRemaining} spots</span>
                  </div>
                </div>
              )}

              {/* Bookings Error */}
              {bookingsError && (
                <Banner
                  type="error"
                  text={bookingsError}
                  onDismiss={() => setBookingsError("")}
                />
              )}

              {/* Loading Attendees */}
              {loadingBookings && (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="w-32 h-4" />
                          <Skeleton className="w-44 h-3" />
                        </div>
                      </div>
                      <Skeleton className="w-20 h-6 rounded-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty Attendees */}
              {!loadingBookings && !bookingsError && sessionBookings.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl space-y-2">
                  <Users className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-sm font-semibold text-white">No Attendees Yet</p>
                  <p className="text-xs text-neutral-400">
                    No members have booked a spot for this session yet.
                  </p>
                </div>
              )}

              {/* Attendees List */}
              {!loadingBookings && !bookingsError && sessionBookings.length > 0 && (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {sessionBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl bg-[#15151C]/50 border border-white/[0.06] hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C8FF2E]/10 border border-[#C8FF2E]/30 text-[#C8FF2E] flex items-center justify-center font-display font-black text-xs shrink-0">
                          {getInitials(b.user?.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{b.user?.name || "Member"}</span>
                            <span className="text-[10px] font-mono text-neutral-500">#{b.id}</span>
                          </div>
                          <span className="text-[11px] text-neutral-400 block font-sans">
                            {b.user?.email || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                        <span className="text-[11px] font-mono text-neutral-500">
                          {new Date(b.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};
