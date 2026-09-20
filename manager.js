const STATUS_TEXT = {
    ACCEPTED: "✅ Қабылданды",
    CALLED: "📞 Байланыстым",
    PAID: "💳 Төлем алды",
    DOCUMENTS: "📄 Құжат қабылданды",
    SUBMITTED: "🏛️ Консулдыққа тапсырылды",
    READY: "🎉 Виза дайын",
    REJECTED: "❌ Бас тартты"
};
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const managerBot = new TelegramBot(process.env.MANAGER_BOT_TOKEN, {
    polling: true
});

console.log("✅ Manager Bot started");

managerBot.on("callback_query", async (query) => {

    const data = query.data;

    const [action, id] = data.split("_");

    let newStatus = "";

    switch (action) {

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

const application = await prisma.application.findUnique({
    where: {
        id: Number(id)
    }
});

    await managerBot.answerCallbackQuery(query.id, {
        text: "✅ Статус жаңартылды"
    });
await managerBot.editMessageText(
`🆕 ЖАҢА ӨТІНІМ

👤 ${application.name}

🌍 ${application.country}

📞 ${application.phone}

🛂 ${application.visaType}

📌 Статус: ${STATUS_TEXT[newStatus]}

🆔 #${application.id}`,
{
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,

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
});
    console.log(`Application #${id} -> ${newStatus}`);

});