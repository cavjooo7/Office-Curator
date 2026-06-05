import fs from "node:fs/promises";
import path from "node:path";
import { Frequency, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const source = path.resolve(process.cwd(), "..", "practice-os", "public", "app-data.json");

function frequency(value: string): Frequency {
  const text = value.toLowerCase();
  if (text.includes("daily")) return Frequency.DAILY;
  if (text.includes("weekly")) return Frequency.WEEKLY;
  if (text.includes("quarter")) return Frequency.QUARTERLY;
  if (text.includes("year")) return Frequency.YEARLY;
  if (text.includes("month")) return Frequency.MONTHLY;
  return Frequency.AS_NEEDED;
}

async function main() {
  const data = JSON.parse(await fs.readFile(source, "utf8"));
  const staffIdMap = new Map<number, string>();
  const groupIdMap = new Map<number, string>();
  const clientIdMap = new Map<number, string>();
  const serviceIdMap = new Map<number, string>();

  for (const group of data.groups) {
    const saved = await prisma.clientGroup.upsert({
      where: { name: group.name },
      update: { revenuePaLakhs: group.revenue_pa_lakhs },
      create: { name: group.name, revenuePaLakhs: group.revenue_pa_lakhs }
    });
    groupIdMap.set(group.id, saved.id);
  }

  for (const staff of data.staff) {
    const saved = await prisma.staff.upsert({
      where: { id: `local-staff-${staff.id}` },
      update: { name: staff.name, initials: staff.initials, roleTitle: staff.role, email: staff.email, active: staff.status !== "Inactive" },
      create: {
        id: `local-staff-${staff.id}`,
        name: staff.name,
        initials: staff.initials,
        roleTitle: staff.role,
        email: staff.email,
        active: staff.status !== "Inactive",
        assignedGroups: [],
        assignedServices: []
      }
    });
    staffIdMap.set(staff.id, saved.id);
  }

  for (const service of data.services) {
    const saved = await prisma.service.upsert({
      where: { name: service.name },
      update: {
        category: service.category,
        frequency: frequency(service.frequency),
        defaultDueRule: service.default_due_rule,
        estimatedHours: service.estimated_hours,
        standardFeeMin: service.standard_fee_min,
        standardFeeMax: service.standard_fee_max,
        riskLevel: service.risk_level
      },
      create: {
        name: service.name,
        category: service.category,
        frequency: frequency(service.frequency),
        defaultDueRule: service.default_due_rule,
        estimatedHours: service.estimated_hours,
        standardFeeMin: service.standard_fee_min,
        standardFeeMax: service.standard_fee_max,
        riskLevel: service.risk_level
      }
    });
    serviceIdMap.set(service.id, saved.id);
  }

  for (const item of data.checklistTemplates) {
    const serviceId = serviceIdMap.get(item.service_id);
    if (!serviceId) continue;
    await prisma.checklistTemplate.create({
      data: {
        serviceId,
        itemText: item.item_text,
        sortOrder: item.sort_order || 0,
        mandatory: Boolean(item.is_mandatory)
      }
    });
  }

  for (const client of data.clients) {
    const saved = await prisma.client.upsert({
      where: { code: client.client_code },
      update: {
        name: client.name,
        groupId: groupIdMap.get(client.group_id) || null,
        constitution: client.constitution,
        industryType: client.industry_type,
        gstin: client.gstin,
        city: client.city,
        status: client.status,
        booksMaintainedBy: client.books_maintained_by,
        assignedStaffId: staffIdMap.get(client.assigned_staff_id) || null,
        reviewerId: staffIdMap.get(client.reviewer_id) || null
      },
      create: {
        code: client.client_code,
        name: client.name,
        groupId: groupIdMap.get(client.group_id) || null,
        constitution: client.constitution,
        industryType: client.industry_type,
        gstin: client.gstin,
        city: client.city,
        status: client.status,
        booksMaintainedBy: client.books_maintained_by,
        billingCategory: client.billing_category || "Standard",
        assignedStaffId: staffIdMap.get(client.assigned_staff_id) || null,
        reviewerId: staffIdMap.get(client.reviewer_id) || null
      }
    });
    clientIdMap.set(client.id, saved.id);
  }

  for (const cs of data.clientServices) {
    const clientId = clientIdMap.get(cs.client_id);
    const serviceId = serviceIdMap.get(cs.service_id);
    if (!clientId || !serviceId) continue;
    await prisma.clientService.upsert({
      where: { clientId_serviceId: { clientId, serviceId } },
      update: {
        active: cs.status === "Active",
        assignedStaffId: staffIdMap.get(cs.assigned_staff_id) || null,
        reviewerId: staffIdMap.get(cs.reviewer_id) || null,
        estimatedHours: cs.estimated_hours,
        agreedFee: cs.agreed_fee
      },
      create: {
        clientId,
        serviceId,
        active: cs.status === "Active",
        assignedStaffId: staffIdMap.get(cs.assigned_staff_id) || null,
        reviewerId: staffIdMap.get(cs.reviewer_id) || null,
        estimatedHours: cs.estimated_hours,
        agreedFee: cs.agreed_fee
      }
    });
  }

  for (const fee of data.fees) {
    const clientId = clientIdMap.get(fee.client_id);
    if (!clientId) continue;
    await prisma.fee.upsert({
      where: { clientId },
      update: {
        monthlyRetainership: fee.monthly_retainership,
        yearlyCompliance: fee.yearly_compliance,
        outstandingAmount: fee.outstanding_amount,
        suggestedCategory: fee.suggested_category,
        suggestedFee: fee.suggested_fee,
        profitabilityScore: fee.profitability_score,
        actionRequired: fee.action_required
      },
      create: {
        clientId,
        monthlyRetainership: fee.monthly_retainership,
        yearlyCompliance: fee.yearly_compliance,
        outstandingAmount: fee.outstanding_amount,
        suggestedCategory: fee.suggested_category,
        suggestedFee: fee.suggested_fee,
        profitabilityScore: fee.profitability_score,
        actionRequired: fee.action_required
      }
    });
  }

  console.log("Cloud seed completed", {
    groups: groupIdMap.size,
    staff: staffIdMap.size,
    clients: clientIdMap.size,
    services: serviceIdMap.size
  });
}

main().finally(async () => prisma.$disconnect());
