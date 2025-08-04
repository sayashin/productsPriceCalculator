// sketch.js (Fixed button clicks + custom price input field)
let widthInput = '', heightInput = '', unit = 'inches';
let selectedCategory = '', selectedProduct = '', customerType = 'broker';
let isTypingWidth = false, isTypingHeight = false, isTypingCustomPrice = false;
let pricesData = {}; 
let result = '';
let showCategoryOptions = false, showProductOptions = false, showCustomerOptions = false, showUnitOptions = false;
let highQuality = false;
let useCustomPrice = false;
let customPrice = '';
let availableProducts = [];

const dropdownStyle = { w: 300, h: 30, spacing: 35 };

async function preload() {
  pricesData = await window.api.loadPrices();
}

function setup() {
  createCanvas(550, 1200);
  textFont('monospace');
  textSize(16);
  selectedCategory = Object.keys(pricesData)[0] || '';
  selectedProduct = selectedCategory ? Object.keys(pricesData[selectedCategory])[0] : '';
}

function draw() {
  background(0);
  fill(255);

  text('Width:', 20, 40);
  drawInputBox(widthInput, 150, 20, isTypingWidth);

  text('Height:', 20, 90);
  drawInputBox(heightInput, 150, 70, isTypingHeight);

  text('Unit:', 20, 140);
  drawDropdown(unit, 150, 120);

  text('Category:', 20, 190);
  drawDropdown(selectedCategory, 150, 170);

  text('Product:', 20, 240);
  drawDropdown(selectedProduct, 150, 220);

  text('Customer:', 20, 290);
  drawDropdown(customerType, 150, 270);

  drawCheckbox('High Quality (+$1/sqft)', 20, 340, highQuality);
  drawCheckbox('Use Custom Price', 20, 390, useCustomPrice);

  if (useCustomPrice) {
    text('Custom Price:', 20, 440);
    drawInputBox(customPrice, 150, 420, isTypingCustomPrice);
  }

  let basePrice = getCurrentPrice();
  if (basePrice !== null && !useCustomPrice) {
    text(`$${basePrice.toFixed(2)} per sqft`, 150, useCustomPrice ? 480 : 430);
  }

  drawButton('Calculate Price', 20, 500, 200, 40);
  drawButton('Clear', 250, 500, 120, 40);
  drawButton('Edit Prices', 400, 500, 120, 40);

  textSize(22);
  text(result, 20, 580);
  textSize(16);

  if (showUnitOptions) drawDropdownOptions(['inches', 'feet'], 150, 120);
  if (showCategoryOptions) drawDropdownOptions(Object.keys(pricesData).filter(cat => cat !== 'Generic'), 150, 170);
  if (showProductOptions && selectedCategory) drawDropdownOptions(availableProducts, 150, 220);
  if (showCustomerOptions) drawDropdownOptions(['broker', 'customer', 'church'], 150, 270);
}

function getCurrentPrice() {
  if (useCustomPrice) {
    return parseFloat(customPrice) || 0;
  }
  if (pricesData[selectedCategory] && pricesData[selectedCategory][selectedProduct]) {
    return pricesData[selectedCategory][selectedProduct][customerType] || 0;
  }
  return null;
}

function drawInputBox(val, x, y, active) {
  stroke(active ? 'blue' : 'gray');
  fill(20);
  rect(x, y, dropdownStyle.w, dropdownStyle.h);
  fill(255);
  noStroke();
  text(val, x + 5, y + 20);
}

function drawDropdown(label, x, y) {
  stroke('gray');
  fill(40);
  rect(x, y, dropdownStyle.w, dropdownStyle.h);
  fill(255);
  noStroke();
  text(trimText(label, 25) + ' ▼', x + 5, y + 20);
}

function drawDropdownOptions(options, x, y) {
  for (let i = 0; i < options.length; i++) {
    let yOpt = y + dropdownStyle.h + i * dropdownStyle.h;
    fill(mouseY > yOpt && mouseY < yOpt + dropdownStyle.h ? 100 : 60);
    stroke('gray');
    rect(x, yOpt, dropdownStyle.w, dropdownStyle.h);
    fill(255);
    noStroke();
    text(trimText(options[i], 28), x + 5, yOpt + 20);
  }
}

function trimText(text, maxChars) {
  return text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
}

function drawButton(label, x, y, w, h) {
  fill(80);
  stroke('gray');
  rect(x, y, w, h);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textAlign(LEFT, BASELINE);
}

function drawCheckbox(label, x, y, checked) {
  stroke('gray');
  fill(20);
  rect(x, y, 20, 20);
  if (checked) {
    fill(0, 255, 0);
    rect(x + 4, y + 4, 12, 12);
  }
  noStroke();
  fill(255);
  text(label, x + 30, y + 18);
}

function mousePressed() {
  const xMin = 150, xMax = 450;
  isTypingWidth = mouseX > xMin && mouseX < xMax && mouseY > 20 && mouseY < 50;
  isTypingHeight = mouseX > xMin && mouseX < xMax && mouseY > 70 && mouseY < 100;
  isTypingCustomPrice = useCustomPrice && mouseX > xMin && mouseX < xMax && mouseY > 420 && mouseY < 450;

  if (mouseX > 20 && mouseX < 40 && mouseY > 340 && mouseY < 360) highQuality = !highQuality;
  if (mouseX > 20 && mouseX < 40 && mouseY > 390 && mouseY < 410) useCustomPrice = !useCustomPrice;

  if (showUnitOptions) return selectDropdown(['inches', 'feet'], 120, (val) => unit = val);
  if (showCategoryOptions) return selectDropdown(Object.keys(pricesData).filter(cat => cat !== 'Generic'), 170, (val) => {
    selectedCategory = val;
    availableProducts = Object.keys(pricesData[selectedCategory] || {});
    selectedProduct = availableProducts[0] || '';
    showCategoryOptions = false;
    showProductOptions = true;
  });
  if (showProductOptions) return selectDropdown(availableProducts, 220, (val) => selectedProduct = val);
  if (showCustomerOptions) return selectDropdown(['broker', 'customer', 'church'], 270, (val) => customerType = val);

  if (mouseX > xMin && mouseX < xMax && mouseY > 120 && mouseY < 150) return toggleDropdown('unit');
  if (mouseX > xMin && mouseX < xMax && mouseY > 170 && mouseY < 200) return toggleDropdown('category');
  if (mouseX > xMin && mouseX < xMax && mouseY > 220 && mouseY < 250) return toggleDropdown('product');
  if (mouseX > xMin && mouseX < xMax && mouseY > 270 && mouseY < 300) return toggleDropdown('customer');

  if (mouseX > 20 && mouseX < 220 && mouseY > 500 && mouseY < 540) calculatePrice();
  if (mouseX > 250 && mouseX < 370 && mouseY > 500 && mouseY < 540) clearInputs();
  if (mouseX > 400 && mouseX < 520 && mouseY > 500 && mouseY < 540) window.api.openAdmin();
}

function toggleDropdown(type) {
  showUnitOptions = type === 'unit';
  showCategoryOptions = type === 'category';
  showProductOptions = type === 'product';
  showCustomerOptions = type === 'customer';
}

function selectDropdown(options, baseY, callback) {
  options.forEach((val, i) => {
    let yOpt = baseY + dropdownStyle.h + i * dropdownStyle.h;
    if (mouseY > yOpt && mouseY < yOpt + dropdownStyle.h) {
      callback(val);
      showUnitOptions = showCategoryOptions = showProductOptions = showCustomerOptions = false;
    }
  });
}

function keyPressed() {
  if (keyCode === BACKSPACE) {
    if (isTypingWidth) widthInput = widthInput.slice(0, -1);
    else if (isTypingHeight) heightInput = heightInput.slice(0, -1);
    else if (isTypingCustomPrice) customPrice = customPrice.slice(0, -1);
    return false;
  }
}

function keyTyped() {
  if (isNumeric(key)) {
    if (isTypingWidth) widthInput += key;
    else if (isTypingHeight) heightInput += key;
    else if (isTypingCustomPrice) customPrice += key;
  }
}

function isNumeric(ch) {
  return /[0-9.]/.test(ch);
}

function calculatePrice() {
  const w = parseFloat(widthInput);
  const h = parseFloat(heightInput);
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || !selectedProduct) {
    result = 'Enter valid width, height, and product';
    return;
  }
  const realW = unit === 'inches' ? w / 12 : w;
  const realH = unit === 'inches' ? h / 12 : h;
  const area = realW * realH;
  let basePrice = getCurrentPrice();
  if (highQuality) basePrice += 1.0;
  const total = area * basePrice;
  result = `Area: ${area.toFixed(2)} sqft | Total: $${total.toFixed(2)}`;
}

function clearInputs() {
  widthInput = '';
  heightInput = '';
  result = '';
  highQuality = false;
  customPrice = '';
}
