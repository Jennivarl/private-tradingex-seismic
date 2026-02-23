Seismic dark-pool prototype

Overview
- Minimal demo of encrypted orders submitted to a server, stored ciphertext-only.
- A mock "TEE" worker holds the private key, decrypts orders, matches buy/sell, and writes signed settlements.

How to run (locally)
1. Install dependencies:

```bash
cd prototype
npm install
```

2. Start the server (in one terminal):

```bash
npm start
```

3. Start the worker (in another terminal):

```bash
npm run worker
```

4. Open the frontend at `prototype/public/index.html` (open file in browser) and use the UI to create encrypted orders.

Notes
- This is a demo only. For production, use a real TEE (SGX/TDX), secure key management, and hardened matching/settlement.
- The prototype stores data in JSON files under `prototype/db/` for simplicity.
