import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Dabba Ledger</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tiffin ordering for Aunty&apos;s kitchen.
        </p>
      </div>

      {user ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <Link
            href="/order"
            className="rounded-md bg-neutral-900 px-3 py-2 text-center text-white"
          >
            Go to order page
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-neutral-900 px-3 py-2 text-center text-white"
        >
          Sign in with email
        </Link>
      )}
    </main>
  );
}
