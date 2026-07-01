# KRX Auto Trading Control System

TradingView Webhook 신호를 NestJS 서버에서 검증하고, 키움 REST API를 통해 KRX 실계좌 주문을 처리하며, Flutter 앱에서 주문, 체결, 포지션, 위험 상태를 관제하는 개인용 자동매매 시스템입니다.

## Overview

이 프로젝트는 실계좌 주문 환경에서 필요한 멱등성, 위험관리, 장애 복구, 운영 배포를 중심으로 설계한 KRX 자동매매 시스템입니다.

단순히 매수/매도 요청을 전달하는 서버가 아니라, TradingView 신호를 수신한 뒤 주문 가능 여부를 검증하고, 중복 주문을 방지하며, 모든 주문 상태와 체결 이력을 MySQL에 기록하는 구조를 목표로 합니다.

Flutter 앱은 실주문을 직접 실행하지 않고, 서버 상태와 주문 처리 결과를 관제하는 역할만 담당합니다.

## Architecture

```text
TradingView Alert
        |
        v
NestJS API Server
        |
        v
Risk Management Engine
        |
        v
Broker Adapter
        |
        v
Kiwoom REST API
        |
        v
MySQL + Prisma
        |
        v
Flutter Control App
```

## Key Features

- TradingView Webhook 수신 및 Secret 검증
- 신호 저장 및 `eventId` 기반 중복 처리 방지
- 주문 상태 전이 관리
- 위험관리 규칙 검증
- 긴급정지 처리
- 키움 REST API 연동을 위한 Broker Adapter 구조
- 주문, 체결, 포지션, 거절 사유 저장
- Flutter 기반 모바일 관제 앱
- Docker, PM2, Jenkins 기반 운영 배포 구성

## Safety Principles

실계좌 주문을 다루는 시스템이므로 다음 원칙을 기준으로 설계합니다.

- 동일한 TradingView 신호는 한 번만 처리합니다.
- 모든 주문은 `clientOrderId`로 추적합니다.
- LIVE 주문은 서버 환경변수와 재시작을 통해서만 활성화합니다.
- Flutter 앱에는 증권사 키, 계좌 비밀번호, DB 접속 정보를 저장하지 않습니다.
- 긴급정지는 DB 상태와 로컬 `STOP_TRADING` 파일을 모두 지원합니다.
- 주문 실패, 거절, Broker 응답 오류는 모두 기록합니다.
- 장애 후 미확정 주문을 복구할 수 있도록 주문 상태 이력을 남깁니다.

## Tech Stack

### Backend

- Node.js
- TypeScript
- NestJS
- Prisma
- MySQL
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
- flutter_secure_storage

## Implementation Scope

### Backend API

- NestJS 기반 REST API 서버
- TradingView Webhook 수신 및 검증
- 주문 신호 저장 및 중복 처리 방지
- JWT 기반 관리자 인증
- Swagger 기반 API 문서화

### Trading Engine

- 주문 상태 전이 관리
- `eventId` 기반 신호 멱등성 보장
- `clientOrderId` 기반 주문 멱등성 보장
- 위험관리 규칙 검증
- 긴급정지 처리
- 주문 실패 및 거절 사유 기록

### Broker Integration

- Broker Adapter 인터페이스
- 개발 검증용 MockBroker
- 키움 REST API 인증 구조
- 계좌 및 잔고 조회
- 실주문 전 `DRY_RUN` 검증 흐름
- LIVE 주문 전환 체크리스트

### Data Layer

- Prisma 기반 MySQL 모델링
- 주문, 체결, 포지션, 신호, 시스템 이벤트 저장
- 금액 및 수량 Decimal 처리
- 주요 조회 조건 복합 인덱스
- 상태 변경 이력 기록

### Control App

- Flutter 기반 모바일 관제 앱
- 로그인 및 토큰 관리
- 자동매매 상태 대시보드
- 주문, 체결, 신호, 포지션 조회
- 서버 및 Broker 상태 확인
- 긴급정지 요청

### Operations

- Docker Compose 기반 로컬/운영 구성
- PM2 기반 Windows 24시간 실행
- Cloudflare Tunnel 또는 ngrok 기반 Webhook HTTPS endpoint
- Jenkins 기반 CI/CD 파이프라인
- MySQL 백업 및 장애 복구 문서

## Project Structure

```text
auto-trading/
├─ apps/
│  ├─ api/
│  └─ mobile/
├─ docs/
├─ docker/
├─ scripts/
├─ docker-compose.yml
└─ README.md
```

## Documentation

- `docs/architecture.md`: 시스템 아키텍처
- `docs/deployment-plan.md`: 배포 및 운영 계획
- `docs/failure-recovery.md`: 장애 복구 시나리오
- `docs/live-trading-checklist.md`: 실주문 전환 체크리스트
- `docs/risk-management.md`: 위험관리 정책

## Security Notes

- `.env` 파일은 Git에 포함하지 않습니다.
- 증권사 App Key, Secret, 계좌번호, 비밀번호는 서버 환경변수로만 관리합니다.
- 민감정보는 로그에 출력하지 않습니다.
- 계좌번호는 API 응답과 로그에서 마스킹합니다.
- 관리자 API는 JWT 인증을 적용합니다.
- Webhook 인증과 모바일 인증은 분리합니다.

## Status

현재는 초기 아키텍처와 문서 구조를 정리하는 단계입니다. 이후 NestJS API 서버, Prisma 모델, TradingView Webhook, 주문 엔진, 키움 Broker Adapter, Flutter 관제 앱 순서로 구현합니다.