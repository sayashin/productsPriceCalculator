let prices = {};

async function loadPrices() {
  prices = await window.api.loadPrices();
  populateCategories();
}

function populateCategories() {
  const catSel = document.getElementById('categorySelect');
  catSel.innerHTML = '';
  Object.keys(prices).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    catSel.appendChild(opt);
  });
  populateProducts();
}

function populateProducts() {
  const cat = document.getElementById('categorySelect').value;
  const prodSel = document.getElementById('productSelect');
  prodSel.innerHTML = '';
  if (!cat || !prices[cat]) return;
  Object.keys(prices[cat]).forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod;
    opt.textContent = prod;
    prodSel.appendChild(opt);
  });
  updatePriceFields();
}

function updatePriceFields() {
  const cat = document.getElementById('categorySelect').value;
  const prod = document.getElementById('productSelect').value;
  if (cat && prod && prices[cat][prod]) {
    document.getElementById('brokerPrice').value = prices[cat][prod].broker ?? '';
    document.getElementById('customerPrice').value = prices[cat][prod].customer ?? '';
    document.getElementById('churchPrice').value = prices[cat][prod].church ?? '';
  } else {
    document.getElementById('brokerPrice').value = '';
    document.getElementById('customerPrice').value = '';
    document.getElementById('churchPrice').value = '';
  }
}

document.getElementById('categorySelect').addEventListener('change', populateProducts);
document.getElementById('productSelect').addEventListener('change', updatePriceFields);

document.getElementById('saveBtn').addEventListener('click', async () => {
  const cat = document.getElementById('categorySelect').value;
  const prod = document.getElementById('productSelect').value;
  if (cat && prod) {
    prices[cat][prod] = {
      broker: parseFloat(document.getElementById('brokerPrice').value) || 0,
      customer: parseFloat(document.getElementById('customerPrice').value) || 0,
      church: parseFloat(document.getElementById('churchPrice').value) || 0
    };
    await window.api.savePrices(prices);
    document.getElementById('status').textContent = '✅ Prices saved!';
    loadPrices();
  }
});

document.getElementById('confirmAddProductBtn').addEventListener('click', async () => {
  const newCat = document.getElementById('newCategoryInput').value.trim();
  const newProd = document.getElementById('newProductInput').value.trim();

  if (!newProd) {
    alert('⚠️ Please enter a Product name');
    return;
  }

  const category = newCat || document.getElementById('categorySelect').value;
  if (!category) {
    alert('⚠️ Please select or enter a Category');
    return;
  }

  if (!prices[category]) prices[category] = {};
  prices[category][newProd] = { broker: 1.0, customer: 5.0, church: 3.0 };

  await window.api.savePrices(prices);
  document.getElementById('status').textContent = `✅ Added "${newProd}" under "${category}"`;

  document.getElementById('newCategoryInput').value = '';
  document.getElementById('newProductInput').value = '';

  await loadPrices();
  document.getElementById('categorySelect').value = category;
  populateProducts();
  document.getElementById('productSelect').value = newProd;
  updatePriceFields();
});

document.getElementById('deleteProductBtn').addEventListener('click', async () => {
  const cat = document.getElementById('categorySelect').value;
  const prod = document.getElementById('productSelect').value;
  if (cat && prod && prices[cat][prod]) {
    if (confirm(`🗑️ Are you sure you want to delete "${prod}"?`)) {
      delete prices[cat][prod];
      if (Object.keys(prices[cat]).length === 0) delete prices[cat];
      await window.api.savePrices(prices);
      document.getElementById('status').textContent = `🗑️ Deleted "${prod}"`;
      loadPrices();
    }
  }
});

loadPrices();
