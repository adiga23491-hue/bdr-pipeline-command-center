/**
 * CSV Backup Manager
 * Automatically creates timestamped backups of pipeline_master.csv on startup
 * Keeps only the latest 10 backups to prevent disk space issues
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'pipeline_master.csv');
const BACKUP_DIR = path.join(__dirname, 'backups', 'csv');
const MAX_BACKUPS = 10;

/**
 * Creates a timestamped backup of the CSV file
 * Format: pipeline_master_YYYY-MM-DD_HH-MM-SS.csv
 */
function backupCSV() {
  // Skip if CSV doesn't exist yet
  if (!fs.existsSync(CSV_PATH)) {
    console.log('ℹ️  No CSV to backup yet');
    return null;
  }

  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
    }

    // Create timestamped backup filename
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5); // Format: YYYY-MM-DD_HH-MM-SS (removes milliseconds and Z)

    const backupPath = path.join(BACKUP_DIR, `pipeline_master_${timestamp}.csv`);

    // Copy CSV to backup
    fs.copyFileSync(CSV_PATH, backupPath);
    const backupSize = fs.statSync(backupPath).size;
    console.log(`✅ CSV backup created: pipeline_master_${timestamp}.csv (${backupSize} bytes)`);

    // Auto-cleanup: Keep only latest MAX_BACKUPS
    cleanupOldBackups();

    return backupPath;
  } catch (err) {
    console.error(`❌ Backup failed: ${err.message}`);
    return null;
  }
}

/**
 * Remove old backups, keeping only the latest MAX_BACKUPS
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('pipeline_master_') && f.endsWith('.csv'))
      .sort()
      .reverse(); // Sort descending (newest first)

    if (files.length > MAX_BACKUPS) {
      const filesToRemove = files.slice(MAX_BACKUPS);
      filesToRemove.forEach((f) => {
        const filePath = path.join(BACKUP_DIR, f);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed old backup: ${f}`);
      });
    }
  } catch (err) {
    console.warn(`⚠️  Cleanup warning: ${err.message}`);
  }
}

/**
 * List all available backups with timestamps
 */
function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    return fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('pipeline_master_') && f.endsWith('.csv'))
      .map((f) => ({
        filename: f,
        timestamp: f.replace('pipeline_master_', '').replace('.csv', ''),
        path: path.join(BACKUP_DIR, f),
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Newest first
  } catch (err) {
    console.error(`Error listing backups: ${err.message}`);
    return [];
  }
}

module.exports = { backupCSV, listBackups };
