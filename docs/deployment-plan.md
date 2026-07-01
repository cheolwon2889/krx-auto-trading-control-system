# Deployment Plan

## Local Development

Initial development runs on the developer's Windows PC.

```text
NestJS API
MySQL
Prisma
Flutter app
```

## Operation Target

The first real operation target is a Windows PC running 24 hours.

Planned components:

- MySQL through Docker or Windows service
- NestJS API through PM2
- Cloudflare Tunnel or ngrok for HTTPS Webhook access
- Local log files
- Scheduled MySQL backups

## CI/CD Goal

Jenkins will be added after the backend and deployment scripts are stable.

Pipeline target:

```text
Git push
  -> Jenkins checkout
  -> install dependencies
  -> lint
  -> test
  -> build
  -> Docker image build
  -> deploy
  -> PM2 restart
  -> health check
```

## Required Artifacts

- `Dockerfile`
- `docker-compose.yml`
- `ecosystem.config.js`
- `Jenkinsfile`
- `.env.example`
- `scripts/start-api.bat`
- `scripts/stop-api.bat`
- `scripts/check-health.ps1`
- `scripts/backup-mysql.ps1`

## Deployment Safety Rules

- Never commit `.env`.
- Never print broker secrets in logs.
- Mask account numbers in API responses and logs.
- Require a health check after restart.
- Keep emergency stop available even when the Flutter app is offline.
- Back up MySQL before production schema changes.
