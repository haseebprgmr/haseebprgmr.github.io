// JSONBin configuration
const JSONBIN_API_KEY = '$2a$10$ISnzYBxkpDNeersZBo0mVe5v/iOr89sUQyl.zGdj3v.pGlKBJLYgu'; // Replace with your API key
const JSONBIN_BIN_ID = '67bfb39fe41b4d34e49d819d'; // Replace with your bin ID
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Initialize rates
let rates = {
    "USDT": { buyRate: 15.2, sellRate: 15.4, symbol: "₮", icon: "fa-coins" },
    "USD": { buyRate: 15.0, sellRate: 15.3, symbol: "$", icon: "fa-dollar-sign" },
    "EUR": { buyRate: 16.5, sellRate: 16.8, symbol: "€", icon: "fa-euro-sign" }
};

// Load rates from JSONBin
async function loadRates() {
    try {
        const response = await axios.get(JSONBIN_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        if (response.data.record) {
            rates = response.data.record;
        }
        initCurrencyList();
        calculateConversions();
        calculateMvrCost();
        updateLastUpdated();
    } catch (error) {
        console.error('Error loading rates:', error);
        // Fallback to default rates
        initCurrencyList();
        calculateConversions();
        calculateMvrCost();
        updateLastUpdated();
    }
}

// Save rates to JSONBin
async function saveRates() {
    try {
        await axios.put(JSONBIN_URL, rates, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log('Rates saved successfully!');
    } catch (error) {
        console.error('Error saving rates:', error);
    }
}

// Initialize currency list
function initCurrencyList() {
    const container = document.getElementById('currencyList');
    container.innerHTML = '';
    
    Object.entries(rates).forEach(([currency, data]) => {
        const element = document.createElement('div');
        element.className = 'currency-item';
        element.innerHTML = `
            <div class="currency-info">
                <i class="fas ${data.icon} fa-2x" style="color: var(--secondary);"></i>
                <div>
                    <h3>${currency}</h3>
                    <div class="rate-display">
                        <div class="rate-type">
                            <span class="rate-label">We Buy:</span>
                            <span class="currency-rate buy-rate">${data.buyRate.toFixed(4)}</span>
                            <span class="rate-explanation">(You Sell)</span>
                        </div>
                        <div class="rate-type">
                            <span class="rate-label">We Sell:</span>
                            <span class="currency-rate sell-rate">${data.sellRate.toFixed(4)}</span>
                            <span class="rate-explanation">(You Buy)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <span class="conversion-result">-</span>
            </div>
        `;
        container.appendChild(element);
    });
}

// Initialize currency select options
function initCurrencySelect() {
    const select = document.getElementById('currencySelect');
    Object.keys(rates).forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        select.appendChild(option);
    });
}

// Calculate MVR cost for foreign currency
function calculateMvrCost() {
    const foreignAmount = parseFloat(document.getElementById('foreignAmount').value) || 0;
    const selectedCurrency = document.getElementById('currencySelect').value;
    
    // When users SELL foreign currency to you (you BUY), use buyRate
    const mvrReceived = foreignAmount * rates[selectedCurrency].buyRate;
    document.getElementById('mvrResult').textContent = mvrReceived.toLocaleString('en-US', {
        style: 'currency',
        currency: 'MVR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Calculate foreign currency for MVR
function calculateConversions() {
    const mvrAmount = parseFloat(document.getElementById('amount').value) || 0;
    
    // When users BUY foreign currency from you (you SELL), use sellRate
    document.querySelectorAll('.currency-item').forEach(item => {
        const currency = item.querySelector('h3').textContent;
        const foreignReceived = mvrAmount / rates[currency].sellRate;
        const resultElement = item.querySelector('.conversion-result');
        resultElement.textContent = foreignReceived.toLocaleString('en-US', {
            maximumFractionDigits: 4
        });
    });
}

// Admin functionality
const ADMIN_PASSWORD = "your-secure-password"; // Change this!

function toggleAdmin() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.toggle('hidden');
    clearAdminMessages();
}

function verifyAdmin() {
    const password = document.getElementById('adminPass').value;
    const errorDiv = document.getElementById('adminError');
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('rateControls').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
    } else {
        errorDiv.textContent = 'Incorrect password. Please try again.';
        document.getElementById('adminPass').value = '';
    }
}

function showRateControls() {
    const controls = document.getElementById('rateControls');
    controls.innerHTML = '<h3>Update Exchange Rates</h3>';
    
    Object.entries(rates).forEach(([currency, data]) => {
        controls.innerHTML += `
            <div class="rate-control-group">
                <h4>${currency} Rates</h4>
                <div class="rate-inputs">
                    <div>
                        <label>Buy Rate (MVR)</label>
                        <input type="number" step="0.0001"
                               id="buy_${currency}"
                               value="${data.buyRate.toFixed(4)}">
                    </div>
                    <div>
                        <label>Sell Rate (MVR)</label>
                        <input type="number" step="0.0001"
                               id="sell_${currency}"
                               value="${data.sellRate.toFixed(4)}">
                    </div>
                </div>
                <button class="contact-button" 
                        onclick="updateRates('${currency}')"
                        style="background: var(--secondary);">
                    <i class="fas fa-save"></i> Update
                </button>
            </div>
        `;
    });
}

function updateRates(currency) {
    const buyRate = parseFloat(document.getElementById(`buy_${currency}`).value);
    const sellRate = parseFloat(document.getElementById(`sell_${currency}`).value);
    
    if (buyRate >= sellRate) {
        alert("Error: Buy rate must be lower than sell rate");
        return;
    }

    rates[currency].buyRate = buyRate;
    rates[currency].sellRate = sellRate;
    saveRates();
    initCurrencyList();
    calculateConversions();
    updateLastUpdated();
}

function updateLastUpdated() {
    const lastUpdated = new Date().toLocaleString('en-US', {
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('lastUpdated').textContent = `Rates updated: ${lastUpdated}`;
}

function showError(message) {
    const errorDiv = document.getElementById('adminError');
    errorDiv.textContent = message;
}

function clearAdminMessages() {
    const errorDiv = document.getElementById('adminError');
    errorDiv.textContent = '';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadRates();
    initCurrencySelect();
});
