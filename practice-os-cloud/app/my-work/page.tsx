import { WorkStatus } from "@prisma/client";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openStatuses } from "@/lib/status";
import { updateTaskStatus, addTimeEntry } from "./server-actions";

export default async function MyWorkPage() {
  const user = await requireUser();
  const staffId = user.staffProfile?.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const tasks = staffId
    ? await prisma.task.findMany({
        where: { assignedStaffId: staffId, status: { in: openStatuses } },
        orderBy: [{ dueDate: "asc" }],
        include: { client: true, service: true, checklistItems: true }
      })
    : [];

  const todayTasks = tasks.filter((task) => task.dueDate <= today);
  const weekTasks = tasks.filter((task) => task.dueDate > today && task.dueDate <= weekEnd);
  const reviewCorrections = tasks.filter((task) => task.status === WorkStatus.CORRECTION_REQUIRED);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Staff work desk</p>
          <h1>My Work</h1>
          <p className="muted">{user.name}</p>
        </div>
      </header>
      <div className="grid kpi-grid">
        <KpiCard label="Due today / overdue" value={todayTasks.length} sub="Move first" />
        <KpiCard label="Due this week" value={weekTasks.length} sub="Plan ahead" />
        <KpiCard label="Corrections" value={reviewCorrections.length} sub="Reviewer remarks" />
        <KpiCard label="Open tasks" value={tasks.length} sub="Assigned to you" />
      </div>

      <section className="table-shell" style={{ marginTop: 18 }}>
        <div className="table-header">
          <h2>Assigned Work</h2>
          <p className="muted">Update status and time from here.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Due</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th>Update</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.dueDate.toLocaleDateString("en-IN")}</td>
                <td>{task.client.name}</td>
                <td>{task.service.name}<br /><span className="muted">{task.period}</span></td>
                <td><StatusBadge value={task.status} /></td>
                <td>
                  <form action={updateTaskStatus} className="form">
                    <input type="hidden" name="taskId" value={task.id} />
                    <select name="status" defaultValue={task.status}>
                      {Object.values(WorkStatus).map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <button>Save</button>
                  </form>
                </td>
                <td>
                  <form action={addTimeEntry} className="form">
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="clientId" value={task.clientId} />
                    <input type="hidden" name="serviceId" value={task.serviceId} />
                    <input type="number" name="hours" step="0.25" placeholder="Hours" />
                    <input name="remarks" placeholder="Work note" />
                    <button>Add Time</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
