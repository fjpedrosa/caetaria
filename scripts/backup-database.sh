#!/bin/bash

# ===============================================================================
# DATABASE BACKUP SCRIPT
# ===============================================================================
# Automated backup script for production Supabase database
# Usage: ./scripts/backup-database.sh [production|staging]
# ===============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Environment variables
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${ENVIRONMENT}_backup_${TIMESTAMP}.sql"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        error_exit "Supabase CLI not found. Install with: npm install -g supabase"
    fi
    
    # Check environment variables
    case $ENVIRONMENT in
        production)
            if [[ -z "${SUPABASE_PROJECT_ID:-}" ]]; then
                error_exit "SUPABASE_PROJECT_ID environment variable not set"
            fi
            ;;
        staging)
            if [[ -z "${SUPABASE_STAGING_PROJECT_ID:-}" ]]; then
                error_exit "SUPABASE_STAGING_PROJECT_ID environment variable not set"
            fi
            ;;
        *)
            error_exit "Invalid environment. Use 'production' or 'staging'"
            ;;
    esac
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    log "Prerequisites check passed"
}

# Perform backup
perform_backup() {
    log "Starting backup for $ENVIRONMENT environment..."
    
    local project_id
    case $ENVIRONMENT in
        production)
            project_id="$SUPABASE_PROJECT_ID"
            ;;
        staging)
            project_id="$SUPABASE_STAGING_PROJECT_ID"
            ;;
    esac
    
    # Create database dump
    log "Creating database dump..."
    if supabase db dump --project-ref "$project_id" > "$BACKUP_FILE" 2>> "$LOG_FILE"; then
        log "Database dump created successfully: $BACKUP_FILE"
    else
        error_exit "Failed to create database dump"
    fi
    
    # Compress backup file
    log "Compressing backup file..."
    if gzip "$BACKUP_FILE"; then
        BACKUP_FILE="${BACKUP_FILE}.gz"
        log "Backup compressed: $BACKUP_FILE"
    else
        log "WARNING: Failed to compress backup file"
    fi
    
    # Get file size
    local file_size
    file_size=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup file size: $file_size"
}

# Upload to cloud storage (if configured)
upload_to_cloud() {
    if [[ -n "${AWS_S3_BACKUP_BUCKET:-}" && -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
        log "Uploading backup to S3..."
        
        if command -v aws &> /dev/null; then
            local s3_key="database-backups/$ENVIRONMENT/$(basename "$BACKUP_FILE")"
            
            if aws s3 cp "$BACKUP_FILE" "s3://${AWS_S3_BACKUP_BUCKET}/${s3_key}" 2>> "$LOG_FILE"; then
                log "Backup uploaded to S3: s3://${AWS_S3_BACKUP_BUCKET}/${s3_key}"
            else
                log "WARNING: Failed to upload backup to S3"
            fi
        else
            log "WARNING: AWS CLI not installed, skipping S3 upload"
        fi
    else
        log "Cloud backup not configured, skipping upload"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    local retention_days=${BACKUP_RETENTION_DAYS:-30}
    log "Cleaning up backups older than $retention_days days..."
    
    # Find and delete old backups
    local deleted_count=0
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
        log "Deleted old backup: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "${ENVIRONMENT}_backup_*.sql.gz" -type f -mtime +$retention_days -print0 2>/dev/null || true)
    
    if [[ $deleted_count -eq 0 ]]; then
        log "No old backups to clean up"
    else
        log "Cleaned up $deleted_count old backup files"
    fi
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        # Test gzip file integrity
        if gzip -t "$BACKUP_FILE" 2>> "$LOG_FILE"; then
            log "Backup file integrity verified"
        else
            error_exit "Backup file is corrupted"
        fi
    fi
    
    # Check file size (should be > 1KB)
    local file_size_bytes
    file_size_bytes=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    
    if [[ $file_size_bytes -lt 1024 ]]; then
        error_exit "Backup file is too small ($file_size_bytes bytes), likely incomplete"
    fi
    
    log "Backup verification passed"
}

# Send notification
send_notification() {
    local status=$1
    local message="Database backup $status for $ENVIRONMENT environment"
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local payload="{\"text\":\"🗄️ $message\"}"
        curl -X POST -H 'Content-type: application/json' \
             --data "$payload" \
             "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # Email notification (if configured)
    if [[ -n "${ALERT_EMAIL:-}" && "$status" == "FAILED" ]]; then
        echo "$message. Check logs at $LOG_FILE" | \
        mail -s "Database Backup Alert" "$ALERT_EMAIL" &>/dev/null || true
    fi
    
    log "Notification sent: $message"
}

# Main execution
main() {
    log "========================================"
    log "Starting database backup process"
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $TIMESTAMP"
    log "========================================"
    
    # Trap errors and send failure notification
    trap 'send_notification "FAILED"; exit 1' ERR
    
    check_prerequisites
    perform_backup
    verify_backup
    upload_to_cloud
    cleanup_old_backups
    
    send_notification "COMPLETED"
    
    log "========================================"
    log "Database backup completed successfully"
    log "Backup file: $BACKUP_FILE"
    log "========================================"
}

# Help function
show_help() {
    cat << EOF
Database Backup Script

Usage: $0 [ENVIRONMENT]

ENVIRONMENT:
    production  Backup production database (default)
    staging     Backup staging database

Options:
    -h, --help  Show this help message

Environment Variables:
    SUPABASE_PROJECT_ID         Production project ID (required for production)
    SUPABASE_STAGING_PROJECT_ID Staging project ID (required for staging)
    AWS_S3_BACKUP_BUCKET       S3 bucket for cloud backups (optional)
    AWS_ACCESS_KEY_ID          AWS access key (required for S3 upload)
    AWS_SECRET_ACCESS_KEY      AWS secret key (required for S3 upload)
    BACKUP_RETENTION_DAYS      Days to keep backups (default: 30)
    SLACK_WEBHOOK_URL          Slack webhook for notifications (optional)
    ALERT_EMAIL                Email for failure notifications (optional)

Examples:
    $0                         # Backup production database
    $0 production              # Backup production database
    $0 staging                 # Backup staging database

EOF
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    ""|production|staging)
        main
        ;;
    *)
        echo "Error: Invalid argument '$1'"
        show_help
        exit 1
        ;;
esac