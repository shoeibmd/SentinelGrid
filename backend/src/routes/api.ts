import { Router } from 'express';
import { 
  AuthController, 
  AssetController, 
  PingController, 
  IncidentController, 
  IntegrationController, 
  AuditController 
} from '../controllers/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'sentinelgrid-core-api',
    version: '1.0.0'
  });
});

// Auth Routes
router.post('/auth/login', AuthController.login);
router.post('/auth/register', authenticate as any, authorize(['Admin']) as any, AuthController.register as any);
router.get('/auth/me', authenticate as any, AuthController.me as any);

// Asset Routes
router.get('/assets', AssetController.list);
router.get('/assets/summary', AssetController.summary);
router.get('/assets/:id', AssetController.getById);
router.post('/assets', authenticate as any, authorize(['Admin', 'Operator']) as any, AssetController.create as any);
router.put('/assets/:id', authenticate as any, authorize(['Admin', 'Operator']) as any, AssetController.update as any);
router.delete('/assets/:id', authenticate as any, authorize(['Admin']) as any, AssetController.delete as any);

// Ping Monitor Routes
router.get('/monitors', PingController.list);
router.get('/monitors/:id', PingController.getById);
router.get('/monitors/:id/history', PingController.getHistory);
router.post('/monitors', authenticate as any, authorize(['Admin', 'Operator']) as any, PingController.create as any);
router.post('/monitors/:id/check', PingController.triggerCheck);
router.put('/monitors/:id', authenticate as any, authorize(['Admin', 'Operator']) as any, PingController.update as any);
router.delete('/monitors/:id', authenticate as any, authorize(['Admin']) as any, PingController.delete as any);

// Incident Routes
router.get('/incidents', IncidentController.list);
router.get('/incidents/:id', IncidentController.getById);
router.post('/incidents', authenticate as any, authorize(['Admin', 'Analyst', 'Operator']) as any, IncidentController.create as any);
router.patch('/incidents/:id/status', authenticate as any, authorize(['Admin', 'Analyst', 'Operator']) as any, IncidentController.updateStatus as any);
router.post('/incidents/:id/containment', authenticate as any, authorize(['Admin', 'Operator']) as any, IncidentController.executeContainment as any);

// Integration Routes
router.get('/integrations', IntegrationController.list);
router.put('/integrations/:id', authenticate as any, authorize(['Admin']) as any, IntegrationController.update as any);
router.post('/integrations/:id/test', authenticate as any, authorize(['Admin', 'Operator']) as any, IntegrationController.testConnection as any);

// Audit Log Routes
router.get('/audit-logs', authenticate as any, authorize(['Admin', 'Analyst']) as any, AuditController.list as any);
router.get('/audit-logs/verify', authenticate as any, authorize(['Admin']) as any, AuditController.verifyChain as any);

export default router;
