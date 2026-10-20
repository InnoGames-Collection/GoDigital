/**
 * EthioTelecom Authentication Service
 * Supports Mobile Station International Subscriber Directory Number (MSISDN) login,
 * SMS OTP verification, and TeleBirr Direct Connect.
 */

import { UserProfile } from '../types';
import { StorageService } from './storageService';
import { apiService } from './apiService';

export interface AuthResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

export const AuthService = {
  /**
   * Request 6-digit OTP code via backend EthioTelecom SMS gateway
   */
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; message: string; demoOtp?: string }> {
    const res = await apiService.requestOtp(phoneNumber);
    if (res && res.success) {
      return {
        success: true,
        message: res.message,
        demoOtp: res.demoOtp,
      };
    }

    return {
      success: false,
      message: res?.message || 'Failed to dispatch verification code. Please check your phone number.',
    };
  },

  /**
   * Verify 6-digit OTP against backend database and log in
   */
  async verifyOtp(phoneNumber: string, otp: string): Promise<AuthResponse> {
    const res = await apiService.verifyOtp(phoneNumber, otp);
    if (res && res.success && res.profile) {
      StorageService.saveProfile(res.profile);
      return {
        success: true,
        message: res.message || 'Successfully authenticated with EthioTelecom.',
        profile: res.profile,
      };
    }

    return {
      success: false,
      message: res?.message || 'Invalid or expired 6-digit verification code.',
    };
  },

  /**
   * Authoritative TeleBirr Direct Connect Authenticator
   */
  async loginWithTeleBirr(phoneNumber?: string, token?: string): Promise<AuthResponse> {
    const profile = await apiService.loginWithTelebirr(phoneNumber, token);
    if (profile) {
      StorageService.saveProfile(profile);
      return {
        success: true,
        message: 'Connected with TeleBirr SuperApp successfully.',
        profile,
      };
    }

    return {
      success: false,
      message: 'Failed to authenticate via TeleBirr SuperApp.',
    };
  },

  /**
   * Sign out and clear authenticated session
   */
  signOut(): UserProfile {
    apiService.clearToken();
    return StorageService.clearSession();
  }
};
