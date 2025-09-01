#!/bin/bash

# ===============================================================================
# DATABASE RESTORE SCRIPT
# ===============================================================================
# Disaster recovery script for restoring Supabase database from backup
# Usage: ./scripts/restore-database.sh [backup_file] [target_environment]
# WARNING: This will overwrite the target database!
# ===============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
LOG_FILE="${BACKUP_DIR}/restore.log"

# Arguments
BACKUP_FILE=${1:-}
TARGET_ENV=${2:-staging}

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Show help
show_help() {
    cat << EOF
Database Restore Script

WARNING: This will completely overwrite the target database!
         Always test restores in staging first.

Usage: $0 BACKUP_FILE [TARGET_ENVIRONMENT]

Arguments:
    BACKUP_FILE         Path to backup file (.sql or .sql.gz)
    TARGET_ENVIRONMENT  Environment to restore to (staging|production)
                       Default: staging

Options:
    -h, --help  Show this help message
    -l, --list  List available backup files

Environment Variables:
    SUPABASE_PROJECT_ID         Production project ID
    SUPABASE_STAGING_PROJECT_ID Staging project ID
    RESTORE_CONFIRMATION        Set to 'yes' to skip confirmation

Examples:
    $0 backups/staging_backup_20240101_120000.sql.gz staging
    $0 backups/production_backup_20240101_120000.sql.gz staging
    
    # List available backups
    $0 --list

Safety Features:
    - Requires explicit confirmation
    - Creates pre-restore backup
    - Validates backup file before restore
    - Logs all operations

EOF
}

# List available backups
list_backups() {
    log "Available backup files:"
    echo
    
    if [[ -d "$BACKUP_DIR" ]]; then
        find "$BACKUP_DIR" -name "*.sql*" -type f -exec ls -lh {} \; | \
        awk '{print $9, "("$5", "$6" "$7")"}' | \
        sort -r
    else
        log "No backup directory found at $BACKUP_DIR"
    fi
    
    exit 0
}

# Validate inputs
validate_inputs() {
    log "Validating inputs..."
    
    # Check if help or list requested
    case "${BACKUP_FILE:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--list)
            list_backups
            ;;
        "")
            error_exit "Backup file not specified. Use --help for usage information."
            ;;
    esac
    
    # Validate backup file
    if [[ ! -f "$BACKUP_FILE" ]]; then
        error_exit "Backup file not found: $BACKUP_FILE"
    fi
    
    # Validate target environment
    case $TARGET_ENV in
        staging|production)
            log "Target environment: $TARGET_ENV"
            ;;
        *)
            error_exit "Invalid target environment. Use 'staging' or 'production'"
            ;;
    esac
    
    # Check required environment variables
    local project_id_var
    case $TARGET_ENV in
        production)
            project_id_var="SUPABASE_PROJECT_ID"
            if [[ -z "${SUPABASE_PROJECT_ID:-}" ]]; then
                error_exit "SUPABASE_PROJECT_ID environment variable not set"
            fi
            ;;
        staging)
            project_id_var="SUPABASE_STAGING_PROJECT_ID"
            if [[ -z "${SUPABASE_STAGING_PROJECT_ID:-}" ]]; then
                error_exit "SUPABASE_STAGING_PROJECT_ID environment variable not set"
            fi
            ;;
    esac
    
    log "Input validation passed"
}

# Safety confirmation
confirm_restore() {
    if [[ "${RESTORE_CONFIRMATION:-}" == "yes" ]]; then
        log "Restore confirmation bypassed via environment variable"
        return
    fi
    
    echo
    echo "⚠️  WARNING: DATABASE RESTORE OPERATION ⚠️"
    echo
    echo "This will completely overwrite the $TARGET_ENV database!"
    echo "Backup file: $BACKUP_FILE"
    echo "Target: $TARGET_ENV environment"
    echo
    echo "This operation is IRREVERSIBLE."
    echo
    
    read -p "Type 'RESTORE' to confirm: " confirmation
    
    if [[ "$confirmation" != "RESTORE" ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
    
    log "Restore confirmed by user"
}

# Create pre-restore backup
create_pre_restore_backup() {
    log "Creating pre-restore backup of target database..."
    
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local pre_restore_backup="${BACKUP_DIR}/${TARGET_ENV}_pre_restore_${timestamp}.sql"
    
    local project_id
    case $TARGET_ENV in
        production)
            project_id="$SUPABASE_PROJECT_ID"
            ;;
        staging)
            project_id="$SUPABASE_STAGING_PROJECT_ID"
            ;;
    esac
    
    if supabase db dump --project-ref "$project_id" > "$pre_restore_backup" 2>> "$LOG_FILE"; then
        # Compress the backup
        gzip "$pre_restore_backup" || true
        log "Pre-restore backup created: ${pre_restore_backup}.gz"
    else
        log "WARNING: Failed to create pre-restore backup"
        read -p "Continue without pre-restore backup? (y/N): " continue_anyway
        if [[ "$continue_anyway" != "y" && "$continue_anyway" != "Y" ]]; then
            error_exit "Restore cancelled due to backup failure"
        fi
    fi
}

# Validate backup file
validate_backup_file() {
    log "Validating backup file..."
    
    # Check if file is compressed
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        # Test gzip integrity
        if ! gzip -t "$BACKUP_FILE" 2>> "$LOG_FILE"; then
            error_exit "Backup file is corrupted (gzip test failed)"
        fi
        log "Compressed backup file validation passed"
    fi
    
    # Check file size
    local file_size_bytes
    file_size_bytes=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    
    if [[ $file_size_bytes -lt 1024 ]]; then
        error_exit "Backup file is too small ($file_size_bytes bytes)"
    fi
    
    local file_size_human
    file_size_human=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup file size: $file_size_human"
    
    log "Backup file validation passed"
}

# Perform restore
perform_restore() {
    log "Starting database restore..."
    
    local project_id
    case $TARGET_ENV in
        production)
            project_id="$SUPABASE_PROJECT_ID"
            ;;
        staging)
            project_id="$SUPABASE_STAGING_PROJECT_ID"
            ;;
    esac
    
    # Prepare SQL file
    local sql_file="$BACKUP_FILE"
    local temp_file=""
    
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        temp_file=$(mktemp)
        if ! gunzip -c "$BACKUP_FILE" > "$temp_file" 2>> "$LOG_FILE"; then
            [[ -n "$temp_file" ]] && rm -f "$temp_file"
            error_exit "Failed to decompress backup file"
        fi
        sql_file="$temp_file"
        log "Backup file decompressed for restore"
    fi
    
    # Reset database
    log "Resetting target database..."
    if supabase db reset --project-ref "$project_id" 2>> "$LOG_FILE"; then
        log "Database reset completed"
    else
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        error_exit "Failed to reset database"
    fi
    
    # Apply backup
    log "Applying backup to database..."
    if supabase db push --project-ref "$project_id" < "$sql_file" 2>> "$LOG_FILE"; then
        log "Database restore completed successfully"
    else
        [[ -n "$temp_file" ]] && rm -f "$temp_file"
        error_exit "Failed to apply backup to database"
    fi
    
    # Clean up temporary file
    [[ -n "$temp_file" ]] && rm -f "$temp_file"
}

# Verify restore
verify_restore() {
    log "Verifying restore..."
    
    local project_id
    case $TARGET_ENV in
        production)
            project_id="$SUPABASE_PROJECT_ID"
            ;;
        staging)
            project_id="$SUPABASE_STAGING_PROJECT_ID"
            ;;
    esac
    
    # Test basic connectivity
    if supabase projects list | grep -q "$project_id"; then
        log "Database connectivity verified"
    else
        log "WARNING: Could not verify database connectivity"
    fi
    
    # TODO: Add specific table/data verification based on your schema
    
    log "Restore verification completed"
}

# Send notification
send_notification() {
    local status=$1
    local message="Database restore $status for $TARGET_ENV environment"
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local emoji="✅"
        [[ "$status" == "FAILED" ]] && emoji="❌"
        
        local payload="{\"text\":\"$emoji $message\"}"
        curl -X POST -H 'Content-type: application/json' \
             --data "$payload" \
             "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # Email notification for failures
    if [[ -n "${ALERT_EMAIL:-}" && "$status" == "FAILED" ]]; then
        echo "$message. Check logs at $LOG_FILE" | \
        mail -s "Database Restore Alert" "$ALERT_EMAIL" &>/dev/null || true
    fi
    
    log "Notification sent: $message"
}

# Main execution
main() {
    log "========================================"
    log "Starting database restore process"
    log "Backup file: $BACKUP_FILE"
    log "Target environment: $TARGET_ENV"
    log "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log "========================================"
    
    # Trap errors and send failure notification
    trap 'send_notification "FAILED"; exit 1' ERR
    
    validate_inputs
    confirm_restore
    validate_backup_file
    create_pre_restore_backup
    perform_restore
    verify_restore
    
    send_notification "COMPLETED"
    
    log "========================================"
    log "Database restore completed successfully"
    log "Environment: $TARGET_ENV"
    log "========================================"
}

# Create log directory
mkdir -p "$BACKUP_DIR"

# Run main function
main