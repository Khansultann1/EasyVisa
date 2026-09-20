function showAustraliaMenu(bot, chatId) {

    bot.sendMessage(
        chatId,
`🇦🇺 Австралия

Виза түрін таңдаңыз:`,
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
    showAustraliaMenu
};