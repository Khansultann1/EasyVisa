const express = require("express");
const router = express.Router();
const prisma = require("../database/prisma");
const axios = require("axios");

const VALID_STATUSES = new Set([
    "NEW", "ACCEPTED", "CALLED", "PAID", "DOCUMENTS", "SUBMITTED", "READY", "REJECTED"
]);

function requireAuth(req, res, next) {
    if (!req.session?.user) {
        return res.status(401).json({ error: "Unauthorized" });
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

function jsonSafe(value) {
    return JSON.parse(JSON.stringify(value, (key, item) =>
        typeof item === "bigint" ? item.toString() : item
    ));
}

// Public website submission. Persist first; Telegram notification is best-effort.
router.post("/", async (req, res) => {
    try {
        const { name, phone, country, city, visaType, message } = req.body || {};
        if (![name, phone, country].every(v => typeof v === "string" && v.trim())) {
            return res.status(400).json({ error: "name, phone and country are required" });
        }
        if (name.trim().length > 120 || phone.trim().length > 40 ||
            country.trim().length > 80 || String(city || "").length > 100 ||
            String(message || "").length > 2000) {
            return res.status(400).json({ error: "One or more fields exceed the allowed length" });
        }

        const application = await prisma.application.create({
            data: {
                name: name.trim(),
                phone: phone.trim(),
                country: country.trim(),
                city: String(city || "").trim(),
                visaType: String(visaType || "Tourist").trim().slice(0, 80),
                message: String(message || "").trim(),
                status: "NEW"
            }
        });

        let telegramNotified = false;
        if (process.env.MANAGER_BOT_TOKEN && process.env.ADMIN_ID) {
            const text =
`🆕 ЖАҢА ӨТІНІМ

👤 Аты: ${application.name}
📱 Телефон: ${application.phone}
🌍 Ел: ${application.country}
🛂 Виза: ${application.visaType}
🏙️ Қала: ${application.city || "-"}
📝 Ақпарат: ${application.message || "-"}
🆔 #${application.id}`;

            const statuses = [
                ["✅ Қабылданды", "accepted"],
                ["📞 Байланыстым", "called"],
                ["💳 Төлем алды", "paid"],
                ["📄 Құжат қабылданды", "documents"],
                ["🏛️ Консулдыққа тапсырылды", "submitted"],
                ["🎉 Виза дайын", "ready"],
                ["❌ Бас тартты", "rejected"]
            ];
            try {
                await axios.post(
                    `https://api.telegram.org/bot${process.env.MANAGER_BOT_TOKEN}/sendMessage`,
                    {
                        chat_id: process.env.ADMIN_ID,
                        text,
                        reply_markup: {
                            inline_keyboard: statuses.map(([label, key]) => [{
                                text: label,
                                callback_data: `${key}_${application.id}`
                            }])
                        }
                    },
                    { timeout: 8000 }
                );
                telegramNotified = true;
            } catch (telegramError) {
                console.error("Telegram notification failed:", telegramError.response?.data || telegramError.message);
            }
        } else {
            console.warn("Telegram notification skipped: manager bot configuration is missing");
        }

        return res.status(201).json({
            success: true,
            application: { id: application.id, status: application.status },
            telegramNotified
        });
    } catch (error) {
        console.error("Application submission failed:", error);
        return res.status(500).json({ error: "Unable to save application" });
    }
});

// All CRM read and management endpoints require an authenticated session.
router.use(requireAuth);

router.get("/", async (req, res) => {
    try {
        const applications = await prisma.application.findMany({ orderBy: { createdAt: "desc" } });
        res.json(jsonSafe(applications));
    } catch (error) {
        console.error("Applications list failed:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get("/stats/summary", async (req, res) => {
    try {
        const statuses = ["NEW", "ACCEPTED", "CALLED", "PAID", "DOCUMENTS", "SUBMITTED", "READY", "REJECTED"];
        const counts = await Promise.all(statuses.map(status =>
            prisma.application.count({ where: { status } })
        ));
        res.json({
            total: counts.reduce((sum, count) => sum + count, 0),
            ...Object.fromEntries(statuses.map((status, index) => [
                status === "NEW" ? "newCount" : status.toLowerCase(),
                counts[index]
            ]))
        });
    } catch (error) {
        console.error("Application stats failed:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get("/:id/history", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid application id" });
        const history = await prisma.applicationHistory.findMany({
            where: { applicationId: id },
            orderBy: { createdAt: "asc" }
        });
        res.json(jsonSafe(history));
    } catch (error) {
        console.error("Application history failed:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid application id" });
        const application = await prisma.application.findUnique({ where: { id } });
        if (!application) return res.status(404).json({ error: "Application not found" });
        res.json(jsonSafe(application));
    } catch (error) {
        console.error("Application lookup failed:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.put("/:id/status", requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body || {};
        if (!Number.isInteger(id) || id < 1 || !VALID_STATUSES.has(status)) {
            return res.status(400).json({ error: "Invalid application id or status" });
        }
        const application = await prisma.$transaction(async tx => {
            const updated = await tx.application.update({ where: { id }, data: { status } });
            await tx.applicationHistory.create({ data: { applicationId: id, status } });
            return updated;
        });
        res.json(jsonSafe(application));
    } catch (error) {
        console.error("Status update failed:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.put("/:id/note", requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { note } = req.body || {};
        if (!Number.isInteger(id) || id < 1 || (note !== null && typeof note !== "string")) {
            return res.status(400).json({ error: "Invalid application id or note" });
        }
        const application = await prisma.application.update({
            where: { id },
            data: { note: note === null ? null : note.slice(0, 2000) }
        });
        res.json(jsonSafe(application));
    } catch (error) {
        console.error("Note update failed:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
