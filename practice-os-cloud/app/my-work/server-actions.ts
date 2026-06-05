"use server";

import { WorkStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateTaskStatus(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId"));
  const status = formData.get("status") as WorkStatus;

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { checklistItems: true } });
  if (!task) throw new Error("Task not found");
  if (status === WorkStatus.COMPLETED && task.checklistItems.some((item) => item.mandatory && !item.done)) {
    throw new Error("SOP blocked completion. Complete checklist or request reviewer exception.");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      completionDate: status === WorkStatus.COMPLETED ? new Date() : undefined
    }
  });
  await prisma.auditLog.create({
    data: { actorId: user.id, entityType: "Task", entityId: taskId, action: "STATUS_UPDATE", after: { status } }
  });
  revalidatePath("/my-work");
  revalidatePath("/dashboard");
}

export async function addTimeEntry(formData: FormData) {
  const user = await requireUser();
  if (!user.staffProfile) throw new Error("No staff profile linked to user.");
  const taskId = String(formData.get("taskId"));
  const hours = Number(formData.get("hours") || 0);
  if (!hours) throw new Error("Hours required.");
  await prisma.timeEntry.create({
    data: {
      staffId: user.staffProfile.id,
      clientId: String(formData.get("clientId")),
      serviceId: String(formData.get("serviceId")),
      taskId,
      workDate: new Date(),
      totalHours: hours,
      remarks: String(formData.get("remarks") || "")
    }
  });
  await prisma.task.update({ where: { id: taskId }, data: { actualTimeHours: { increment: hours } } });
  revalidatePath("/my-work");
  revalidatePath("/dashboard");
}
