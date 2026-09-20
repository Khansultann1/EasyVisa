const countries = {
    Canada: {
        flag: "🇨🇦",
        button: "🇨🇦 Канада",
        menu: "canada",
        name: "Канада",

        tourist: {
            documents: [
                "Паспорт",
                "Фото",
                "Банк анықтамасы",
                "Жұмыс орнынан анықтама"
            ]
        },

        business: {
            documents: [
                "Паспорт",
                "Фото",
                "Компаниядан шақырту",
                "Банк анықтамасы"
            ]
        },

        student: {
            documents: [
                "Паспорт",
                "Фото",
                "Оқуға қабылдау хаты",
                "Қаржылық құжаттар"
            ]
        },

        family: {
            documents: [
                "Паспорт",
                "Фото",
                "Шақыру хаты",
                "Туыстықты растайтын құжат"
            ]
        }
    },

    UK: {
        flag: "🇬🇧",
        button: "🇬🇧 Ұлыбритания",
        menu: "uk",
        name: "Ұлыбритания",

        tourist: {
            documents: [
                "Паспорт",
                "Фото",
                "Соңғы 6 ай банк көшірмесі"
            ]
        },

        business: {
            documents: [
                "Паспорт",
                "Фото",
                "Business Invitation"
            ]
        },

        student: {
            documents: [
                "Паспорт",
                "CAS Letter",
                "IELTS (қажет болса)"
            ]
        },

        family: {
            documents: [
                "Паспорт",
                "Invitation Letter",
                "Туыстық құжаттары"
            ]
        }
    },

    Australia: {
        flag: "🇦🇺",
        button: "🇦🇺 Австралия",
        menu: "australia",
        name: "Австралия",

        tourist: {
            documents: [
                "Паспорт",
                "Фото",
                "Банк анықтамасы"
            ]
        },

        business: {
            documents: [
                "Паспорт",
                "Компания шақыртуы"
            ]
        },

        student: {
            documents: [
                "Паспорт",
                "COE",
                "Қаржылық құжаттар"
            ]
        },

        family: {
            documents: [
                "Паспорт",
                "Invitation Letter"
            ]
        }
    },

    USA: {
        flag: "🇺🇸",
        button: "🇺🇸 АҚШ",
        menu: "usa",
        name: "АҚШ",

        tourist: {
            documents: [
                "Паспорт",
                "Фото 5×5",
                "DS-160",
                "Банк анықтамасы"
            ]
        },

        business: {
            documents: [
                "Паспорт",
                "DS-160",
                "Business Invitation"
            ]
        },

        student: {
            documents: [
                "Паспорт",
                "I-20",
                "SEVIS"
            ]
        },

        family: {
            documents: [
                "Паспорт",
                "Шақыру хаты"
            ]
        }
    },

    Korea: {
        flag: "🇰🇷",
        button: "🇰🇷 Корея",
        menu: "korea",
        name: "Корея",

        tourist: {
            documents: [
                "Паспорт",
                "Фото",
                "Банк анықтамасы"
            ]
        },

        business: {
            documents: [
                "Паспорт",
                "Компания шақыртуы"
            ]
        },

        student: {
            documents: [
                "Паспорт",
                "Admission Letter"
            ]
        },

        family: {
            documents: [
                "Паспорт",
                "Шақыру хаты"
            ]
        }
    }
    ,
Schengen: {
    flag: "🇪🇺",
    button: "🇪🇺 Шенген",
    menu: "schengen",
    name: "Шенген",

    tourist: {
        documents: [
            "Паспорт",
            "Фото",
            "Банк анықтамасы",
            "Жұмыс орнынан анықтама"
        ]
    },

    business: {
        documents: [
            "Паспорт",
            "Компания шақыртуы"
        ]
    },

    student: {
        documents: [
            "Паспорт",
            "Қабылдау хаты"
        ]
    },

    family: {
        documents: [
            "Паспорт",
            "Шақыру хаты"
        ]
    }
}
};

module.exports = countries;