import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "./server-actions";

export default async function ClientsPage() {
  await requireUser([Role.OWNER, Role.MANAGER, Role.REVIEWER, Role.VIEWER]);
  const [clients, groups, staff] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, include: { group: true, assignedStaff: true } }),
    prisma.clientGroup.findMany({ orderBy: { name: "asc" } }),
    prisma.staff.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);
  return (
    <>
      <header className="topbar"><div><p className="eyebrow">Client master</p><h1>Clients</h1></div></header>
      <section className="section">
        <h2>Add Client</h2>
        <form action={createClient} className="form">
          <div className="form-grid">
            <label>Code<input name="code" required /></label>
            <label>Name<input name="name" required /></label>
            <label>Group<select name="groupId"><option value="">Ungrouped</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
            <label>Constitution<input name="constitution" /></label>
            <label>Industry<input name="industryType" /></label>
            <label>GSTIN<input name="gstin" /></label>
            <label>City<input name="city" /></label>
            <label>Assigned staff<select name="assignedStaffId"><option value="">Unassigned</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          </div>
          <button>Add Client</button>
        </form>
      </section>
      <section className="table-shell" style={{ marginTop: 18 }}>
        <div className="table-header"><h2>Client Register</h2></div>
        <table>
          <thead><tr><th>Client</th><th>Group</th><th>Constitution</th><th>GSTIN</th><th>Staff</th></tr></thead>
          <tbody>{clients.map((c) => <tr key={c.id}><td>{c.name}<br /><span className="muted">{c.code}</span></td><td>{c.group?.name || "-"}</td><td>{c.constitution}</td><td>{c.gstin || "-"}</td><td>{c.assignedStaff?.name || "Unassigned"}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
