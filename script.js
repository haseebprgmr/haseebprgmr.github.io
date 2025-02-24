// Initialize currencies with buy/sell rates
let rates = {
    "USDT": { 
        buyRate: 15.2, 
        sellRate: 15.4,
        symbol: "₮",
        icon: "fa-coins"
    },
    "USD": { 
        buyRate: 15.0,
        sellRate: 15.3,
        symbol: "$",
        icon: "fa-dollar-sign"
    },
    "EUR": {
        buyRate: 16.5,
        sellRate: 16.8,
        symbol: "€",
        icon: "fa-euro-sign"
    }
};

// Load rates
   database.ref('rates').on('value', (snapshot) => {
     rates = snapshot.val() || defaultRates;
     initCurrencyList();
   });

   // Save rates
   database.ref('rates').update(rates);
    // Migration for existing users
    if(storedRates.USDT && !storedRates.USDT.buyRate) {
        rates = Object.keys(storedRates).reduce((acc, currency) => {
            acc[currency] = {
                buyRate: storedRates[currency].rate * 0.98,
                sellRate: storedRates[currency].rate,
                symbol: storedRates[currency].symbol,
                icon: storedRates[currency].icon
            };
            return acc;
        }, {});
    } else {
        rates = storedRates;
    }
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
    
    // When users SELL foreign currency to you (you BUY), use buyRate
    const mvrReceived = foreignAmount * rates[selectedCurrency].buyRate;
    document.getElementById('mvrResult').textContent = mvrReceived.toLocaleString('en-US', {
        style: 'currency',
        currency: 'MVR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

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
const ADMIN_PASSWORD = "Bestexchange123";
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
     const password = document.getElementById('adminPass').value;
     if(password === "YOUR_ADMIN_PASSWORD") {
       database.ref('rates').update(rates);
       alert("Rates updated for all users!");
     }
   }
    
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
            <div class="rate-control-group">
                <h4>${currency} Rates</h4>
                <div class="rate-inputs">
                    <div>
                        <label>Buy Rate (MVR)</label>
                        <input type="number" step="0.0001"
                               id="buy_${currency}"
                               value="${data.buyRate.toFixed(4)}"
                               min="0.0001"
                               max="${data.sellRate - 0.0001}">
                    </div>
                    <div>
                        <label>Sell Rate (MVR)</label>
                        <input type="number" step="0.0001"
                               id="sell_${currency}"
                               value="${data.sellRate.toFixed(4)}"
                               min="${data.buyRate + 0.0001}">
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
    localStorage.setItem('currencyRates', JSON.stringify(rates));
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
if(window.location.search.includes('initdb')) {
     database.ref('rates').set({
       "USDT": { buyRate:15.2, sellRate:15.4 },
       "USD": { buyRate:15.0, sellRate:15.3 },
       "EUR": { buyRate:16.5, sellRate:16.8 }
     });
   }
