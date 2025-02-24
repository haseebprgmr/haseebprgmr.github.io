// Initialize currencies with default rates
let rates = {
    "USDT": { rate: 15.4, symbol: "₮", icon: "fa-coins" },
    "USD": { rate: 15.3, symbol: "$", icon: "fa-dollar-sign" },
    "EUR": { rate: 16.8, symbol: "€", icon: "fa-euro-sign" }
};

// Load rates from localStorage
if(localStorage.getItem('currencyRates')) {
    rates = JSON.parse(localStorage.getItem('currencyRates'));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCurrencyList();
    initCurrencySelect();
    calculateConversions();
    calculateMvrCost();
    updateLastUpdated();
});

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
                    <p>${data.symbol}1 = MVR<span class="currency-rate">${data.rate.toFixed(4)}</span></p>
                </div>
            </div>
            <div>
                <span class="conversion-result">-</span>
            </div>
        `;
        container.appendChild(element);
    });
}

function initCurrencySelect() {
    const select = document.getElementById('currencySelect');
    Object.keys(rates).forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        select.appendChild(option);
    });
}

function calculateMvrCost() {
    const foreignAmount = parseFloat(document.getElementById('foreignAmount').value) || 0;
    const selectedCurrency = document.getElementById('currencySelect').value;
    const rate = rates[selectedCurrency].rate;
    
    const mvrCost = foreignAmount * rate;
    document.getElementById('mvrResult').textContent = mvrCost.toLocaleString('en-US', {
        style: 'currency',
        currency: 'MVR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function calculateConversions() {
    const mvrAmount = parseFloat(document.getElementById('amount').value) || 0;
    
    document.querySelectorAll('.currency-item').forEach(item => {
        const rate = parseFloat(item.querySelector('.currency-rate').textContent);
        const resultElement = item.querySelector('.conversion-result');
        resultElement.textContent = (mvrAmount / rate).toLocaleString('en-US', {
            maximumFractionDigits: 4
        });
    });
}

// Admin functionality
const ADMIN_PASSWORD = "secure123";
let adminMode = false;

function toggleAdmin() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.toggle('hidden');
    clearAdminMessages();
    if(!adminPanel.classList.contains('hidden')) {
        document.getElementById('adminPass').focus();
    }
}

function verifyAdmin() {
    const passwordInput = document.getElementById('adminPass');
    const controls = document.getElementById('rateControls');
    
    clearAdminMessages();

    if(passwordInput.value === ADMIN_PASSWORD) {
        controls.classList.remove('hidden');
        showRateControls();
        adminMode = true;
        passwordInput.value = '';
    } else {
        showError('Incorrect password. Please try again.');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showRateControls() {
    const controls = document.getElementById('rateControls');
    controls.innerHTML = '<h3>Update Exchange Rates</h3>';
    
    Object.entries(rates).forEach(([currency, data]) => {
        controls.innerHTML += `
            <div class="input-group" style="margin: 1rem 0;">
                <div style="flex: 1;">
                    <label>${currency} Rate (MVR)</label>
                    <input type="number" 
                           step="0.0001"
                           id="edit_${currency}"
                           value="${data.rate.toFixed(4)}"
                           style="width: 100%;">
                </div>
                <button class="contact-button" 
                        onclick="updateRate('${currency}')"
                        style="background: var(--secondary);">
                    <i class="fas fa-save"></i> Update
                </button>
            </div>
        `;
    });
}

function updateRate(currency) {
    const newRate = parseFloat(document.getElementById(`edit_${currency}`).value);
    rates[currency].rate = newRate;
    localStorage.setItem('currencyRates', JSON.stringify(rates));
    localStorage.setItem('lastUpdated', new Date().toISOString());
    
    initCurrencyList();
    calculateConversions();
    updateLastUpdated();
}

function updateLastUpdated() {
    const lastUpdated = localStorage.getItem('lastUpdated') || new Date().toISOString();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    document.getElementById('lastUpdated').textContent = `Rates updated: ${new Date(lastUpdated).toLocaleString('en-US', options)}`;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.id = 'adminError';
    errorDiv.textContent = message;
    document.getElementById('adminPanel').appendChild(errorDiv);
}

function clearAdminMessages() {
    const existingError = document.getElementById('adminError');
    if(existingError) existingError.remove();
}