# SentinelGrid Production Deployment & Hardening Guide

## 1. Production Hardening Checklist

Before deploying SentinelGrid to production environments, complete each item:

- [ ] **Secrets & Passwords**: Change all default passwords in `.env` (`POSTGRES_PASSWORD`, `JWT_SECRET`, `GRAFANA_ADMIN_PASSWORD`).
- [ ] **TLS / HTTPS**: Terminate TLS using valid certificates (e.g. Let's Encrypt or corporate CA) on the Nginx reverse proxy or external ingress controller.
- [ ] **Container Isolation**: Ensure containers do not run with `--privileged` flags and do not mount the host Docker socket (`/var/run/docker.sock`).
- [ ] **Database Network Isolation**: PostgreSQL is accessible only within the internal `backend-net` Docker network. Never bind port 5432 to `0.0.0.0`.
- [ ] **Non-Root Users**: Verify container images execute under non-root UIDs (`node`, `nginx`, `postgres`).
- [ ] **Audit Trail Retention**: Configure persistent volume backups for `sentinelgrid_postgres_data` and verify SHA-256 hash chains regularly.
- [ ] **Containment Safety Review**: Confirm that hypervisor host shutdown is prohibited in response policies.

---

## 2. Docker Compose Commands

### Build & Start
```bash
docker compose up -d --build
```

### Check Logs
```bash
docker compose logs -f sentinelgrid-backend
docker compose logs -f sentinelgrid-ui
```

### Stop Services
```bash
docker compose down
```

### Database Backup
```bash
docker exec -t sentinelgrid-postgres pg_dump -U sentinel sentinelgrid > backup_$(date +%Y%m%d).sql
```
