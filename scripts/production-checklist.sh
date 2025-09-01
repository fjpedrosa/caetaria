#!/bin/bash

# ===============================================================================
# PRODUCTION READINESS CHECKLIST VALIDATOR
# ===============================================================================
# Automated validation script to verify production deployment readiness
# Usage: ./scripts/production-checklist.sh [--environment production|staging]
# ===============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/production-checklist.log"

# Arguments
ENVIRONMENT=${2:-production}
VERBOSE=${VERBOSE:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Logging functions
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
    log "PASS: $1"
}

failure() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
    log "FAIL: $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNING_CHECKS++))
    ((TOTAL_CHECKS++))
    log "WARN: $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Show help
show_help() {
    cat << EOF
Production Readiness Checklist Validator

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENV   Target environment (production|staging) [default: production]
    -v, --verbose          Enable verbose output
    -h, --help             Show this help message

Environment Variables:
    ENVIRONMENT           Override environment setting
    VERBOSE               Enable verbose output (true|false)
    
Examples:
    $0                            # Check production readiness
    $0 --environment staging      # Check staging readiness  
    $0 --verbose                  # Check with verbose output
    
EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
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
    
    # Validate environment
    case $ENVIRONMENT in
        production|staging)
            ;;
        *)
            failure "Invalid environment: $ENVIRONMENT. Use 'production' or 'staging'"
            exit 1
            ;;
    esac
}

# Check environment variables
check_environment_variables() {
    info "Checking environment variables..."
    
    local env_file
    case $ENVIRONMENT in
        production)
            env_file=".env.production"
            ;;
        staging)
            env_file=".env.staging"
            ;;
    esac
    
    if [[ -f "$PROJECT_ROOT/$env_file" ]]; then
        success "Environment file exists: $env_file"
        
        # Source the environment file for validation
        set -a
        source "$PROJECT_ROOT/$env_file"
        set +a
    else
        warning "Environment file not found: $env_file"
    fi
    
    # Critical environment variables
    local critical_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXTAUTH_SECRET"
        "WEBHOOK_SECRET"
    )
    
    for var in "${critical_vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            success "Critical environment variable set: $var"
        else
            failure "Missing critical environment variable: $var"
        fi
    done
    
    # Security variables
    local security_vars=(
        "ENCRYPTION_KEY"
        "SENTRY_DSN"
        "SENTRY_AUTH_TOKEN"
    )
    
    for var in "${security_vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            success "Security variable set: $var"
        else
            warning "Optional security variable not set: $var"
        fi
    done
    
    # Validate secret strength
    if [[ -n "${NEXTAUTH_SECRET:-}" ]]; then
        if [[ ${#NEXTAUTH_SECRET} -ge 32 ]]; then
            success "NEXTAUTH_SECRET has sufficient length (${#NEXTAUTH_SECRET} chars)"
        else
            failure "NEXTAUTH_SECRET too short (${#NEXTAUTH_SECRET} chars, minimum 32)"
        fi
    fi
}

# Check build configuration
check_build_configuration() {
    info "Checking build configuration..."
    
    # Check package.json
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        success "package.json exists"
        
        # Check build scripts
        if grep -q '"build"' "$PROJECT_ROOT/package.json"; then
            success "Build script configured"
        else
            failure "Build script not found in package.json"
        fi
        
        # Check dependencies
        if [[ $VERBOSE == true ]]; then
            log "Checking critical dependencies..."
            local deps=("next" "react" "@supabase/supabase-js" "@sentry/nextjs")
            for dep in "${deps[@]}"; do
                if grep -q "\"$dep\"" "$PROJECT_ROOT/package.json"; then
                    success "Dependency installed: $dep"
                else
                    failure "Missing dependency: $dep"
                fi
            done
        fi
    else
        failure "package.json not found"
    fi
    
    # Check Next.js configuration
    if [[ -f "$PROJECT_ROOT/next.config.ts" || -f "$PROJECT_ROOT/next.config.js" ]]; then
        success "Next.js configuration file exists"
    else
        failure "Next.js configuration file not found"
    fi
    
    # Check TypeScript configuration
    if [[ -f "$PROJECT_ROOT/tsconfig.json" ]]; then
        success "TypeScript configuration exists"
    else
        warning "TypeScript configuration not found"
    fi
}

# Check security configuration
check_security_configuration() {
    info "Checking security configuration..."
    
    # Check middleware
    if [[ -f "$PROJECT_ROOT/src/middleware.ts" ]]; then
        success "Middleware file exists"
        
        # Check for security headers
        if grep -q "X-Content-Type-Options" "$PROJECT_ROOT/src/middleware.ts"; then
            success "Security headers configured in middleware"
        else
            warning "Security headers not found in middleware"
        fi
    else
        failure "Middleware file not found"
    fi
    
    # Check Vercel configuration
    if [[ -f "$PROJECT_ROOT/vercel.json" ]]; then
        success "Vercel configuration exists"
        
        # Check for security headers in vercel.json
        if grep -q "Strict-Transport-Security" "$PROJECT_ROOT/vercel.json"; then
            success "HSTS configured in Vercel"
        else
            warning "HSTS not configured in Vercel"
        fi
        
        if grep -q "Content-Security-Policy" "$PROJECT_ROOT/vercel.json" || grep -q "X-Frame-Options" "$PROJECT_ROOT/vercel.json"; then
            success "Security headers configured in Vercel"
        else
            warning "Security headers missing in Vercel configuration"
        fi
    else
        failure "Vercel configuration not found"
    fi
    
    # Check for environment-specific CORS
    if [[ $ENVIRONMENT == "production" && -n "${CORS_ORIGINS:-}" ]]; then
        if [[ "$CORS_ORIGINS" != "*" ]]; then
            success "CORS origins properly restricted"
        else
            failure "CORS origins not restricted (using wildcard)"
        fi
    fi
}

# Check database configuration
check_database_configuration() {
    info "Checking database configuration..."
    
    # Check Supabase configuration
    if [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
        if [[ "$NEXT_PUBLIC_SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
            success "Supabase URL format is correct"
        elif [[ "$NEXT_PUBLIC_SUPABASE_URL" =~ ^http://127\.0\.0\.1: ]]; then
            if [[ $ENVIRONMENT == "production" ]]; then
                failure "Using local Supabase URL in production"
            else
                success "Using local Supabase URL for development"
            fi
        else
            failure "Invalid Supabase URL format"
        fi
    fi
    
    # Check migrations directory
    if [[ -d "$PROJECT_ROOT/supabase/migrations" ]]; then
        success "Supabase migrations directory exists"
        
        local migration_count
        migration_count=$(find "$PROJECT_ROOT/supabase/migrations" -name "*.sql" | wc -l)
        if [[ $migration_count -gt 0 ]]; then
            success "Database migrations found ($migration_count files)"
        else
            warning "No database migrations found"
        fi
    else
        warning "Supabase migrations directory not found"
    fi
    
    # Test database connectivity (if running locally)
    if command -v supabase &> /dev/null; then
        success "Supabase CLI is available"
        
        # Only test connectivity for staging or if explicitly allowed
        if [[ $ENVIRONMENT != "production" || "${TEST_DB_CONNECTIVITY:-}" == "true" ]]; then
            info "Testing database connectivity..."
            
            local project_id
            case $ENVIRONMENT in
                production)
                    project_id="${SUPABASE_PROJECT_ID:-}"
                    ;;
                staging)
                    project_id="${SUPABASE_STAGING_PROJECT_ID:-}"
                    ;;
            esac
            
            if [[ -n "$project_id" ]]; then
                if timeout 10s supabase projects list | grep -q "$project_id"; then
                    success "Database connectivity verified"
                else
                    failure "Database connectivity test failed"
                fi
            else
                warning "Project ID not set, skipping connectivity test"
            fi
        fi
    else
        warning "Supabase CLI not installed"
    fi
}

# Check monitoring configuration
check_monitoring_configuration() {
    info "Checking monitoring configuration..."
    
    # Check Sentry configuration
    if [[ -f "$PROJECT_ROOT/src/lib/monitoring/sentry.ts" ]]; then
        success "Sentry configuration file exists"
    else
        warning "Sentry configuration file not found"
    fi
    
    if [[ -n "${SENTRY_DSN:-}" ]]; then
        success "Sentry DSN configured"
        
        if [[ "$SENTRY_DSN" =~ ^https://.*@.*\.sentry\.io/ ]]; then
            success "Sentry DSN format is correct"
        else
            failure "Invalid Sentry DSN format"
        fi
    else
        warning "Sentry DSN not configured"
    fi
    
    # Check health check endpoints
    if [[ -f "$PROJECT_ROOT/src/app/api/health/route.ts" ]]; then
        success "Health check endpoint exists"
    else
        failure "Health check endpoint not found"
    fi
    
    if [[ -f "$PROJECT_ROOT/src/app/api/status/route.ts" ]]; then
        success "Status endpoint exists"
    else
        warning "Status endpoint not found"
    fi
    
    # Check analytics configuration
    if [[ -n "${NEXT_PUBLIC_POSTHOG_KEY:-}" ]]; then
        success "PostHog analytics configured"
    else
        warning "PostHog analytics not configured"
    fi
    
    if [[ -n "${NEXT_PUBLIC_VERCEL_ANALYTICS_ID:-}" ]]; then
        success "Vercel Analytics configured"
    else
        warning "Vercel Analytics not configured"
    fi
}

# Check backup configuration
check_backup_configuration() {
    info "Checking backup configuration..."
    
    # Check backup scripts
    if [[ -f "$PROJECT_ROOT/scripts/backup-database.sh" ]]; then
        success "Database backup script exists"
        
        if [[ -x "$PROJECT_ROOT/scripts/backup-database.sh" ]]; then
            success "Backup script is executable"
        else
            failure "Backup script is not executable"
        fi
    else
        failure "Database backup script not found"
    fi
    
    if [[ -f "$PROJECT_ROOT/scripts/restore-database.sh" ]]; then
        success "Database restore script exists"
    else
        warning "Database restore script not found"
    fi
    
    # Check backup configuration
    if [[ -n "${AWS_S3_BACKUP_BUCKET:-}" ]]; then
        success "S3 backup bucket configured"
        
        if [[ -n "${AWS_ACCESS_KEY_ID:-}" && -n "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
            success "AWS credentials configured for backups"
        else
            warning "AWS credentials not configured for backups"
        fi
    else
        warning "S3 backup not configured"
    fi
    
    # Check retention settings
    local retention_days=${BACKUP_RETENTION_DAYS:-30}
    if [[ $retention_days -ge 7 ]]; then
        success "Backup retention period is adequate ($retention_days days)"
    else
        warning "Backup retention period may be too short ($retention_days days)"
    fi
}

# Check performance configuration
check_performance_configuration() {
    info "Checking performance configuration..."
    
    # Check Node.js options
    if [[ -n "${NODE_OPTIONS:-}" ]]; then
        success "Node.js options configured: $NODE_OPTIONS"
        
        if [[ "$NODE_OPTIONS" =~ --max-old-space-size= ]]; then
            success "Memory limit configured in Node.js options"
        else
            warning "Memory limit not configured in Node.js options"
        fi
    else
        warning "Node.js options not configured"
    fi
    
    # Check caching configuration
    if [[ -n "${REDIS_URL:-}" ]]; then
        success "Redis caching configured"
    else
        warning "Redis caching not configured"
    fi
    
    # Check CDN configuration
    if [[ -n "${NEXT_PUBLIC_CDN_URL:-}" ]]; then
        success "CDN configured"
    else
        warning "CDN not configured"
    fi
    
    # Check image optimization
    if [[ -n "${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:-}" ]]; then
        success "Image optimization (Cloudinary) configured"
    else
        warning "Image optimization not configured"
    fi
}

# Check CI/CD configuration
check_cicd_configuration() {
    info "Checking CI/CD configuration..."
    
    # Check GitHub Actions
    if [[ -d "$PROJECT_ROOT/.github/workflows" ]]; then
        success "GitHub Actions directory exists"
        
        local workflow_count
        workflow_count=$(find "$PROJECT_ROOT/.github/workflows" -name "*.yml" -o -name "*.yaml" | wc -l)
        if [[ $workflow_count -gt 0 ]]; then
            success "GitHub Actions workflows found ($workflow_count files)"
        else
            warning "No GitHub Actions workflows found"
        fi
        
        # Check for specific workflows
        if [[ -f "$PROJECT_ROOT/.github/workflows/ci.yml" ]]; then
            success "CI workflow exists"
        else
            warning "CI workflow not found"
        fi
        
        if [[ -f "$PROJECT_ROOT/.github/workflows/cd.yml" ]]; then
            success "CD workflow exists"
        else
            warning "CD workflow not found"
        fi
    else
        warning "GitHub Actions not configured"
    fi
    
    # Check Vercel deployment configuration
    if [[ -n "${VERCEL_TOKEN:-}" ]]; then
        success "Vercel token configured"
    else
        warning "Vercel token not configured for automated deployments"
    fi
}

# Test build process
test_build_process() {
    info "Testing build process..."
    
    if [[ "${SKIP_BUILD_TEST:-}" == "true" ]]; then
        warning "Build test skipped (SKIP_BUILD_TEST=true)"
        return
    fi
    
    cd "$PROJECT_ROOT"
    
    # Check if dependencies are installed
    if [[ ! -d "node_modules" ]]; then
        info "Installing dependencies..."
        if npm ci; then
            success "Dependencies installed successfully"
        else
            failure "Failed to install dependencies"
            return
        fi
    fi
    
    # Test build
    info "Testing production build..."
    if npm run build; then
        success "Production build successful"
    else
        failure "Production build failed"
    fi
    
    # Check build output
    if [[ -d ".next" ]]; then
        success "Build output directory exists"
        
        if [[ -f ".next/BUILD_ID" ]]; then
            success "Build ID file exists"
        else
            warning "Build ID file not found"
        fi
    else
        failure "Build output directory not found"
    fi
}

# Run all checks
run_all_checks() {
    log "========================================"
    log "Starting Production Readiness Check"
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log "========================================"
    
    check_environment_variables
    echo
    check_build_configuration
    echo
    check_security_configuration
    echo
    check_database_configuration
    echo
    check_monitoring_configuration
    echo
    check_backup_configuration
    echo
    check_performance_configuration
    echo
    check_cicd_configuration
    echo
    test_build_process
}

# Generate report
generate_report() {
    echo
    log "========================================"
    log "Production Readiness Check Report"
    log "========================================"
    
    echo -e "\n${BLUE}📊 Summary${NC}"
    echo -e "Total Checks: $TOTAL_CHECKS"
    echo -e "${GREEN}✓ Passed: $PASSED_CHECKS${NC}"
    echo -e "${RED}✗ Failed: $FAILED_CHECKS${NC}"
    echo -e "${YELLOW}⚠ Warnings: $WARNING_CHECKS${NC}"
    
    local pass_rate
    pass_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    echo -e "Pass Rate: $pass_rate%"
    
    log "SUMMARY: Total=$TOTAL_CHECKS, Passed=$PASSED_CHECKS, Failed=$FAILED_CHECKS, Warnings=$WARNING_CHECKS, Pass Rate=$pass_rate%"
    
    echo
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        echo -e "${GREEN}🎉 Ready for $ENVIRONMENT deployment!${NC}"
        log "RESULT: Ready for deployment"
    else
        echo -e "${RED}❌ Not ready for $ENVIRONMENT deployment${NC}"
        echo -e "   Please fix $FAILED_CHECKS failed checks before deploying."
        log "RESULT: Not ready for deployment"
    fi
    
    if [[ $WARNING_CHECKS -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  $WARNING_CHECKS warnings should be addressed${NC}"
    fi
    
    echo
    echo -e "${BLUE}📋 Full log available at: $LOG_FILE${NC}"
    
    log "========================================"
    log "Production Readiness Check Completed"
    log "========================================"
    
    # Exit with error code if there are failures
    if [[ $FAILED_CHECKS -gt 0 ]]; then
        exit 1
    fi
}

# Main execution
main() {
    # Create log file
    mkdir -p "$(dirname "$LOG_FILE")"
    
    parse_arguments "$@"
    run_all_checks
    generate_report
}

# Handle script arguments
if [[ $# -eq 0 ]]; then
    main
else
    main "$@"
fi