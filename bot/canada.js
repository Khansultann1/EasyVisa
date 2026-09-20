function showCanadaMenu(bot, chatId) {
    bot.sendMessage(
        chatId,
        "🇨🇦 Канада визасының түрін таңдаңыз:",
        {
            reply_markup: {
                keyboard: [
                    ["🧳 Туристік", "💼 Бизнес"],
                    ["👨‍👩‍👧 Family Visit", "🎓 Студент"],
                    ["🔙 Артқа", "🏠 Басты мәзір"]
                ],
                resize_keyboard: true
            }
        }
    );
}

module.exports = {
    showCanadaMenu
};