// ============================================================
//  Rialo Weather Insurance — Frontend Logic
//
//  In a real Rialo app this file would talk to the chain via
//  the Rialo JS SDK.  For this DevNet demo we simulate the
//  on-chain part so the presentation works even offline.
// ============================================================

// ── Global state ─────────────────────────────────────────────
let policy = null;       // set in setupPolicy()
let txCount = 1000;       // fake block counter for demo
let connectedWallet = null;    // set in connectWallet()
let currentBlock = 8_412_047;  // realistic Rialo DevNet block number

// ── Live block counter (ticks up every ~3.5 seconds) ─────────
function startBlockCounter() {
    const el = document.getElementById('block-num');
    if (!el) return;
    el.textContent = currentBlock.toLocaleString();
    setInterval(() => {
        currentBlock += Math.random() < 0.7 ? 1 : 0; // occasional skip = realistic
        el.textContent = currentBlock.toLocaleString();
    }, 3500);
}
startBlockCounter();

// ── Connect Wallet (simulated — no real wallet on DevNet) ─────
function connectWallet() {
    const btn = document.getElementById('walletBtn');
    if (connectedWallet) return; // already connected

    btn.textContent = '⟳ Connecting…';
    btn.disabled = true;

    // Simulate wallet handshake delay
    setTimeout(() => {
        // Generate a realistic-looking Rialo wallet address
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let addr = '';
        for (let i = 0; i < 44; i++) {
            addr += chars[Math.floor(Math.random() * chars.length)];
        }
        connectedWallet = addr;

        // Show shortened address on button
        btn.textContent = `${addr.slice(0, 4)}…${addr.slice(-4)}`;
        btn.classList.add('connected');
        btn.disabled = false;
    }, 900);
}

// ── Utility helpers ───────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fakeTxHash() {
    const hex = () => Math.floor(Math.random() * 16).toString(16);
    return '0x' + Array.from({ length: 64 }, hex).join('');
}

function fakeWallet(seed) {
    // Deterministic-looking wallet from the city name
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let out = '';
    for (let i = 0; i < 44; i++) {
        out += chars[(seed.charCodeAt(i % seed.length) + i * 7) % chars.length];
    }
    return out;
}

function setLoading(btnId, loading, defaultText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="spin">⟳</span> Processing…'
        : defaultText;
}

// ── STEP 1: Setup Policy ──────────────────────────────────────
async function setupPolicy() {
    const city = document.getElementById('city').value.trim();
    const threshold = parseFloat(document.getElementById('threshold').value);
    const payout = parseInt(document.getElementById('payout').value);
    const apiKey = document.getElementById('apiKey').value.trim();

    // Basic validation
    if (!city) return alert('Please enter a city name.');
    if (!apiKey) return alert('Please enter your OpenWeatherMap API key.\n\nGet a free one at: openweathermap.org/api');
    if (isNaN(threshold) || threshold < 0.1) return alert('Rain threshold must be at least 0.1 mm.');
    if (isNaN(payout) || payout < 1) return alert('Enter a valid payout amount.');
    if (payout > 200) return alert('Payout must be at most 200 RALO tokens.');

    setLoading(null, true, null);
    const btn = document.querySelector('#step1 .btn-primary');
    btn.disabled = true;
    btn.innerHTML = '<span class="spin">⟳</span> Deploying contract…';

    // Simulate on-chain deployment delay
    await sleep(1800);

    // Save policy
    policy = { city, threshold, payout, apiKey, wallet: fakeWallet(city) };

    // Show confirmation
    const out = document.getElementById('step1-output');
    out.style.display = 'block';
    out.innerHTML = `
        <strong>Policy created on Rialo DevNet</strong><br/>
        Location : <strong>${city}</strong><br/>
        Threshold : <strong>${threshold.toFixed ? threshold.toFixed(1) : threshold} mm rainfall</strong><br/>
        Payout : <strong>${payout} DEMO RALO tokens</strong><br/>
        User : <code style="font-size:0.75rem">${policy.wallet.slice(0, 12)}…</code><br/>
        Tx (setup) : <code style="font-size:0.75rem">${fakeTxHash().slice(0, 18)}…</code>
    `;

    btn.innerHTML = 'Policy Created';

    // Unlock step 2
    document.getElementById('step2').classList.remove('locked');
    document.getElementById('step2').classList.add('unlocked');
    document.getElementById('checkBtn').disabled = false;
}

// ── STEP 2: Check weather & evaluate ─────────────────────────
async function checkWeather() {
    if (!policy) return;

    const btn = document.getElementById('checkBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spin">⟳</span> Contract calling weather API…';

    // Call our backend which integrates with Open-Meteo (free, no API key needed)
    const backendUrl = `http://localhost:3001/weather?location=${encodeURIComponent(policy.city)}`;

    let weatherData = null;
    let apiWorked = false;

    try {
        const resp = await fetch(backendUrl);
        if (resp.ok) {
            weatherData = await resp.json();
            apiWorked = true;
            console.log('Backend weather response:', weatherData);
        } else {
            const err = await resp.json().catch(() => ({}));
            console.error('Backend error:', err);
        }
    } catch (e) {
        console.error('Failed to reach backend:', e.message);
    }

    // If API call failed, show demo mode
    if (!apiWorked) {
        await sleep(1000);
        btn.innerHTML = 'Weather Checked (Demo Mode)';

        // Unlock step 3
        document.getElementById('step3').classList.remove('locked');
        document.getElementById('step3').classList.add('unlocked');

        const statusEl = document.getElementById('payout-status');
        const msgEl = document.getElementById('payout-message');
        const detailEl = document.getElementById('payout-detail');

        msgEl.textContent = 'Backend service initializing. Click below for demo.';
        detailEl.textContent = '';

        const demoBtn = document.createElement('button');
        demoBtn.className = 'btn-primary';
        demoBtn.style.marginTop = '20px';
        demoBtn.textContent = 'Simulate Payout';
        demoBtn.onclick = () => simulateTrigger(0);
        statusEl.appendChild(demoBtn);
        return;
    }

    // Successfully got weather data
    const rainfallMm = weatherData?.rainfall_mm ?? 0;
    const tempC = weatherData?.temp ?? '—';
    const conditionStr = weatherData?.condition ?? 'clear';

    // Update weather box
    const box = document.getElementById('weather-box');
    box.style.display = 'block';

    document.getElementById('w-city').textContent = `${weatherData?.location || policy.city}`;
    document.getElementById('w-rain').textContent = `${rainfallMm.toFixed(1)} mm`;
    document.getElementById('w-threshold').textContent = `${policy.threshold} mm`;
    document.getElementById('w-condition').textContent = conditionStr;
    document.getElementById('w-temp').textContent = `${tempC} °C`;

    // Color the rainfall value
    const rainEl = document.getElementById('w-rain');
    rainEl.style.color = rainfallMm >= policy.threshold ? '#6ee7b7' : '#f87171';

    // Simulate contract evaluation delay (makes demo feel real)
    await sleep(1200);

    btn.innerHTML = 'Weather Checked';

    // Unlock step 3
    document.getElementById('step3').classList.remove('locked');
    document.getElementById('step3').classList.add('unlocked');

    // ── Evaluate condition & show result ─────────────────────
    const statusEl = document.getElementById('payout-status');
    const msgEl = document.getElementById('payout-message');
    const detailEl = document.getElementById('payout-detail');
    const txBox = document.getElementById('tx-box');

    if (rainfallMm >= policy.threshold) {
        // ── TRIGGERED: show payout ─────────────────────────────
        statusEl.className = 'payout-status triggered';
        msgEl.textContent = `Payout Sent — ${policy.payout} DEMO RALO`;
        detailEl.textContent = `Rainfall (${rainfallMm.toFixed(1)} mm) exceeded threshold (${policy.threshold} mm). Funds transferred.`;

        txBox.style.display = 'block';
        document.getElementById('tx-hash').textContent = fakeTxHash();
        document.getElementById('tx-farmer').textContent = connectedWallet || policy.wallet;
    }
}

// ── STEP 3: Demo helper: simulate payout ────────────────────────────
function simulateTrigger(actualRain) {
    console.log('simulateTrigger called with policy:', policy);

    const statusEl = document.getElementById('payout-status');
    const btn = statusEl.querySelector('button');
    if (btn) btn.remove();

    const msgEl = document.getElementById('payout-message');
    const detailEl = document.getElementById('payout-detail');
    if (!msgEl || !detailEl) {
        console.error('Cannot find payout-message or payout-detail elements');
        return;
    }

    msgEl.textContent = 'Simulating threshold breach...';
    detailEl.textContent = '';

    // Use setTimeout to update UI after one second
    setTimeout(() => {
        console.log('setTimeout fired - updating UI');
        try {
            // Re-fetch elements to ensure they're current
            const msgEl = document.getElementById('payout-message');
            const detailEl = document.getElementById('payout-detail');
            const statusEl = document.getElementById('payout-status');
            const txBox = document.getElementById('tx-box');

            if (!msgEl || !detailEl || !statusEl || !txBox) {
                console.error('Missing DOM elements:', { msgEl, detailEl, statusEl, txBox });
                return;
            }

            const fakeRain = policy.threshold + 5 + Math.floor(Math.random() * 20);
            console.log('Fake rain:', fakeRain, 'Threshold:', policy.threshold, 'Payout:', policy.payout);

            // Update display with payout result
            statusEl.className = 'payout-status triggered';
            msgEl.textContent = `Payout Sent — ${policy.payout} DEMO RALO`;
            detailEl.textContent = `Rainfall (${fakeRain.toFixed(1)} mm) exceeded threshold (${policy.threshold} mm). Funds transferred.`;

            // Update transaction box
            txBox.style.display = 'block';
            document.getElementById('tx-hash').textContent = fakeTxHash();
            document.getElementById('tx-farmer').textContent = connectedWallet || policy.wallet;
            document.getElementById('tx-amount').textContent = `${policy.payout} DEMO RALO`;
            document.getElementById('tx-block').textContent = `#${currentBlock.toLocaleString()}`;
            document.getElementById('tx-fee').textContent = '0.000021 DEMO RALO';

            console.log('Payout simulation complete');
        } catch (e) {
            console.error('Error in simulateTrigger setTimeout:', e, e.stack);
            document.getElementById('payout-message').textContent = 'Error: ' + e.message;
        }
    }, 1200);
}
