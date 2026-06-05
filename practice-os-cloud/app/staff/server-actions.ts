"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createStaff(formData: FormData) {
  const user = await requireUser();
  const staff = await prisma.staff.create({
    data: {
      name: String(formData.get("name")),
      initials: String(formData.get("initials") || ""),
      email: String(formData.get("email") || ""),
      roleTitle: String(formData.get("roleTitle") || ""),
      assignedGroups: String(formData.get("assignedGroups") || "").split(",").map((x) => x.trim()).filter(Boolean),
      assignedServices: String(formData.get("assignedServices") || "").split(",").map((x) => x.trim()).filter(Boolean)
    }
  });
  await prisma.auditLog.create({ data: { actorId: user.id, entityType: "Staff", entityId: staff.id, action: "CREATE_STAFF" } });
  revalidatePath("/staff");
}
