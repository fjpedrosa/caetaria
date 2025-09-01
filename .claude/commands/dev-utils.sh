#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar uso de memoria
check_memory() {
    echo -e "${BLUE}🔍 Checking current memory usage...${NC}"
    node -e "
        const used = process.memoryUsage();
        console.log('Memory Usage:');
        for (let key in used) {
            console.log(\`\${key}: \${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\`);
        }
        console.log('');
        console.log('Available Heap:', Math.round((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024), 'MB');
    "
}

# Función para health check
health_check() {
    echo -e "${BLUE}🏥 Running health check...${NC}"
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "Next.js version: $(npx next --version 2>/dev/null || echo 'Next.js not found')"
    echo ""
    check_memory
}

# Función para limpiar cache con confirmación
clean_with_confirmation() {
    echo -e "${YELLOW}⚠️  This will clean all caches and may require rebuilding.${NC}"
    echo "Files to be removed:"
    echo "  - .next/"
    echo "  - node_modules/.cache/"
    echo "  - .turbo/"
    echo "  - playwright-report/"
    echo "  - test-results/"
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🧹 Cleaning caches...${NC}"
        npm run clean:cache
        echo -e "${GREEN}✅ Cache cleaned successfully!${NC}"
    else
        echo -e "${YELLOW}❌ Cancelled${NC}"
    fi
}

# Función para desarrollo inteligente
smart_dev() {
    echo -e "${BLUE}🤖 Starting smart development mode...${NC}"
    
    # Check available memory
    AVAILABLE_MEM=$(node -e "console.log(Math.round((require('os').totalmem() - (require('os').totalmem() - require('os').freemem())) / 1024 / 1024 / 1024))")
    
    echo "Available system memory: ${AVAILABLE_MEM}GB"
    
    if [ "$AVAILABLE_MEM" -ge 16 ]; then
        echo -e "${GREEN}🚀 High memory system detected. Using performance mode.${NC}"
        npm run dev:performance
    elif [ "$AVAILABLE_MEM" -ge 8 ]; then
        echo -e "${BLUE}💪 Good memory available. Using stable mode.${NC}"
        npm run dev:stable
    else
        echo -e "${YELLOW}⚡ Limited memory detected. Using fallback mode.${NC}"
        npm run dev:fallback
    fi
}

# Función para desarrollo con auto-recovery
dev_with_recovery() {
    echo -e "${BLUE}🛡️  Starting development with auto-recovery...${NC}"
    
    while true; do
        echo -e "${GREEN}Starting development server...${NC}"
        npm run dev:stable
        
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 0 ]; then
            echo -e "${GREEN}✅ Development server exited normally.${NC}"
            break
        else
            echo -e "${RED}❌ Development server crashed (exit code: $EXIT_CODE)${NC}"
            echo -e "${YELLOW}🔄 Attempting auto-recovery in 3 seconds...${NC}"
            sleep 3
            
            echo -e "${BLUE}🧹 Cleaning cache...${NC}"
            npm run clean:cache > /dev/null 2>&1
            
            echo -e "${BLUE}🔄 Retrying with webpack fallback...${NC}"
            npm run dev:webpack
            break
        fi
    done
}

# Función para pre-commit checks
pre_commit() {
    echo -e "${BLUE}🔍 Running pre-commit checks...${NC}"
    
    echo "1. Type checking..."
    npm run type-check
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Type check failed${NC}"
        return 1
    fi
    
    echo "2. Linting..."
    npm run lint
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Linting failed${NC}"
        return 1
    fi
    
    echo "3. Running tests..."
    npm run test
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Tests failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All pre-commit checks passed!${NC}"
}

# Función para optimizar para el simulador WhatsApp
simulator_mode() {
    echo -e "${BLUE}📱 Starting WhatsApp Simulator optimized development...${NC}"
    echo -e "${YELLOW}💡 This mode is optimized for:${NC}"
    echo "  - Canvas operations"
    echo "  - GIF export functionality"
    echo "  - Memory-intensive operations"
    echo "  - WebWorker processing"
    echo ""
    
    check_memory
    echo -e "${GREEN}🚀 Starting performance mode...${NC}"
    npm run dev:performance
}

# Función principal
main() {
    case "$1" in
        "memory"|"mem")
            check_memory
            ;;
        "health")
            health_check
            ;;
        "clean")
            clean_with_confirmation
            ;;
        "smart")
            smart_dev
            ;;
        "recovery")
            dev_with_recovery
            ;;
        "pre-commit"|"pc")
            pre_commit
            ;;
        "simulator"|"sim")
            simulator_mode
            ;;
        "help"|"--help"|"-h"|"")
            echo -e "${BLUE}🛠️  Development Utilities${NC}"
            echo ""
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  memory, mem       Check current memory usage"
            echo "  health           Run complete health check"
            echo "  clean            Clean caches with confirmation"
            echo "  smart            Smart development mode based on system resources"
            echo "  recovery         Development with auto-recovery on crashes"
            echo "  pre-commit, pc   Run pre-commit checks"
            echo "  simulator, sim   Start WhatsApp Simulator optimized mode"
            echo "  help             Show this help message"
            echo ""
            echo -e "${YELLOW}Examples:${NC}"
            echo "  $0 smart         # Automatically choose best dev mode"
            echo "  $0 simulator     # Start simulator-optimized development"
            echo "  $0 memory        # Check current memory usage"
            echo "  $0 pre-commit    # Run all pre-commit checks"
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo "Use '$0 help' for available commands."
            exit 1
            ;;
    esac
}

# Ejecutar función principal con todos los argumentos
main "$@"