import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

function Home() {
  return (
    <div className="p-8 space-y-4 flex flex-col justify-center items-center mt-30">
      <h1 className="text-3xl font-bold">Welcome to Gym App</h1>
      <h2 className="text-lg text-muted-foreground">Get Started :</h2>
      <div className="flex gap-4">
        <Link to="/login">
          <Button>Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}

export default Home
