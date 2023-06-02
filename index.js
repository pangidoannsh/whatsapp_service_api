const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios').default;
require('dotenv').config();

const api = axios.create({
    baseURL: process.env.BASE_URL,
    headers: {
        Authorization: "Bearer 430aa6cc-9878-4c25-b667-409db5744b90"
    }
})

const client = new Client({
    authStrategy: new LocalAuth()
});
const qrcode = require('qrcode-terminal');

function whatsappID(phone = "") {
    if (phone.charAt(0) === "0" || phone.charAt(0) === "+") {
        return "62" + phone.substring(1) + "@c.us"
    }
    else if (phone.charAt(0) === "6") {
        return phone + "@c.us"
    } else {
        return false
    }
}

// Listener Whatsapp
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
    setInterval(() => {
        api.get('/inbox').then(res => {
            res.data.length !== 0 ? console.log("Messages : ", res.data.map(data => ({ to: data.phone, message: data.message }))) : '';

            res.data.forEach(async inbox => {
                const chatId = whatsappID(inbox.phone);
                console.log(chatId);
                if (chatId) {
                    await client.sendMessage(chatId, inbox.message)
                    api.put(`/inbox/${inbox.id}`).catch(error => {
                        console.log("Gagal Update Status Inbox");
                    })
                }
            });
        }).catch(err => {
            console.log(err);
        })
    }, 5000);
});

client.on('message', message => {
    // console.log(message);
    switch (message.body.toLowerCase()) {
        case 'menu':
            message.reply(`Hello ${message._data?.notifyName ?? ''} this your Menu!`);
            break;
    }

});

client.initialize();


