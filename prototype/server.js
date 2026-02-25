const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const https = require('https');

const DATA_DIR = path.join(__dirname, 'db');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTLEMENTS_FILE = path.join(DATA_DIR, 'settlements.json');
const KEYS_FILE = path.join(__dirname, 'keys.json');

if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
if (!fs.existsSync(SETTLEMENTS_FILE)) fs.writeFileSync(SETTLEMENTS_FILE, JSON.stringify([]));

// Generate or load server keypair (simulates enclave public key)
let keypair;
if (fs.existsSync(KEYS_FILE)) {
    keypair = JSON.parse(fs.readFileSync(KEYS_FILE));
    keypair.publicKey = nacl.util.decodeBase64(keypair.publicKey);
    keypair.secretKey = nacl.util.decodeBase64(keypair.secretKey);
} else {
    const kp = nacl.box.keyPair();
    keypair = {
        publicKey: kp.publicKey,
        secretKey: kp.secretKey
    };
    fs.writeFileSync(KEYS_FILE, JSON.stringify({ publicKey: nacl.util.encodeBase64(kp.publicKey), secretKey: nacl.util.encodeBase64(kp.secretKey) }));
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Return server public key (base64)
app.get('/pubkey', (req, res) => {
    res.json({ publicKey: nacl.util.encodeBase64(keypair.publicKey) });
});

// ── Weather API endpoint ──────────────────────────────
// Geocode location name to lat/lng using Open-Meteo Geocoding API, then fetch weather
app.get('/weather', async (req, res) => {
    const location = req.query.location;
    if (!location) {
        return res.status(400).json({ error: 'Missing location parameter' });
    }

    try {
        // Step 1: Geocode the location using Open-Meteo Geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;

        const geoData = await fetchJson(geoUrl);

        if (!geoData.results || geoData.results.length === 0) {
            return res.status(404).json({ error: `Location "${location}" not found` });
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Step 2: Get weather data from Open-Meteo Weather API
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,rain,precipitation&timezone=auto`;

        const weatherData = await fetchJson(weatherUrl);
        const current = weatherData.current;

        // Decode WMO weather code to condition string
        const condition = decodeWeatherCode(current.weather_code);

        // Return in format expected by frontend
        res.json({
            location: `${name}, ${country}`,
            latitude,
            longitude,
            temp: Math.round(current.temperature_2m),
            humidity: current.relative_humidity_2m,
            condition: condition,
            rainfall_mm: current.precipitation || 0,
            rain: current.rain || 0,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Weather API error:', err.message);
        res.status(500).json({ error: 'Failed to fetch weather data', details: err.message });
    }
});

// Helper: Fetch JSON from HTTPS URL
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout: 5000 }, (resp) => {
            let data = '';
            resp.on('data', chunk => { data += chunk; });
            resp.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Helper: Decode WMO weather codes
function decodeWeatherCode(code) {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with hail'
    };
    return codes[code] || 'Unknown';
}

// Submit encrypted order: { ciphertext, nonce, senderPublicKey, side?, price?, amount? }
app.post('/orders', (req, res) => {
    const { ciphertext, nonce, senderPublicKey, side, price, amount } = req.body;
    if (!ciphertext || !nonce || !senderPublicKey) return res.status(400).json({ error: 'missing fields' });

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    const id = uuidv4();
    const record = {
        id,
        ciphertext,
        nonce,
        senderPublicKey,
        status: 'queued',
        createdAt: Date.now(),
        // Store order details for demo mode
        side: side,
        price: price,
        amount: amount
    };
    orders.push(record);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json({ id });
});

// List orders (for demo only) - returns ciphertexts
app.get('/orders', (req, res) => {
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    res.json(orders);
});

// List matched trades (settlements) - minimal info only
app.get('/matches', (req, res) => {
    try {
        if (!fs.existsSync(SETTLEMENTS_FILE)) {
            fs.writeFileSync(SETTLEMENTS_FILE, JSON.stringify([]));
        }
        const settlements = JSON.parse(fs.readFileSync(SETTLEMENTS_FILE, 'utf8'));
        // Return only IDs and timestamps - no terms, no buyer/seller info
        const minimal = settlements.map(s => ({
            id: s.id,
            timestamp: s.timestamp
        }));
        res.json(minimal);
    } catch (e) {
        console.error('Error reading settlements:', e);
        res.json([]);
    }
});

// Reset settlements (for demo fresh start)
app.post('/reset', (req, res) => {
    try {
        fs.writeFileSync(SETTLEMENTS_FILE, JSON.stringify([]));
        res.json({ success: true });
    } catch (e) {
        console.error('Error resetting settlements:', e);
        res.status(500).json({ error: 'Reset failed' });
    }
});

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (pubkey available at /pubkey)`));
