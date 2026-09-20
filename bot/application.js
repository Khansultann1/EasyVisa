function startApplication(userState, chatId) {
    if (!userState[chatId]) {
        userState[chatId] = {};
    }

    userState[chatId].step = "name";
}

module.exports = {
    startApplication
};