const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "your_custom_token";

// Xác nhận webhook với Facebook
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Xử lý tin nhắn từ Messenger
app.post("/webhook", (req, res) => {
    let body = req.body;

    if (body.object === "page") {
        body.entry.forEach(entry => {
            let webhookEvent = entry.messaging[0];
            let senderID = webhookEvent.sender.id;

            if (webhookEvent.message) {
                handleMessage(senderID, webhookEvent.message);
            }
        });
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// Gửi tin nhắn phản hồi
const PAGE_ACCESS_TOKEN = "your_page_access_token";
const request = require("request");

function handleMessage(senderID, receivedMessage) {
    let response = { text: "Bạn đã gửi: " + receivedMessage.text };

    request({
        url: `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        method: "POST",
        json: {
            recipient: { id: senderID },
            message: response
        }
    }, (error, res, body) => {
        if (error) {
            console.error("Error sending message: ", error);
        }
    });
}

// Chạy server
app.listen(443, () => console.log("Server is running on port 443"));
