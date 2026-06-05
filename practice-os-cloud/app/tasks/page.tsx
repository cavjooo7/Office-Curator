import { Priority, Role } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTask } from "./server-actions";

export default async function TasksPage() {
  await requireUser([Role.OWNER, Role.MANAGER, Role.REVIEWER]);
  const [tasks, clients, services, staff] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ dueDate: "asc" }],
      take: 100,
      include: { client: true, service: true, assignedStaff: true, reviewer: true }
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
    prisma.staff.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Manager desk</p>
          <h1>Tasks</h1>
        </div>
      </header>
      <section className="section">
        <h2>Create Task</h2>
        <form action={createTask} className="form">
          <div className="form-grid">
            <label>Client<select name="clientId">{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>Service<select name="serviceId">{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Period<input name="period" placeholder="Jun 2026 / FY 2025-26" /></label>
            <label>Due date<input name="dueDate" type="date" /></label>
            <label>Staff<select name="assignedStaffId"><option value="">Unassigned</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Reviewer<select name="reviewerId"><option value="">Owner</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Priority<select name="priority">{Object.values(Priority).map((p) => <option key={p}>{p}</option>)}</select></label>
            <label>Estimate hours<input name="estimate" type="number" step="0.25" defaultValue="1" /></label>
          </div>
          <button>Create Task</button>
        </form>
      </section>
      <section className="table-shell" style={{ marginTop: 18 }}>
        <div className="table-header">
          <h2>Task Register</h2>
          <p className="muted">Latest 100 tasks.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Due</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th>Staff</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.dueDate.toLocaleDateString("en-IN")}</td>
                <td>{task.client.name}</td>
                <td>{task.service.name}<br /><span className="muted">{task.period}</span></td>
                <td><StatusBadge value={task.status} /></td>
                <td>{task.assignedStaff?.name || "Unassigned"}</td>
                <td>{task.reviewer?.name || "Owner"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
