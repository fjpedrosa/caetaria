#!/bin/bash

# ===============================================================================
# PRODUCTION DEPLOYMENT SCRIPT
# ===============================================================================
# Comprehensive production deployment script with safety checks and validation
# Usage: ./scripts/deploy-production.sh [--skip-checks] [--auto-approve]
# ===============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/deployment.log"

# Arguments
SKIP_CHECKS=false
AUTO_APPROVE=false
ENVIRONMENT="production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
    log "SUCCESS: $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    log "WARNING: $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    log "ERROR: $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
    log "INFO: $1"
}

# Error handling
error_exit() {
    error "$1"
    log "DEPLOYMENT FAILED: $1"
    send_failure_notification "$1"
    exit 1
}

# Show help
show_help() {
    cat << EOF
Production Deployment Script

Usage: $0 [OPTIONS]

Options:
    --skip-checks      Skip pre-deployment validation checks
    --auto-approve     Skip manual confirmation prompts
    -h, --help         Show this help message

Environment Variables:
    VERCEL_TOKEN       Vercel deployment token (required)
    SKIP_CHECKS        Skip validation checks (true|false)
    AUTO_APPROVE       Skip manual approvals (true|false)
    
Examples:
    $0                          # Full deployment with all checks
    $0 --skip-checks           # Deploy without validation
    $0 --auto-approve          # Deploy without prompts
    
EOF
}

# Parse arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-checks)
                SKIP_CHECKS=true
                shift
                ;;
            --auto-approve)
                AUTO_APPROVE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Override with environment variables
    [[ "${SKIP_CHECKS:-}" == "true" ]] && SKIP_CHECKS=true
    [[ "${AUTO_APPROVE:-}" == "true" ]] && AUTO_APPROVE=true
}

# Pre-deployment checks
run_pre_deployment_checks() {
    if [[ "$SKIP_CHECKS" == "true" ]]; then
        warning "Pre-deployment checks skipped"
        return
    fi
    
    info "Running pre-deployment validation..."
    
    # Run production readiness checklist
    if [[ -x "$SCRIPT_DIR/production-checklist.sh" ]]; then
        if "$SCRIPT_DIR/production-checklist.sh" --environment production; then
            success "Production readiness checks passed"
        else
            error_exit "Production readiness checks failed"
        fi
    else
        warning "Production checklist script not found or not executable"
    fi
}

# Backup current production
backup_current_production() {
    info "Creating pre-deployment backup..."
    
    if [[ -x "$SCRIPT_DIR/backup-database.sh" ]]; then
        if "$SCRIPT_DIR/backup-database.sh" production; then
            success "Pre-deployment backup completed"
        else
            warning "Pre-deployment backup failed (continuing deployment)"
        fi
    else
        warning "Backup script not found"
    fi
}

# Build and test
build_and_test() {
    info "Building and testing application..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    info "Installing dependencies..."
    if npm ci; then
        success "Dependencies installed"
    else
        error_exit "Failed to install dependencies"
    fi
    
    # Run tests
    info "Running tests..."
    if npm run test:ci; then
        success "All tests passed"
    else
        error_exit "Tests failed"
    fi
    
    # Build application
    info "Building production bundle..."
    if npm run build; then
        success "Production build completed"
    else
        error_exit "Production build failed"
    fi
    
    # Verify build output
    if [[ -d ".next" && -f ".next/BUILD_ID" ]]; then
        success "Build output verified"
    else
        error_exit "Build output validation failed"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    info "Deploying to Vercel production..."
    
    # Check if Vercel CLI is available
    if ! command -v vercel &> /dev/null; then
        error_exit "Vercel CLI not installed. Install with: npm i -g vercel"
    fi
    
    # Check for Vercel token
    if [[ -z "${VERCEL_TOKEN:-}" ]]; then
        error_exit "VERCEL_TOKEN environment variable not set"
    fi
    
    # Deploy with production flag
    if vercel --prod --token="$VERCEL_TOKEN" --yes; then
        success "Deployment to Vercel completed"
    else
        error_exit "Vercel deployment failed"
    fi
}

# Post-deployment validation
validate_deployment() {
    info "Validating deployment..."
    
    # Get deployment URL (this would be your actual domain)
    local domain="${PRODUCTION_DOMAIN:-https://neptunik.com}"
    
    # Health check
    info "Testing health endpoint..."
    local health_response
    if health_response=$(curl -s -w "%{http_code}" -o /dev/null "$domain/api/health"); then
        if [[ "$health_response" == "200" ]]; then
            success "Health check passed"
        else
            error_exit "Health check failed (HTTP $health_response)"
        fi
    else
        error_exit "Health check request failed"
    fi
    
    # Status check
    info "Testing status endpoint..."
    local status_response
    if status_response=$(curl -s -w "%{http_code}" -o /dev/null "$domain/api/status"); then
        if [[ "$status_response" == "200" ]]; then
            success "Status check passed"
        else
            warning "Status check returned HTTP $status_response"
        fi
    else
        warning "Status check request failed"
    fi
    
    # SSL verification
    info "Verifying SSL certificate..."
    if openssl s_client -connect "${domain#https://}:443" -servername "${domain#https://}" < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        success "SSL certificate verified"
    else
        warning "SSL certificate verification failed"
    fi
    
    # Basic page load test
    info "Testing main page load..."
    if curl -s -o /dev/null -w "%{time_total}" "$domain" | awk '{if($1 < 5) print "pass"; else print "fail"}' | grep -q "pass"; then
        success "Main page loads within acceptable time"
    else
        warning "Main page load time may be slow"
    fi
}

# Purge CDN cache
purge_cdn_cache() {
    info "Purging CDN cache..."
    
    # Check if we can purge Cloudflare cache
    if [[ -n "${CLOUDFLARE_API_TOKEN:-}" && -n "${CLOUDFLARE_ZONE_ID:-}" ]]; then
        if command -v curl &> /dev/null; then
            local purge_response
            purge_response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
                -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
                -H "Content-Type: application/json" \
                --data '{"purge_everything":true}' \
                -w "%{http_code}")
            
            if echo "$purge_response" | grep -q '"success":true'; then
                success "CDN cache purged"
            else
                warning "CDN cache purge may have failed"
            fi
        else
            warning "curl not available for CDN cache purge"
        fi
    else
        info "CDN cache purge not configured (skipping)"
    fi
}

# Send notifications
send_success_notification() {
    local message="🚀 Production deployment successful for Neptunik platform"
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"$message\"}" \
             "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # Discord notification  
    if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"content\":\"$message\"}" \
             "$DISCORD_WEBHOOK_URL" &>/dev/null || true
    fi
    
    log "SUCCESS NOTIFICATION SENT: $message"
}

send_failure_notification() {
    local error_message="$1"
    local message="❌ Production deployment failed for Neptunik platform: $error_message"
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"$message\"}" \
             "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # Discord notification
    if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"content\":\"$message\"}" \
             "$DISCORD_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # Email notification
    if [[ -n "${ALERT_EMAIL:-}" ]] && command -v mail &> /dev/null; then
        echo "Deployment failed with error: $error_message. Check logs at $LOG_FILE" | \
        mail -s "Production Deployment Failed" "$ALERT_EMAIL" &>/dev/null || true
    fi
    
    log "FAILURE NOTIFICATION SENT: $message"
}

# Manual confirmation
confirm_deployment() {
    if [[ "$AUTO_APPROVE" == "true" ]]; then
        log "Auto-approval enabled, skipping confirmation"
        return
    fi
    
    echo
    echo "🚀 PRODUCTION DEPLOYMENT CONFIRMATION"
    echo "======================================"
    echo "You are about to deploy to PRODUCTION environment"
    echo "This will update the live system serving real users"
    echo
    echo "Pre-deployment validation: $([ "$SKIP_CHECKS" == "true" ] && echo "SKIPPED" || echo "COMPLETED")"
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo
    echo "⚠️  This action cannot be easily undone"
    echo
    
    read -p "Type 'DEPLOY' to confirm production deployment: " confirmation
    
    if [[ "$confirmation" != "DEPLOY" ]]; then
        info "Deployment cancelled by user"
        exit 0
    fi
    
    log "Production deployment confirmed by user"
}

# Main deployment function
main() {
    log "========================================"
    log "Starting Production Deployment"
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log "Skip Checks: $SKIP_CHECKS"
    log "Auto Approve: $AUTO_APPROVE"
    log "========================================"
    
    # Set up error handling
    trap 'error_exit "Deployment interrupted by error"' ERR
    
    # Confirmation
    confirm_deployment
    
    # Pre-deployment steps
    run_pre_deployment_checks
    backup_current_production
    build_and_test
    
    # Deployment
    deploy_to_vercel
    
    # Post-deployment steps
    validate_deployment
    purge_cdn_cache
    
    # Success
    send_success_notification
    
    log "========================================"
    log "Production Deployment Completed Successfully"
    log "Environment: $ENVIRONMENT"
    log "Completion Time: $(date '+%Y-%m-%d %H:%M:%S')"
    log "========================================"
    
    success "🎉 Production deployment completed successfully!"
    info "Monitor the application at: ${PRODUCTION_DOMAIN:-https://neptunik.com}"
    info "Check health at: ${PRODUCTION_DOMAIN:-https://neptunik.com}/api/health"
    info "View logs at: $LOG_FILE"
}

# Create log file
mkdir -p "$(dirname "$LOG_FILE")"

# Parse arguments and run
parse_arguments "$@"
main