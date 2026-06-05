"use server";

import { Priority } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createTask(formData: FormData) {
  const user = await requireUser();
  const clientId = String(formData.get("clientId"));
  const serviceId = String(formData.get("serviceId"));
  const [client, service, templates] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.checklistTemplate.findMany({ where: { serviceId }, orderBy: { sortOrder: "asc" } })
  ]);
  if (!client || !service) throw new Error("Client and service required.");
  const period = String(formData.get("period") || "Ad hoc");
  const dueDate = formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : new Date();
  await prisma.task.create({
    data: {
      clientId,
      serviceId,
      title: `${service.name} - ${client.name} - ${period}`,
      period,
      dueDate,
      assignedStaffId: String(formData.get("assignedStaffId") || "") || null,
      reviewerId: String(formData.get("reviewerId") || "") || null,
      priority: formData.get("priority") as Priority,
      timeEstimateHours: Number(formData.get("estimate") || service.estimatedHours || 1),
      checklistItems: {
        create: templates.map((item) => ({
          itemText: item.itemText,
          mandatory: item.mandatory
        }))
      }
    }
  });
  await prisma.auditLog.create({ data: { actorId: user.id, entityType: "Task", entityId: clientId, action: "CREATE_TASK" } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
