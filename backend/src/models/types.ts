export type UserRole = 'Admin' | 'Analyst' | 'Operator' | 'Viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type OSType = 'windows' | 'linux' | 'vmware_esxi' | 'network_device' | 'other';
export type AssetStatus = 'online' | 'warning' | 'critical' | 'offline';

export interface Asset {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  osType: OSType;
  osVersion?: string;
  status: AssetStatus;
  agentInstalled: boolean;
  agentVersion?: string;
  tags: string[];
  groupName: string;
  createdAt: string;
  updatedAt: string;
}

export type CheckType = 'icmp' | 'tcp' | 'http';
export type MonitorStatus = 'up' | 'down' | 'degraded' | 'pending';

export interface PingMonitor {
  id: string;
  name: string;
  target: string;
  port?: number;
  checkType: CheckType;
  intervalSeconds: number;
  timeoutMs: number;
  warningThresholdMs: number;
  criticalThresholdMs: number;
  status: MonitorStatus;
  lastLatencyMs?: number;
  packetLossPercent: number;
  lastCheckAt?: string;
  enabled: boolean;
  createdAt: string;
}

export interface PingHistoryEntry {
  id: string;
  monitorId: string;
  latencyMs: number;
  status: MonitorStatus;
  packetLossPercent: number;
  message?: string;
  recordedAt: string;
}

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'new' | 'investigating' | 'quarantined' | 'isolated' | 'resolved' | 'dismissed';
export type ResponseLevel = 'alert_only' | 'investigate' | 'quarantine' | 'isolate' | 'isolate_and_shutdown';

export interface Incident {
  id: string;
  title: string;
  description: string;
  assetId?: string;
  assetName?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  responseLevel: ResponseLevel;
  source: 'wazuh' | 'ping_monitor' | 'manual' | 'heuristic';
  forensicData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  username: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  hashSignature: string;
  createdAt: string;
}

export interface IntegrationStatus {
  id: string;
  name: 'grafana' | 'prometheus' | 'uptime_kuma' | 'wazuh' | 'vmware';
  displayName: string;
  enabled: boolean;
  baseUrl: string;
  status: 'healthy' | 'degraded' | 'unreachable' | 'unconfigured';
  lastSyncAt?: string;
  summary: string;
  details?: Record<string, any>;
}
