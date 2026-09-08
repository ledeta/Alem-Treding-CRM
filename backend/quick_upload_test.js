const fs = require('fs');
const path = require('path');
const http = require('http');

// List all xlsx files in uploads directory
const uploadsDir = 'uploads';
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.xlsx'));

console.log('📁 Excel files found:');
files.forEach(f => {
  const stats = fs.statSync(path.join(uploadsDir, f));
  console.log(`   • ${f} (${stats.size} bytes)`);
});

console.log('\n');

// Test with first xlsx file found
if (files.length === 0) {
  console.error('❌ No .xlsx files found in uploads directory!');
  process.exit(1);
}

const testFile = files[0];
const filePath = path.join(uploadsDir, testFile);

console.log(`🚀 Testing with: ${testFile}\n`);

function uploadFile() {
  return new Promise((resolve, reject) => {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const boundary = 'WebKitFormBoundary' + Math.random().toString(36).substr(2);
      
      const formData = [];
      formData.push(`--${boundary}`);
      formData.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"`);
      formData.push('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      formData.push('');
      
      const body = Buffer.concat([
        Buffer.from(formData.join('\r\n') + '\r\n', 'utf8'),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
      ]);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/transactions/import/sales',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      
      req.on('error', reject);
      req.write(body);
      req.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

uploadFile()
  .then(result => {
    console.log('═'.repeat(70));
    console.log('📊 UPLOAD TEST RESULT');
    console.log('═'.repeat(70));
    console.log(`Status Code: ${result.status}\n`);
    
    if (result.status === 201 && result.data.success) {
      console.log('✅ SUCCESS!\n');
      console.log(`Message: ${result.data.message}`);
      console.log(`\nImport Summary:`);
      console.log(`  • Total Rows: ${result.data.data.totalRows}`);
      console.log(`  • Imported: ${result.data.data.successCount}`);
      console.log(`  • Failed: ${result.data.data.failCount}`);
      
      if (result.data.data.parseErrors.length > 0) {
        console.log(`  • Parse Errors: ${result.data.data.parseErrors.length}`);
        result.data.data.parseErrors.slice(0, 3).forEach(e => {
          console.log(`    - ${e.error}`);
        });
      }
      
      if (result.data.data.importErrors.length > 0) {
        console.log(`  • Import Errors: ${result.data.data.importErrors.length}`);
        result.data.data.importErrors.slice(0, 3).forEach(e => {
          console.log(`    - Row ${e.rowNumber}: ${e.error}`);
        });
      }
      
      console.log(`\nCategory Summary:`);
      Object.entries(result.data.data.categorySummary).forEach(([cat, count]) => {
        console.log(`  • ${cat}: ${count}`);
      });
      
      console.log(`\nBranch Summary:`);
      Object.entries(result.data.data.branchSummary).forEach(([branch, count]) => {
        console.log(`  • ${branch}: ${count}`);
      });
      
      console.log(`\n✅ File uploaded successfully!`);
      
    } else if (result.status === 400) {
      console.log('❌ BAD REQUEST (400)\n');
      console.log('Error Details:');
      if (result.data.message) {
        console.log(`  Message: ${result.data.message}`);
      }
      if (result.data.data && result.data.data.errors) {
        result.data.data.errors.forEach(e => {
          console.log(`  • ${e.error}`);
        });
      }
    } else if (result.status === 401) {
      console.log('❌ UNAUTHORIZED (401)\n');
      console.log('The endpoint requires authentication but none was provided.');
    } else {
      console.log(`❌ ERROR (${result.status})\n`);
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
    
    console.log('═'.repeat(70));
  })
  .catch(error => {
    console.error('❌ Upload Test Failed:', error.message);
  });
