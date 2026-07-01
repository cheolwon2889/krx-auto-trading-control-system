# KRX Auto Trading Control System

TradingView Webhook 신호를 NestJS 서버에서 검증하고, 키움 REST API를 통해 KRX 실계좌 주문을 실행하며, Flutter 앱에서 주문, 체결, 포지션, 위험 상태를 관제하는 개인용 자동매매 시스템입니다.

## Project Goal

이 프로젝트는 단순한 자동매매 예제가 아니라 포트폴리오와 실제 운영을 모두 고려한 백엔드 중심 프로젝트입니다.

- TradingView Alert Webhook 수신
- NestJS 기반 주문 검증 서버
- Prisma와 MySQL 기반 주문, 체결, 포지션 기록
- 키움 REST API 연동을 위한 Broker Adapter 구조
- Flutter 모바일 관제 앱
- Docker, PM2, Jenkins 기반 운영 및 배포 연습

## Core Principles

- 실주문을 목표로 하되, 개발 중에는 `DRY_RUN`과 `MockBroker`로 먼저 검증합니다.
- LIVE 주문은 환경변수와 서버 재시작으로만 활성화합니다.
- Flutter 앱에는 주문 입력 기능, 증권사 키, DB 접속 정보를 저장하지 않습니다.
- 동일한 TradingView `eventId`는 한 번만 처리합니다.
- 모든 주문은 `clientOrderId`로 멱등성을 보장합니다.
- 긴급정지는 DB 상태와 `STOP_TRADING` 파일을 모두 지원합니다.
- 장애 후 미확정 주문 복구 흐름을 문서화하고 테스트합니다.

## Planned Stack

### Backend

- Node.js 24 LTS
- TypeScript
- NestJS
- Prisma
- MySQL 8
- JWT
- Swagger
- Jest
- Docker
- PM2
- Jenkins

### Mobile

- Flutter
- Dart
- Material 3
- Riverpod
- Dio
- GoRouter

## Roadmap

### Month 1: Backend Foundation

- Monorepo setup
- NestJS API server
- Prisma schema
- MySQL Docker Compose
- TradingView Webhook
- Signal persistence
- Duplicate event prevention
- Basic tests

### Month 2: Trading Engine and Kiwoom Integration

- Broker interface
- MockBroker
- Risk management
- Emergency stop
- Kiwoom REST API authentication
- Account and balance lookup
- Dry-run order flow
- LIVE readiness checklist

### Month 3: Flutter, Deployment, and Portfolio Polish

- Flutter control app
- Dashboard and order views
- Docker and PM2 deployment
- Windows operation scripts
- Jenkins CI/CD
- Backup and recovery docs
- Portfolio README and screenshots

## Daily Workflow

```text
5분: 이전 작업 복습
20분: 오늘의 한 가지 구현 또는 문서화
5분: 실행 결과 기록, 다음 할 일 정리
```

## Git Commit Routine

```powershell
git status
git diff
git add <changed-files>
git commit -m "type: short description"
```

Commit message types:

- `docs`: documentation
- `feat`: feature
- `fix`: bug fix
- `test`: tests
- `refactor`: internal code cleanup
- `chore`: setup and maintenance
- `ci`: CI/CD

## Current Status

Day 1: project baseline and documentation.
