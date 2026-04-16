import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Parse Excel file and extract contacts
export function parseExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Extract name and phone from first two columns
    const contacts = jsonData.map((row, index) => {
      const columns = Object.values(row);
      return {
        index: index,
        name: columns[0] ? String(columns[0]).trim() : `Contact ${index + 1}`,
        phone: String(columns[1]).trim(),
        originalRow: row
      };
    }).filter(contact => contact.phone && contact.phone.length > 0);

    return {
      contacts,
      originalData: jsonData,
      headers: Object.keys(jsonData[0] || {})
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

// Generate updated Excel file with responses
export function generateUpdatedExcel(originalData, responses, outputPath) {
  try {
    // Create a copy of original data
    const updatedData = JSON.parse(JSON.stringify(originalData));

    // Add response columns if they don't exist
    const responseMap = {};
    responses.forEach(response => {
      responseMap[response.phone_number] = response;
    });

    // Update rows with responses
    updatedData.forEach((row, index) => {
      const columns = Object.values(row);
      const phoneNumber = String(columns[1]).trim();
      const response = responseMap[phoneNumber];

      if (response) {
        // Add columns for responses
        const keys = Object.keys(row);
        
        if (keys.length === 2) {
          // Original file only had Name and Phone
          row['Mathematics 12th Passed'] = response.math_12th_passed ? 'Yes' : 'No';
          row['Engineering Interested'] = response.engineering_interested ? 'Interested' : 
                                          (response.alternative_course ? 'Not Interested' : 'No Response');
          row['Alternative Course'] = response.alternative_course || '-';
          row['Call Status'] = response.call_status;
        } else {
          // Assume columns are already there
          const mathColumn = keys[2] || 'Mathematics 12th Passed';
          const engineeringColumn = keys[3] || 'Engineering Interested';
          const altCourseColumn = keys[4] || 'Alternative Course';
          
          row[mathColumn] = response.math_12th_passed ? 'Yes' : 'No';
          row[engineeringColumn] = response.engineering_interested ? 'Interested' : 
                                   (response.alternative_course ? 'Not Interested' : 'No Response');
          row[altCourseColumn] = response.alternative_course || '-';
        }
      }
    });

    // Create workbook and add data
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(updatedData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 15 }, // Phone
      { wch: 20 }, // Mathematics 12th Passed
      { wch: 25 }, // Engineering Interested
      { wch: 30 }, // Alternative Course
      { wch: 15 }  // Call Status
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Results');
    
    // Write file
    XLSX.writeFile(workbook, outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error(`Failed to generate Excel file: ${error.message}`);
  }
}

// Format phone number for Twilio
export function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming US)
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  
  return '+' + cleaned;
}

// Validate phone number format
export function isValidPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}
