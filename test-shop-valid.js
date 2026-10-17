const XLSX = require('./frontend/node_modules/xlsx');
const path = require('path');

// Create valid shop Excel file (all items have "SH" prefix)
const validData = [
  {
    'Customer Name': 'Test Shop Customer 1',
    'Phone': '0911234567',
    'Items': 'SH SM J7/J700,J701 INCELL',
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
    'Items': 'SH iPhone 12 LCD Display',
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
    'Items': 'SH Samsung A51 Battery',
    'Quantity': 10,
    'Unit Price': 800,
    'Total Price': 8000,
    'Payment Type': 'Cash',
    'Deposit': 8000,
    'Remaining': 0
  },
  {
    'Customer Name': 'Test Shop Customer 3',
    'Phone': '0933456789',
    'Items': 'SH Huawei P30 Screen',
    'Quantity': 2,
    'Unit Price': 3200,
    'Total Price': 6400,
    'Payment Type': 'Credit',
    'Deposit': 2000,
    'Remaining': 4400
  }
];

const validWorkbook = XLSX.utils.book_new();
const validWorksheet = XLSX.utils.json_to_sheet(validData);
XLSX.utils.book_append_sheet(validWorkbook, validWorksheet, 'Shop Sales');

const validPath = path.join(__dirname, 'test-shop-VALID.xlsx');
XLSX.writeFile(validWorkbook, validPath);

console.log('✅ Created VALID test file: test-shop-VALID.xlsx');
console.log('   All items have "SH" prefix - should be ACCEPTED');
console.log('');
console.log('Items in file:');
validData.forEach((row, i) => {
  console.log(`   ${i + 1}. ${row.Items} ✓`);
});
