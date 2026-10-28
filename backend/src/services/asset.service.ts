import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { Asset, AssetStatus, OSType } from '../models/types.js';

export class AssetService {
  static listAssets(filters?: { osType?: OSType; status?: AssetStatus; groupName?: string; search?: string }): Asset[] {
    let assets = Array.from(db.assets.values());

    if (filters?.osType) {
      assets = assets.filter(a => a.osType === filters.osType);
    }
    if (filters?.status) {
      assets = assets.filter(a => a.status === filters.status);
    }
    if (filters?.groupName) {
      assets = assets.filter(a => a.groupName.toLowerCase() === filters.groupName!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      assets = assets.filter(a => 
        a.name.toLowerCase().includes(q) ||
        a.hostname.toLowerCase().includes(q) ||
        a.ipAddress.includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getAssetById(id: string): Asset | null {
    return db.assets.get(id) || null;
  }

  static createAsset(data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>, operatorUsername: string, ipAddress: string): Asset {
    const newAsset: Asset = {
      id: uuidv4(),
      ...data,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.assets.set(newAsset.id, newAsset);

    db.addAuditLog(
      undefined,
      operatorUsername,
      'ASSET_CREATED',
      'ASSET',
      newAsset.id,
      { name: newAsset.name, ip: newAsset.ipAddress, osType: newAsset.osType },
      ipAddress
    );

    return newAsset;
  }

  static updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>, operatorUsername: string, ipAddress: string): Asset {
    const asset = db.assets.get(id);
    if (!asset) {
      throw new Error(`Asset with id ${id} not found.`);
    }

    const updated: Asset = {
      ...asset,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    db.assets.set(id, updated);

    db.addAuditLog(
      undefined,
      operatorUsername,
      'ASSET_UPDATED',
      'ASSET',
      id,
      { changes: Object.keys(updates) },
      ipAddress
    );

    return updated;
  }

  static deleteAsset(id: string, operatorUsername: string, ipAddress: string): boolean {
    const asset = db.assets.get(id);
    if (!asset) return false;

    db.assets.delete(id);

    db.addAuditLog(
      undefined,
      operatorUsername,
      'ASSET_DELETED',
      'ASSET',
      id,
      { deletedAssetName: asset.name, ip: asset.ipAddress },
      ipAddress
    );

    return true;
  }

  static getAssetSummary(): {
    total: number;
    online: number;
    warning: number;
    critical: number;
    offline: number;
    byOs: Record<string, number>;
  } {
    const assets = Array.from(db.assets.values());
    const summary = {
      total: assets.length,
      online: 0,
      warning: 0,
      critical: 0,
      offline: 0,
      byOs: {} as Record<string, number>
    };

    for (const a of assets) {
      summary[a.status] = (summary[a.status] || 0) + 1;
      summary.byOs[a.osType] = (summary.byOs[a.osType] || 0) + 1;
    }

    return summary;
  }
}
