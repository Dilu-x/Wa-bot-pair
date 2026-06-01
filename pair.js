const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const {
    default: Shitsu_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    async function Shitsu_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_Shitsu_MD = Shitsu_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: Browsers.macOS('Chrome')
            });

            if (!Pair_Code_By_Shitsu_MD.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Shitsu_MD.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Shitsu_MD.ev.on('creds.update', saveCreds);
            Pair_Code_By_Shitsu_MD.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    
                    // Sending the Session ID first
                    let session = await Pair_Code_By_Shitsu_MD.sendMessage(Pair_Code_By_Shitsu_MD.user.id, { text: 'SHITSU-MD~' + b64data });

                    // Redesigned message without links
                    let Shitsu_MD_TEXT = `
╭═══════════════•◈•═══════════════╮
│      🌌 SHITSU MD CONNECTED 🌌      │
╰═══════════════•◈•═══════════════╯

✨ Your Session has been successfully linked!
✨ Crafted with love by Dilsha.

━━━━━━━━━━━━━━━━━━━━━━

📂 Setup Instructions:
▸ Copy the Session ID sent above.
▸ Set it as your SESSION_ID variable.
▸ Deploy your bot and enjoy!

━━━━━━━━━━━━━━━━━━━━━━

💡 Important Notes:
▸ Keep your Session ID private.
▸ Do not share it with anyone.
▸ Enjoy the lovely Shitsu MD experience.

━━━━━━━━━━━━━━━━━━━━━━
Made with 💖 by Dilsha`;

                    // Fixed the variable name bug from the original code (Toxic_MD_TEXT -> Shitsu_MD_TEXT)
                    await Pair_Code_By_Shitsu_MD.sendMessage(Pair_Code_By_Shitsu_MD.user.id, { text: Shitsu_MD_TEXT }, { quoted: session });

                    await delay(100);
                    await Pair_Code_By_Shitsu_MD.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    Shitsu_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted');
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await Shitsu_MD_PAIR_CODE();
});

module.exports = router;