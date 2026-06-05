"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createClient(formData: FormData) {
  const user = await requireUser();
  const client = await prisma.client.create({
    data: {
      code: String(formData.get("code")),
      name: String(formData.get("name")),
      groupId: String(formData.get("groupId") || "") || null,
      constitution: String(formData.get("constitution") || ""),
      industryType: String(formData.get("industryType") || ""),
      gstin: String(formData.get("gstin") || ""),
      city: String(formData.get("city") || ""),
      assignedStaffId: String(formData.get("assignedStaffId") || "") || null
    }
  });
  await prisma.auditLog.create({ data: { actorId: user.id, entityType: "Client", entityId: client.id, action: "CREATE_CLIENT" } });
  revalidatePath("/clients");
}
