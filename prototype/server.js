const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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
