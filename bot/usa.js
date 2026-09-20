function showUSAMenu(bot, chatId) {
    bot.sendMessage(chatId, "🇺🇸 АҚШ визасы", {
        reply_markup: {
           keyboard: [
    ["🧳 Туристік", "💼 Бизнес"],
    ["👨‍👩‍👧 Family Visit", "🎓 Студент"],
    ["🔙 Артқа", "🏠 Басты мәзір"]
],
resize_keyboard: true
        }
    });
}

module.exports = {
    showUSAMenu
};