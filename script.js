// JSONBin configuration
const JSONBIN_API_KEY = '$2a$10$PBdovtf4GVCRv1mFrs4EReP7QAkgpDl4CE69Cn7I5CdN3Z44ZaXX.'; // Your API key
const JSONBIN_BIN_ID = '67c07ab6e41b4d34e49dd8a9'; // Your Bin ID
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Admin password (use environment variables in production)
const ADMIN_PASSWORD = "admin123";

// Exchange rates (fallback if JSONBin fails)
let rates = {};

// Load rates from JSONBin
async function loadRates() {
    try {
        // Show loading indicator
        document.getElementById('rateList').innerHTML = `<div class="loading">Loading rates...</div>`;

        const response = await axios.get(JSONBIN_URL, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        rates = response.data.record;
        displayRates();
    } catch (error) {
        console.error('Error loading rates:', error);
        // Fallback to default rates if JSONBin fails
        rates = {
            "USDT": { buyRate: 15.2, sellRate: 15.4 },
            "USD": { buyRate: 15.0, sellRate: 15.3 },
            "EUR": { buyRate: 16.5, sellRate: 16.8 }
        };
        displayRates();
        // Show error message on UI
        document.getElementById('rateList').innerHTML += `
            <div class="error">Failed to load rates. Using default rates.</div>
        `;
    }
}

// Display rates on the UI
function displayRates() {
    const rateList = document.getElementById('rateList');
    rateList.innerHTML = Object.entries(rates).map(([currency, data]) => `
        <div class="rate-item">
            <strong>${currency}</strong>: Buy ${data.buyRate} / Sell ${data.sellRate}
        </div>
    `).join('');
}

// Toggle Admin Panel Visibility
function toggleAdmin() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.toggle('hidden'); // Toggle visibility
}

// Verify Admin Password
function verifyAdmin() {
    const password = document.getElementById('adminPass').value;
    const adminError = document.getElementById('adminError');

    if (password === ADMIN_PASSWORD) {
        // Hide admin login panel
        document.getElementById('adminPanel').classList.add('hidden');
        // Show rate controls
        document.getElementById('rateControls').classList.remove('hidden');
        // Clear error message
        adminError.textContent = '';
        // Show rate update form
        showRateForm();
    } else {
        // Show error message
        adminError.textContent = 'Incorrect password!';
    }
}

// Show rate update form
function showRateForm() {
    const rateForm = document.getElementById('rateForm');
    rateForm.innerHTML = Object.entries(rates).map(([currency, data]) => `
        <div class="rate-input">
            <label>${currency}</label>
            <input type="number" id="buy_${currency}" value="${data.buyRate}" placeholder="Buy Rate">
            <input type="number" id="sell_${currency}" value="${data.sellRate}" placeholder="Sell Rate">
            <button onclick="updateRate('${currency}')">Update</button>
        </div>
    `).join('');
}

// Update rates
async function updateRate(currency) {
    const buyRate = parseFloat(document.getElementById(`buy_${currency}`).value);
    const sellRate = parseFloat(document.getElementById(`sell_${currency}`).value);

    // Input validation
    if (isNaN(buyRate) || isNaN(sellRate)) {
        alert("Please enter valid numbers for buy and sell rates.");
        return;
    }

    if (buyRate >= sellRate) {
        alert("Buy rate must be lower than sell rate!");
        return;
    }

    // Update rates locally
    rates[currency] = { buyRate, sellRate };

    try {
        // Update rates on JSONBin
        await axios.put(JSONBIN_URL, rates, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY, 'Content-Type': 'application/json' }
        });
        alert('Rates updated successfully!');
        // Reload rates to reflect changes
        loadRates();
    } catch (error) {
        console.error('Error updating rates:', error);
        alert('Failed to update rates. Please try again.');
    }
}

// Foreign Currency to MVR
function calculateForeignToMVR() {
    const amount = parseFloat(document.getElementById('foreignAmount').value);
    const currency = document.getElementById('foreignCurrencySelect').value;
    const rate = rates[currency];

    // Input validation
    if (!rate || isNaN(amount)) {
        document.getElementById('foreignToMVRResult').textContent = 'Invalid input!';
        return;
    }

    // Buy: User sells foreign currency to you (you buy)
    const mvrReceived = amount * rate.buyRate;

    // Sell: User buys foreign currency from you (you sell)
    const mvrNeeded = amount * rate.sellRate;

    // Display result
    document.getElementById('foreignToMVRResult').innerHTML = `
        <p>If you sell ${amount} ${currency}, you will receive: <strong>${mvrReceived.toFixed(2)} MVR</strong></p>
        <p>If you buy ${amount} ${currency}, you will pay: <strong>${mvrNeeded.toFixed(2)} MVR</strong></p>
    `;
}

// MVR to Foreign Currency
function calculateMVRToForeign() {
    const amount = parseFloat(document.getElementById('mvrAmount').value);
    const currency = document.getElementById('mvrCurrencySelect').value;
    const rate = rates[currency];

    // Input validation
    if (!rate || isNaN(amount)) {
        document.getElementById('mvrToForeignResult').textContent = 'Invalid input!';
        return;
    }

    // Calculate how much foreign currency the user can buy with their MVR
    const foreignAmount = amount / rate.sellRate;

    // Display result
    document.getElementById('mvrToForeignResult').innerHTML = `
        <p>With ${amount} MVR, you can buy: <strong>${foreignAmount.toFixed(2)} ${currency}</strong></p>
    `;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadRates();
});
