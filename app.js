// app.js
let prices = {};

window.api.loadPrices().then(data => {
  prices = data;
  populateCategories();
});

// 🔔 live refresh when admin saves
window.api.onPricesUpdated?.((newPrices) => {
  prices = newPrices;
  populateCategories();
  updatePriceDisplay();
});

function populateCategories() {
  const categorySelect = document.getElementById('categorySelect');
  categorySelect.innerHTML = '';
  Object.keys(prices).filter(cat => cat !== 'Generic').forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
  populateProducts();
}

function populateProducts() {
  const category = document.getElementById('categorySelect').value;
  const productSelect = document.getElementById('productSelect');
  productSelect.innerHTML = '';
  Object.keys(prices[category] || {}).forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod;
    opt.textContent = prod;
    productSelect.appendChild(opt);
  });
  updatePriceDisplay();
}

function updatePriceDisplay() {
  const category = document.getElementById('categorySelect').value;
  const product = document.getElementById('productSelect').value;
  const customer = document.getElementById('customerType').value;
  const price = prices[category]?.[product]?.[customer];
  document.getElementById('pricePerSqft').textContent = price
    ? `$${price.toFixed(2)} per sqft`
    : '';
}

function calculatePrice() {
  const widthFeet = parseFloat(document.getElementById('widthFeet').value) || 0;
  const widthInches = parseFloat(document.getElementById('widthInches').value) || 0;
  const heightFeet = parseFloat(document.getElementById('heightFeet').value) || 0;
  const heightInches = parseFloat(document.getElementById('heightInches').value) || 0;

  const width = widthFeet + widthInches / 12;
  const height = heightFeet + heightInches / 12;

  if (width <= 0 || height <= 0) {
    document.getElementById('result').textContent = '⚠️ Enter valid dimensions.';
    return;
  }

  const category = document.getElementById('categorySelect').value;
  const product = document.getElementById('productSelect').value;
  const customerType = document.getElementById('customerType').value;
  const highQuality = document.getElementById('highQuality').checked;

  const priceData = prices?.[category]?.[product];
  if (!priceData || priceData[customerType] == null) {
    document.getElementById('result').textContent = '⚠️ Price not found.';
    return;
  }

 let pricePerSqft = parseFloat(document.getElementById('customPrice').value);

if (isNaN(pricePerSqft)) {
  pricePerSqft = priceData[customerType];
  if (highQuality) pricePerSqft += 1.0;
}

  const quantity = parseInt(document.getElementById('quantity').value) || 1;
const area = width * height;
const subtotal = area * pricePerSqft;
const total = subtotal * quantity;

  document.getElementById('pricePerSqft').textContent = `$${pricePerSqft.toFixed(2)} per sqft`;
  document.getElementById('result').innerHTML = `
  <div style="font-size: 22px; margin-top: 15px;">
    Area: ${area.toFixed(2)} sqft<br>
    Price per sqft: $${pricePerSqft.toFixed(2)}<br>
    Price per Unit: $${subtotal.toFixed(2)}<br>
    Quantity: ${quantity}<br>
    <strong>Total: $${total.toFixed(2)}</strong>
  </div>`;
}

function clearForm() {
  ['widthFeet', 'widthInches', 'heightFeet', 'heightInches', 'customPrice', 'quantity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('result').textContent = '';
  document.getElementById('pricePerSqft').textContent = '';
  document.getElementById('highQuality').checked = false;
}

// Dropdown changes should only refresh price/fields, not trigger calculate
document.getElementById('categorySelect').addEventListener('change', populateProducts);
document.getElementById('productSelect').addEventListener('change', updatePriceDisplay);
document.getElementById('customerType').addEventListener('change', updatePriceDisplay);

// ✅ Calculate only on button click
document.getElementById('calcBtn').addEventListener('click', calculatePrice);
