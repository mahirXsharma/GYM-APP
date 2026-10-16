import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingsApi, type BookingItem, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const formatDate = (isoString?: string) => {
    if (!isoString) return { dateStr: "N/A", timeStr: "" };
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-neutral-800 bg-neutral-900 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Bookings</h1>
            <p className="text-sm text-neutral-400 mt-1">
              View your reserved sessions, attendance passcodes, and waitlists.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/sessions">
              <Button className="bg-white text-black hover:bg-neutral-200 text-xs font-semibold">
                Browse Sessions
              </Button>
            </Link>
          </div>
        </div>

        {feedback && (
          <div
            role="alert"
            className={`p-4 rounded-md border text-sm flex items-start justify-between gap-2 ${
              feedback.type === "success"
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

        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveOnly(false)}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                !activeOnly
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              All Bookings ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveOnly(true)}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                activeOnly
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Active Only
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            disabled={loading}
            className="text-xs border-neutral-700 bg-neutral-800 text-neutral-300"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {loading && bookings.length === 0 && (
          <div className="text-center py-12 border border-neutral-800 bg-neutral-900 rounded-lg">
            <p className="text-sm text-neutral-400">Loading your bookings...</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-6 rounded-lg border border-red-800 bg-red-950/30 text-center space-y-3"
          >
            <p className="text-sm text-red-300 font-semibold">{error}</p>
            <Button
              onClick={fetchBookings}
              className="bg-white text-black hover:bg-neutral-200 text-xs font-semibold"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-12 border border-dashed border-neutral-800 bg-neutral-900/50 rounded-lg space-y-3">
            <h2 className="text-base font-semibold text-white">No Bookings Found</h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {activeOnly
                ? "You do not have any active confirmed or waitlisted bookings."
                : "You have not made any bookings yet."}
            </p>
            <Link to="/sessions">
              <Button className="bg-white text-black hover:bg-neutral-200 text-xs font-semibold">
                Explore Available Sessions
              </Button>
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const { dateStr, timeStr } = formatDate(booking.session?.scheduledFor);
              const isConfirmed = booking.status === "CONFIRMED";
              const isWaitlist = booking.status === "WAITING_LIST";
              const isAttended = booking.status === "ATTENDED";
              const isCancelled = booking.status === "CANCELLED";
              const canCancel = isConfirmed || isWaitlist;
              const isCancelling = cancellingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className={`border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 ${
                    isConfirmed
                      ? "border-emerald-800/80"
                      : isWaitlist
                      ? "border-amber-800/80"
                      : "border-neutral-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {isConfirmed && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                          Confirmed Spot
                        </span>
                      )}
                      {isWaitlist && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">
                          On Waitlist
                        </span>
                      )}
                      {isAttended && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800">
                          Attended ✓
                        </span>
                      )}
                      {isCancelled && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-800 text-neutral-400">
                          Cancelled
                        </span>
                      )}
                      <span className="text-xs text-neutral-400">Booking #{booking.id}</span>
                      {booking.user?.name && (
                        <span className="text-xs text-neutral-300 font-medium">
                          • Member: {booking.user.name} ({booking.user.email})
                        </span>
                      )}
                    </div>

                    <div className="text-lg font-bold text-white">
                      {dateStr} at {timeStr}
                    </div>

                    <p className="text-xs text-neutral-400">
                      {isWaitlist
                        ? "You are on the waitlist. If another member cancels, you will be automatically promoted."
                        : isAttended
                        ? "Attendance confirmed by admin."
                        : user?.isAdmin
                        ? "Member must provide their passcode at check-in."
                        : "Show your passcode to gym staff upon arrival."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
                    {!user?.isAdmin && isConfirmed && booking.code && (
                      <div className="bg-neutral-950 border border-emerald-700 px-3 py-2 rounded text-center">
                        <span className="text-[10px] uppercase font-semibold text-emerald-400 block">
                          Passcode
                        </span>
                        <span className="font-mono text-base font-bold text-white tracking-widest">
                          {booking.code}
                        </span>
                      </div>
                    )}

                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={isCancelling}
                        className="text-xs text-red-400 border-red-900/60 bg-neutral-950 hover:bg-red-950 hover:text-red-300"
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Booking"}
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
