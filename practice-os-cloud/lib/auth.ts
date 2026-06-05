import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function currentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.user_metadata?.name || user.email },
    create: {
      email: user.email,
      name: user.user_metadata?.name || user.email,
      role: user.email === process.env.PRACTICE_OS_OWNER_EMAIL ? Role.OWNER : Role.STAFF
    },
    include: { staffProfile: true }
  });
}

export async function requireUser(roles?: Role[]) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (roles?.length && !roles.includes(user.role)) redirect("/my-work");
  return user;
}
