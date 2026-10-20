import { FastifyInstance } from 'fastify';
import { authService } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  // TeleBirr SuperApp Direct Connect Single-Sign-On
  fastify.post('/telebirr-login', async (request, reply) => {
    const body = (request.body || {}) as { phoneNumber?: string; token?: string };
    const result = await authService.loginWithTeleBirr(body.phoneNumber, body.token);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });

  // SMS OTP Request
  fastify.post('/request-otp', async (request, reply) => {
    const body = (request.body || {}) as { phoneNumber?: string };
    if (!body.phoneNumber) {
      return reply.status(400).send({ success: false, message: 'Phone number is required.' });
    }
    const result = await authService.requestOtp(body.phoneNumber);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });

  // SMS OTP Verification
  fastify.post('/verify-otp', async (request, reply) => {
    const body = (request.body || {}) as { phoneNumber?: string; otp?: string };
    if (!body.phoneNumber || !body.otp) {
      return reply.status(400).send({ success: false, message: 'Phone number and 6-digit OTP code are required.' });
    }
    const result = await authService.verifyOtp(body.phoneNumber, body.otp);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });

  // Get current authenticated user profile
  fastify.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user!.userId;
    const profile = await authService.getProfile(userId);
    if (!profile) {
      return reply.status(404).send({ success: false, message: 'Profile not found' });
    }
    return reply.send({ success: true, profile });
  });

  // Alias for /me
  fastify.get('/profile', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user!.userId;
    const profile = await authService.getProfile(userId);
    if (!profile) {
      return reply.status(404).send({ success: false, message: 'Profile not found' });
    }
    return reply.send({ success: true, profile });
  });

  // Sign out / invalidate session
  fastify.post('/logout', { preHandler: [requireAuth] }, async (request, reply) => {
    return reply.send({ success: true, message: 'Signed out successfully' });
  });
}
