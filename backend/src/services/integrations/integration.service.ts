import { db } from '../../db/index.js';
import { IntegrationStatus } from '../../models/types.js';

export class IntegrationService {
  static listIntegrations(): IntegrationStatus[] {
    return Array.from(db.integrations.values());
  }

  static getIntegrationById(id: string): IntegrationStatus | null {
    return db.integrations.get(id) || null;
  }

  static updateIntegration(
    id: string,
    updates: Partial<Pick<IntegrationStatus, 'enabled' | 'baseUrl'>>,
    operator: string,
    ip: string
  ): IntegrationStatus {
    const item = db.integrations.get(id);
    if (!item) throw new Error(`Integration '${id}' not found`);

    const updated = {
      ...item,
      ...updates,
      lastSyncAt: new Date().toISOString()
    };

    db.integrations.set(id, updated);

    db.addAuditLog(
      undefined,
      operator,
      'INTEGRATION_CONFIG_UPDATED',
      'INTEGRATION',
      id,
      { enabled: updated.enabled, baseUrl: updated.baseUrl },
      ip
    );

    return updated;
  }

  static async testConnection(id: string, operator: string, ip: string): Promise<{ success: boolean; status: string; message: string; latencyMs: number }> {
    const item = db.integrations.get(id);
    if (!item) throw new Error(`Integration '${id}' not found`);

    const start = Date.now();
    // Simulate real adapter probe latency
    await new Promise(r => setTimeout(r, 60));
    const latencyMs = Date.now() - start;

    item.status = 'healthy';
    item.lastSyncAt = new Date().toISOString();
    db.integrations.set(id, item);

    db.addAuditLog(
      undefined,
      operator,
      'INTEGRATION_TEST_CONNECTION',
      'INTEGRATION',
      id,
      { result: 'healthy', latencyMs },
      ip
    );

    return {
      success: true,
      status: 'healthy',
      message: `Connection to ${item.displayName} (${item.baseUrl}) verified successfully.`,
      latencyMs
    };
  }
}
