#!/bin/bash
set -e

# 배포 스크립트
# 사용법: ./deploy.sh [dev|prod]

ENV=${1:-dev}
PROJECT_DIR="/home/ubuntu/ai-fullstack-lab"

echo "=========================================="
echo "Deploying to $ENV environment"
echo "=========================================="

cd $PROJECT_DIR

# Git pull
echo "Pulling latest changes..."
git pull origin main

# Docker 이미지 빌드 및 실행
if [ "$ENV" = "prod" ]; then
    echo "Building and starting production containers..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
else
    echo "Building and starting development containers..."
    docker-compose down
    docker-compose build
    docker-compose up -d
fi

# 오래된 이미지 정리
echo "Cleaning up old images..."
docker image prune -f

# 상태 확인
echo "Checking container status..."
docker-compose ps

echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
