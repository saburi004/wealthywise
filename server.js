// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import dotenv from 'dotenv';
// import fs from 'fs';
// import { createRequire } from 'module';

// // Correct PDF.js import for Node.js
// const require = createRequire(import.meta.url);
// const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
// const pdfjsWorker = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

// // Configure PDF.js for Node.js
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// // Rest of your imports
// import { gmailRouter } from './backend/gmail.js';

// dotenv.config();
// const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Create temp folder if it doesn't exist
// const TEMP_FOLDER = path.join(__dirname, 'backend', 'temp');
// if (!fs.existsSync(TEMP_FOLDER)) {
//   fs.mkdirSync(TEMP_FOLDER, { recursive: true });
// }

// // ... rest of your existing code ...




// // import express from 'express';
// // import path from 'path';
// // import { fileURLToPath } from 'url';
// // import dotenv from 'dotenv';
// // import fs from 'fs';
// // import { createRequire } from 'module';
// // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
// // import { gmailRouter } from './backend/gmail.js';

// // // Create require function for ES modules
// // const require = createRequire(import.meta.url);

// // dotenv.config();
// // const app = express();
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Configure PDF.js for Node.js environment
// // pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // // Create temp folder if it doesn't exist
// // const TEMP_FOLDER = path.join(__dirname, 'temp');
// // if (!fs.existsSync(TEMP_FOLDER)) {
// //   fs.mkdirSync(TEMP_FOLDER, { recursive: true });
// // }

// // Middleware
// app.use(express.json());

// // Routes
// app.use('/auth/google', gmailRouter);
// app.use(express.static(path.join(__dirname, 'frontend')));

// // PDF Processing Functions
// async function processPDF(filePath) {
//   try {
//     const data = new Uint8Array(fs.readFileSync(filePath));
//     const pdf = await pdfjsLib.getDocument({ data }).promise;
//     const result = {
//       filename: path.basename(filePath),
//       totalPages: pdf.numPages,
//       tables: [],
//       extractedAt: new Date().toISOString()
//     };

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const textContent = await page.getTextContent();
//       const tables = await extractTablesFromPage(textContent, i);
//       result.tables.push(...tables);
//     }

//     result.metadata = {
//       totalTables: result.tables.length,
//       totalRows: result.tables.reduce((sum, table) => sum + table.rows.length, 0)
//     };

//     return result;
//   } catch (error) {
//     console.error(`Error processing ${filePath}:`, error);
//     return {
//       filename: path.basename(filePath),
//       error: error.message,
//       stack: error.stack
//     };
//   }
// }

// async function extractTablesFromPage(textContent, pageNum) {
//   const items = textContent.items;
//   const lineGroups = groupTextItemsByLine(items);
//   const tables = [];

//   // Simple table detection - looks for rows with consistent column patterns
//   let currentTable = null;
  
//   for (const line of lineGroups) {
//     if (isPotentialTableRow(line)) {
//       if (!currentTable) {
//         currentTable = {
//           page: pageNum,
//           headers: guessHeaders(line),
//           rows: [],
//           columnPositions: line.items.map(item => item.x)
//         };
//       }
//       currentTable.rows.push(extractRowData(line, currentTable.columnPositions));
//     } else if (currentTable) {
//       tables.push(currentTable);
//       currentTable = null;
//     }
//   }

//   if (currentTable) tables.push(currentTable);
//   return tables;
// }

// function groupTextItemsByLine(items) {
//   const lineMap = new Map();
//   const tolerance = 3; // pixels
  
//   items.forEach(item => {
//     if (!item.str.trim()) return;
    
//     const y = Math.round(item.transform[5]);
//     let targetY = y;
    
//     for (const existingY of lineMap.keys()) {
//       if (Math.abs(existingY - y) <= tolerance) {
//         targetY = existingY;
//         break;
//       }
//     }
    
//     if (!lineMap.has(targetY)) {
//       lineMap.set(targetY, []);
//     }
//     lineMap.get(targetY).push({
//       text: item.str.trim(),
//       x: Math.round(item.transform[4])
//     });
//   });

//   return Array.from(lineMap.entries())
//     .sort((a, b) => b[0] - a[0]) // top to bottom
//     .map(([y, items]) => ({
//       y,
//       items: items.sort((a, b) => a.x - b.x) // left to right
//     }));
// }

// function isPotentialTableRow(line) {
//   // Enhanced table row detection
//   if (line.items.length < 3) return false;
  
//   const texts = line.items.map(item => item.text);
//   const hasDate = texts.some(text => /^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(text));
//   const hasAmount = texts.some(text => /^[\d,]+\.\d{2}$/.test(text));
  
//   // Check for consistent column spacing
//   const xPositions = line.items.map(item => item.x);
//   const xDiffs = [];
//   for (let i = 1; i < xPositions.length; i++) {
//     xDiffs.push(xPositions[i] - xPositions[i-1]);
//   }
//   const avgSpacing = xDiffs.reduce((a,b) => a + b, 0) / xDiffs.length;
//   const isConsistent = xDiffs.every(diff => Math.abs(diff - avgSpacing) < 10);
  
//   return hasDate || hasAmount || isConsistent;
// }

// function guessHeaders(line) {
//   // Enhanced header detection
//   return line.items.map((item, i) => {
//     const text = item.text.toLowerCase();
//     if (text.match(/date|dt|trans.*date/)) return 'date';
//     if (text.match(/desc|narration|particulars|details/)) return 'description';
//     if (text.match(/withdrawal|debit|dr|paid|charges/)) return 'debit';
//     if (text.match(/deposit|credit|cr|received|interest/)) return 'credit';
//     if (text.match(/balance|bal|closing/)) return 'balance';
//     if (text.match(/chq|cheque|check|ref|reference/)) return 'reference';
//     if (text.match(/value.*date/)) return 'value_date';
//     return `column_${i+1}`;
//   });
// }

// function extractRowData(line, columnPositions) {
//   const row = {};
//   const tolerance = 20; // pixels
  
//   line.items.forEach(item => {
//     let bestCol = 0;
//     let minDist = Math.abs(item.x - columnPositions[0]);
    
//     for (let i = 1; i < columnPositions.length; i++) {
//       const dist = Math.abs(item.x - columnPositions[i]);
//       if (dist < minDist) {
//         minDist = dist;
//         bestCol = i;
//       }
//     }
    
//     if (minDist <= tolerance) {
//       const colName = `column_${bestCol+1}`;
//       row[colName] = cleanValue(item.text);
      
//       // Try to auto-detect column type if not already set
//       if (/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(item.text)) {
//         row[`${colName}_type`] = 'date';
//       } else if (/^[\d,]+\.\d{2}$/.test(item.text)) {
//         row[`${colName}_type`] = 'amount';
//       }
//     }
//   });
  
//   return row;
// }

// function cleanValue(value) {
//   // Enhanced value cleaning
//   if (/^[\d,]+\.\d{2}$/.test(value)) {
//     return parseFloat(value.replace(/,/g, ''));
//   }
//   if (/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(value)) {
//     return value.replace(/-/g, '/'); // Standardize date separators
//   }
//   return value.trim();
// }

// // API Endpoints
// app.get('/process-pdfs', async (req, res) => {
//   try {
//     const pdfFiles = fs.readdirSync(TEMP_FOLDER)
//       .filter(file => file.toLowerCase().endsWith('.pdf'));
    
//     if (pdfFiles.length === 0) {
//       return res.status(404).json({ error: 'No PDF files found' });
//     }

//     const results = await Promise.all(
//       pdfFiles.map(file => processPDF(path.join(TEMP_FOLDER, file)))
//     );

//     res.json({
//       success: true,
//       processedAt: new Date().toISOString(),
//       processedFiles: pdfFiles.length,
//       results
//     });
//   } catch (error) {
//     console.error('PDF processing error:', error);
//     res.status(500).json({ 
//       error: 'PDF processing failed',
//       details: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });

// // CLI-specific endpoint with console output
// app.get('/process-pdfs-cli', async (req, res) => {
//   try {
//     const pdfFiles = fs.readdirSync(TEMP_FOLDER)
//       .filter(file => file.toLowerCase().endsWith('.pdf'));
    
//     if (pdfFiles.length === 0) {
//       console.log('No PDF files found in temp folder');
//       return res.status(404).json({ error: 'No PDF files found' });
//     }

//     console.log(`\nProcessing ${pdfFiles.length} PDF file(s)...`);
//     const results = [];

//     for (const file of pdfFiles) {
//       const filePath = path.join(TEMP_FOLDER, file);
//       const result = await processPDF(filePath);
//       results.push(result);

//       // CLI output
//       console.log(`\n=== ${file} ===`);
//       console.log(`Pages: ${result.totalPages}`);
//       console.log(`Tables found: ${result.tables.length}`);
//       console.log(`Rows extracted: ${result.metadata?.totalRows || 0}`);
      
//       if (result.tables.length > 0) {
//         const firstTable = result.tables[0];
//         console.log('\nSample data (first table):');
//         console.log('Headers:', firstTable.headers.join(', '));
//         if (firstTable.rows.length > 0) {
//           console.log('First row:', JSON.stringify(firstTable.rows[0], null, 2));
//         }
//       }
//     }

//     // Also return JSON response
//     res.json({
//       success: true,
//       processedAt: new Date().toISOString(),
//       processedFiles: pdfFiles.length,
//       results
//     });
//   } catch (error) {
//     console.error('PDF processing error:', error);
//     res.status(500).json({ 
//       error: 'PDF processing failed',
//       details: error.message
//     });
//   }
// });

// // File management endpoints
// app.get('/list-files', (req, res) => {
//   try {
//     const files = fs.readdirSync(TEMP_FOLDER);
//     const fileInfo = files.map(filename => ({
//       filename,
//       path: path.join(TEMP_FOLDER, filename),
//       size: fs.statSync(path.join(TEMP_FOLDER, filename)).size,
//       lastModified: fs.statSync(path.join(TEMP_FOLDER, filename)).mtime
//     }));
//     res.json(fileInfo);
//   } catch (err) {
//     console.error('Error listing files:', err);
//     res.status(500).json({ error: 'Could not read files' });
//   }
// });

// app.get('/download', (req, res) => {
//   const filename = req.query.file;
//   if (!filename) {
//     return res.status(400).send('Filename required');
//   }

//   if (filename.includes('..') || filename.includes('/')) {
//     return res.status(400).send('Invalid filename');
//   }

//   const filePath = path.join(TEMP_FOLDER, filename);
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).send('File not found');
//   }

//   res.download(filePath, filename, (err) => {
//     if (err) {
//       console.error('Download error:', err);
//       res.status(500).send('Download failed');
//     }
//   });
// });

// app.get('/cleanup', (req, res) => {
//   try {
//     const files = fs.readdirSync(TEMP_FOLDER);
//     files.forEach(file => {
//       try {
//         fs.unlinkSync(path.join(TEMP_FOLDER, file));
//       } catch (err) {
//         console.error(`Error deleting file ${file}:`, err);
//       }
//     });
//     res.json({ message: 'Temp files cleaned up', deletedCount: files.length });
//   } catch (err) {
//     console.error('Cleanup error:', err);
//     res.status(500).json({ error: 'Cleanup failed' });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   res.status(500).json({ 
//     error: 'Internal server error',
//     details: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
//   console.log(`Temp folder: ${TEMP_FOLDER}`);
//   console.log(`PDF.js version: ${pdfjsLib.version}`);
// });




import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { createRequire } from 'module';

// PDF.js setup
const require = createRequire(import.meta.url);
// const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
// const pdfjsWorker = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const pdfjsWorker = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Gmail OAuth router
import { gmailRouter } from './app/transaction/gmail.js';

// Setup
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp folder
const TEMP_FOLDER = path.join(__dirname, 'backend', 'temp');
if (!fs.existsSync(TEMP_FOLDER)) {
  fs.mkdirSync(TEMP_FOLDER, { recursive: true });
}

// Middleware
app.use(express.json());
app.use('/auth/google', gmailRouter);  // ✅ CORRECTED HERE
app.use(express.static(path.join(__dirname, 'frontend')));

// Example password generator function (you can customize or remove this)
function generatePasswordsFromEnv() {
  const passwords = new Set();
  const userInfo = {
    customerId: process.env.USER_CUSTOMERID || '',
    firstName: process.env.USER_FIRSTNAME || '',
    dob: process.env.USER_DOB || '',
    pan: process.env.USER_PAN || '',
    last4: process.env.USER_LAST4 || '',
    account: process.env.USER_ACC || '',
    mobile: process.env.USER_MOBILE || '',
    emailPrefix: process.env.USER_EMAIL_PREFIX || ''
  };

  // Basic values
  passwords.add(userInfo.pan);
  passwords.add(userInfo.customerId);
  passwords.add(userInfo.dob);
  passwords.add(userInfo.last4);
  passwords.add(userInfo.account);
  passwords.add(userInfo.mobile);
  passwords.add(userInfo.emailPrefix);

  // DOB variations (format: 181124)
  if (userInfo.dob.length === 6) {
    passwords.add(userInfo.dob.slice(0, 4)); // First 4 digits
    passwords.add(userInfo.dob.slice(2));    // Last 4 digits
    passwords.add(userInfo.dob.slice(4));    // Last 2 digits
    passwords.add(`19${userInfo.dob}`);      // 19 prefix
    passwords.add(`20${userInfo.dob}`);      // 20 prefix
  }

  // Name combinations
  if (userInfo.firstName) {
    const nameLower = userInfo.firstName.toLowerCase();
    const nameUpper = userInfo.firstName.toUpperCase();
    const nameShort = userInfo.firstName.slice(0, 4);
    
    passwords.add(`${nameLower}${userInfo.dob}`);
    passwords.add(`${nameLower}${userInfo.dob.slice(-4)}`);
    passwords.add(`${nameUpper}${userInfo.dob}`);
    passwords.add(`${nameShort}${userInfo.dob}`);
    passwords.add(`${nameShort.toLowerCase()}${userInfo.dob.slice(-4)}`);
    passwords.add(`${nameLower}123`);
    passwords.add(`${nameLower}@123`);
    passwords.add(`${nameLower}${userInfo.dob.slice(-2)}`);
  }

  // PAN number variations
  if (userInfo.pan.length === 10) {
    passwords.add(userInfo.pan.slice(5, 9)); // Numeric part
    passwords.add(userInfo.pan.slice(5));    // Last 5 chars
    passwords.add(userInfo.pan.slice(0, 5)); // First 5 chars
  }

  // Account number variations
  if (userInfo.account) {
    passwords.add(userInfo.account.slice(-4)); // Last 4 digits
    passwords.add(userInfo.account.slice(-6)); // Last 6 digits
  }

  // Mobile number variations
  if (userInfo.mobile) {
    passwords.add(userInfo.mobile.slice(-4)); // Last 4 digits
    passwords.add(userInfo.mobile.slice(-6)); // Last 6 digits
  }

  // Common weak passwords
  passwords.add('password');
  passwords.add('123456');
  passwords.add('welcome');
  passwords.add('admin');
  passwords.add('bank123');

  return Array.from(passwords);
}

// PDF processing with password handling
async function processPDF(filePath) {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    
    // First try without password
    try {
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      console.log(`PDF ${path.basename(filePath)} opened without password`);
      return await extractPDFData(pdf, filePath);
    } catch (noPasswordError) {
      if (noPasswordError.message.includes('password')) {
        // PDF is password protected
        console.log(`PDF ${path.basename(filePath)} is password protected, attempting to crack...`);
        
        const userPasswords = generatePasswordsFromEnv();
        console.log(`Generated ${userPasswords.length} possible passwords`);
        
        // Try each generated password
        for (const password of userPasswords) {
          try {
            const pdf = await pdfjsLib.getDocument({ 
              data, 
              password 
            }).promise;
            console.log(`Successfully opened with password: ${password.replace(/./g, '*')}`);
            return await extractPDFData(pdf, filePath);
          } catch (passError) {
            continue; // Try next password
          }
        }
        
        throw new Error('Failed to crack PDF password with generated passwords');
      }
      throw noPasswordError;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return {
      filename: path.basename(filePath),
      error: error.message,
      stack: error.stack
    };
  }
}

// Extract data from opened PDF
async function extractPDFData(pdf, filePath) {
  const result = {
    filename: path.basename(filePath),
    totalPages: pdf.numPages,
    tables: [],
    extractedAt: new Date().toISOString()
  };

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const tables = await extractTablesFromPage(textContent, i);
    result.tables.push(...tables);
  }

  result.metadata = {
    totalTables: result.tables.length,
    totalRows: result.tables.reduce((sum, table) => sum + table.rows.length, 0)
  };

  return result;
}

// Table extraction functions
async function extractTablesFromPage(textContent, pageNum) {
  const items = textContent.items;
  const lineGroups = groupTextItemsByLine(items);
  const tables = [];
  let currentTable = null;
  
  for (const line of lineGroups) {
    if (isPotentialTableRow(line)) {
      if (!currentTable) {
        currentTable = {
          page: pageNum,
          headers: guessHeaders(line),
          rows: [],
          columnPositions: line.items.map(item => item.x)
        };
      }
      currentTable.rows.push(extractRowData(line, currentTable.columnPositions));
    } else if (currentTable) {
      tables.push(currentTable);
      currentTable = null;
    }
  }

  if (currentTable) tables.push(currentTable);
  return tables;
}

function groupTextItemsByLine(items) {
  const lineMap = new Map();
  const tolerance = 3;
  
  items.forEach(item => {
    if (!item.str.trim()) return;
    
    const y = Math.round(item.transform[5]);
    let targetY = y;
    
    for (const existingY of lineMap.keys()) {
      if (Math.abs(existingY - y) <= tolerance) {
        targetY = existingY;
        break;
      }
    }
    
    if (!lineMap.has(targetY)) {
      lineMap.set(targetY, []);
    }
    lineMap.get(targetY).push({
      text: item.str.trim(),
      x: Math.round(item.transform[4])
    });
  });

  return Array.from(lineMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([y, items]) => ({
      y,
      items: items.sort((a, b) => a.x - b.x)
    }));
}

function isPotentialTableRow(line) {
  if (line.items.length < 3) return false;
  
  const texts = line.items.map(item => item.text);
  const hasDate = texts.some(text => /^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(text));
  const hasAmount = texts.some(text => /^[\d,]+\.\d{2}$/.test(text));
  
  const xPositions = line.items.map(item => item.x);
  const xDiffs = [];
  for (let i = 1; i < xPositions.length; i++) {
    xDiffs.push(xPositions[i] - xPositions[i-1]);
  }
  const avgSpacing = xDiffs.reduce((a,b) => a + b, 0) / xDiffs.length;
  const isConsistent = xDiffs.every(diff => Math.abs(diff - avgSpacing) < 10);
  
  return hasDate || hasAmount || isConsistent;
}

function guessHeaders(line) {
  return line.items.map((item, i) => {
    const text = item.text.toLowerCase();
    if (text.match(/date|dt|trans.*date/)) return 'date';
    if (text.match(/desc|narration|particulars|details/)) return 'description';
    if (text.match(/withdrawal|debit|dr|paid|charges/)) return 'debit';
    if (text.match(/deposit|credit|cr|received|interest/)) return 'credit';
    if (text.match(/balance|bal|closing/)) return 'balance';
    if (text.match(/chq|cheque|check|ref|reference/)) return 'reference';
    if (text.match(/value.*date/)) return 'value_date';
    return `column_${i+1}`;
  });
}

function extractRowData(line, columnPositions) {
  const row = {};
  const tolerance = 20;
  
  line.items.forEach(item => {
    let bestCol = 0;
    let minDist = Math.abs(item.x - columnPositions[0]);
    
    for (let i = 1; i < columnPositions.length; i++) {
      const dist = Math.abs(item.x - columnPositions[i]);
      if (dist < minDist) {
        minDist = dist;
        bestCol = i;
      }
    }
    
    if (minDist <= tolerance) {
      const colName = `column_${bestCol+1}`;
      row[colName] = cleanValue(item.text);
      
      if (/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(item.text)) {
        row[`${colName}_type`] = 'date';
      } else if (/^[\d,]+\.\d{2}$/.test(item.text)) {
        row[`${colName}_type`] = 'amount';
      }
    }
  });
  
  return row;
}

function cleanValue(value) {
  if (/^[\d,]+\.\d{2}$/.test(value)) {
    return parseFloat(value.replace(/,/g, ''));
  }
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(value)) {
    return value.replace(/-/g, '/');
  }
  return value.trim();
}


app.get('/process-pdfs-cli', async (req, res) => {
  try {
    const pdfFiles = fs.readdirSync(TEMP_FOLDER)
      .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('❌ No PDF files found in temp folder');
      return res.status(404).json({ error: 'No PDF files found' });
    }

    console.log(`\n🔍 Processing ${pdfFiles.length} PDF file(s)...`);
    const results = [];

    for (const file of pdfFiles) {
      const filePath = path.join(TEMP_FOLDER, file);
      console.log(`\n📄 === Processing: ${file} ===`);

      // Track processing time
      const startTime = Date.now();
      const result = await processPDF(filePath);
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      results.push(result);

      // CLI output
      console.log(`\n📊 Extraction Results:`);
      console.log(`⏱️  Processing Time: ${processingTime}s`);
      console.log(`📑 Pages: ${result.totalPages}`);
      
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
        if (result.error.includes('password')) {
          console.log('💡 Tip: Add more password patterns to your environment variables');
        }
      } else {
        console.log(`📊 Tables found: ${result.tables.length}`);
        console.log(`📝 Rows extracted: ${result.metadata?.totalRows || 0}`);
        
        if (result.tables.length > 0) {
          const firstTable = result.tables[0];
          console.log('\n🔢 Sample data (first table):');
          console.log('📌 Headers:', firstTable.headers.join(', '));
          
          if (firstTable.rows.length > 0) {
            console.log('\n🔠 First row data:');
            const sampleRow = firstTable.rows[0];
            for (const [key, value] of Object.entries(sampleRow)) {
              console.log(`  ${key.padEnd(20)}: ${value}`);
            }
          }
        }
      }
      
      console.log(`\n✅ Finished processing: ${file}`);
    }

    // Summary
    console.log('\n📈 Processing Summary:');
    console.log(`✔️  Processed Files: ${pdfFiles.length}`);
    console.log(`✔️  Successful Extractions: ${results.filter(r => !r.error).length}`);
    console.log(`❌ Failed Extractions: ${results.filter(r => r.error).length}`);

    // Also return JSON response
    res.json({
      success: true,
      processedAt: new Date().toISOString(),
      processedFiles: pdfFiles.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      results
    });
  } catch (error) {
    console.error('\n🔥 PDF processing error:', error);
    res.status(500).json({ 
      error: 'PDF processing failed',
      details: error.message
    });
  }
});
// API Endpoints
app.get('/process-pdfs', async (req, res) => {
  try {
    const pdfFiles = fs.readdirSync(TEMP_FOLDER)
      .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      return res.status(404).json({ error: 'No PDF files found' });
    }

    const results = await Promise.all(
      pdfFiles.map(file => processPDF(path.join(TEMP_FOLDER, file)))
    );

    res.json({
      success: true,
      processedAt: new Date().toISOString(),
      processedFiles: pdfFiles.length,
      results
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: 'PDF processing failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// File management endpoints
app.get('/list-files', (req, res) => {
  try {
    const files = fs.readdirSync(TEMP_FOLDER);
    res.json(files.map(filename => ({
      filename,
      path: path.join(TEMP_FOLDER, filename),
      size: fs.statSync(path.join(TEMP_FOLDER, filename)).size,
      lastModified: fs.statSync(path.join(TEMP_FOLDER, filename)).mtime
    })));
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).json({ error: 'Could not read files' });
  }
});

app.get('/download', (req, res) => {
  const filename = req.query.file;
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return res.status(400).send('Invalid filename');
  }

  const filePath = path.join(TEMP_FOLDER, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.download(filePath, filename);
});

app.get('/cleanup', (req, res) => {
  try {
    const files = fs.readdirSync(TEMP_FOLDER);
    files.forEach(file => {
      try {
        fs.unlinkSync(path.join(TEMP_FOLDER, file));
      } catch (err) {
        console.error(`Error deleting file ${file}:`, err);
      }
    });
    res.json({ message: 'Temp files cleaned up', deletedCount: files.length });
  } catch (err) {
    console.error('Cleanup error:', err);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`Temp folder: ${TEMP_FOLDER}`);
  console.log(`PDF.js version: ${pdfjsLib.version}`);
});