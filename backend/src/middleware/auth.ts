import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAuthToken, AuthJwtPayload } from '../utils/jwt.js';

export type AuthPayload = AuthJwtPayload & {
  id?: string;
  msisdn?: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthPayload;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.',
    });
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyAuthToken(token) as AuthPayload | null;
  if (!payload) {
    return reply.status(401).send({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }

  payload.id = payload.userId;
  payload.msisdn = payload.phone;
  request.user = payload;
}

export async function optionalAuth(request: FastifyRequest) {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = verifyAuthToken(token) as AuthPayload | null;
    if (payload) {
      payload.id = payload.userId;
      payload.msisdn = payload.phone;
      request.user = payload;
    }
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply);
  if (reply.sent) return;

  if (request.user?.role !== 'admin' && !['SUPER_ADMIN', 'OPERATOR', 'AUDITOR'].includes(request.user?.role || '')) {
    return reply.status(403).send({
      success: false,
      error: 'Access denied: Administrator privilege required.',
    });
  }
}

export const verifyAuth = requireAuth;
export const verifyAdmin = requireAdmin;
