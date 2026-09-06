import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  const email = process.env.PLATFORM_ADMIN_EMAIL ?? "platform-admin@pos.local";
  const password = process.env.PLATFORM_ADMIN_PASSWORD ?? "change-me-please";
  const firstName = process.env.PLATFORM_ADMIN_FIRST_NAME ?? "Platform";
  const lastName = process.env.PLATFORM_ADMIN_LAST_NAME ?? "Admin";

  const organization = await prisma.organization.upsert({
    where: { slug: "platform" },
    update: {},
    create: { name: "Platform", slug: "platform", status: "APPROVED", approvedAt: new Date() },
  });

  const existingStore = await prisma.store.findFirst({ where: { organizationId: organization.id } });
  if (!existingStore) {
    await prisma.store.create({ data: { organizationId: organization.id, name: "Platform HQ" } });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, firstName, lastName, isPlatformAdmin: true },
    create: {
      organizationId: organization.id,
      email,
      passwordHash,
      firstName,
      lastName,
      role: "OWNER",
      isPlatformAdmin: true,
    },
  });

  console.log(`Platform admin ready: ${email}`);
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
