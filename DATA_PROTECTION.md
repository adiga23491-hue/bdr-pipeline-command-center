# 🔒 Data Protection & Backup Strategy

## Overview
All opportunity data is now protected with a comprehensive backup system. The backend CSV is treated as the source of truth with multiple redundant backups.

## Backup Architecture

### Primary Data Store
- **Location:** `backend/pipeline_master.csv`
- **Format:** CSV with 14 columns (Id, Opp_Name, Stage, Meeting_Date, Languages, Pain_Validated, Source, Link, BDR_Name, AE_Name, Notes, Email, Next_Step, Last_Updated)
- **Protection:** Read-only from API (only backend modifies this file)

### Backup Files
1. **Main Excel Backup:** `backend/pipeline_master_backup.xlsx`
   - Updated whenever backup script runs
   - Professional formatting with color-coded headers
   - All 24+ opportunities with complete details

2. **Timestamped Backups:** `backend/backups/pipeline_master_YYYY-MM-DDTHH-MM-SS.xlsx`
   - Created automatically on each backup run
   - Keeps historical snapshots of data
   - Useful for recovery if recent changes need to be reverted

3. **Git Repository:** GitHub remote
   - Full change history preserved
   - Can revert to any previous commit
   - Commit messages document data changes

## Backup Workflow

### Automatic Backup (Recommended)
```bash
# Run backup to create Excel exports
cd backend
node backup-to-excel.js

# Or add to cron for daily backups
0 2 * * * cd /path/to/backend && node backup-to-excel.js
```

### Manual Backup
```bash
npm run backup
```

## Data Modification Policy

### ✅ Allowed: Frontend Changes
- Add/edit Email and Next_Step fields
- Update Opp_Name, Stage, Languages, Source, Link, AE_Name, Notes
- All changes sync to backend CSV automatically

### ❌ Restricted: Backend Deletions
- **NEVER** delete opportunities from the CSV directly
- **NEVER** modify the CSV file manually without backup
- **ALWAYS** run backup before making bulk changes

## Data Recovery

### If data is accidentally lost:
1. **Check timestamped backups:** `backend/backups/`
2. **Check Excel backup:** `backend/pipeline_master_backup.xlsx`
3. **Check git history:** `git log backend/pipeline_master.csv`
4. **Restore from commit:** `git checkout <commit-hash> -- backend/pipeline_master.csv`

### Restore from git (example)
```bash
# List recent commits
git log --oneline -n 20 backend/pipeline_master.csv

# Restore to specific commit
git checkout 2492464 -- backend/pipeline_master.csv
```

## Important Notes

⚠️ **Frontend-Only Updates Going Forward**
- All UI changes and new features are frontend-only
- Backend CSV is protected from accidental modification
- Any data changes go through the API endpoints only

⚠️ **Excel Backups**
- Excel files are snapshots, not live connections
- They must be regenerated with `backup-to-excel.js` to be current
- Do not edit Excel files directly; use the application instead

📊 **Data Integrity**
- All 24 opportunities preserved with complete metadata
- No data loss from Phase 2 implementation
- Email and Next_Step fields added for future enhancement

## Quick Reference

| Action | Command | Notes |
|--------|---------|-------|
| Backup to Excel | `node backend/backup-to-excel.js` | Creates main + timestamped backup |
| View backup history | `ls -la backend/backups/` | Lists all timestamped backups |
| Restore from git | `git checkout <hash> -- backend/pipeline_master.csv` | Requires git commit hash |
| Check git history | `git log backend/pipeline_master.csv` | Shows all CSV modifications |
| Verify current data | `head -5 backend/pipeline_master.csv` | Peek at CSV data |

## Questions?
If data is ever lost or corrupted, backups exist in:
1. `backend/pipeline_master_backup.xlsx` (latest)
2. `backend/backups/` (historical)
3. GitHub repository (full history)
