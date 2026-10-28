import { describe, it, expect, beforeAll } from 'vitest';
import { AuthService } from '../src/services/auth.service.js';
import { AssetService } from '../src/services/asset.service.js';
import { PingService } from '../src/services/ping.service.js';
import { IncidentService } from '../src/services/incident.service.js';
import { AuditService } from '../src/services/audit.service.js';
import { IntegrationService } from '../src/services/integrations/integration.service.js';
import { db } from '../src/db/index.js';

describe('SentinelGrid Backend Suite', () => {

  describe('1. Authentication & RBAC', () => {
    it('should authenticate default admin user with valid credentials', async () => {
      const result = await AuthService.login('admin', 'SentinelAdmin#2026!', '127.0.0.1');
      expect(result).toHaveProperty('token');
      expect(result.user.username).toBe('admin');
      expect(result.user.role).toBe('Admin');
    });

    it('should reject invalid password', async () => {
      await expect(AuthService.login('admin', 'WrongPassword!', '127.0.0.1'))
        .rejects.toThrow('Invalid credentials.');
    });

    it('should reject non-existent user', async () => {
      await expect(AuthService.login('ghost_user', 'Pass123!', '127.0.0.1'))
        .rejects.toThrow('Invalid credentials.');
    });

    it('should allow admin to register a new operator', async () => {
      const newUser = await AuthService.registerUser(
        'sec_analyst_1',
        'analyst1@sentinelgrid.internal',
        'SecureAnalystPass#2026!',
        'Analyst',
        'admin',
        '127.0.0.1'
      );
      expect(newUser.username).toBe('sec_analyst_1');
      expect(newUser.role).toBe('Analyst');
    });
  });

  describe('2. Asset & Endpoint Inventory Management', () => {
    it('should list pre-seeded assets spanning Windows, Linux, and VMware ESXi', () => {
      const assets = AssetService.listAssets();
      expect(assets.length).toBeGreaterThanOrEqual(4);
      const osTypes = assets.map(a => a.osType);
      expect(osTypes).toContain('windows');
      expect(osTypes).toContain('linux');
      expect(osTypes).toContain('vmware_esxi');
    });

    it('should create and retrieve a new asset', () => {
      const created = AssetService.createAsset({
        name: 'TEST-DB-NODE',
        hostname: 'db-node-01.internal',
        ipAddress: '10.0.50.22',
        osType: 'linux',
        osVersion: 'Debian 12 Bookworm',
        status: 'online',
        agentInstalled: true,
        agentVersion: '4.7.2',
        tags: ['Database', 'Postgres'],
        groupName: 'Database Cluster'
      }, 'admin', '127.0.0.1');

      expect(created.id).toBeDefined();
      expect(created.name).toBe('TEST-DB-NODE');

      const retrieved = AssetService.getAssetById(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.ipAddress).toBe('10.0.50.22');
    });

    it('should calculate accurate asset summaries', () => {
      const summary = AssetService.getAssetSummary();
      expect(summary.total).toBeGreaterThanOrEqual(5);
      expect(summary.online).toBeGreaterThanOrEqual(3);
      expect(summary.byOs).toHaveProperty('windows');
      expect(summary.byOs).toHaveProperty('linux');
      expect(summary.byOs).toHaveProperty('vmware_esxi');
    });
  });

  describe('3. Network Ping & Availability Monitoring Engine', () => {
    it('should list initialized ping monitors', () => {
      const monitors = PingService.listMonitors();
      expect(monitors.length).toBeGreaterThanOrEqual(3);
    });

    it('should perform localhost loopback ICMP probe and record latency', async () => {
      const monitors = PingService.listMonitors();
      const loopbackMon = monitors.find(m => m.target === '127.0.0.1');
      expect(loopbackMon).toBeDefined();

      if (loopbackMon) {
        const result = await PingService.executeMonitorCheck(loopbackMon.id);
        expect(result.status).toBe('up');
        expect(result.latencyMs).toBeGreaterThanOrEqual(0);
        expect(result.packetLossPercent).toBe(0);

        const history = PingService.getMonitorHistory(loopbackMon.id);
        expect(history.length).toBeGreaterThan(0);
      }
    });

    it('should create a custom TCP monitor and verify thresholds', () => {
      const mon = PingService.createMonitor({
        name: 'SSH Port Monitor',
        target: '127.0.0.1',
        port: 22,
        checkType: 'tcp',
        intervalSeconds: 30,
        timeoutMs: 1500,
        warningThresholdMs: 50,
        criticalThresholdMs: 200,
        enabled: true
      }, 'admin', '127.0.0.1');

      expect(mon.id).toBeDefined();
      expect(mon.port).toBe(22);
    });
  });

  describe('4. Automated Incident Response & Containment Safety', () => {
    it('should list active incidents', () => {
      const incidents = IncidentService.listIncidents();
      expect(incidents.length).toBeGreaterThan(0);
      expect(incidents[0].severity).toBe('critical');
    });

    it('should execute file quarantine action', () => {
      const incident = IncidentService.listIncidents()[0];
      const result = IncidentService.executeContainmentAction(incident.id, 'quarantine', 'admin', '127.0.0.1');
      expect(result.success).toBe(true);
      expect(result.incident.status).toBe('quarantined');
      expect(result.incident.forensicData?.quarantineExecutedAt).toBeDefined();
    });

    it('should execute network isolation action', () => {
      const incident = IncidentService.listIncidents()[0];
      const result = IncidentService.executeContainmentAction(incident.id, 'isolate', 'admin', '127.0.0.1');
      expect(result.success).toBe(true);
      expect(result.incident.status).toBe('isolated');
      expect(result.incident.forensicData?.firewallRuleApplied).toBe('BLOCK_ALL_EXCEPT_MANAGEMENT_PORT');
    });

    it('should enforce SAFETY RULE: never allow hypervisor host shutdown due to VM incident', () => {
      // Find or create an incident linked to ESXi host
      const esxiAsset = Array.from(db.assets.values()).find(a => a.osType === 'vmware_esxi');
      expect(esxiAsset).toBeDefined();

      const esxiIncident = IncidentService.createIncident({
        title: 'Suspected Guest Compromise on ESXi',
        description: 'Testing safety boundary',
        assetId: esxiAsset?.id,
        severity: 'high'
      }, 'admin', '127.0.0.1');

      expect(() => {
        IncidentService.executeContainmentAction(esxiIncident.id, 'isolate_and_shutdown', 'admin', '127.0.0.1');
      }).toThrow(/SAFETY_VIOLATION: Hypervisor host shutdown is prohibited/);
    });
  });

  describe('5. Audit Logging & Cryptographic Chain Integrity', () => {
    it('should verify un-tampered audit log hash chain', () => {
      const verification = AuditService.verifyLogChainIntegrity();
      expect(verification.valid).toBe(true);
      expect(verification.totalChecked).toBeGreaterThan(5);
    });

    it('should record every administrative and containment action', () => {
      const logs = AuditService.listLogs({ action: 'CONTAINMENT_ISOLATE' });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].hashSignature).toBeDefined();
    });
  });

  describe('6. Open-Source Integration Connectors', () => {
    it('should list all registered integrations', () => {
      const integrations = IntegrationService.listIntegrations();
      const names = integrations.map(i => i.name);
      expect(names).toContain('grafana');
      expect(names).toContain('prometheus');
      expect(names).toContain('uptime_kuma');
      expect(names).toContain('wazuh');
      expect(names).toContain('vmware');
    });

    it('should verify connection health check for integrations', async () => {
      const res = await IntegrationService.testConnection('grafana', 'admin', '127.0.0.1');
      expect(res.success).toBe(true);
      expect(res.status).toBe('healthy');
    });
  });

});
