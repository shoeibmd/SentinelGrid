import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AssetService } from '../services/asset.service.js';
import { PingService } from '../services/ping.service.js';
import { IncidentService } from '../services/incident.service.js';
import { IntegrationService } from '../services/integrations/integration.service.js';
import { AuditService } from '../services/audit.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Auth Controller
export const AuthController = {
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = await AuthService.login(username, password, ip);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  },

  register: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { username, email, password, role } = req.body;
      if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields (username, email, password, role) are required.' });
      }
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const user = await AuthService.registerUser(username, email, password, role, req.user!.username, ip);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  me: (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    const user = AuthService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  }
};

// Asset Controller
export const AssetController = {
  list: (req: Request, res: Response) => {
    const { osType, status, groupName, search } = req.query as any;
    const assets = AssetService.listAssets({ osType, status, groupName, search });
    res.json(assets);
  },

  summary: (_req: Request, res: Response) => {
    res.json(AssetService.getAssetSummary());
  },

  getById: (req: Request, res: Response) => {
    const asset = AssetService.getAssetById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  },

  create: (req: AuthenticatedRequest, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const asset = AssetService.createAsset(req.body, req.user!.username, ip);
      res.status(201).json(asset);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  update: (req: AuthenticatedRequest, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const asset = AssetService.updateAsset(req.params.id, req.body, req.user!.username, ip);
      res.json(asset);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  delete: (req: AuthenticatedRequest, res: Response) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const deleted = AssetService.deleteAsset(req.params.id, req.user!.username, ip);
    if (!deleted) return res.status(404).json({ error: 'Asset not found' });
    res.json({ message: 'Asset deleted successfully' });
  }
};

// Ping Monitor Controller
export const PingController = {
  list: (_req: Request, res: Response) => {
    res.json(PingService.listMonitors());
  },

  getById: (req: Request, res: Response) => {
    const monitor = PingService.getMonitorById(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    res.json(monitor);
  },

  getHistory: (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    res.json(PingService.getMonitorHistory(req.params.id, limit));
  },

  create: (req: AuthenticatedRequest, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const mon = PingService.createMonitor(req.body, req.user!.username, ip);
      res.status(201).json(mon);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  triggerCheck: async (req: Request, res: Response) => {
    try {
      const result = await PingService.executeMonitorCheck(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  update: (req: AuthenticatedRequest, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const mon = PingService.updateMonitor(req.params.id, req.body, req.user!.username, ip);
      res.json(mon);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  delete: (req: AuthenticatedRequest, res: Response) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const deleted = PingService.deleteMonitor(req.params.id, req.user!.username, ip);
    if (!deleted) return res.status(404).json({ error: 'Monitor not found' });
    res.json({ message: 'Monitor deleted successfully' });
  }
};

// Incident Controller
export const IncidentController = {
  list: (req: Request, res: Response) => {
    const { severity, status } = req.query as any;
    res.json(IncidentService.listIncidents({ severity, status }));
  },

  getById: (req: Request, res: Response) => {
    const inc = IncidentService.getIncidentById(req.params.id);
    if (!inc) return res.status(404).json({ error: 'Incident not found' });
    res.json(inc);
  },

  create: (req: AuthenticatedRequest, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const inc = IncidentService.createIncident(req.body, req.user!.username, ip);
      res.status(201).json(inc);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  updateStatus: (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, notes } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const inc = IncidentService.updateIncidentStatus(req.params.id, status, req.user!.username, ip, notes);
      res.json(inc);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  executeContainment: (req: AuthenticatedRequest, res: Response) => {
    try {
      const { action } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = IncidentService.executeContainmentAction(req.params.id, action, req.user!.username, ip);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
};

// Integration Controller
export const IntegrationController = {
  list: (_req: Request, res: Response) => {
    res.json(IntegrationService.listIntegrations());
  },

  update: (req: AuthenticatedRequest, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const updated = IntegrationService.updateIntegration(req.params.id, req.body, req.user!.username, ip);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  testConnection: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = await IntegrationService.testConnection(req.params.id, req.user!.username, ip);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
};

// Audit Controller
export const AuditController = {
  list: (req: Request, res: Response) => {
    const { username, action, resourceType, limit } = req.query as any;
    res.json(AuditService.listLogs({
      username,
      action,
      resourceType,
      limit: limit ? parseInt(limit) : 100
    }));
  },

  verifyChain: (_req: Request, res: Response) => {
    res.json(AuditService.verifyLogChainIntegrity());
  }
};
