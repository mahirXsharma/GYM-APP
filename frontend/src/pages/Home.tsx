import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center space-y-6">
      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome to Gym Booking</h1>
        <p className="text-sm text-neutral-400">
          Book your workout slots, check in with your passcode, and manage your gym attendance.
        </p>
      </div>

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Logged in as <strong className="text-white">{user?.name}</strong> ({user?.email})
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/sessions">
              <Button className="bg-white text-black hover:bg-neutral-200">
                View Sessions
              </Button>
            </Link>
            <Link to="/my-bookings">
              <Button variant="outline" className="border-neutral-700 bg-neutral-900 text-white">
                My Bookings
              </Button>
            </Link>
            {user?.isAdmin && (
              <Link to="/admin">
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={logout} className="border-neutral-700 text-neutral-300">
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">Get started by logging in or creating a new account:</p>
          <div className="flex justify-center gap-3">
            <Link to="/login">
              <Button className="bg-white text-black hover:bg-neutral-200 font-semibold px-6">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="border-neutral-700 bg-neutral-900 text-white px-6">
                Register
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
