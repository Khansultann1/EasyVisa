function showSchengenMenu(bot, chatId) {
    bot.sendMessage(
        chatId,
        "🇪🇺 Шенген визасының түрін таңдаңыз:",
        {
            reply_markup: {
                keyboard: [
                    ["🧳 Туристік"],
                    ["💼 Бизнес"],
                    ["🎓 Студент"],
                    ["👨‍👩‍👧 Family Visit"],
                    ["📝 Өтінім беру"],
                    ["🔙 Артқа"]
                ],
                resize_keyboard: true
            }
        }
    );
}

module.exports = {
    showSchengenMenu
};