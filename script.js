const chat = document.querySelector(".chat-widget");
const chatBtn = document.querySelector(".whatsapp");

if (chatBtn) {
    chatBtn.addEventListener("click", function (e) {
        e.preventDefault();

        if (chat.style.display === "block") {
            chat.style.display = "none";
        } else {
            chat.style.display = "block";
        }
    });
}
const form = document.getElementById("visaForm");

if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const country = document.getElementById("country").value;
        const message = document.getElementById("message").value;

        try {

            const response = await fetch("/api/applications", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name,
                    phone,
                    country,
                    city: "Шымкент",
                    visaType: "Tourist",
                    message

                })

            });

            if (!response.ok) {
                throw new Error("Server Error");
            }

            alert("✅ Өтінім сәтті жіберілді!");

            const text =
`📌 Жаңа өтінім

👤 Аты: ${name}

📱 Телефон: ${phone}

🌍 Виза: ${country}

📝 Қосымша ақпарат:
${message}`;

            window.open(
                `https://wa.me/77714788264?text=${encodeURIComponent(text)}`,
                "_blank"
            );

            form.reset();

        } catch (err) {

            console.error(err);

            alert("❌ Өтінімді жіберу мүмкін болмады.");

        }

    });

}