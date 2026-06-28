import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Idempotent seed. Creates the single owner account from bootstrap env vars.
 * Run via `npm run db:seed` (also invoked by `prisma migrate dev`).
 */
const url = process.env.DATABASE_URL;
const email = process.env.AUTH_BOOTSTRAP_EMAIL;
const passwordHash = process.env.AUTH_BOOTSTRAP_PASSWORD_HASH;

if (!url) throw new Error("DATABASE_URL is required to seed.");
if (!email || !passwordHash) {
  throw new Error(
    "AUTH_BOOTSTRAP_EMAIL and AUTH_BOOTSTRAP_PASSWORD_HASH are required to seed.",
  );
}

const db = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const user = await db.user.upsert({
    where: { email: email! },
    update: {},
    create: { email: email!, passwordHash: passwordHash!, role: "OWNER" },
    select: { id: true, email: true },
  });
  console.log(`Seeded owner account: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
