require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const axios = require('axios');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [], logs: [] }).write();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Discord Client Setup (für Role Assignment)
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.login(process.env.DISCORD_TOKEN);

// --- HILFSFUNKTIONEN ---

// Roblox User ID holen via Username
async function getRobloxId(username) {
    try {
        const res = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [username],
            excludeBannedUsers: true
        });
        if (res.data.data.length > 0) return res.data.data[0].id;
        return null;
    } catch (e) { return null; }
}

// Roblox Bio prüfen
async function checkRobloxBio(userId, code) {
    try {
        const res = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        const description = res.data.description || "";
        return description.includes(code);
    } catch (e) { return false; }
}

// Rate Limit Check
function checkRateLimit(ip) {
    const now = Date.now();
    const record = db.get('users').find({ ip }).value();
    if (record && record.attempts) {
        // Reset nach 1 Stunde
        if (now - record.lastAttempt > 3600000) {
            db.get('users').find({ ip }).assign({ attempts: 0, lastAttempt: now }).write();
            return true;
        }
        if (record.attempts >= 3) return false;
    }
    return true;
}

function incrementAttempts(ip) {
    const now = Date.now();
    let record = db.get('users').find({ ip }).value();
    if (!record) {
        db.get('users').push({ ip, attempts: 1, lastAttempt: now }).write();
    } else {
        db.get('users').find({ ip }).assign({ 
            attempts: record.attempts + 1, 
            lastAttempt: now 
        }).write();
    }
}

// --- ROUTEN ---

// Discord OAuth Callback
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        // Token tauschen
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
            code: code
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenRes.data.access_token;
        
        // User Infos holen
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const discordUser = userRes.data;
        
        // Session simulieren (In Produktion: Echte Sessions/Cookies nutzen)
        res.redirect(`/?token=${accessToken}&discord_id=${discordUser.id}&username=${encodeURIComponent(discordUser.username)}`);
    } catch (error) {
        console.error(error);
        res.redirect('/?error=login_failed');
    }
});

// Roblox ID holen
app.post('/api/get-roblox-id', async (req, res) => {
    const { username } = req.body;
    const rbxId = await getRobloxId(username);
    if (rbxId) res.json({ success: true, id: rbxId });
    else res.status(404).json({ success: false, message: "User nicht gefunden" });
});

// Verifizierung prüfen
app.post('/api/verify', async (req, res) => {
    const { discordId, robloxId, code, ip } = req.body;

    if (!checkRateLimit(ip)) {
        return res.status(429).json({ success: false, message: "Zu viele Versuche. Warte 1 Stunde." });
    }

    const isVerified = await checkRobloxBio(robloxId, code);

    if (isVerified) {
        // Rolle vergeben
        try {
            const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
            const member = await guild.members.fetch(discordId);
            await member.roles.add(process.env.DISCORD_ROLE_ID);
            
            // Loggen
            db.get('logs').push({ 
                discordId, robloxId, timestamp: new Date(), action: 'verified' 
            }).write();
            
            // DB Update
            db.get('users').update({ discordId }, { discordId, robloxId, verified: true, joinedAt: new Date() }).write();

            res.json({ success: true, message: "Erfolgreich verifiziert!" });
        } catch (e) {
            console.error("Role assign failed", e);
            res.status(500).json({ success: false, message: "Discord Rolle fehlgeschlagen (Bot Rechte?)" });
        }
    } else {
        incrementAttempts(ip);
        res.json({ success: false, message: "Code nicht in Bio gefunden." });
    }
});

// User Status prüfen
app.get('/api/status/:discordId', (req, res) => {
    const user = db.get('users').find({ discordId: req.params.discordId }).value();
    res.json({ verified: !!user?.verified, robloxId: user?.robloxId });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
