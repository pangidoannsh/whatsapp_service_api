const axios = require('axios').default;
const api = axios.create({
    baseURL: 'http://localhost:8000'
});

const { rmSync, readdir } = require('fs');
const pino = require('pino');
const {
    default: maWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    isJidBroadcast
} = require('baileys-md')
/**
 * connector the service to whatsapp
 */
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth');

    // ini Whatsapp Socket
    const client = maWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        shouldIgnoreJid: jid => isJidBroadcast(jid),
    })

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (connection === 'close') {
            switch (statusCode) {
                case DisconnectReason.loggedOut:
                    rmSync('./auth_info_baileys', { recursive: true, force: true })
                    console.log(`Device Logged Out, Please Scan Again.`);
                    break;
                case DisconnectReason.connectionClosed:
                    console.log("Connection closed, reconnecting....");
                    break;
                case DisconnectReason.connectionLost:
                    console.log("Connection Lost, reconnecting....");
                    break;
                default:
                    console.log("Connecting");
            }
            connectToWhatsApp();
        } else if (connection === 'open') {
            console.log(`Whatsapp ${client.user.id} Ready!`)
        }
    })

    client.ev.on('creds.update', saveCreds);

    client.ev.on('messages.upsert', async data => {
        const { pushName, key, message } = data.messages[0];
        const { remoteJid: jid, fromMe } = key;
        console.log(data.messages[0]);
        if (!fromMe) {
            const msgBody = message.conversation ?? message.extendedTextMessage.text;
            console.log('body : ', msgBody);
            switch (msgBody.toLowerCase()) {
                case 'menu':
                    const text = `Hi ${pushName} this your Menu!`
                    client.sendMessage(jid, { text }, { quoted: data.messages[0] })
                    break;
            }
            console.log("JID : ", jid);
            console.log("From : ", pushName);
            // console.log("Text : ", msgBody);
        }
    })
}


// run in main file
connectToWhatsApp()
