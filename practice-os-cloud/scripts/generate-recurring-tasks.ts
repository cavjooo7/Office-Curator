import { prisma } from "../lib/prisma";
import { generateRecurringTasks } from "../lib/recurring";

generateRecurringTasks(prisma)
  .then((result) => {
    console.log(result);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
