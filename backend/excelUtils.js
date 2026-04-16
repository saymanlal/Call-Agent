import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Parse Excel / CSV file and extract contacts
export function parseExcelFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('Uploaded file not found');
    }

    // Read file buffer (more reliable on Render / cloud hosting)
    const fileBuffer = fs.readFileSync(filePath);

    // Detect extension
    const ext = path.extname(filePath).toLowerCase();

    let workbook;

    if (ext === '.csv') {
      workbook = XLSX.read(fileBuffer.toString('utf8'), {
        type: 'string'
      });
    } else {
      workbook = XLSX.read(fileBuffer, {
        type: 'buffer'
      });
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No worksheet found in file');
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Read rows as arrays
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false
    });

    if (!rows || rows.length < 1) {
      throw new Error('File is empty');
    }

    // Remove empty rows
    const cleanRows = rows.filter(
      (row) => Array.isArray(row) && row.some((cell) => String(cell).trim() !== '')
    );

    if (cleanRows.length < 1) {
      throw new Error('No usable rows found');
    }

    // Detect if first row is header
    const firstRow = cleanRows[0].map((cell) =>
      String(cell).toLowerCase().trim()
    );

    const hasHeader =
      firstRow[0]?.includes('name') ||
      firstRow[1]?.includes('phone') ||
      firstRow[1]?.includes('mobile') ||
      firstRow[1]?.includes('number');

    const dataRows = hasHeader ? cleanRows.slice(1) : cleanRows;

    const contacts = dataRows
      .map((row, index) => {
        const name =
          row[0] && String(row[0]).trim() !== ''
            ? String(row[0]).trim()
            : `Contact ${index + 1}`;

        const phone = row[1] ? String(row[1]).trim() : '';

        return {
          index,
          name,
          phone,
          originalRow: row
        };
      })
      .filter((contact) => contact.phone && isValidPhoneNumber(contact.phone));

    if (contacts.length === 0) {
      throw new Error(
        'No valid contacts found. Column A = Name, Column B = Phone Number'
      );
    }

    return {
      contacts,
      originalData: dataRows,
      headers: hasHeader ? cleanRows[0] : ['Name', 'Phone']
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

// Generate updated Excel file with responses
export function generateUpdatedExcel(originalData, responses, outputPath) {
  try {
    const updatedData = [];

    const responseMap = {};
    responses.forEach((response) => {
      responseMap[String(response.phone_number).trim()] = response;
    });

    originalData.forEach((row, index) => {
      const name =
        row[0] && String(row[0]).trim() !== ''
          ? String(row[0]).trim()
          : `Contact ${index + 1}`;

      const phone = row[1] ? String(row[1]).trim() : '';

      const response = responseMap[phone];

      updatedData.push({
        Name: name,
        Phone: phone,
        'Mathematics 12th Passed': response
          ? response.math_12th_passed
            ? 'Yes'
            : 'No'
          : 'No Response',

        'Engineering Interested': response
          ? response.engineering_interested
            ? 'Yes'
            : 'No'
          : 'No Response',

        'Alternative Course': response
          ? response.alternative_course || '-'
          : '-',

        'Call Status': response
          ? response.call_status || 'Completed'
          : 'Pending'
      });
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(updatedData);

    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Results');

    XLSX.writeFile(workbook, outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error(`Failed to generate Excel file: ${error.message}`);
  }
}

// Format phone number for Twilio
export function formatPhoneNumber(phone) {
  let cleaned = String(phone).replace(/\D/g, '');

  // India default
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  return '+' + cleaned;
}

// Validate phone number
export function isValidPhoneNumber(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}