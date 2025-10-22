const { extractTextFromPDF } = require('./dist/utils/pdfParser');
const path = require('path');

async function testPDF() {
  // Create a test PDF file path (you'll need to provide a real PDF)
  const testFile = process.argv[2];
  
  if (!testFile) {
    console.log('Usage: node test-pdf.js <path-to-pdf-file>');
    process.exit(1);
  }
  
  try {
    console.log('Testing PDF extraction...');
    const result = await extractTextFromPDF(testFile);
    console.log('\n=== EXTRACTED TEXT ===');
    console.log(result);
    console.log('\n=== END ===');
    console.log(`\nExtracted ${result.length} characters successfully!`);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPDF();