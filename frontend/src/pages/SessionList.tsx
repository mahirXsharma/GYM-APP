import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { sessionsApi, bookingsApi, type SessionItem, type BookingItem, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const SessionList = () => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [myBookings, setMyBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingInProgressId, setBookingInProgressId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const stateSnapshotRef = useRef<{ sessions: SessionItem[]; myBookings: BookingItem[] }>({
    sessions: [],
    myBookings: [],
  });

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

      stateSnapshotRef.current = {
        sessions: fetchedSessions,
        myBookings: fetchedBookings,
      };
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

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        dateStr: date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        timeStr: date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { dateStr: isoString, timeStr: "" };
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border border-neutral-800 bg-neutral-900 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Workout Sessions</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Select an upcoming session to reserve your spot (Max 20 participants).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/my-bookings">
              <Button variant="outline" className="text-xs border-neutral-700 bg-neutral-800 text-white">
                My Bookings ({myBookings.length})
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(false)}
              disabled={loading}
              className="text-xs border-neutral-700 bg-neutral-800 text-neutral-300"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {feedback && (
          <div
            role="alert"
            className={`p-4 rounded-md border text-sm flex items-start justify-between gap-2 ${feedback.type === "success"
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-200"
                : "bg-red-950/60 border-red-800 text-red-200"
              }`}
          >
            <div>
              <strong>{feedback.type === "success" ? "Success: " : "Notice: "}</strong>
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading && sessions.length === 0 && (
          <div className="text-center py-12 border border-neutral-800 bg-neutral-900 rounded-lg">
            <p className="text-sm text-neutral-400">Loading available sessions...</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-6 rounded-lg border border-red-800 bg-red-950/30 text-center space-y-3"
          >
            <p className="text-sm text-red-300 font-semibold">{error}</p>
            <Button
              onClick={() => loadData(false)}
              className="bg-white text-black hover:bg-neutral-200 text-xs font-semibold"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-12 border border-dashed border-neutral-800 bg-neutral-900/50 rounded-lg space-y-3">
            <h2 className="text-base font-semibold text-white">No upcoming sessions found</h2>
            <p className="text-xs text-neutral-400">Check back later or refresh to check for new slots.</p>
            <Button
              variant="outline"
              onClick={() => loadData(false)}
              className="text-xs border-neutral-700 text-neutral-300"
            >
              Check Again
            </Button>
          </div>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => {
              const { dateStr, timeStr } = formatDate(session.scheduledFor);
              const isFull = session.seatsRemaining <= 0;
              const isBookingThis = bookingInProgressId === session.id;

              const userBooking = myBookings.find(
                (b) => b.sessionId === session.id && (b.status === "CONFIRMED" || b.status === "WAITING_LIST")
              );
              const isConfirmed = userBooking?.status === "CONFIRMED";
              const isWaitlisted = userBooking?.status === "WAITING_LIST";

              return (
                <div
                  key={session.id}
                  className={`border rounded-lg p-5 flex flex-col justify-between bg-neutral-900 space-y-4 ${isConfirmed
                      ? "border-emerald-700 bg-emerald-950/20"
                      : isWaitlisted
                        ? "border-amber-700 bg-amber-950/20"
                        : "border-neutral-800"
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-400">{dateStr}</span>
                      {isConfirmed ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700 font-medium">
                          ✓ Booked
                        </span>
                      ) : isWaitlisted ? (
                        <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700 font-medium">
                          On Waitlist
                        </span>
                      ) : isFull ? (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-medium">
                          Full (Waitlist)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                          {session.seatsRemaining} spots left
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xl font-bold text-white">{timeStr}</div>
                      <p className="text-xs text-neutral-400 mt-0.5">Session #{session.id} • 60 Mins</p>
                    </div>

                    <div className="text-xs text-neutral-400 pt-1">
                      <span>Capacity: </span>
                      <strong className="text-white">
                        {session.capacity - session.seatsRemaining} / {session.capacity}
                      </strong>
                    </div>

                    {!user?.isAdmin && isConfirmed && userBooking?.code && (
                      <div className="pt-2 border-t border-emerald-800/40 text-xs">
                        <span className="text-emerald-400 font-semibold block">Your Passcode:</span>
                        <span className="font-mono text-base font-bold text-white tracking-wider">
                          {userBooking.code}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {isConfirmed ? (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full text-xs text-emerald-400 border-emerald-800 bg-emerald-950/30 cursor-not-allowed"
                      >
                        Reserved ✓
                      </Button>
                    ) : isWaitlisted ? (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full text-xs text-amber-400 border-amber-800 bg-amber-950/30 cursor-not-allowed"
                      >
                        Waitlist Active
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleBook(session)}
                        disabled={isBookingThis}
                        className={`w-full text-xs font-semibold ${isFull
                            ? "bg-neutral-800 text-amber-300 hover:bg-neutral-700 border border-neutral-700"
                            : "bg-white text-black hover:bg-neutral-200"
                          }`}
                      >
                        {isBookingThis
                          ? "Booking..."
                          : isFull
                            ? "Join Waiting List"
                            : "Book Spot"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};