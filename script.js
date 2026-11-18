const chat = document.querySelector(".chat-widget");
const chatBtn = document.querySelector(".whatsapp");
const whatsappNumber = "77714788264";

function openWhatsApp(message) {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
            const response = await fetch("/api/applications", {
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

            alert("Өтінім қабылданды. WhatsApp арқылы хабарламаңызды да жібере аласыз.");
            openWhatsApp(whatsappMessage);
            form.reset();
        } catch (error) {
            // Keep the lead path usable if the static website cannot reach its CRM API.
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
