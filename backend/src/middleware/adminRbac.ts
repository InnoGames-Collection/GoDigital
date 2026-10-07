import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { cache } from '../config/cache.js';

export type AdminRole = 'SUPER_ADMIN' | 'CONTENT_CREATOR' | 'OPERATIONS_MANAGER' | 'AUDITOR';

export type AdminPermission =
  | 'puzzles:read'
  | 'puzzles:create'
  | 'puzzles:update'
  | 'puzzles:delete'
  | 'puzzles:bulk_import'
  | 'daily_challenges:read'
  | 'daily_challenges:manage'
  | 'analytics:read'
  | 'players:read'
  | 'players:unmask_pii'
  | 'players:adjust_balance'
  | 'players:reset_score'
  | 'tournaments:read'
  | 'tournaments:manage'
  | 'tournaments:payout'
  | 'audit_logs:read'
  | 'admin_users:manage';

export interface AdminJwtPayload {
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
  department: string;
  jti: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AdminJwtPayload;
  }
}

// Enterprise RBAC Matrix
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    'puzzles:read',
    'puzzles:create',
    'puzzles:update',
    'puzzles:delete',
    'puzzles:bulk_import',
    'daily_challenges:read',
    'daily_challenges:manage',
    'analytics:read',
    'players:read',
    'players:unmask_pii',
    'players:adjust_balance',
    'players:reset_score',
    'tournaments:read',
    'tournaments:manage',
    'tournaments:payout',
    'audit_logs:read',
    'admin_users:manage',
  ],
  CONTENT_CREATOR: [
    'puzzles:read',
    'puzzles:create',
    'puzzles:update',
    'puzzles:delete',
    'puzzles:bulk_import',
    'daily_challenges:read',
    'daily_challenges:manage',
    'analytics:read',
    'players:read',
    'tournaments:read',
  ],
  OPERATIONS_MANAGER: [
    'players:read',
    'players:unmask_pii',
    'players:adjust_balance',
    'players:reset_score',
    'tournaments:read',
    'tournaments:manage',
    'tournaments:payout',
    'analytics:read',
    'audit_logs:read',
    'daily_challenges:read',
    'puzzles:read',
  ],
  AUDITOR: [
    'audit_logs:read',
    'analytics:read',
    'players:read',
    'puzzles:read',
    'daily_challenges:read',
    'tournaments:read',
  ],
};

export function signAdminToken(payload: Omit<AdminJwtPayload, 'jti'>): string {
  const jti = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return jwt.sign({ ...payload, jti }, env.JWT_SECRET, {
    expiresIn: '2h', // Short 2-hour expiration for admin sessions
    issuer: 'godigital-admin-gateway',
  });
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  try {
    const exists = await cache.get(`admin:blacklist:${jti}`);
    return exists !== null;
  } catch {
    return false;
  }
}

export async function blacklistToken(jti: string, ttlSeconds: number = 7200): Promise<void> {
  try {
    await cache.set(`admin:blacklist:${jti}`, '1', 'EX', ttlSeconds);
  } catch (err: any) {
    console.warn('[Valkey Warning] Could not blacklist token:', err.message);
  }
}

/**
 * Fastify preHandler to verify dedicated admin JWT and check Valkey revocation blacklist.
 */
export async function requireAdminAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Administrative authentication required. Missing or malformed Bearer token.',
    });
  }

  const token = authHeader.slice(7).trim();
  let decoded: AdminJwtPayload;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'godigital-admin-gateway',
    }) as AdminJwtPayload;
  } catch (err: any) {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Admin token is invalid or expired. Please re-authenticate.',
      detail: err.message,
    });
  }

  // Check Valkey / Redis revocation blacklist
  if (decoded.jti && (await isTokenBlacklisted(decoded.jti))) {
    return reply.status(401).send({
      success: false,
      error: 'TOKEN_REVOKED',
      message: 'Administrative session has been revoked. Please log in again.',
    });
  }

  request.adminUser = decoded;
}

/**
 * RBAC permission guard generator.
 */
export function requirePermission(permission: AdminPermission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAdminAuth(request, reply);
    if (reply.sent) return;

    const user = request.adminUser;
    if (!user) {
      return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });
    }

    const allowedPermissions = ROLE_PERMISSIONS[user.role] || [];
    if (!allowedPermissions.includes(permission)) {
      return reply.status(403).send({
        success: false,
        error: 'FORBIDDEN',
        message: `Role '${user.role}' lacks required permission '${permission}'.`,
        requiredPermission: permission,
        role: user.role,
      });
    }
  };
}

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}
