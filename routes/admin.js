const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();


// =======================================
// ADMIN AUTH CHECK
// =======================================

function requireAdmin(req, res, next) {

    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    if (req.session.user.role !== "ADMIN") {
        return res.status(403).json({
            error: "Forbidden"
        });
    }

    next();
}

router.use(requireAdmin);


// =======================================
// Барлық менеджерлер
// GET /api/admin/managers
// =======================================

router.get("/managers", async (req, res) => {

    try {

        const managers = await prisma.admin.findMany({
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json(managers);

    } catch (error) {

        console.error("❌ Managers error:", error);

        res.status(500).json({
            error: "Server Error"
        });
    }
});


// =======================================
// Жаңа менеджер қосу
// POST /api/admin/managers
// =======================================

router.post("/managers", async (req, res) => {

    try {

        const {
            username,
            password,
            name
        } = req.body;

        if (!username || !password) {

            return res.status(400).json({
                error: "Username және password міндетті"
            });
        }

        if (password.length < 6) {

            return res.status(400).json({
                error: "Пароль кемінде 6 таңба болуы керек"
            });
        }

        const existingManager =
            await prisma.admin.findUnique({
                where: {
                    username: username.trim()
                }
            });

        if (existingManager) {

            return res.status(409).json({
                error: "Бұл username бұрыннан бар"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const manager =
            await prisma.admin.create({
                data: {
                    username: username.trim(),
                    password: hashedPassword,
                    name: name || null,
                    role: "MANAGER",
                    isActive: true
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    role: true,
                    isActive: true,
                    createdAt: true
                }
            });

        res.status(201).json(manager);

    } catch (error) {

        console.error("❌ Manager create error:", error);

        res.status(500).json({
            error: "Server Error"
        });
    }
});


// =======================================
// Менеджерді қосу / өшіру
// PUT /api/admin/managers/:id/toggle
// =======================================

router.put("/managers/:id/toggle", async (req, res) => {

    try {

        const id = Number(req.params.id);

        const manager =
            await prisma.admin.findUnique({
                where: { id }
            });

        if (!manager) {

            return res.status(404).json({
                error: "Manager not found"
            });
        }

        if (manager.role === "ADMIN") {

            return res.status(400).json({
                error: "ADMIN аккаунтын өшіруге болмайды"
            });
        }

        const updated =
            await prisma.admin.update({
                where: { id },
                data: {
                    isActive: !manager.isActive
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    role: true,
                    isActive: true,
                    updatedAt: true
                }
            });

        res.json(updated);

    } catch (error) {

        console.error("❌ Manager toggle error:", error);

        res.status(500).json({
            error: "Server Error"
        });
    }
});


// =======================================
// Менеджерді өшіру
// DELETE /api/admin/managers/:id
// =======================================

router.delete("/managers/:id", async (req, res) => {

    try {

        const id = Number(req.params.id);

        const manager =
            await prisma.admin.findUnique({
                where: { id }
            });

        if (!manager) {

            return res.status(404).json({
                error: "Manager not found"
            });
        }

        if (manager.role === "ADMIN") {

            return res.status(400).json({
                error: "ADMIN аккаунтын өшіруге болмайды"
            });
        }

        await prisma.admin.delete({
            where: { id }
        });

        res.json({
            success: true
        });

    } catch (error) {

        console.error("❌ Manager delete error:", error);

        res.status(500).json({
            error: "Server Error"
        });
    }
});


module.exports = router;