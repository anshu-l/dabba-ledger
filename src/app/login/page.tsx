"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/order";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {step === "email"
            ? "Enter your email — we'll send you a 6-digit code."
            : `Enter the code sent to ${email}.`}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <input
            type="email"
            required
            autoFocus
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            autoFocus
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-center text-lg tracking-[0.5em] outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-sm text-neutral-500 underline"
          >
            Use a different email
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
