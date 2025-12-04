"use client"

import { useState } from "react";
import { loginWithEmail } from "../service/authService";
import Header from "./header";
import { useRouter } from "next/navigation";



export default function LoginScreen() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter()

  async function handleSubmit(e) {
    
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      setLoading('true')
      const user = await loginWithEmail(email,password)
      console.log("Logged in as:", user.email);
      router.push("/dashboard")
    }
    catch(e) {
      console.error(err);
      setError(err.message || "Failed to log in");
    } 
    finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen w-screen bg-white justify-center">

      <Header/>

        {/* FORM CONTENT */}
        <div className="mx-auto px-6 pt-16 pb-10 text-black min-w-md max-w-lg text-center justify-center">
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full rounded-md border border-indigo-200 bg-indigo-100 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>

          {/* Sign In button */}
          <button className="w-full mb-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-400"
            onClick={(e)=>handleSubmit(e)}
          >
            Sign In
          </button>

          {/* Links */}
          <button className="block text-left text-sm mb-2 hover:underline ">
            Forgot Password
          </button>
          <button className="block text-left text-sm hover:underline">Register</button>
        </div>
      </div>
  );
}
