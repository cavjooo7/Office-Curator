"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function loginWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "");
  const headerStore = await headers();
  const origin = headerStore.get("origin") || "http://localhost:3000";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/dashboard`
    }
  });
}
