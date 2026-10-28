import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Asset, 
  PingMonitor, 
  PingHistoryEntry, 
  Incident, 
  AuditLog, 
  IntegrationStatus 
} from '../models/types.js';
import { hashPassword, calculateAuditHash } from '../utils/crypto.js';

class DataStore {
  public users: Map<string, User> = new Map();
  public assets: Map<string, Asset> = new Map();
  public pingMonitors: Map<string, PingMonitor> = new Map();
  public pingHistory: PingHistoryEntry[] = [];
  public incidents: Map<string, Incident> = new Map();
  public auditLogs: AuditLog[] = [];
  public integrations: Map<string, IntegrationStatus> = new Map();
  private lastAuditHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.seedInitialData();
  }

  private async seedInitialData() {
    // 1. Seed Default Admin User (Password: SentinelAdmin#2026!)
    const adminPasswordHash = await hashPassword('SentinelAdmin#2026!');
    const adminUser: User = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@sentinelgrid.internal',
      passwordHash: adminPasswordHash,
      role: 'Admin',
      mfaEnabled: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    this.users.set(adminUser.id, adminUser);

    // Operator User (Password: SentinelOp#2026!)
    const operatorPasswordHash = await hashPassword('SentinelOp#2026!');
    const operatorUser: User = {
      id: uuidv4(),
      username: 'operator',
      email: 'operator@sentinelgrid.internal',
      passwordHash: operatorPasswordHash,
      role: 'Operator',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    this.users.set(operatorUser.id, operatorUser);

    // 2. Seed Diverse Assets
    const initialAssets: Asset[] = [
      {
        id: uuidv4(),
        name: 'DC-PRIMARY-01',
        hostname: 'dc01.corp.sentinelgrid.internal',
        ipAddress: '192.168.10.10',
        osType: 'windows',
        osVersion: 'Windows Server 2022 Datacenter',
        status: 'online',
        agentInstalled: true,
        agentVersion: '4.7.2',
        tags: ['DomainController', 'CoreInfra', 'Tier0'],
        groupName: 'Identity & Directory',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'SRV-APP-LINUX-01',
        hostname: 'app01.prod.sentinelgrid.internal',
        ipAddress: '192.168.20.15',
        osType: 'linux',
        osVersion: 'Ubuntu 24.04 LTS (Noble Numbat)',
        status: 'online',
        agentInstalled: true,
        agentVersion: '4.7.2',
        tags: ['Production', 'Kubernetes', 'WebTier'],
        groupName: 'Application Cluster',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'HYPERVISOR-ESXI-01',
        hostname: 'esxi01.mgmt.sentinelgrid.internal',
        ipAddress: '192.168.1.100',
        osType: 'vmware_esxi',
        osVersion: 'VMware ESXi 8.0 Update 2b',
        status: 'online',
        agentInstalled: false, // Managed via pyVmomi / vSphere API
        tags: ['Virtualization', 'BareMetal', 'DatacenterA'],
        groupName: 'Virtualization Hosts',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'CORE-SW-CISCO-01',
        hostname: 'sw-core-01.mgmt.sentinelgrid.internal',
        ipAddress: '192.168.1.1',
        osType: 'network_device',
        osVersion: 'Cisco IOS-XE 17.9.4',
        status: 'online',
        agentInstalled: false,
        tags: ['Network', 'Backbone', 'Switch'],
        groupName: 'Network Infrastructure',
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'FINANCE-WKS-04',
        hostname: 'wks-fin-04.corp.sentinelgrid.internal',
        ipAddress: '192.168.30.44',
        osType: 'windows',
        osVersion: 'Windows 11 Pro 23H2',
        status: 'warning',
        agentInstalled: true,
        agentVersion: '4.7.2',
        tags: ['Workstation', 'Finance', 'EndpointDefense'],
        groupName: 'Finance Department',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    initialAssets.forEach(a => this.assets.set(a.id, a));

    // 3. Seed Network Ping & Availability Monitors
    const initialMonitors: PingMonitor[] = [
      {
        id: uuidv4(),
        name: 'Core Gateway Ping',
        target: '127.0.0.1',
        checkType: 'icmp',
        intervalSeconds: 15,
        timeoutMs: 2000,
        warningThresholdMs: 40,
        criticalThresholdMs: 120,
        status: 'up',
        lastLatencyMs: 0.85,
        packetLossPercent: 0.0,
        lastCheckAt: new Date().toISOString(),
        enabled: true,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: uuidv4(),
        name: 'DNS Resolver Availability (1.1.1.1)',
        target: '1.1.1.1',
        port: 53,
        checkType: 'tcp',
        intervalSeconds: 20,
        timeoutMs: 2500,
        warningThresholdMs: 60,
        criticalThresholdMs: 200,
        status: 'up',
        lastLatencyMs: 14.2,
        packetLossPercent: 0.0,
        lastCheckAt: new Date().toISOString(),
        enabled: true,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: uuidv4(),
        name: 'Internal Portal HTTP Probe',
        target: 'http://localhost:5000/api/health',
        checkType: 'http',
        intervalSeconds: 30,
        timeoutMs: 3000,
        warningThresholdMs: 100,
        criticalThresholdMs: 500,
        status: 'up',
        lastLatencyMs: 5.4,
        packetLossPercent: 0.0,
        lastCheckAt: new Date().toISOString(),
        enabled: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: uuidv4(),
        name: 'ESXi Management Interface Check',
        target: '192.168.1.100',
        port: 443,
        checkType: 'tcp',
        intervalSeconds: 30,
        timeoutMs: 3000,
        warningThresholdMs: 50,
        criticalThresholdMs: 250,
        status: 'up',
        lastLatencyMs: 1.8,
        packetLossPercent: 0.0,
        lastCheckAt: new Date().toISOString(),
        enabled: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];

    initialMonitors.forEach(m => {
      this.pingMonitors.set(m.id, m);
      // Pre-seed some history data points
      for (let i = 10; i >= 0; i--) {
        this.pingHistory.push({
          id: uuidv4(),
          monitorId: m.id,
          latencyMs: Number(((m.lastLatencyMs || 10) + (Math.random() * 4 - 2)).toFixed(2)),
          status: 'up',
          packetLossPercent: 0,
          message: 'OK',
          recordedAt: new Date(Date.now() - i * 60000).toISOString()
        });
      }
    });

    // 4. Seed Credible Incident (Ransomware / Suspicious Activity simulation)
    const finAsset = initialAssets.find(a => a.name === 'FINANCE-WKS-04');
    const sampleIncident: Incident = {
      id: uuidv4(),
      title: 'Suspicious Encryptor Activity & High Entropy File Mod Detected',
      description: 'Heuristic & Wazuh FIM rule 100240 triggered: mass extension rewrite (.locked) observed in C:\\Users\\j.doe\\Documents along with abnormal vssadmin.exe shadowcopy deletion attempt.',
      assetId: finAsset?.id,
      assetName: finAsset?.name || 'FINANCE-WKS-04',
      severity: 'critical',
      status: 'investigating',
      responseLevel: 'quarantine',
      source: 'wazuh',
      forensicData: {
        processName: 'svchost_updater.exe',
        md5: '7d82b3a9c67e810fa24bc98e102f4311',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        parentProcess: 'powershell.exe -enc ...',
        detectedBehavior: ['vssadmin delete shadows /all /quiet', 'high_entropy_writes', 'rapid_file_renames'],
        quarantinedFiles: ['C:\\Users\\j.doe\\Downloads\\invoice_oct_statement.pdf.exe'],
        networkIsolationStatus: 'pending_approval'
      },
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 600000).toISOString()
    };
    this.incidents.set(sampleIncident.id, sampleIncident);

    // 5. Seed Integrations
    const defaultIntegrations: IntegrationStatus[] = [
      {
        id: 'grafana',
        name: 'grafana',
        displayName: 'Grafana Visualization',
        enabled: true,
        baseUrl: 'http://grafana:3000',
        status: 'healthy',
        lastSyncAt: new Date().toISOString(),
        summary: 'Synchronized. 4 dashboards provisioned (Host Metrics, Network Latency, ESXi Virtualization, Wazuh SIEM)'
      },
      {
        id: 'prometheus',
        name: 'prometheus',
        displayName: 'Prometheus Metrics Collector',
        enabled: true,
        baseUrl: 'http://prometheus:9090',
        status: 'healthy',
        lastSyncAt: new Date().toISOString(),
        summary: 'Active scraping on 5 targets (Node Exporter, Windows Exporter, Ping Engine)'
      },
      {
        id: 'uptime_kuma',
        name: 'uptime_kuma',
        displayName: 'Uptime Kuma Probe Engine',
        enabled: true,
        baseUrl: 'http://uptime-kuma:3001',
        status: 'healthy',
        lastSyncAt: new Date().toISOString(),
        summary: 'Linked with SentinelGrid Ping Service. 4 active synthetic monitors synchronized.'
      },
      {
        id: 'wazuh',
        name: 'wazuh',
        displayName: 'Wazuh Security & HIDS Manager',
        enabled: true,
        baseUrl: 'https://wazuh-manager:55000',
        status: 'healthy',
        lastSyncAt: new Date().toISOString(),
        summary: 'Wazuh API connected. Active agents: 3, Rule correlation active, FIM enabled.'
      },
      {
        id: 'vmware',
        name: 'vmware',
        displayName: 'VMware vSphere / ESXi Manager',
        enabled: true,
        baseUrl: 'https://192.168.1.100/sdk',
        status: 'healthy',
        lastSyncAt: new Date().toISOString(),
        summary: 'pyVmomi adapter active. 1 ESXi 8.0 host, 8 guest VMs monitored.'
      }
    ];
    defaultIntegrations.forEach(i => this.integrations.set(i.id, i));

    // 6. Seed Initial Audit Logs
    this.addAuditLog(
      adminUser.id,
      'admin',
      'SYSTEM_INITIALIZED',
      'SYSTEM',
      'core-control-plane',
      { version: '1.0.0', environment: 'production-ready', modules: ['auth', 'assets', 'ping', 'security', 'integrations'] },
      '127.0.0.1'
    );
  }

  public addAuditLog(
    userId: string | undefined,
    username: string,
    action: string,
    resourceType: string,
    resourceId: string | undefined,
    details: Record<string, any>,
    ipAddress: string
  ): AuditLog {
    const entryData = {
      id: uuidv4(),
      userId,
      username,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      createdAt: new Date().toISOString()
    };

    const hashSignature = calculateAuditHash(this.lastAuditHash, entryData);
    this.lastAuditHash = hashSignature;

    const logEntry: AuditLog = {
      ...entryData,
      hashSignature
    };

    this.auditLogs.unshift(logEntry);
    // Keep max 5000 logs in memory buffer
    if (this.auditLogs.length > 5000) {
      this.auditLogs.pop();
    }
    return logEntry;
  }
}

export const db = new DataStore();
