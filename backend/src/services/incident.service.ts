import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { Incident, IncidentSeverity, IncidentStatus, ResponseLevel } from '../models/types.js';

export class IncidentService {
  static listIncidents(filters?: { severity?: IncidentSeverity; status?: IncidentStatus }): Incident[] {
    let incidents = Array.from(db.incidents.values());

    if (filters?.severity) {
      incidents = incidents.filter(i => i.severity === filters.severity);
    }
    if (filters?.status) {
      incidents = incidents.filter(i => i.status === filters.status);
    }

    return incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getIncidentById(id: string): Incident | null {
    return db.incidents.get(id) || null;
  }

  static createIncident(data: {
    title: string;
    description: string;
    assetId?: string;
    severity: IncidentSeverity;
    responseLevel?: ResponseLevel;
    source?: 'wazuh' | 'ping_monitor' | 'manual' | 'heuristic';
    forensicData?: Record<string, any>;
  }, operator: string, ip: string): Incident {
    let assetName = 'Unassigned';
    if (data.assetId) {
      const asset = db.assets.get(data.assetId);
      if (asset) assetName = asset.name;
    }

    const newInc: Incident = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      assetId: data.assetId,
      assetName,
      severity: data.severity,
      status: 'new',
      responseLevel: data.responseLevel || 'alert_only',
      source: data.source || 'manual',
      forensicData: data.forensicData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.incidents.set(newInc.id, newInc);

    db.addAuditLog(
      undefined,
      operator,
      'INCIDENT_CREATED',
      'INCIDENT',
      newInc.id,
      { title: newInc.title, severity: newInc.severity, assetName },
      ip
    );

    return newInc;
  }

  static updateIncidentStatus(
    id: string, 
    status: IncidentStatus, 
    operator: string, 
    ip: string,
    notes?: string
  ): Incident {
    const inc = db.incidents.get(id);
    if (!inc) throw new Error('Incident not found');

    const previousStatus = inc.status;
    inc.status = status;
    inc.updatedAt = new Date().toISOString();

    if (notes) {
      inc.forensicData = {
        ...inc.forensicData,
        lastOperatorNotes: notes
      };
    }

    db.incidents.set(id, inc);

    db.addAuditLog(
      undefined,
      operator,
      'INCIDENT_STATUS_UPDATED',
      'INCIDENT',
      id,
      { from: previousStatus, to: status, notes },
      ip
    );

    return inc;
  }

  static executeContainmentAction(
    id: string,
    action: 'quarantine' | 'isolate' | 'isolate_and_shutdown',
    operator: string,
    ip: string,
    confirmationRequired = true
  ): { success: boolean; message: string; incident: Incident } {
    const inc = db.incidents.get(id);
    if (!inc) throw new Error('Incident not found');

    const asset = inc.assetId ? db.assets.get(inc.assetId) : null;

    // Safety check: Never shutdown an ESXi host due to VM incident!
    if (action === 'isolate_and_shutdown' && asset?.osType === 'vmware_esxi') {
      throw new Error('SAFETY_VIOLATION: Hypervisor host shutdown is prohibited for guest incident containment.');
    }

    if (action === 'quarantine') {
      inc.status = 'quarantined';
      inc.responseLevel = 'quarantine';
      inc.forensicData = {
        ...inc.forensicData,
        quarantineExecutedAt: new Date().toISOString(),
        quarantineOperator: operator
      };
      if (asset) {
        asset.status = 'warning';
      }
    } else if (action === 'isolate') {
      inc.status = 'isolated';
      inc.responseLevel = 'isolate';
      inc.forensicData = {
        ...inc.forensicData,
        networkIsolationExecutedAt: new Date().toISOString(),
        networkIsolationOperator: operator,
        firewallRuleApplied: 'BLOCK_ALL_EXCEPT_MANAGEMENT_PORT'
      };
      if (asset) {
        asset.status = 'critical';
      }
    } else if (action === 'isolate_and_shutdown') {
      inc.status = 'isolated';
      inc.responseLevel = 'isolate_and_shutdown';
      inc.forensicData = {
        ...inc.forensicData,
        shutdownOrderedAt: new Date().toISOString(),
        shutdownOperator: operator,
        shutdownType: 'controlled_sync_unmount'
      };
      if (asset) {
        asset.status = 'offline';
      }
    }

    inc.updatedAt = new Date().toISOString();
    db.incidents.set(id, inc);
    if (asset) db.assets.set(asset.id, asset);

    db.addAuditLog(
      undefined,
      operator,
      `CONTAINMENT_${action.toUpperCase()}`,
      'INCIDENT',
      id,
      { assetId: inc.assetId, assetName: inc.assetName, action },
      ip
    );

    return {
      success: true,
      message: `Containment action '${action}' successfully executed against target ${inc.assetName}.`,
      incident: inc
    };
  }
}
