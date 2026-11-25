import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client that forwards the signed-in user's Clerk session
 * token. Supabase verifies it (Clerk third-party auth integration) and Row Level
 * Security restricts every query to rows where user_id = auth.jwt()->>'sub'.
 */
export async function createServerSupabase() {
  // Data-layer auth check: layouts alone don't protect pages in Next.js, so every
  // data access goes through here and redirects signed-out users to sign-in.
  const { getToken } = await auth.protect();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        return (await getToken()) ?? null;
      },
    },
  );
}
