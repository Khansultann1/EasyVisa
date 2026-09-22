require("dotenv").config();
const session = require("express-session");
const authRoutes = require("./routes/auth");
const path = require("path");
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const countries = require("./data/countries");
const { saveApplication } = require("./services/applicationService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { startApplication } = require("./bot/application");
const { showMainMenu } = require("./bot/menu");
const { showCanadaMenu } = require("./bot/canada");
const { showUKMenu } = require("./bot/uk");
const { showAustraliaMenu } = require("./bot/australia");
const { showUSAMenu } = require("./bot/usa");
const { showKoreaMenu } = require("./bot/korea");
const { showSchengenMenu } = require("./bot/schengen");
require("./bots/clientBot");
const app = express();
const adminRoutes = require("./routes/admin");

app.use(express.json());
app.use(express.static(__dirname));
app.use(session({
    secret: "easyvisa_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    }
}));
const applicationRoutes = require("./routes/applications");

app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true,
});
const ADMIN_ID = Number(process.env.ADMIN_ID) || 7369655231;

console.log("ADMIN_ID =", ADMIN_ID);
const userState = {};

bot.onText(/\/start/, (msg) => {
    showMainMenu(bot, msg.chat.id);
});

bot.onText(/\/id/, (msg) => {
    bot.sendMessage(msg.chat.id, `Chat ID: ${msg.chat.id}`);
});
const STATUS_TEXT = {
    NEW: "🆕 Жаңа өтінім",
    ACCEPTED: "✅ Қабылданды",
    CALLED: "📞 Менеджер байланысқа шықты",
    PAID: "💳 Төлем қабылданды",
    DOCUMENTS: "📄 Құжат қабылданды",
    SUBMITTED: "🏛️ Консулдыққа тапсырылды",
    READY: "🎉 Виза дайын",
    REJECTED: "❌ Виза берілмеді"
};
bot.on("message", async (msg) => {

    const chatId = msg.chat.id;
        // 🔙 BACK BUTTON - FIRST PRIORITY

    if (msg.text === "🔙 Артқа") {

        console.log("🔙 BACK PRESSED");

        const country = userState[chatId]?.country;

        console.log("Current country:", country);
        console.log("Current step:", userState[chatId]?.step);

        delete userState[chatId];

        if (country === "Canada") {
            return showCanadaMenu(bot, chatId);
        }

        if (country === "UK") {
            return showUKMenu(bot, chatId);
        }

        if (country === "Australia") {
            return showAustraliaMenu(bot, chatId);
        }

        if (country === "USA") {
            return showUSAMenu(bot, chatId);
        }

        if (country === "Korea") {
            return showKoreaMenu(bot, chatId);
        }

        if (country === "Schengen") {
            return showSchengenMenu(bot, chatId);
        }

        return showMainMenu(bot, chatId);
    }
if (userState[chatId]?.step === "CHECK_STATUS") {

    console.log("Телефон:", msg.text);

    const apps = await prisma.application.findMany({
        select: {
            id: true,
            name: true,
            phone: true,
            country: true,
            visaType: true,
            status: true
        }
    });

    console.log(apps);

    const application = apps.find(
        app => app.phone.trim() === msg.text.trim()
    );

    console.log("FOUND:", application);

    if (!application) {
        delete userState[chatId];

        return bot.sendMessage(
            chatId,
            "❌ Бұл телефон нөмірі бойынша өтінім табылмады."
        );
    }

    delete userState[chatId];

    return bot.sendMessage(
        chatId,
`📋 NEXTVISA

👤 ${application.name}

🌍 Ел: ${application.country}

🛂 Виза: ${application.visaType}

📌 Статус: ${STATUS_TEXT[application.status] || application.status}

🆔 №${application.id}`);
}

// ---------------- BACK BUTTON ----------------


    // ---------------- CANADA ----------------
if (msg.text === "📋 Менің өтінімдерім") {

    userState[chatId] = {
        step: "CHECK_STATUS"
    };

    return bot.sendMessage(
        chatId,
`📱 Өтінім берген телефон нөміріңізді енгізіңіз.

Мысалы:
87714788264`
    );
}
const countryButtons = Object.values(countries).map(c => c.button);



const visaButtons = [
    "🧳 Туристік",
    "💼 Бизнес",
    "🎓 Студент",
    "👨‍👩‍👧 Family Visit",
    "📝 Өтінім беру",
    "📋 Менің өтінімдерім",
    "🔙 Артқа"
];

if (
    !countryButtons.includes(msg.text) &&
    !visaButtons.includes(msg.text) &&
    !userState[chatId]?.step
) {

    // Егер ел таңдалмаған болса ғана басты мәзірді көрсетеміз
    if (!userState[chatId]?.country) {
        return showMainMenu(bot, chatId);
    }

    // Ел таңдалған болса – қайтадан виза мәзірін көрсетеміз
    switch (userState[chatId].country) {

        case "Canada":
            return showCanadaMenu(bot, chatId);

        case "UK":
            return showUKMenu(bot, chatId);

        case "Australia":
            return showAustraliaMenu(bot, chatId);

        case "USA":
            return showUSAMenu(bot, chatId);

        case "Korea":
            return showKoreaMenu(bot, chatId);
    }
}
for (const key in countries) {

    if (msg.text === countries[key].button) {

        userState[chatId] = {
            country: key
        };

        switch (key) {

            case "Canada":
                return showCanadaMenu(bot, chatId);

            case "UK":
                return showUKMenu(bot, chatId);

            case "Australia":
                return showAustraliaMenu(bot, chatId);

            case "Korea":
                return showKoreaMenu(bot, chatId);

         case "USA":
                return showUSAMenu(bot, chatId);
                case "Schengen":
    return showSchengenMenu(bot, chatId);
        }

    }

}
// ---------------- VISA TYPE ----------------

if (
    msg.text &&
    (
        msg.text.includes("Туристік") ||
        msg.text.includes("Бизнес") ||
        msg.text.includes("Студент") ||
        msg.text.includes("Family Visit")
    )
) {

    const country = userState[chatId]?.country;

    console.log("========== VISA BUTTON ==========");
    console.log("TEXT:", msg.text);
    console.log("COUNTRY:", country);

    if (!country || !countries[country]) {
        console.log("❌ Country not found:", country);
        return showMainMenu(bot, chatId);
    }

    let visaType;
    let documents;

    if (msg.text.includes("Туристік")) {

        visaType = "Tourist";
        documents = countries[country].tourist.documents;

    } else if (msg.text.includes("Бизнес")) {

        visaType = "Business";
        documents = countries[country].business.documents;

    } else if (msg.text.includes("Студент")) {

        visaType = "Student";
        documents = countries[country].student.documents;

    } else if (msg.text.includes("Family Visit")) {

        visaType = "Family Visit";
        documents = countries[country].family.documents;
    }

    userState[chatId].visaType = visaType;

    console.log("VISA TYPE:", visaType);
    console.log("DOCUMENTS:", documents);

    const info = countries[country];

    const docs = documents
        .map(doc => `✅ ${doc}`)
        .join("\n");

    return bot.sendMessage(
        chatId,
`${info.flag} ${info.name} — ${visaType} визасы

📋 Қажетті құжаттар

${docs}

👇 Өтінім беру батырмасын басыңыз.`,
        {
            reply_markup: {
                keyboard: [
                    ["📝 Өтінім беру"],
                    ["🔙 Артқа"]
                ],
                resize_keyboard: true
            }
        }
    );
}


    // ---------------- APPLICATION ----------------

if (msg.text === "📝 Өтінім беру") {

    if (!userState[chatId]) return;

    userState[chatId].step = "name";

    startApplication(userState, chatId);

    return bot.sendMessage(
        chatId,
        "👤 Аты-жөніңізді енгізіңіз:"
    );
}

    // ---------------- NAME ----------------

    if (userState[chatId]?.step === "name") {

        userState[chatId].name = msg.text;
        userState[chatId].step = "phone";

        return bot.sendMessage(
            chatId,
            "📱 Телефон нөміріңіз:"
        );

    }

    // ---------------- PHONE ----------------

    if (userState[chatId]?.step === "phone") {

        userState[chatId].phone = msg.text;
        userState[chatId].step = "city";

        return bot.sendMessage(
            chatId,
            "🏙️ Қала:"
        );

    }

    // ---------------- CITY ----------------

    if (userState[chatId]?.step === "city") {

        userState[chatId].city = msg.text;

        const data = userState[chatId];

        try {

   const application = await saveApplication({
    country: data.country,
    visaType: data.visaType,
    name: data.name,
    phone: data.phone,
    telegramId: chatId,
    city: data.city,
});

    console.log(data);
console.log("Country:", data.country);
           const info = countries[data.country];
console.log("MANAGER TOKEN:", process.env.MANAGER_BOT_TOKEN);
console.log("ADMIN_ID:", process.env.ADMIN_ID);
const text =
`🆕 ЖАҢА ӨТІНІМ

🌍 Ел: ${info.flag} ${info.name}
📋 Виза: ${data.visaType}

👤 Аты: ${data.name}
📱 Телефон: ${data.phone}
🏙️ Қала: ${data.city}`;
console.log("Жіберілетін хабарлама:");
console.log(text);
            try {
console.log("MANAGER_BOT_TOKEN:", process.env.MANAGER_BOT_TOKEN);
console.log("ADMIN_ID:", process.env.ADMIN_ID);
    const result =await axios.post(
    `https://api.telegram.org/bot${process.env.MANAGER_BOT_TOKEN}/sendMessage`,
    {
        chat_id: process.env.ADMIN_ID,
        text,

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
                        text: "📄 Құжат қабылданды",
                        callback_data: `documents_${application.id}`
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
    console.log("Админге жіберілді!");
    console.log(result);
console.log("Message sent to chat:", result.data.result.chat.id);
} catch (err) {

    console.log("Админге жіберу қатесі:");

    console.log(err.response?.body || err);

}

            await bot.sendMessage(
                chatId,
                "✅ Өтінім қабылданды!\n\nМенеджер сізбен жақын арада хабарласады."
            );

        } catch (err) {

            console.error(err);

            await bot.sendMessage(
                chatId,
                "❌ Қате пайда болды."
            );

        }

        delete userState[chatId];

        return showMainMenu(bot, chatId);

    }
if (msg.text === "🏠 Басты мәзір") {

    delete userState[chatId];

    return showMainMenu(bot, chatId);

}
    // ---------------- BACK ----------------

    if (msg.text === "🔙 Артқа") {
        return showMainMenu(bot, chatId);
    }

});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});
app.get("/admin", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.sendFile(__dirname + "/admin/index.html");

});
bot.on("callback_query", async (query) => {

    console.log("BUTTON PRESSED");
    console.log(query);

    const data = query.data;
    const [status, id] = data.split("_");
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (chatId !== ADMIN_ID) {
        await bot.answerCallbackQuery(query.id, { text: "Only ADMIN can change status", show_alert: true });
        return;
    }
    let newStatus = "";

    switch (status) {

        case "accepted":
            newStatus = "ACCEPTED";
            break;

        case "called":
            newStatus = "CALLED";
            break;

        case "paid":
            newStatus = "PAID";
            break;

        case "documents":
            newStatus = "DOCUMENTS";
            break;

        case "submitted":
            newStatus = "SUBMITTED";
            break;

        case "ready":
            newStatus = "READY";
            break;

        case "rejected":
            newStatus = "REJECTED";
            break;

        default:
            return;
    }

    await prisma.application.update({
        where: {
            id: Number(id)
        },
        data: {
            status: newStatus
        }
    });

    await bot.answerCallbackQuery(query.id, {
        text: "Статус жаңартылды ✅"
    });
await prisma.applicationHistory.create({
        data: {
            applicationId: Number(id),
            status: newStatus
        }
    });

    const application = await prisma.application.findUnique({
    where: {
        id: Number(id)
    }
});

await bot.editMessageText(
`🆕 ЖАҢА ӨТІНІМ

👤 ${application.name}

🌍 ${application.country}

📞 ${application.phone}

🛂 ${application.visaType}

📌 Статус: ${newStatus}

🆔 #${application.id}`,
{
    chat_id: chatId,
    message_id: messageId,
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
});
app.listen(PORT, () => {
    console.log(`Server started: ${PORT}`);
});