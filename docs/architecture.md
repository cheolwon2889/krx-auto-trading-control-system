# Architecture

## Overview

```text
TradingView Alert
        |
        v
NestJS API
        |
        v
Risk Engine
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

## Backend Responsibilities

- Receive TradingView Webhook requests.
- Validate Webhook secret and request DTO.
- Store every signal in MySQL.
- Prevent duplicate orders with `eventId`.
- Validate strategy state, trading state, market hours, order amount, and daily limits.
- Create broker orders through a `BrokerClient` abstraction.
- Store order, execution, position, and rejection history.
- Expose REST APIs for the Flutter control app.
- Support emergency stop through DB state and a local stop file.

## Flutter Responsibilities

- Authenticate as an administrator.
- Display trading status, broker status, and server health.
- Display orders, executions, signals, and positions.
- Trigger emergency stop.
- Store only mobile auth tokens and server URL.
- Never store broker secrets, account passwords, or DB credentials.

## Trading Safety Model

The system is designed around three operating states:

- `DRY_RUN`: validates and records order intent without sending real orders.
- `LIVE_READY`: all checks pass, but live orders are still blocked.
- `LIVE`: real orders can be sent through the Kiwoom Broker Adapter.

LIVE mode must not be enabled from the Flutter app. It should require server-side environment configuration and a restart.

## Data Ownership

- MySQL is the source of truth for signals, orders, executions, positions, and system events.
- Flutter reads data only through NestJS REST APIs.
- Broker secrets live only in backend environment variables.
- `.env` files are never committed.
