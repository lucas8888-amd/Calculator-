const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

const OPERATOR_SYMBOLS = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

function formatNumber(numStr) {
  if (numStr === '' || numStr === undefined) return '0';
  const [intPart, decPart] = numStr.split('.');
  const formattedInt = new Intl.NumberFormat('en-US').format(Number(intPart));
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

function updateDisplay() {
  resultEl.textContent = formatNumber(current);
  if (operator && previous !== null) {
    expressionEl.textContent = `${formatNumber(previous)} ${OPERATOR_SYMBOLS[operator]}`;
  } else {
    expressionEl.textContent = '';
  }
}

function inputDigit(digit) {
  if (justEvaluated) {
    current = digit;
    justEvaluated = false;
    return;
  }
  if (current === '0') {
    current = digit;
  } else {
    current += digit;
  }
}

function inputDecimal() {
  if (justEvaluated) {
    current = '0.';
    justEvaluated = false;
    return;
  }
  if (!current.includes('.')) {
    current += '.';
  }
}

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case 'add': return x + y;
    case 'subtract': return x - y;
    case 'multiply': return x * y;
    case 'divide': return y === 0 ? NaN : x / y;
    default: return y;
  }
}

function setOperator(nextOperator) {
  if (operator && previous !== null && !justEvaluated) {
    const result = compute(previous, current, operator);
    previous = String(result);
    current = String(result);
  } else {
    previous = current;
  }
  operator = nextOperator;
  justEvaluated = false;
  current = '0';
}

function equals() {
  if (operator === null || previous === null) return;
  const result = compute(previous, current, operator);
  current = Number.isNaN(result) ? 'Error' : trimResult(result);
  previous = null;
  operator = null;
  justEvaluated = true;
}

function trimResult(num) {
  if (!isFinite(num)) return 'Error';
  const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
}

function negate() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : `-${current}`;
}

function percent() {
  current = trimResult(parseFloat(current) / 100);
}

document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const { num, action } = btn.dataset;

  if (num !== undefined) {
    inputDigit(num);
  } else if (action === 'decimal') {
    inputDecimal();
  } else if (action === 'clear') {
    clearAll();
  } else if (action === 'negate') {
    negate();
  } else if (action === 'percent') {
    percent();
  } else if (action === 'equals') {
    equals();
  } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
    setOperator(action);
  }

  updateDisplay();
});

document.addEventListener('keydown', (e) => {
  const { key } = e;
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === '.') {
    inputDecimal();
  } else if (key === '+') {
    setOperator('add');
  } else if (key === '-') {
    setOperator('subtract');
  } else if (key === '*') {
    setOperator('multiply');
  } else if (key === '/') {
    e.preventDefault();
    setOperator('divide');
  } else if (key === 'Enter' || key === '=') {
    equals();
  } else if (key === 'Escape') {
    clearAll();
  } else if (key === 'Backspace') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
  } else {
    return;
  }
  updateDisplay();
});

updateDisplay();
