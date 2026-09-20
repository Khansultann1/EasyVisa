const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();


// =======================================
// LOGIN
// POST /api/auth/login
// =======================================

router.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Логин және пароль енгізіңіз"
            });
        }

        const admin = await prisma.admin.findUnique({
            where: {
                username: username.trim()
            }
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Логин немесе пароль қате"
            });
        }

        const match = await bcrypt.compare(
            password,
            admin.password
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Логин немесе пароль қате"
            });
        }

        // Session
        req.session.user = {
            id: admin.id,
            username: admin.username,
            role: admin.role
        };

        res.json({
            success: true,
            user: req.session.user
        });

    } catch (error) {

        console.error(
            "❌ Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// =======================================
// CURRENT USER
// GET /api/auth/me
// =======================================

router.get("/me", (req, res) => {

    if (!req.session || !req.session.user) {

        return res.status(401).json({
            logged: false
        });
    }

    res.json({
        logged: true,
        user: req.session.user
    });
});


// =======================================
// LOGOUT
// GET /api/auth/logout
// =======================================

router.get("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "❌ Logout error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Logout error"
            });
        }

        res.redirect("/login");
    });
});


module.exports = router;