"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const supabase = createClient();

export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
    setLoading(true);

    // Attempt to sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    //refresh the page

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const magicLink = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: {
        emailRedirectTo: "https://local.com/auth/callback",
      },
    });

    if (!data.user) {
      alert("You need to sign up first!");
    }

    if (error) {
      alert(error.message || error.message);
    } else {
      alert("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-gray-500">
              Enter your email and password below to login to your account
            </p>
          </div>

          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>

        {/* OAuth Providers */}
        <Button
          className="w-full px-4 my-3 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login with Google"}
        </Button>
   
        <Link className="text-center" href="/sign-up">Sign Up</Link>
    

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sign in via magic link with your email below
          </p>
          <form className="mt-3" onSubmit={magicLink}>
            <div className="mb-4">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                type="email"
                placeholder="Your email"
                value={magicEmail}
                required={true}
                onChange={(e) => setMagicEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Button
                className={`w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>Send magic link</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Link href="/forgot-password">Forgot your password?</Link>
    </div>
  );
}
