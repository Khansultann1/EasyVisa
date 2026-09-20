function showMainMenu(bot, chatId) {
    bot.sendMessage(
        chatId,
        "🌍 NextVisa визалық орталығына қош келдіңіз!\n\nҚажетті елді таңдаңыз:",
        {
            reply_markup: {
               keyboard: [
    ["🇨🇦 Канада", "🇬🇧 Ұлыбритания"],
    ["🇦🇺 Австралия", "🇰🇷 Корея"],
    ["🇪🇺 Шенген", "🇺🇸 АҚШ"],
    ["📋 Менің өтінімдерім"]
],
resize_keyboard: true
            }
        }
    );
}

module.exports = {
    showMainMenu
};