#!/bin/bash

# Rekonet Systems Deployment Script
# This script helps deploy the website to various platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
}

# Check if Node.js is installed (optional)
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js version: $NODE_VERSION"
    else
        print_warning "Node.js is not installed. Some features may not work."
    fi
}

# Initialize git repository if not already initialized
init_git() {
    if [ ! -d ".git" ]; then
        print_status "Initializing Git repository..."
        git init
        print_success "Git repository initialized."
    else
        print_status "Git repository already exists."
    fi
}

# Add all files to git
add_files() {
    print_status "Adding files to Git..."
    git add .
    print_success "Files added to Git."
}

# Commit changes
commit_changes() {
    local message="${1:-Update website}"
    print_status "Committing changes..."
    git commit -m "$message"
    print_success "Changes committed."
}

# Push to GitHub
push_to_github() {
    local branch="${1:-main}"
    print_status "Pushing to GitHub..."
    
    # Check if remote exists
    if git remote get-url origin &> /dev/null; then
        git push origin "$branch"
        print_success "Successfully pushed to GitHub."
    else
        print_warning "No remote repository configured."
        print_status "Please add your GitHub repository:"
        echo "  git remote add origin https://github.com/yourusername/rekonet-systems.git"
        echo "  git push -u origin main"
    fi
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if command -v netlify &> /dev/null; then
        netlify deploy --prod
        print_success "Deployed to Netlify."
    else
        print_warning "Netlify CLI is not installed."
        print_status "Install it with: npm install -g netlify-cli"
        print_status "Or deploy manually by connecting your GitHub repository to Netlify."
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_success "Deployed to Vercel."
    else
        print_warning "Vercel CLI is not installed."
        print_status "Install it with: npm install -g vercel"
        print_status "Or deploy manually by connecting your GitHub repository to Vercel."
    fi
}

# Run performance tests
run_tests() {
    print_status "Running performance tests..."
    
    # Check if Lighthouse CLI is installed
    if command -v lighthouse &> /dev/null; then
        lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
        print_success "Lighthouse report generated."
    else
        print_warning "Lighthouse CLI is not installed."
        print_status "Install it with: npm install -g lighthouse"
    fi
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    
    # Check if serve is installed
    if command -v serve &> /dev/null; then
        serve -s . -l 3000
    elif command -v python3 &> /dev/null; then
        python3 -m http.server 3000
    elif command -v python &> /dev/null; then
        python -m http.server 3000
    elif command -v php &> /dev/null; then
        php -S localhost:3000
    else
        print_error "No suitable server found. Please install serve, Python, or PHP."
        exit 1
    fi
}

# Show help
show_help() {
    echo "Rekonet Systems Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  init        Initialize Git repository"
    echo "  add         Add all files to Git"
    echo "  commit      Commit changes (optional: commit message)"
    echo "  push        Push to GitHub (optional: branch name)"
    echo "  netlify     Deploy to Netlify"
    echo "  vercel      Deploy to Vercel"
    echo "  test        Run performance tests"
    echo "  serve       Start development server"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 init"
    echo "  $0 commit 'Initial commit'"
    echo "  $0 push main"
    echo "  $0 netlify"
    echo "  $0 serve"
}

# Main function
main() {
    local command="${1:-help}"
    
    # Check prerequisites
    check_git
    check_node
    
    case "$command" in
        "init")
            init_git
            ;;
        "add")
            add_files
            ;;
        "commit")
            local message="${2:-Update website}"
            commit_changes "$message"
            ;;
        "push")
            local branch="${2:-main}"
            push_to_github "$branch"
            ;;
        "netlify")
            deploy_netlify
            ;;
        "vercel")
            deploy_vercel
            ;;
        "test")
            run_tests
            ;;
        "serve")
            start_dev_server
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"