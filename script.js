// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDksaEMrHB5Wk4yWwg7GbKEeQlo0RZueq0",
  authDomain: "price-list-542e6.firebaseapp.com",
  databaseURL: "https://price-list-542e6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "price-list-542e6",
  storageBucket: "price-list-542e6.firebasestorage.app",
  messagingSenderId: "1009713697691",
  appId: "1:1009713697691:web:9ef1ad1aa4f0be214a473e",
  measurementId: "G-HQLQS92RLV"
};
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Initialize currencies
let rates = {};

// Load rates from Firebase
function loadRates() {
    database.ref('rates').on('value', (snapshot) => {
        if (snapshot.exists()) {
            rates = snapshot.val();
            initCurrencyList();
            calculateConversions();
            calculateMvrCost();
            updateLastUpdated();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadRates();
    initCurrencySelect();
});

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

function updateRates(currency) {
    const buyRate = parseFloat(document.getElementById(buy_${currency}).value);
    const sellRate = parseFloat(document.getElementById(sell_${currency}).value);
    
    if (buyRate >= sellRate) {
        alert("Error: Buy rate must be lower than sell rate");
        return;
    }

    database.ref(rates/${currency}).update({
        buyRate: buyRate,
        sellRate: sellRate
    }).then(() => {
        alert('Rates updated successfully!');
    }).catch((error) => {
        alert('Error updating rates: ' + error.message);
    });
}

function showError(message) {
    const errorDiv = document.getElementById('adminError');
    errorDiv.textContent = message;
}

function clearAdminMessages() {
    const errorDiv = document.getElementById('adminError');
    errorDiv.textContent = '';
}
