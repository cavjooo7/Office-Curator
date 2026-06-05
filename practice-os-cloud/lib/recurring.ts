import { addDays, endOfMonth, format, setDate, startOfMonth } from "date-fns";
import { Frequency, PrismaClient, Priority, WorkStatus } from "@prisma/client";

function periodFor(frequency: Frequency, baseDate: Date) {
  if (frequency === Frequency.YEARLY) return `FY ${baseDate.getFullYear()}-${String(baseDate.getFullYear() + 1).slice(2)}`;
  if (frequency === Frequency.QUARTERLY) return `${baseDate.getFullYear()} Q${Math.floor(baseDate.getMonth() / 3) + 1}`;
  if (frequency === Frequency.WEEKLY) return `Week ${format(baseDate, "I yyyy")}`;
  if (frequency === Frequency.DAILY) return format(baseDate, "dd MMM yyyy");
  return format(baseDate, "MMM yyyy");
}

function dueDateFor(day: number | null, baseDate: Date) {
  if (!day) return endOfMonth(baseDate);
  return setDate(startOfMonth(baseDate), Math.min(day, 28));
}

export async function generateRecurringTasks(prisma: PrismaClient, baseDate = new Date()) {
  const rules = await prisma.recurringRule.findMany({
    where: { active: true },
    include: { service: { include: { checklistTemplates: true, clientServices: { where: { active: true }, include: { client: true } } } } }
  });

  let created = 0;
  for (const rule of rules) {
    const period = periodFor(rule.frequency, baseDate);
    for (const clientService of rule.service.clientServices) {
      if (clientService.client.status !== "Active") continue;
      const dueDate = dueDateFor(rule.dueDay, baseDate);
      if (dueDate < addDays(baseDate, -3)) continue;
      const existing = await prisma.task.findFirst({
        where: { clientId: clientService.clientId, serviceId: rule.serviceId, period }
      });
      if (existing) continue;

      await prisma.task.create({
        data: {
          clientId: clientService.clientId,
          serviceId: rule.serviceId,
          title: `${rule.service.name} - ${clientService.client.name} - ${period}`,
          period,
          dueDate,
          internalReviewDueDate: rule.internalReviewDay ? dueDateFor(rule.internalReviewDay, baseDate) : null,
          assignedStaffId: clientService.assignedStaffId || clientService.client.assignedStaffId,
          reviewerId: clientService.reviewerId || clientService.client.reviewerId,
          priority: rule.service.riskLevel === "High" ? Priority.HIGH : Priority.MEDIUM,
          status: WorkStatus.NOT_STARTED,
          timeEstimateHours: clientService.estimatedHours || rule.service.estimatedHours,
          generatedByRuleId: rule.id,
          checklistItems: {
            create: rule.service.checklistTemplates.map((item) => ({
              itemText: item.itemText,
              mandatory: item.mandatory
            }))
          }
        }
      });
      created += 1;
    }
    await prisma.recurringRule.update({ where: { id: rule.id }, data: { lastGeneratedFor: period } });
  }

  return { created };
}
