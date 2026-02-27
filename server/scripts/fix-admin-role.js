import prisma from "../config/prisma.js";

const result = await prisma.user.updateMany({
  where: { email: "admin@finbridge.com" },
  data: { role: "ADMIN" },
});

console.log("Rows updated:", result.count);

if (result.count === 0) {
  console.log(
    "No user found with admin@finbridge.com — register the account first, then it will get ADMIN role automatically.",
  );
} else {
  console.log("✅ admin@finbridge.com role set to ADMIN successfully.");
}

await prisma.$disconnect();
process.exit(0);
