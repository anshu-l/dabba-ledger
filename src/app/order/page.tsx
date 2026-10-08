import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Placeholder — proves the auth gate works end to end.
// The middleware already redirects signed-out visitors to /login,
// this check is the defense-in-depth server-side copy of that rule.
export default async function OrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/order");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-xl font-semibold">You&apos;re verified 🎉</h1>
      <p className="text-sm text-neutral-500">
        Signed in as {user.email}. Meal ordering goes here next.
      </p>
    </main>
  );
}
