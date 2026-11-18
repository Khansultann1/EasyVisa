const chat = document.querySelector(".chat-widget");
const chatBtn = document.querySelector(".whatsapp");
const whatsappNumber = "77714788264";

function openWhatsApp(message) {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    // Navigate in the current tab. window.open() after an awaited fetch is commonly
    // blocked by mobile and Instagram in-app browsers as an unsolicited popup.
    window.location.assign(url);
}

if (chatBtn && chat) {
    chatBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const isOpen = chat.style.display === "block";
        chat.style.display = isOpen ? "none" : "block";
        chatBtn.setAttribute("aria-expanded", String(!isOpen));
    });
}

// The quick-reply buttons in the NextVisa chat widget open a prefilled WhatsApp inquiry.
if (chat) {
    chat.querySelectorAll(".chat-buttons button").forEach((button) => {
        button.addEventListener("click", () => {
            const choice = button.textContent.trim();
            openWhatsApp(`Сәлеметсіз бе! ${choice} бойынша виза рәсімдеу туралы кеңес алғым келеді.`);
        });
    });
}

const form = document.getElementById("visaForm");

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const country = document.getElementById("country").value;
        const message = document.getElementById("message").value.trim();

        const whatsappMessage =
`Сәлеметсіз бе! NextVisa сайты арқылы өтінім қалдырғым келеді.

👤 Аты: ${name}
📱 Телефон: ${phone}
🌍 Виза бағыты: ${country}
📝 Қосымша ақпарат: ${message || "Жоқ"}

Өтінімімді қарап, кеңес беруіңізді сұраймын.`;

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : "";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Жіберілуде...";
        }

        try {
            const response = await fetch("https://nextvisa-api.onrender.com/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    phone,
                    country,
                    city: "Шымкент",
                    visaType: "Tourist",
                    message
                })
            });

            if (!response.ok) throw new Error("Application API unavailable");

            form.reset();
            alert("Өтінім қабылданды. WhatsApp ашылады — хабарламаңызды жіберу үшін Send батырмасын басыңыз.");
            openWhatsApp(whatsappMessage);
        } catch (error) {
            const proceed = window.confirm(
                "Сайттың өтінім сервері қазір жауап бермеді. Өтінімді WhatsApp арқылы жіберейік пе?"
            );
            if (proceed) openWhatsApp(whatsappMessage);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText || "Өтінім жіберу";
            }
        }
    });
}
