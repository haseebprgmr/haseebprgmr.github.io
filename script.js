// JSONBin configuration
const JSONBIN_API_KEY = '$2a$10$NclxDQUlXF9OtuxdQxDxVug.8VmB2C0VFq1qRRIHOgR4k.GYxKB/O'; // Your API key
const JSONBIN_BIN_ID = '67bfbf75acd3cb34a8f1b832'; // Your Bin ID
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let rates = {};

// Load rates from JSONBin
async function loadRates() {
    try {
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
    }
}

// Display rates
function displayRates() {
    const rateList = document.getElementById('rateList');
    rateList.innerHTML = Object.entries(rates).map(([currency, data]) => `
        <div class="rate-item">
            <strong>${currency}</strong>: Buy ${data.buyRate} / Sell ${data.sellRate}
        </div>
    `).join('');
}

// Admin login
const ADMIN_PASSWORD = "admin123"; // Change this!

function verifyAdmin() {
    const password = document.getElementById('adminPass').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('rateControls').classList.remove('hidden');
        showRateForm();
    } else {
        document.getElementById('adminError').textContent = 'Incorrect password!';
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

    if (buyRate >= sellRate) {
        alert("Buy rate must be lower than sell rate!");
        return;
    }

    rates[currency] = { buyRate, sellRate };

    try {
        await axios.put(JSONBIN_URL, rates, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY, 'Content-Type': 'application/json' }
        });
        alert('Rates updated successfully!');
        loadRates();
    } catch (error) {
        console.error('Error updating rates:', error);
    }
}

// Currency converter
function calculate() {
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currencySelect').value;
    const rate = rates[currency];

    if (!rate || isNaN(amount)) {
        document.getElementById('result').textContent = 'Invalid input!';
        return;
    }

    // Buy: User sells foreign currency to you (you buy)
    const mvrReceived = amount * rate.buyRate;

    // Sell: User buys foreign currency from you (you sell)
    const mvrNeeded = amount * rate.sellRate;

    document.getElementById('result').innerHTML = `
        <p>If you sell ${amount} ${currency}, you will receive: <strong>${mvrReceived.toFixed(2)} MVR</strong></p>
        <p>If you buy ${amount} ${currency}, you will pay: <strong>${mvrNeeded.toFixed(2)} MVR</strong></p>
    `;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadRates();
});
