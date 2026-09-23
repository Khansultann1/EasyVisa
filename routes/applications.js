const express = require("express");
const router = express.Router();
const prisma = require("../database/prisma");
const axios = require("axios");
function requireAuth(req, res, next) {

    if (!req.session || !req.session.user) {

        return res.status(401).json({
            error: "Unauthorized"
        });

    }

    next();
}


function requireAdmin(req, res, next) {
    const role = String(req.session?.user?.role || "").toUpperCase();

    if (role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden: admin role required" });
    }

    next();
}
// CRM API authentication is applied after the public application submission route.
// =======================================
// Барлық өтінімдер
// GET /api/applications
// =======================================


router.get("/", async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        const safeApplications = applications.map(app => ({
    ...app,
    telegramId: app.telegramId
        ? app.telegramId.toString()
        : null
}));

res.json(safeApplications);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Server Error",
        });
    }
});

// =======================================
// Статистика
// GET /api/applications/stats/summary
// =======================================
router.get("/stats/summary", async (req, res) => {
    try {
        const total = await prisma.application.count();

        const newCount = await prisma.application.count({
            where: {
                status: "NEW",
            },
        });

        const accepted = await prisma.application.count({
    where: {
        status: "ACCEPTED",
    },
});

const called = await prisma.application.count({
    where: {
        status: "CALLED",
    },
});

const paid = await prisma.application.count({
    where: {
        status: "PAID",
    },
});

const documents = await prisma.application.count({
    where: {
        status: "DOCUMENTS",
    },
});

const submitted = await prisma.application.count({
    where: {
        status: "SUBMITTED",
    },
});

const ready = await prisma.application.count({
    where: {
        status: "READY",
    },
});

        const rejected = await prisma.application.count({
    where: {
        status: "REJECTED",
    },
});
        res.json({
    total,
    newCount,
    accepted,
    called,
    paid,
    documents,
    submitted,
    ready,
    rejected,
});

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Server Error",
        });
    }
});

// =======================================
// Бір өтінім
// GET /api/applications/:id
// =======================================
router.get("/:id", async (req, res) => {
    try {
        const application = await prisma.application.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
            });
        }

                res.json(
            JSON.parse(
                JSON.stringify(application, (key, value) =>
                    typeof value === "bigint"
                        ? value.toString()
                        : value
                )
            )
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Server Error",
        });
    }
});

// =======================================
// Статусты өзгерту
// PUT /api/applications/:id/status
// =======================================
router.put("/:id/status", requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        // 1. Өтінім статусын өзгерту
        const application = await prisma.application.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });

        // 2. Статус өзгерісін тарихқа сақтау
        await prisma.applicationHistory.create({
            data: {
                applicationId: id,
                status,
            },
        });

        // 3. BigInt-ті JSON үшін қауіпсіз форматқа келтіру
        const safeApplication = JSON.parse(
            JSON.stringify(application, (key, value) =>
                typeof value === "bigint"
                    ? value.toString()
                    : value
            )
        );

        res.json(safeApplication);

    } catch (error) {
        console.error("❌ Status change error:", error);

        res.status(500).json({
            error: "Server Error",
        });
    }
});

router.put("/:id/note", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { note } = req.body;

        const application = await prisma.application.update({
            where: { id },
            data: { note },
        });

        const safeApplication = JSON.parse(
            JSON.stringify(application, (key, value) =>
                typeof value === "bigint"
                    ? value.toString()
                    : value
            )
        );

        res.json(safeApplication);

    } catch (error) {
        console.error("❌ Note save error:", error);

        res.status(500).json({
            error: "Server Error",
        });
    }
});
// =======================================
// Өтінім тарихы
// GET /api/applications/:id/history
// =======================================
router.get("/:id/history", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const history = await prisma.applicationHistory.findMany({
            where: {
                applicationId: id,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        res.json(history);

    } catch (error) {
        console.error("❌ History error:", error);

        res.status(500).json({
            error: "Server Error",
        });
    }
});
// =======================================
// Сайттан жаңа өтінім
// POST /api/applications
// =======================================

router.post("/", async (req, res) => {
    try {

        const {
            name,
            phone,
            country,
            city,
            visaType,
            message
        } = req.body;

       const application = await prisma.application.create({
    data: {
        name,
        phone,
        country,
        city: city || "",
        visaType: visaType || "Tourist",
        message: message || "",
        status: "NEW"
    }
});

router.use(requireAuth);

try {

   await axios.post(
    `https://api.telegram.org/bot${process.env.MANAGER_BOT_TOKEN}/sendMessage`,
    {
        chat_id: process.env.ADMIN_ID,

        text:
`🆕 ЖАҢА ӨТІНІМ

👤 ${application.name}

🌍 ${application.country}

📞 ${application.phone}

🛂 ${application.visaType}

📝 ${application.message || "-"}

🆔 #${application.id}`,

        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "✅ Қабылданды",
                        callback_data: `accepted_${application.id}`
                    }
                ],
                [
                    {
                        text: "📞 Байланыстым",
                        callback_data: `called_${application.id}`
                    }
                ],
                [
                    {
                        text: "💳 Төлем алды",
                        callback_data: `paid_${application.id}`
                    }
                ],
                [
                    {
                        text: "📄 Құжат қабылданды",
                        callback_data: `documents_${application.id}`
                    }
                ],
                [
                    {
                        text: "🏛️ Консулдыққа тапсырылды",
                        callback_data: `submitted_${application.id}`
                    }
                ],
                [
                    {
                        text: "🎉 Виза дайын",
                        callback_data: `ready_${application.id}`
                    }
                ],
                [
                    {
                        text: "❌ Бас тартты",
                        callback_data: `rejected_${application.id}`
                    }
                ]
            ]
        }
    }
);

console.log("✅ Telegram OK");
} catch (err) {

    console.log(err.response?.data || err.message);

}

res.json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Server Error"
        });
    }
});
module.exports = router;