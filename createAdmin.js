const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("Admin12345!", 10);

    const admin = await prisma.admin.upsert({
        where: {
            username: "admin"
        },
        update: {},
        create: {
            username: "admin",
            password: hashedPassword,
            role: "ADMIN"
        }
    });

    console.log("✅ Admin құрылды:");
    console.log(admin);

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
});