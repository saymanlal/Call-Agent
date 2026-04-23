import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// ===============================
// PARSE EXCEL / CSV
// ===============================
export function parseExcelFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('Uploaded file not found');
    }

    const fileBuffer = fs.readFileSync(filePath);
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

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      raw: false
    });

    const cleanRows = rows.filter(
      (row) =>
        Array.isArray(row) &&
        row.some((cell) => String(cell).trim() !== '')
    );

    const firstRow = cleanRows[0].map((x) =>
      String(x).toLowerCase().trim()
    );

    const hasHeader =
      firstRow[0]?.includes('name') ||
      firstRow[1]?.includes('phone');

    const dataRows = hasHeader
      ? cleanRows.slice(1)
      : cleanRows;

    const contacts = dataRows
      .map((row, index) => ({
        index,
        name:
          row[0] && String(row[0]).trim()
            ? String(row[0]).trim()
            : `Contact ${index + 1}`,
        phone: row[1] ? String(row[1]).trim() : '',
        originalRow: row
      }))
      .filter((x) => x.phone && isValidPhoneNumber(x.phone));

    return {
      contacts,
      originalData: dataRows,
      headers: hasHeader
        ? cleanRows[0]
        : ['NAME', 'PHONE']
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// ===============================
// EXCEL GENERATOR
// ===============================
export function generateUpdatedExcel(
  originalData,
  responses,
  outputPath
) {
  try {
    const map = {};

    responses.forEach((r) => {
      map[String(r.phone_number).trim()] = r;
    });

    const rows = [];

    originalData.forEach((row, index) => {
      const name =
        row[0] && String(row[0]).trim()
          ? String(row[0]).trim()
          : `Contact ${index + 1}`;

      const phone = row[1]
        ? String(row[1]).trim()
        : '';

      const r = map[phone];

      // Q1
      const q1 =
        r?.math_12th_passed === true
          ? 'YES'
          : r?.math_12th_passed === false
          ? 'NO'
          : '-';

      // Q2 NEW FORMAT
      let q2 = '-';

      if (r?.engineering_interested === true) {
        q2 = 'INTERESTED';
      } else if (
        r?.engineering_interested === false
      ) {
        q2 =
          (
            r?.alternative_course || 'NOT INTERESTED'
          ).toUpperCase();
      }

      rows.push({
        NAME: name,
        PHONE: phone,
        'MATH 12TH PASSED': q1,
        'ENGINEERING DECISION': q2,
        'CALL STATUS':
          (
            r?.call_status || 'PENDING'
          ).toUpperCase()
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 28 },
      { wch: 18 },
      { wch: 22 },
      { wch: 28 },
      { wch: 18 }
    ];

    const range = XLSX.utils.decode_range(
      ws['!ref']
    );

    // HEADER
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = XLSX.utils.encode_cell({
        r: 0,
        c: C
      });

      if (!ws[cell]) continue;

      ws[cell].s = {
        font: {
          bold: true,
          color: { rgb: 'FFFFFF' },
          sz: 12
        },
        fill: {
          fgColor: { rgb: '1F4E78' }
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        }
      };
    }

    // BODY
    for (let R = 1; R <= range.e.r; ++R) {
      for (
        let C = range.s.c;
        C <= range.e.c;
        ++C
      ) {
        const cell =
          XLSX.utils.encode_cell({
            r: R,
            c: C
          });

        if (!ws[cell]) continue;

        ws[cell].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          }
        };
      }

      // Q1 column C
      const c1 = `C${R + 1}`;

      if (ws[c1]?.v === 'YES') {
        ws[c1].s.fill = {
          fgColor: { rgb: 'C6EFCE' }
        };
        ws[c1].s.font = {
          bold: true,
          color: { rgb: '006100' }
        };
      }

      if (ws[c1]?.v === 'NO') {
        ws[c1].s.fill = {
          fgColor: { rgb: 'FFC7CE' }
        };
        ws[c1].s.font = {
          bold: true,
          color: { rgb: '9C0006' }
        };
      }

      // Q2 column D
      const c2 = `D${R + 1}`;

      if (
        ws[c2]?.v === 'INTERESTED'
      ) {
        ws[c2].s.fill = {
          fgColor: { rgb: 'C6EFCE' }
        };
        ws[c2].s.font = {
          bold: true,
          color: { rgb: '006100' }
        };
      }

      if (
        ws[c2]?.v !== 'INTERESTED' &&
        ws[c2]?.v !== '-'
      ) {
        ws[c2].s.fill = {
          fgColor: { rgb: 'FFC7CE' }
        };
        ws[c2].s.font = {
          bold: true,
          color: { rgb: '9C0006' }
        };
      }

      // STATUS column E
      const st = `E${R + 1}`;

      if (ws[st]?.v === 'COMPLETED') {
        ws[st].s.fill = {
          fgColor: { rgb: 'C6EFCE' }
        };
        ws[st].s.font = {
          bold: true,
          color: { rgb: '006100' }
        };
      }

      if (ws[st]?.v === 'CANCELED') {
        ws[st].s.fill = {
          fgColor: { rgb: 'FFC7CE' }
        };
        ws[st].s.font = {
          bold: true,
          color: { rgb: '9C0006' }
        };
      }

      if (
        ws[st]?.v === 'FAILED' ||
        ws[st]?.v === 'BUSY' ||
        ws[st]?.v === 'NO-ANSWER'
      ) {
        ws[st].s.fill = {
          fgColor: { rgb: 'BDD7EE' }
        };
        ws[st].s.font = {
          bold: true,
          color: { rgb: '1F4E78' }
        };
      }

      if (ws[st]?.v === 'PENDING') {
        ws[st].s.fill = {
          fgColor: { rgb: 'FFF2CC' }
        };
        ws[st].s.font = {
          bold: true,
          color: { rgb: '7F6000' }
        };
      }
    }

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      'SURVEY RESULTS'
    );

    XLSX.writeFile(wb, outputPath, {
      cellStyles: true
    });

    return outputPath;
  } catch (error) {
    throw new Error(error.message);
  }
}

// ===============================
// PHONE FORMAT
// ===============================
export function formatPhoneNumber(phone) {
  let cleaned = String(phone).replace(/\D/g, '');

  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  return '+' + cleaned;
}

// ===============================
// VALIDATE PHONE
// ===============================
export function isValidPhoneNumber(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return (
    digits.length >= 10 &&
    digits.length <= 15
  );
}