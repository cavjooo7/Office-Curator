import { WorkStatus } from "@prisma/client";

export const openStatuses: WorkStatus[] = [
  WorkStatus.NOT_STARTED,
  WorkStatus.DATA_AWAITED,
  WorkStatus.IN_PROGRESS,
  WorkStatus.PREPARED,
  WorkStatus.UNDER_REVIEW,
  WorkStatus.CORRECTION_REQUIRED,
  WorkStatus.READY_FOR_SUBMISSION,
  WorkStatus.ON_HOLD
];

const doneStatuses: WorkStatus[] = [
  WorkStatus.COMPLETED,
  WorkStatus.FILED_SUBMITTED,
  WorkStatus.CANCELLED
];

export function isDone(status: WorkStatus) {
  return doneStatuses.includes(status);
}
