import { Role } from "@prisma/client";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openStatuses } from "@/lib/status";
import { createStaff } from "./server-actions";

export default async function StaffPage() {
  await requireUser([Role.OWNER, Role.MANAGER, Role.REVIEWER]);
  const staff = await prisma.staff.findMany({
    orderBy: { name: "asc" },
    include: {
      assignedClients: true,
      assignedTasks: { where: { status: { in: openStatuses } } },
      reviewTasks: { where: { status: { in: ["PREPARED", "UNDER_REVIEW", "CORRECTION_REQUIRED"] } } }
    }
  });
  return (
    <>
      <header className="topbar"><div><p className="eyebrow">Team control</p><h1>Staff</h1></div></header>
      <section className="section">
        <h2>Add Staff</h2>
        <form action={createStaff} className="form">
          <div className="form-grid">
            <label>Name<input name="name" required /></label>
            <label>Initials<input name="initials" /></label>
            <label>Email<input name="email" /></label>
            <label>Role title<input name="roleTitle" /></label>
            <label>Assigned groups<input name="assignedGroups" placeholder="MG, CB, Bansal" /></label>
            <label>Assigned services<input name="assignedServices" placeholder="GST, TDS, Audit" /></label>
          </div>
          <button>Add Staff</button>
        </form>
      </section>
      <div className="grid kpi-grid" style={{ marginTop: 18 }}>
        {staff.slice(0, 8).map((s) => (
          <KpiCard
            key={s.id}
            label={s.name}
            value={s.assignedTasks.length}
            sub={`${s.assignedClients.length} clients | ${s.reviewTasks.length} reviews`}
          />
        ))}
      </div>
      <section className="table-shell" style={{ marginTop: 18 }}>
        <div className="table-header"><h2>Responsibility Matrix</h2></div>
        <table>
          <thead><tr><th>Staff</th><th>Role</th><th>Clients</th><th>Open tasks</th><th>Review pending</th><th>Status</th></tr></thead>
          <tbody>{staff.map((s) => <tr key={s.id}><td>{s.name}<br /><span className="muted">{s.email}</span></td><td>{s.roleTitle}</td><td>{s.assignedClients.length}</td><td>{s.assignedTasks.length}</td><td>{s.reviewTasks.length}</td><td><StatusBadge value={s.active ? "Active" : "Inactive"} /></td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
