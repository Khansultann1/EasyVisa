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
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const country = document.getElementById("country").value;
        const message = document.getElementById("message").value;

        const text =
`📌 Жаңа өтінім

👤 Аты: ${name}

📱 Телефон: ${phone}

🌍 Виза: ${country}

📝 Қосымша ақпарат:
${message}`;

        const whatsappNumber = "77714788264";

        window.open(
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    });
}