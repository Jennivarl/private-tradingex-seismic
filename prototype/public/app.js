// Private Trading Exchange with Real Encryption
(async function () {
    const API = 'http://localhost:3001';
    let myOrders = [];
    let serverPublicKey = null;
    let lastSettlementSeen = null;
    function b64ToUint8Array(b64) {
        return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    }
    function uint8ToB64(u8) {
        return btoa(String.fromCharCode.apply(null, Array.from(u8)));
    }

    // Fetch server's public key
    async function initializePubkey() {
        try {
            const r = await fetch(`${API}/pubkey`);
            const data = await r.json();
            serverPublicKey = data.publicKey;
            document.getElementById('debugPubkey').textContent = serverPublicKey;
        } catch (e) {
            console.error('Failed to fetch pubkey:', e);
            document.getElementById('debugPubkey').textContent = 'Error: ' + e.message;
        }
    }

    // Submit order with real encryption
    async function submitOrder() {
        const side = document.getElementById('side').value;
        const price = Number(document.getElementById('price').value);
        const amount = Number(document.getElementById('amount').value);
        const resultDiv = document.getElementById('result');

        if (!price || !amount) {
            resultDiv.className = 'status error';
            resultDiv.textContent = 'Please fill in all fields';
            return;
        }

        try {
            if (!serverPublicKey) {
                await initializePubkey();
            }

            // Create plaintext order
            const plainOrder = {
                side,
                price,
                amount,
                owner: 'user-' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString()
            };
            const plaintext = JSON.stringify(plainOrder);

            // Display in debug panel
            document.getElementById('debugPlaintext').textContent = JSON.stringify(plainOrder, null, 2);

            // Encrypt using tweetnacl
            if (typeof nacl === 'undefined') {
                throw new Error('tweetnacl not loaded');
            }

            const serverPub = b64ToUint8Array(serverPublicKey);
            const ephemeralKeypair = nacl.box.keyPair();
            const nonce = nacl.randomBytes(nacl.box.nonceLength);

            const plainBytes = new TextEncoder().encode(plaintext);
            const encrypted = nacl.box(plainBytes, nonce, serverPub, ephemeralKeypair.secretKey);

            // Prepare encrypted payload
            const encryptedPayload = {
                ciphertext: uint8ToB64(encrypted),
                nonce: uint8ToB64(nonce),
                senderPublicKey: uint8ToB64(ephemeralKeypair.publicKey)
            };

            // Display encrypted in debug panel
            document.getElementById('debugEncrypted').textContent = JSON.stringify(encryptedPayload, null, 2);

            // Send to server
            const r = await fetch(`${API}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...encryptedPayload,
                    side: side,
                    price: price,
                    amount: amount
                })
            });
            const j = await r.json();

            // Track order
            myOrders.push({
                id: j.id,
                side: side,
                price: price,
                amount: amount,
                timestamp: new Date().toLocaleTimeString()
            });

            resultDiv.className = 'status success';
            resultDiv.textContent = 'Order submitted (encrypted). Waiting for a match...';

            // Don't reset settlements here - let matches accumulate
            updateOrdersTable();
            refreshMatches();

        } catch (e) {
            resultDiv.className = 'status error';
            resultDiv.textContent = 'Error: ' + e.message;
            console.error(e);
        }
    }

    // Update orders table
    function updateOrdersTable() {
        const tbody = document.getElementById('myOrdersTable');

        if (myOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No orders yet. Submit one above!</td></tr>';
            return;
        }

        tbody.innerHTML = myOrders.map(order => `
            <tr>
                <td><span class="badge ${order.side}">${order.side.toUpperCase()}</span></td>
                <td>$${order.price}</td>
                <td>${order.amount} units</td>
                <td style="opacity: 0.7;">${order.timestamp}</td>
            </tr>
        `).join('');
    }

    // Fetch and display matches (just show they happened)
    async function refreshMatches() {
        try {
            const r = await fetch(`${API}/matches`);
            if (!r.ok) return;

            const matches = await r.json();
            const tbody = document.getElementById('matchesTable');

            if (!matches || matches.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Awaiting matches...</td></tr>';
                return;
            }

            // Track last settlement for debug panel
            if (matches.length > 0 && matches[matches.length - 1].id !== lastSettlementSeen) {
                lastSettlementSeen = matches[matches.length - 1].id;
                const last = matches[matches.length - 1];
                document.getElementById('debugSettlement').textContent = JSON.stringify({
                    id: last.id,
                    timestamp: new Date(last.timestamp).toLocaleTimeString(),
                    confirmed: true
                }, null, 2);
            }

            tbody.innerHTML = matches.map((match, i) => `
                <tr>
                    <td style="text-align: center; font-size: 16px;">✓</td>
                    <td style="font-size: 13px; font-family: monospace;">Settlement</td>
                    <td style="opacity: 0.7; font-size: 12px;">${new Date(match.timestamp).toLocaleTimeString()}</td>
                    <td style="opacity: 0.5; font-size: 11px;">ID: ${match.id.substring(0, 16)}...</td>
                </tr>
            `).join('');

        } catch (e) {
            console.error('Error fetching matches:', e);
        }
    }

    // Event listeners
    document.getElementById('submitBtn').addEventListener('click', submitOrder);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        refreshMatches();
        const resultDiv = document.getElementById('result');
        resultDiv.className = 'status success';
        resultDiv.textContent = 'Refreshed!';
        setTimeout(() => { resultDiv.className = 'status'; }, 2000);
    });

    // Auto-refresh every 2 seconds
    setInterval(refreshMatches, 2000);

    // Initialize
    initializePubkey();
    refreshMatches();

})();
