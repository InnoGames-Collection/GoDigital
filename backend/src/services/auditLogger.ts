import { pool } from '../config/database.js';
import pg from 'pg';

export interface AuditLogParams {
  adminId?: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  client?: pg.PoolClient;
}

export class AuditLogger {
  /**
   * Log an administrative mutation into the immutable admin_audit_logs table.
   * Can be executed within a transaction using the optional client parameter.
   */
  static async log(params: AuditLogParams): Promise<string> {
    const {
      adminId = null,
      adminEmail,
      adminRole,
      action,
      resourceType,
      resourceId = null,
      previousState = null,
      newState = null,
      reason = null,
      ipAddress = null,
      userAgent = null,
      client,
    } = params;

    const queryText = `
      INSERT INTO admin_audit_logs (
        admin_id, admin_email, admin_role, action, resource_type,
        resource_id, previous_state, new_state, reason, ip_address, user_agent, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id
    `;

    const values = [
      adminId,
      adminEmail,
      adminRole,
      action,
      resourceType,
      resourceId,
      previousState ? JSON.stringify(previousState) : null,
      newState ? JSON.stringify(newState) : null,
      reason,
      ipAddress,
      userAgent,
    ];

    try {
      const runner = client || pool;
      const res = await runner.query(queryText, values);
      return res.rows[0]?.id;
    } catch (err: any) {
      console.error('[AuditLogger ERROR] Failed to record immutable audit trail:', err.message, params);
      // We log the error but allow calling transactions to decide or bubble
      throw err;
    }
  }
}
