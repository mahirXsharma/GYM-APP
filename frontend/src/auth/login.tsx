// src/auth/login.ts (or .tsx)
export async function loginUser(credentials: { email: string; password: string }) {
  console.log("Submitting login with:", credentials);
  
  // Example: send to backend
  // const res = await fetch("http://localhost:5000/api/login", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(credentials)
  // });
  // return await res.json();
}
