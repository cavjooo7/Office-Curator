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

export function isDone(status: WorkStatus) {
  return [WorkStatus.COMPLETED, WorkStatus.FILED_SUBMITTED, WorkStatus.CANCELLED].includes(status);
}
