import { Role, WorkStatus } from "@prisma/client";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openStatuses } from "@/lib/status";

export default async function DashboardPage() {
  await requireUser([Role.OWNER, Role.MANAGER, Role.REVIEWER, Role.VIEWER]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const [clients, openTasks, overdue, dueThisWeek, reviewPending, staff, fees, tasks] = await Promise.all([
    prisma.client.count({ where: { status: "Active" } }),
    prisma.task.count({ where: { status: { in: openStatuses } } }),
    prisma.task.count({ where: { status: { in: openStatuses }, dueDate: { lt: today } } }),
    prisma.task.count({ where: { status: { in: openStatuses }, dueDate: { gte: today, lte: weekEnd } } }),
    prisma.task.count({ where: { status: { in: [WorkStatus.PREPARED, WorkStatus.UNDER_REVIEW, WorkStatus.CORRECTION_REQUIRED] } } }),
    prisma.staff.count({ where: { active: true } }),
    prisma.fee.aggregate({ _sum: { outstandingAmount: true } }),
    prisma.task.findMany({
      where: { status: { in: openStatuses } },
      orderBy: [{ dueDate: "asc" }],
      take: 12,
      include: { client: true, service: true, assignedStaff: true }
    })
  ]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">System should work, not only people</p>
          <h1>Dashboard</h1>
        </div>
      </header>
      <div className="grid kpi-grid">
        <KpiCard label="Active clients" value={clients} sub="Live client master" />
        <KpiCard label="Open tasks" value={openTasks} sub="Office work register" />
        <KpiCard label="Due this week" value={dueThisWeek} sub="Next 7 days" />
        <KpiCard label="Overdue" value={overdue} sub="Escalation required" />
        <KpiCard label="Review pending" value={reviewPending} sub="Maker-checker queue" />
        <KpiCard label="Staff" value={staff} sub="Active users" />
        <KpiCard label="Fees receivable" value={`₹${Number(fees._sum.outstandingAmount || 0).toLocaleString("en-IN")}`} sub="Pending collection" />
        <KpiCard label="Today" value={today.toLocaleDateString("en-IN")} sub="Current work date" />
      </div>

      <section className="table-shell" style={{ marginTop: 18 }}>
        <div className="table-header">
          <h2>Priority Work Queue</h2>
          <p className="muted">Open work ordered by due date.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Due</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th>Staff</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.dueDate.toLocaleDateString("en-IN")}</td>
                <td>{task.client.name}</td>
                <td>{task.service.name}</td>
                <td><StatusBadge value={task.status} /></td>
                <td>{task.assignedStaff?.name || "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
