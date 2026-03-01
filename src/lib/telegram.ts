export async function sendTelegramNotification(message: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn("Telegram configuration missing. Notification NOT sent:", message);
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML"
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            console.error("Telegram API error:", err);
        }
    } catch (err) {
        console.error("Failed to send Telegram notification:", err);
    }
}
