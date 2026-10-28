# SentinelGrid

```
   _____            _   _            _  _____      _     _ 
  / ____|          | | (_)          | |/ ____|    (_)   | |
 | (___   ___ _ __ | |_ _ _ __   ___| | |  __ _ __ _  __| |
  \___ \ / _ \ '_ \| __| | '_ \ / _ \ | | |_ | '__| |/ _` |
  ____) |  __/ | | | |_| | | | |  __/ | |__| | |  | | (_| |
 |_____/ \___|_| |_|\__|_|_| |_|\___|_|\_____|_|  |_|\__,_|
```

> **Unified Infrastructure Monitoring & Cyber Defense Platform**  
> *One platform. Complete visibility. Automated defense.*

---

## Overview

**SentinelGrid** is a secure, scalable, and open-source platform that consolidates infrastructure metrics, network ping checks, endpoint security, VMware monitoring, centralized configuration, and automated incident response into a single, unified management interface.

### Key Capabilities
- **Unified Operations Dashboard:** Real-time visibility across servers, hypervisors, network targets, active threats, and integrated monitoring subsystems.
- **High-Frequency Network Ping & Availability Monitoring:** Sub-millisecond ICMP, TCP socket, and HTTP/HTTPS synthetic probes with automated threshold alerting and latency trend logging.
- **Cross-Platform Asset Inventory:** First-class inventory support for Windows endpoints, Linux servers, VMware ESXi hypervisors, and network appliances.
- **Security Incident Management & Containment:** Ingestion of Wazuh SIEM / FIM security telemetry, accompanied by an automated, multi-tiered containment engine (Alert Only, Investigate, File Quarantine, Network Isolation, and Safeguarded Shutdown).
- **Tamper-Evident Audit Logging:** Cryptographically chained SHA-256 event ledger for compliance and zero-repudiation.
- **Open-Source Subsystem Integrations:** Native integration adapters for **Grafana**, **Prometheus**, **Uptime Kuma**, **Wazuh**, and **VMware vSphere/ESXi**.
- **Containerized Architecture:** Fully containerized multi-tier deployment using Docker and Docker Compose.

---

## Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Modern CSS | Digital Shield Dark Theme, responsive SOC layout |
| **Backend API** | Node.js, Express, TypeScript | Modular REST API, JWT auth, RBAC, Ping Engine |
| **Primary Store** | PostgreSQL 16 | Relational data, audit ledger, monitor state |
| **Metrics Engine**| Prometheus | Time-series scraper and query store |
| **Visualization** | Grafana | Pre-provisioned dashboards |
| **Availability**  | Uptime Kuma | Multi-protocol synthetic probing |
| **Endpoint HIDS** | Wazuh | SIEM, active response, file integrity monitoring |
| **Hypervisor**    | VMware vSphere / pyVmomi | ESXi health and VM telemetry adapter |
| **Container**     | Docker & Docker Compose | Multi-stage builds, non-root users, health checks |

---

## Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **Docker & Docker Compose**: v24+

### 2. Running Standalone (Backend & Frontend)

#### Backend
```bash
cd backend
npm install
npm run build
npm test           # Run Vitest automated test suite (18 unit & integration tests)
npm run dev        # Starts API server on port 5000 with real-time ping scheduler
```

#### Frontend
```bash
cd frontend
npm install
npm run dev        # Starts Vite development server on port 3000
```

Open `http://localhost:3000` in your browser.

#### Default Credentials
| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `SentinelAdmin#2026!` |
| **Operator** | `operator` | `SentinelOp#2026!` |

---

## Docker Compose Deployment

To build and spin up the complete SentinelGrid ecosystem (Web UI, API, PostgreSQL, Prometheus, Grafana, and Uptime Kuma):

```bash
# 1. Copy and customize environment variables
cp .env.example .env

# 2. Build and launch all containers
docker compose up -d --build

# 3. Check container health status
docker compose ps
```

### Exposed Service Ports:
- **SentinelGrid Centralized UI**: `http://localhost` (Port 80)
- **SentinelGrid Core API**: `http://localhost:5000`
- **Prometheus UI**: `http://localhost:9090`
- **Grafana Dashboards**: `http://localhost:3001`
- **Uptime Kuma**: `http://localhost:3002`

---

## Automated Incident Response & Safeguards

SentinelGrid enforces strict safety boundaries when executing automated containment:

1. **File Quarantine:** Confirmed malicious files identified by Wazuh or heuristic rules are neutralized into an isolated vault.
2. **Network Isolation:** Modifies host firewall rules to sever all external inbound/outbound communication while maintaining control-plane connectivity for remediation.
3. **Controlled Shutdown Safeguard:** 
   - Controlled shutdown requires explicit operator approval and validation.
   - **Hypervisor Protection:** Under no circumstances will a guest VM incident trigger an ESXi host power action. Guest and hypervisor domains remain strictly decoupled.

---

## Testing & Verification

The backend includes an automated test suite verifying Authentication, RBAC, Asset CRUD, Ping Probing, Safety Guards, and Audit Hash Chaining:

```bash
cd backend
npm test
```

Result:
```text
✓ tests/sentinelgrid.test.ts (18 tests)
  ✓ 1. Authentication & RBAC
  ✓ 2. Asset & Endpoint Inventory Management
  ✓ 3. Network Ping & Availability Monitoring Engine
  ✓ 4. Automated Incident Response & Containment Safety
  ✓ 5. Audit Logging & Cryptographic Chain Integrity
  ✓ 6. Open-Source Integration Connectors
```

---

## License

Open Source under the **Apache-2.0 License**.
