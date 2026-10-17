const XLSX = require('./frontend/node_modules/xlsx');
const path = require('path');

// Create invalid shop Excel file (some items missing "SH" prefix)
const invalidData = [
  {
    'Customer Name': 'Test Shop Customer 1',
    'Phone': '0911234567',
    'Items': 'SM J7/J700,J701 INCELL',  // ❌ Missing "SH" prefix
    'Quantity': 5,
    'Unit Price': 2500,
    'Total Price': 12500,
    'Payment Type': 'Credit',
    'Deposit': 5000,
    'Remaining': 7500
  },
  {
    'Customer Name': 'Test Shop Customer 1',
    'Phone': '0911234567',
    'Items': 'SH iPhone 12 LCD Display',  // ✓ Has "SH" prefix
    'Quantity': 3,
    'Unit Price': 4500,
    'Total Price': 13500,
    'Payment Type': 'Credit',
    'Deposit': 5000,
    'Remaining': 8500
  },
  {
    'Customer Name': 'Test Shop Customer 2',
    'Phone': '0922345678',
    'Items': 'Samsung A51 Battery',  // ❌ Missing "SH" prefix
    'Quantity': 10,
    'Unit Price': 800,
    'Total Price': 8000,
    'Payment Type': 'Cash',
    'Deposit': 8000,
    'Remaining': 0
  }
];

const invalidWorkbook = XLSX.utils.book_new();
const invalidWorksheet = XLSX.utils.json_to_sheet(invalidData);
XLSX.utils.book_append_sheet(invalidWorkbook, invalidWorksheet, 'Shop Sales');

const invalidPath = path.join(__dirname, 'test-shop-INVALID.xlsx');
XLSX.writeFile(invalidWorkbook, invalidPath);

console.log('❌ Created INVALID test file: test-shop-INVALID.xlsx');
console.log('   Some items missing "SH" prefix - should be REJECTED');
console.log('');
console.log('Items in file:');
invalidData.forEach((row, i) => {
  const hasSH = row.Items.toUpperCase().startsWith('SH ');
  const status = hasSH ? '✓' : '✗';
  console.log(`   ${i + 1}. ${row.Items} ${status}`);
});
