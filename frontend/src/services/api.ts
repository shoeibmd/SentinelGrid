import { 
  Asset, 
  PingMonitor, 
  PingHistoryEntry, 
  Incident, 
  AuditLog, 
  IntegrationStatus, 
  User 
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('sentinelgrid_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (username: string, password: string):Promise<{ token: string; user: User }> => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  getMe: async (): Promise<User> => {
    return request('/auth/me');
  },

  // Assets
  getAssets: async (params?: { osType?: string; status?: string; search?: string }): Promise<Asset[]> => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/assets${query ? `?${query}` : ''}`);
  },
  getAssetSummary: async (): Promise<{ total: number; online: number; warning: number; critical: number; offline: number; byOs: Record<string, number> }> => {
    return request('/assets/summary');
  },
  createAsset: async (data: Partial<Asset>): Promise<Asset> => {
    return request('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateAsset: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    return request(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteAsset: async (id: string): Promise<{ message: string }> => {
    return request(`/assets/${id}`, {
      method: 'DELETE',
    });
  },

  // Ping Monitors
  getMonitors: async (): Promise<PingMonitor[]> => {
    return request('/monitors');
  },
  getMonitorHistory: async (id: string, limit = 30): Promise<PingHistoryEntry[]> => {
    return request(`/monitors/${id}/history?limit=${limit}`);
  },
  createMonitor: async (data: Partial<PingMonitor>): Promise<PingMonitor> => {
    return request('/monitors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  triggerCheck: async (id: string): Promise<any> => {
    return request(`/monitors/${id}/check`, {
      method: 'POST',
    });
  },
  deleteMonitor: async (id: string): Promise<{ message: string }> => {
    return request(`/monitors/${id}`, {
      method: 'DELETE',
    });
  },

  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    return request('/incidents');
  },
  updateIncidentStatus: async (id: string, status: string, notes?: string): Promise<Incident> => {
    return request(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },
  executeContainment: async (id: string, action: string): Promise<{ success: boolean; message: string; incident: Incident }> => {
    return request(`/incidents/${id}/containment`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  // Integrations
  getIntegrations: async (): Promise<IntegrationStatus[]> => {
    return request('/integrations');
  },
  testIntegration: async (id: string): Promise<{ success: boolean; status: string; message: string; latencyMs: number }> => {
    return request(`/integrations/${id}/test`, {
      method: 'POST',
    });
  },

  // Audit Logs
  getAuditLogs: async (limit = 100): Promise<AuditLog[]> => {
    return request(`/audit-logs?limit=${limit}`);
  },
  verifyAuditIntegrity: async (): Promise<{ valid: boolean; totalChecked: number }> => {
    return request('/audit-logs/verify');
  },
};
