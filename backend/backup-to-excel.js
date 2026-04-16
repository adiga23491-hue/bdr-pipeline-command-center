/**
 * Backup Pipeline CSV to Excel
 * Run this script to automatically export pipeline_master.csv to an Excel file
 * Usage: node backup-to-excel.js
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

const CSV_PATH = path.join(__dirname, 'pipeline_master.csv');
const BACKUP_PATH = path.join(__dirname, 'pipeline_master_backup.xlsx');
const TIMESTAMP_BACKUP_DIR = path.join(__dirname, 'backups');

// Read CSV
function backupToExcel() {
  try {
    if (!fs.existsSync(CSV_PATH)) {
      console.log('❌ CSV file not found:', CSV_PATH);
      return;
    }

    const content = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pipeline Data');

    // Format headers
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { patternType: 'solid', fgColor: { rgb: '0073EA' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    }

    // Set column widths
    const colWidths = {
      'A': 37, 'B': 40, 'C': 18, 'D': 15, 'E': 25, 'F': 15,
      'G': 18, 'H': 25, 'I': 12, 'J': 12, 'K': 30, 'L': 20, 'M': 20, 'N': 25
    };
    ws['!cols'] = Object.values(colWidths).map(w => ({ wch: w }));

    // Save main backup
    XLSX.writeFile(wb, BACKUP_PATH);
    console.log(`✅ Backup created: ${BACKUP_PATH}`);

    // Save timestamped backup
    if (!fs.existsSync(TIMESTAMP_BACKUP_DIR)) {
      fs.mkdirSync(TIMESTAMP_BACKUP_DIR);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const timestampPath = path.join(TIMESTAMP_BACKUP_DIR, `pipeline_master_${timestamp}.xlsx`);
    XLSX.writeFile(wb, timestampPath);
    console.log(`✅ Timestamped backup saved: ${timestampPath}`);

    console.log(`✅ Total records backed up: ${records.length}`);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
  }
}

backupToExcel();
