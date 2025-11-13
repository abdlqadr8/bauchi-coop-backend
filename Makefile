#!/bin/bash

# Local development convenience script for Docker Compose

set -e

help() {
  echo "Bauchi Cooperative Backend - Docker Compose Helper"
  echo ""
  echo "Usage: make [command]"
  echo ""
  echo "Commands:"
  echo "  up              Start all services"
  echo "  down            Stop all services"
  echo "  logs            View application logs"
  echo "  restart         Restart all services"
  echo "  migrate         Run Prisma migrations"
  echo "  seed            Seed database with initial data"
  echo "  db-shell        Connect to PostgreSQL shell"
  echo "  build           Rebuild Docker images"
  echo ""
}

case "${1:-help}" in
  up)
    docker-compose up -d
    echo "✓ Services started. App: http://localhost:3000, Adminer: http://localhost:8080"
    ;;
  down)
    docker-compose down
    echo "✓ Services stopped"
    ;;
  logs)
    docker-compose logs -f app
    ;;
  restart)
    docker-compose restart
    echo "✓ Services restarted"
    ;;
  migrate)
    docker-compose exec app npx prisma migrate dev
    ;;
  seed)
    docker-compose exec app npm run prisma:seed
    echo "✓ Database seeded"
    ;;
  db-shell)
    docker-compose exec db psql -U postgres -d coops
    ;;
  build)
    docker-compose build --no-cache
    echo "✓ Images rebuilt"
    ;;
  help|*)
    help
    ;;
esac
