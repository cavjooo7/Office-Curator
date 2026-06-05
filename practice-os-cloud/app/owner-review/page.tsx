import { Role, WorkStatus } from "@prisma/client";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openStatuses } from "@/lib/status";

export default async function OwnerReviewPage() {
  await requireUser([Role.OWNER, Role.MANAGER, Role.REVIEWER]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [overdue, review, dataAwaited, highTimeClients, overloadedStaff, feeAlerts] = await Promise.all([
    prisma.task.findMany({ where: { status: { in: openStatuses }, dueDate: { lt: today } }, include: { client: true, service: true, assignedStaff: true }, take: 25, orderBy: { dueDate: "asc" } }),
    prisma.task.findMany({ where: { status: { in: [WorkStatus.PREPARED, WorkStatus.UNDER_REVIEW, WorkStatus.CORRECTION_REQUIRED] } }, include: { client: true, service: true, assignedStaff: true }, take: 25, orderBy: { dueDate: "asc" } }),
    prisma.task.count({ where: { status: WorkStatus.DATA_AWAITED } }),
    prisma.timeEntry.groupBy({ by: ["clientId"], _sum: { totalHours: true }, orderBy: { _sum: { totalHours: "desc" } }, take: 10 }),
    prisma.staff.findMany({ include: { assignedTasks: { where: { status: { in: openStatuses } } }, assignedClients: true }, take: 15 }),
    prisma.fee.findMany({ where: { actionRequired: { not: "Continue" } }, include: { client: true }, take: 15, orderBy: { outstandingAmount: "desc" } })
  ]);

  return (
    <>
      <header className="topbar"><div><p className="eyebrow">Owner cockpit</p><h1>Owner Review</h1></div></header>
      <div className="grid kpi-grid">
        <KpiCard label="Overdue" value={overdue.length} sub="Escalate today" />
        <KpiCard label="Needs review" value={review.length} sub="Maker-checker queue" />
        <KpiCard label="Data awaited" value={dataAwaited} sub="Client follow-ups" />
        <KpiCard label="Fee alerts" value={feeAlerts.length} sub="Discussion required" />
      </div>
      <div className="grid two" style={{ marginTop: 18 }}>
        <section className="table-shell">
          <div className="table-header"><h2>Overdue Work</h2></div>
          <table><thead><tr><th>Due</th><th>Client</th><th>Service</th><th>Staff</th><th>Status</th></tr></thead><tbody>{overdue.map((t) => <tr key={t.id}><td>{t.dueDate.toLocaleDateString("en-IN")}</td><td>{t.client.name}</td><td>{t.service.name}</td><td>{t.assignedStaff?.name || "Unassigned"}</td><td><StatusBadge value={t.status} /></td></tr>)}</tbody></table>
        </section>
        <section className="table-shell">
          <div className="table-header"><h2>Review Queue</h2></div>
          <table><thead><tr><th>Due</th><th>Client</th><th>Service</th><th>Staff</th><th>Status</th></tr></thead><tbody>{review.map((t) => <tr key={t.id}><td>{t.dueDate.toLocaleDateString("en-IN")}</td><td>{t.client.name}</td><td>{t.service.name}</td><td>{t.assignedStaff?.name || "Unassigned"}</td><td><StatusBadge value={t.status} /></td></tr>)}</tbody></table>
        </section>
      </div>
      <div className="grid two" style={{ marginTop: 18 }}>
        <section className="table-shell">
          <div className="table-header"><h2>High-Time Clients</h2></div>
          <table><thead><tr><th>Client ID</th><th>Hours</th></tr></thead><tbody>{highTimeClients.map((x) => <tr key={x.clientId}><td>{x.clientId}</td><td>{String(x._sum.totalHours || 0)}</td></tr>)}</tbody></table>
        </section>
        <section className="table-shell">
          <div className="table-header"><h2>Staff Load</h2></div>
          <table><thead><tr><th>Staff</th><th>Clients</th><th>Open tasks</th></tr></thead><tbody>{overloadedStaff.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.assignedClients.length}</td><td>{s.assignedTasks.length}</td></tr>)}</tbody></table>
        </section>
      </div>
    </>
  );
}
