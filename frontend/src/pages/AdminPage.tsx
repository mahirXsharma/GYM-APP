import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { adminApi, sessionsApi, type SessionItem, type BookingItem, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const {
    register: registerSession,
    handleSubmit: handleSessionSubmit,
    reset: resetSessionForm,
    clearErrors: clearSessionErrors,
    formState: { errors: sessionErrors, isSubmitting: isCreatingSession },
  } = useForm<CreateSessionForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      capacity: 20,
    },
  });

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
        text: `Attendance verified successfully! Booking #${res.booking.id} marked as ATTENDED.`,
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
      return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return isoString;
    }
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border border-neutral-800 bg-neutral-900 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-400 text-black mb-1">
              Admin Portal
            </div>
            <h1 className="text-2xl font-bold text-white">Gym Administration</h1>
            <p className="text-xs text-neutral-400">
              Create workout sessions, view attendee rosters, and check in members.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={loadingSessions}
            className="text-xs border-neutral-700 bg-neutral-800 text-neutral-200"
          >
            {loadingSessions ? "Refreshing..." : "Refresh Sessions"}
          </Button>
        </div>

        {sessionsError && (
          <div
            role="alert"
            className="p-4 rounded-md bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center justify-between gap-2"
          >
            <div>
              <strong>Session Loading Error: </strong>
              <span>{sessionsError}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSessions}
              className="text-xs border-red-700 bg-red-900/40 text-white"
            >
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-neutral-800 bg-neutral-900 rounded-lg p-6 space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white">1. Create a Session</h2>
              <p className="text-xs text-neutral-400">Schedule a future date/time and capacity.</p>
            </div>

            {createFeedback && (
              <div
                role="alert"
                className={`p-3 rounded border text-xs flex items-start justify-between gap-2 ${
                  createFeedback.type === "success"
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-200"
                    : "bg-red-950/60 border-red-800 text-red-200"
                }`}
              >
                <div>
                  <strong>{createFeedback.type === "success" ? "Success: " : "Error: "}</strong>
                  <span>{createFeedback.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateFeedback(null)}
                  className="underline ml-auto"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleSessionSubmit(onCreateSession)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="admin-scheduledFor"
                  className="block text-xs font-semibold text-neutral-300 mb-1"
                >
                  Session Date & Time (Future)
                </label>
                <Input
                  id="admin-scheduledFor"
                  type="datetime-local"
                  disabled={isCreatingSession}
                  className={`bg-neutral-950 border-neutral-700 text-white text-sm ${
                    sessionErrors.scheduledFor ? "border-red-500" : ""
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
                {sessionErrors.scheduledFor && (
                  <p className="text-xs text-red-400 mt-1" role="alert">
                    ⚠ {sessionErrors.scheduledFor.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin-capacity"
                  className="block text-xs font-semibold text-neutral-300 mb-1"
                >
                  Capacity (Default 20)
                </label>
                <Input
                  id="admin-capacity"
                  type="number"
                  min="1"
                  max="100"
                  disabled={isCreatingSession}
                  className={`bg-neutral-950 border-neutral-700 text-white text-sm ${
                    sessionErrors.capacity ? "border-red-500" : ""
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
                {sessionErrors.capacity && (
                  <p className="text-xs text-red-400 mt-1" role="alert">
                    ⚠ {sessionErrors.capacity.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isCreatingSession}
                className="w-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs h-10"
              >
                {isCreatingSession ? "Creating Session..." : "Create Session"}
              </Button>
            </form>
          </div>

          <div className="border border-neutral-800 bg-neutral-900 rounded-lg p-6 space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white">3. Mark Who Turned Up</h2>
              <p className="text-xs text-neutral-400">Enter the member&apos;s 8-character passcode to mark attendance.</p>
            </div>

            {checkInFeedback && (
              <div
                role="alert"
                className={`p-3 rounded border text-xs flex items-start justify-between gap-2 ${
                  checkInFeedback.type === "success"
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-200"
                    : "bg-red-950/60 border-red-800 text-red-200"
                }`}
              >
                <div>
                  <strong>{checkInFeedback.type === "success" ? "Success: " : "Error: "}</strong>
                  <span>{checkInFeedback.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckInFeedback(null)}
                  className="underline ml-auto"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleCheckInSubmit(onCheckIn)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="admin-checkInCode"
                  className="block text-xs font-semibold text-neutral-300 mb-1"
                >
                  8-Character Passcode
                </label>
                <Input
                  id="admin-checkInCode"
                  type="text"
                  placeholder="e.g. 7F3B9A1C"
                  maxLength={16}
                  disabled={isCheckingIn}
                  className={`bg-neutral-950 border-neutral-700 text-white font-mono uppercase text-base h-11 tracking-wider ${
                    checkInErrors.code ? "border-red-500" : ""
                  }`}
                  {...registerCheckIn("code", {
                    required: "Passcode is required.",
                    minLength: { value: 6, message: "Code must be at least 6 characters." },
                    onChange: () => {
                      if (checkInErrors.code) clearCheckInErrors("code");
                    },
                  })}
                />
                {checkInErrors.code && (
                  <p className="text-xs text-red-400 mt-1" role="alert">
                    ⚠ {checkInErrors.code.message}
                  </p>
                )}
                <p className="text-[11px] text-neutral-400 mt-1">
                  * Check-in is valid during the 1-hour window of the active session.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isCheckingIn}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10"
              >
                {isCheckingIn ? "Verifying..." : "Mark as Attended"}
              </Button>
            </form>
          </div>
        </div>

        <div className="border border-neutral-800 bg-neutral-900 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">2. See a Session&apos;s Bookings</h2>
              <p className="text-xs text-neutral-400">Select a session to see who booked and their status.</p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="admin-select-session" className="text-xs font-semibold text-neutral-300">
                Session:
              </label>
              <select
                id="admin-select-session"
                value={selectedSessionId || ""}
                onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                className="bg-neutral-950 border border-neutral-700 text-white rounded px-2.5 py-1 text-xs"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session #{s.id} — {formatDate(s.scheduledFor)} ({s.seatsRemaining} spots left)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedSession && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-950 rounded border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-400 block">Session ID:</span>
                <span className="font-semibold text-white">#{selectedSession.id}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Scheduled:</span>
                <span className="font-semibold text-white">{formatDate(selectedSession.scheduledFor)}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Capacity:</span>
                <span className="font-semibold text-white">{selectedSession.capacity} spots</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Remaining:</span>
                <span className="font-semibold text-white">{selectedSession.seatsRemaining} spots</span>
              </div>
            </div>
          )}

          {loadingBookings && (
            <div className="text-center py-8 text-xs text-neutral-400">
              Loading session attendees...
            </div>
          )}

          {bookingsError && (
            <div role="alert" className="p-4 bg-red-950/40 border border-red-800 rounded text-xs text-center space-y-2">
              <p className="text-red-300">{bookingsError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedSessionId && fetchSessionBookings(selectedSessionId)}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          )}

          {!loadingBookings && !bookingsError && sessionBookings.length === 0 && (
            <div className="text-center py-8 border border-dashed border-neutral-800 rounded text-xs text-neutral-400">
              No bookings for this session yet.
            </div>
          )}

          {!loadingBookings && !bookingsError && sessionBookings.length > 0 && (
            <div className="overflow-x-auto border border-neutral-800 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Booking ID</th>
                    <th className="p-2.5">Member Name</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Booked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                  {sessionBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-800/50">
                      <td className="p-2.5 font-mono text-white font-semibold">#{b.id}</td>
                      <td className="p-2.5 font-medium text-white">{b.user?.name || "Member"}</td>
                      <td className="p-2.5 text-neutral-300">{b.user?.email || "—"}</td>
                      <td className="p-2.5">
                        {b.status === "CONFIRMED" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            CONFIRMED
                          </span>
                        )}
                        {b.status === "WAITING_LIST" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            WAITLIST
                          </span>
                        )}
                        {b.status === "ATTENDED" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                            ATTENDED ✓
                          </span>
                        )}
                        {b.status === "CANCELLED" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400">
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-neutral-400">
                        {new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
