const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});
const qrcode = require('qrcode-terminal');

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});
client.on('authenticated', auth => {
    console.log("Login Berhasil, Whatsapp API Ready!");
})
client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    switch (message.body.toLowerCase()) {
        case 'menu':
            message.reply(`Hello ${message._data?.notifyName ?? ''} this your Menu!`);
            break;
    }
});

client.initialize();
