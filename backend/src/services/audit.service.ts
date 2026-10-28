import { db } from '../db/index.js';
import { AuditLog } from '../models/types.js';
import { calculateAuditHash } from '../utils/crypto.js';

export class AuditService {
  static listLogs(filters?: { username?: string; action?: string; resourceType?: string; limit?: number }): AuditLog[] {
    let logs = [...db.auditLogs];

    if (filters?.username) {
      logs = logs.filter(l => l.username.toLowerCase().includes(filters.username!.toLowerCase()));
    }
    if (filters?.action) {
      logs = logs.filter(l => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters?.resourceType) {
      logs = logs.filter(l => l.resourceType.toLowerCase() === filters.resourceType!.toLowerCase());
    }

    const limit = filters?.limit || 100;
    return logs.slice(0, limit);
  }

  static verifyLogChainIntegrity(): { valid: boolean; totalChecked: number; errorIndex?: number } {
    const logs = [...db.auditLogs].reverse(); // Verify from oldest to newest
    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < logs.length; i++) {
      const entry = logs[i];
      const entryData = {
        id: entry.id,
        userId: entry.userId,
        username: entry.username,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        details: entry.details,
        ipAddress: entry.ipAddress,
        createdAt: entry.createdAt
      };

      const expectedHash = calculateAuditHash(previousHash, entryData);
      if (expectedHash !== entry.hashSignature) {
        return { valid: false, totalChecked: i, errorIndex: i };
      }
      previousHash = entry.hashSignature;
    }

    return { valid: true, totalChecked: logs.length };
  }
}
