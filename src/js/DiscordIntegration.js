export default async function SendDiscord(webhookURL, user, params, imageBlob) {
    const form = new FormData();

    const payload = {
        username: "Fucked Up Little Guy",
        avatar_url: "https://i.imgur.com/xjL0dqO.png",
        content: `## ${params.characterName.toUpperCase()}\n*${params.traitStr}*\n-# Pulled by ${user}\n-# [fuckeduplittleguy.com](https://fuckeduplittle.guy.com)`,
    };

    form.append("payload_json", JSON.stringify(payload));
    if (imageBlob) {
        form.append("file", imageBlob, `${params.characterName}.png`);
    }

    try {
        const response = await fetch(webhookURL, {
            method: "POST",
            body: form
        });

        if (!response.ok) {
            console.error("Discord webhook failed:", await response.text());
        }
    } catch (err) {
        console.error("Error sending webhook:", err);
    }
}