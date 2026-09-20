const bcrypt = require("bcryptjs");
const prisma = require("./database/prisma");

async function createAdmin() {
    try {
        const username = "admin";
        const password = "NextVisa2026";

        const existingAdmin = await prisma.admin.findUnique({
            where: {
                username
            }
        });

        if (existingAdmin) {
            console.log("⚠️ Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                role: "ADMIN"
            }
        });

        console.log("✅ Admin created");
        console.log("Username:", admin.username);
        console.log("Password:", password);

    } catch (error) {
        console.error("❌ Error creating admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();