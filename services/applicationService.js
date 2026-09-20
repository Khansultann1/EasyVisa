const prisma = require("../database/prisma");

async function saveApplication(application) {
    return await prisma.application.create({
        data: {
    country: application.country,
    visaType: application.visaType,
    name: application.name,
    phone: application.phone,
    telegramId: application.telegramId,
    city: application.city,
    status: "NEW"
}
    });
}

async function getApplications() {
    return await prisma.application.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
}

async function getApplication(id) {
    return await prisma.application.findUnique({
        where: {
            id
        }
    });
}

async function updateStatus(id, status) {
    return await prisma.application.update({
        where: {
            id
        },
        data: {
            status
        }
    });
}

module.exports = {
    saveApplication,
    getApplications,
    getApplication,
    updateStatus
};