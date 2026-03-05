// ============================================================
//  Rialo Weather Insurance — Frontend Logic
//
//  In a real Rialo app this file would talk to the chain via
//  the Rialo JS SDK.  For this DevNet demo we simulate the
//  on-chain part so the presentation works even offline.
// ============================================================

// ── Global state ─────────────────────────────────────────────
let policy = null;       // set in setupPolicy()
let userEmail = null;    // set in email signup/login
let userAccount = null;  // { email, id, paymentMethod, accountNumber }
let currentUser = null;  // authenticated user state

// ── Initialization: Run after DOM is fully ready ─────────────
document.addEventListener('DOMContentLoaded', function () {
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
        signInBtn.addEventListener('click', openSignInModal);
    }

    // Check if user is already logged in (localStorage)
    checkAuthStatus();
});

// ── Live block counter (ticks up every ~3.5 seconds) ─────────
// ── Auth Helpers ────────────────────────────────────────────
function checkAuthStatus() {
    const saved = localStorage.getItem('userAccount');
    if (saved) {
        try {
            userAccount = JSON.parse(saved);
            setAuthUI(userAccount.email);
        } catch (e) {
            localStorage.removeItem('userAccount');
        }
    }
}

function setAuthUI(email) {
    const btn = document.getElementById('signInBtn');
    if (!btn) return;
    btn.textContent = `✓ ${email.split('@')[0].slice(0, 8)}…`;
    btn.classList.add('connected');
    btn.disabled = false;
    document.getElementById('step1').classList.remove('locked');
}

function openSignInModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
}

function closeSignInModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}

async function handleEmailSignIn() {
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    const payoutMethod = document.getElementById('payoutMethod').value || 'bank';

    if (!email || !password) {
        alert('Please enter email and password.');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Invalid email format.');
        return;
    }

    // Mock auth (in production: POST to /auth/login)
    userAccount = {
        email: email,
        id: Math.random().toString(36).slice(2, 11),
        paymentMethod: payoutMethod,
        accountNumber: 'demo-***-' + Math.random().toString(36).slice(7, 12),
        name: email.split('@')[0]
    };

    localStorage.setItem('userAccount', JSON.stringify(userAccount));
    setAuthUI(email);
    closeSignInModal();
}

function handleLogout() {
    if (confirm('Sign out?')) {
        userAccount = null;
        localStorage.removeItem('userAccount');
        const btn = document.getElementById('signInBtn');
        if (btn) {
            btn.textContent = 'Sign In';
            btn.classList.remove('connected');
        }
        document.getElementById('step1').classList.add('locked');
        document.getElementById('step2').classList.add('locked');
        document.getElementById('step3').classList.add('locked');
        policy = null;
    }
}

// ── Utility helpers ───────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fakeTxHash() {
    const hex = () => Math.floor(Math.random() * 16).toString(16);
    return '0x' + Array.from({ length: 64 }, hex).join('');
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
    if (!userAccount) return alert('Please sign in first.');

    const city = document.getElementById('city').value.trim();
    const threshold = parseFloat(document.getElementById('threshold').value);
    const payout = parseInt(document.getElementById('payout').value);

    // Basic validation
    if (!city) return alert('Please enter a city name.');
    if (isNaN(threshold) || threshold < 0.1) return alert('Rain threshold must be at least 0.1 mm.');
    if (isNaN(payout) || payout < 1) return alert('Enter a valid payout amount.');
    if (payout > 5000) return alert('Payout must be at most $5,000 USD.');

    const btn = document.querySelector('#step1 .btn-primary');
    btn.disabled = true;
    btn.innerHTML = '<span class="spin">⟳</span> Deploying contract…';

    // Simulate on-chain deployment delay
    await sleep(1800);

    // Save policy
    policy = { city, threshold, payout, userEmail: userAccount.email, userId: userAccount.id };

    // Show confirmation
    const out = document.getElementById('step1-output');
    out.style.display = 'block';
    out.innerHTML = `
        <strong>Insurance Policy Created</strong><br/>
        Location : <strong>${city}</strong><br/>
        Threshold : <strong>${threshold.toFixed ? threshold.toFixed(1) : threshold} mm rainfall</strong><br/>
        Payout : <strong>$${payout} USD</strong><br/>
        Account : <code style="font-size:0.75rem">${userAccount.email}</code><br/>
        Status : <code style="font-size:0.75rem">Active</code>
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
        // Add 8 second timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const resp = await fetch(backendUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

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
        demoBtn.textContent = 'Try Demo Payout';
        demoBtn.onclick = () => simulateDemoTrigger(rainfallMm);
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
    const txExplorer = document.getElementById('tx-explorer');

    if (rainfallMm >= policy.threshold) {
        // ── TRIGGERED: request payout from backend ──────────────
        statusEl.className = 'payout-status triggered';
        msgEl.textContent = 'Processing payout...';
        detailEl.textContent = '';

        try {
            const payoutResp = await fetch('http://localhost:3001/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: userAccount.email,
                    userId: userAccount.id,
                    paymentMethod: userAccount.paymentMethod,
                    amount: policy.payout,
                    city: policy.city,
                    threshold: policy.threshold,
                    rainfall: rainfallMm
                })
            });

            if (!payoutResp.ok) {
                throw new Error(`Backend error: ${payoutResp.status}`);
            }

            const payoutData = await payoutResp.json();

            if (payoutData.success) {
                // Display payout success
                msgEl.textContent = `Payout Confirmed — $${payoutData.amount} USD`;
                detailEl.textContent = `Rainfall (${rainfallMm.toFixed(1)} mm) exceeded threshold (${policy.threshold} mm). Your payout has been sent to ${payoutData.payoutMethod}.`;

                txBox.style.display = 'block';
                document.getElementById('tx-hash').textContent = payoutData.transactionId || 'TXN-' + Math.random().toString(36).slice(7);
                document.getElementById('tx-farmer').textContent = userAccount.email;
                document.getElementById('tx-amount').textContent = `$${payoutData.amount} USD`;
                document.getElementById('tx-block').textContent = payoutData.payoutMethod;
                document.getElementById('tx-fee').textContent = 'Standard processing';

                // Add confirmation link
                if (txExplorer) {
                    txExplorer.href = '#';
                    txExplorer.textContent = 'View Confirmation Email ↗';
                    txExplorer.style.display = 'block';
                }
            } else {
                msgEl.textContent = 'Payout Request Failed';
                detailEl.textContent = payoutData.error || 'Unknown error from backend';
            }
        } catch (e) {
            console.error('Payout request error:', e);
            msgEl.textContent = 'Payout Not Available';
            detailEl.textContent = 'Backend payout service offline. Running in demo mode.';

            // Fallback to demo simulation
            const demoBtn = document.createElement('button');
            demoBtn.className = 'btn-primary';
            demoBtn.style.marginTop = '20px';
            demoBtn.textContent = 'View Demo Simulation';
            demoBtn.onclick = () => simulateDemoTrigger(rainfallMm);
            statusEl.appendChild(demoBtn);
        }
    } else {
        // ── NOT TRIGGERED: show condition not met ────────────
        statusEl.className = 'payout-status not-met';
        msgEl.textContent = 'Condition Not Met — No Payout';
        detailEl.textContent = `Rainfall (${rainfallMm.toFixed(1)} mm) below threshold (${policy.threshold} mm). No funds transferred.`;
    }
}

// ── STEP 3: Demo helper: simulate payout ────────────────────────────
function simulateDemoTrigger(actualRain) {
    console.log('simulateDemoTrigger called with policy:', policy);

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
            const txExplorer = document.getElementById('tx-explorer');

            if (!msgEl || !detailEl || !statusEl || !txBox) {
                console.error('Missing DOM elements:', { msgEl, detailEl, statusEl, txBox });
                return;
            }

            const fakeRain = policy.threshold + 5 + Math.floor(Math.random() * 20);
            console.log('Fake rain:', fakeRain, 'Threshold:', policy.threshold, 'Payout:', policy.payout);

            // Generate demo tx signature (base58 format, realistic length)
            const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            let demoTxHash = '';
            for (let i = 0; i < 88; i++) {
                demoTxHash += chars[Math.floor(Math.random() * chars.length)];
            }

            // Update display with payout result
            statusEl.className = 'payout-status triggered';
            msgEl.textContent = `Payout Confirmed — $${policy.payout} USD`;
            detailEl.textContent = `Demo: Rainfall (${fakeRain.toFixed(1)} mm) exceeded threshold (${policy.threshold} mm). This is a simulation—no real funds transferred.`;

            // Update transaction box
            txBox.style.display = 'block';
            document.getElementById('tx-hash').textContent = 'DEMO-' + demoTxHash.slice(0, 16);
            document.getElementById('tx-farmer').textContent = userAccount.email;
            document.getElementById('tx-amount').textContent = `$${policy.payout} USD`;
            document.getElementById('tx-block').textContent = 'Bank Account';
            document.getElementById('tx-fee').textContent = 'Free';

            if (txExplorer) {
                txExplorer.href = '#';
                txExplorer.textContent = 'Demo - No Link';
                txExplorer.style.display = 'block';
            }

            console.log('Payout simulation complete');
        } catch (e) {
            console.error('Error in simulateDemoTrigger setTimeout:', e, e.stack);
            document.getElementById('payout-message').textContent = 'Error: ' + e.message;
        }
    }, 1200);
}
