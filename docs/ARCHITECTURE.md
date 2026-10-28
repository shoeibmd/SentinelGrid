# SentinelGrid Architecture & Subsystem Specification

## 1. High-Level Modular Design

SentinelGrid operates as an unprivileged, micro-service orchestrated control plane. Instead of creating a monolithic agent or rewriting mature metrics collectors and SIEMs, SentinelGrid unifies their control, alerting, and data presentation.

### Architectural Tiers

1. **Client / Operator Tier:**
   - Single Page Application built on React, TypeScript, and Vite.
   - Communicates with the SentinelGrid Core API using Bearer JWT authentication over TLS.
   - Dark mode digital shield theme optimized for Security Operations Centers (SOCs) and Network Operations Centers (NOCs).

2. **Core Control Plane (Backend API):**
   - Express / TypeScript modular server.
   - Subsystem Modules:
     - `AuthService`: Role-Based Access Control (`Admin`, `Analyst`, `Operator`, `Viewer`).
     - `AssetService`: Multi-OS catalog (Windows, Linux, VMware ESXi, Network Appliances).
     - `PingService`: Asynchronous network socket prober (ICMP, TCP, HTTP) with millisecond latency logging and packet-loss calculations.
     - `IncidentService`: Threat correlation, containment workflow state machine, and destructive-action safeguards.
     - `AuditService`: Cryptographically chained SHA-256 audit ledger.
     - `IntegrationService`: Adapters for Grafana, Prometheus, Uptime Kuma, Wazuh, and VMware.

3. **Persistent Data Tier:**
   - **PostgreSQL 16**: Primary storage for users, assets, monitors, history, incidents, and audit trails.
   - **Prometheus TSDB**: High-cardinality time-series metric storage.
   - **Uptime Kuma SQLite Store**: Isolated probe engine cache.
   - **Grafana Data Volume**: Dashboards, alerting rules, and datasource definitions.

4. **Integration Adapters & Protocol Specifications:**
   - **Grafana**: Ingests and renders deep telemetry dashboards via iframe/panel embedding and authenticated API requests on port 3000.
   - **Prometheus**: Scrapes SentinelGrid backend and exporter targets on port 9090.
   - **Uptime Kuma**: Probing target synchronization via WebSocket / REST API on port 3001.
   - **Wazuh Manager**: Ingests security alerts, agent status, and triggers active responses on port 55000 via REST API.
   - **VMware ESXi / vSphere**: Telemetry collection for hypervisor resource utilization and guest VM inventory using pyVmomi / SOAP / REST management APIs.

---

## 2. Docker Network Segmentation

SentinelGrid separates frontend client traffic from internal database and subsystem communication:

- `frontend-net`: Bridge network exposing Nginx on port 80/443.
- `backend-net`: Isolated bridge network connecting the Core API, PostgreSQL, Prometheus, Grafana, and Uptime Kuma. PostgreSQL is not exposed directly to the host network.
