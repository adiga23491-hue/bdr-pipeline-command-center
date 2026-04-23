#!/usr/bin/env node

/**
 * CSV Backup Restore Utility
 * Usage:
 *   node restore-from-backup.js list              # List all available backups
 *   node restore-from-backup.js restore <timestamp>  # Restore a specific backup
 *   node restore-from-backup.js latest            # Restore the most recent backup
 */

const fs = require('fs');
const path = require('path');
const { listBackups } = require('./backup-csv.js');

const CSV_PATH = path.join(__dirname, 'pipeline_master.csv');
const BACKUP_DIR = path.join(__dirname, 'backups', 'csv');

const command = process.argv[2];

// ── List all available backups ────────────────────────────────────────────────
function cmdList() {
  const backups = listBackups();

  if (backups.length === 0) {
    console.log('📭 No backups available yet');
    return;
  }

  console.log(`\n📦 Available Backups (${backups.length} total):\n`);
  backups.forEach((backup, i) => {
    const size = fs.statSync(backup.path).size;
    const date = new Date(backup.timestamp.replace(/_/g, ':').replace('-', 'T') + 'Z');
    const dateStr = date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    console.log(`  ${i + 1}. ${backup.filename}`);
    console.log(`     Date: ${dateStr} | Size: ${size} bytes`);
    console.log('');
  });

  console.log('\n💾 To restore a backup, run:');
  console.log('   node restore-from-backup.js restore <timestamp>');
  console.log('   Example: node restore-from-backup.js restore 2024-04-23_14-30-45\n');
}

// ── Restore a specific backup ─────────────────────────────────────────────────
function cmdRestore(timestamp) {
  const backups = listBackups();
  const backup = backups.find((b) => b.timestamp === timestamp);

  if (!backup) {
    console.error(`❌ Backup not found: ${timestamp}`);
    console.log(`\nAvailable timestamps:`);
    backups.forEach((b) => console.log(`  - ${b.timestamp}`));
    process.exit(1);
  }

  // Create recovery checkpoint (current CSV as backup)
  if (fs.existsSync(CSV_PATH)) {
    const recoveryPath = path.join(BACKUP_DIR, `pipeline_master_RECOVERY_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.csv`);
    fs.copyFileSync(CSV_PATH, recoveryPath);
    console.log(`💾 Created recovery checkpoint: ${path.basename(recoveryPath)}`);
  }

  // Restore backup
  try {
    fs.copyFileSync(backup.path, CSV_PATH);
    const size = fs.statSync(CSV_PATH).size;
    console.log(`\n✅ Restored: ${backup.filename} (${size} bytes)`);
    console.log(`📍 Location: ${CSV_PATH}`);
    console.log('\n⚠️  Server restart required to load restored data.\n');
  } catch (err) {
    console.error(`\n❌ Restore failed: ${err.message}\n`);
    process.exit(1);
  }
}

// ── Restore the latest backup ─────────────────────────────────────────────────
function cmdLatest() {
  const backups = listBackups();
  if (backups.length === 0) {
    console.error('❌ No backups available');
    process.exit(1);
  }
  const latest = backups[0];
  console.log(`\nRestoring latest backup: ${latest.filename}`);
  cmdRestore(latest.timestamp);
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!command || command === 'list') {
  cmdList();
} else if (command === 'restore' && process.argv[3]) {
  cmdRestore(process.argv[3]);
} else if (command === 'latest') {
  cmdLatest();
} else {
  console.log(`
📖 CSV Backup Restore Utility

Usage:
  node restore-from-backup.js list              # List all backups
  node restore-from-backup.js restore <timestamp>  # Restore specific backup
  node restore-from-backup.js latest            # Restore latest backup

Examples:
  node restore-from-backup.js list
  node restore-from-backup.js restore 2024-04-23_14-30-45
  node restore-from-backup.js latest
`);
  process.exit(command ? 1 : 0);
}
