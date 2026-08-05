/**
 * TelebirrService — M-Pesa / Telebirr payment gateway wrapper
 * Supports sandbox simulation + real API integration
 */
import type { PaymentResult } from '../types';

export interface TelebirrConfig {
  sandbox: boolean;
  sandboxBaseUrl: string;
  prodBaseUrl: string;
  appId: string;
  apiKey: string;
}

const TELEBIRR_CONFIG: TelebirrConfig = {
  sandbox: true,
  sandboxBaseUrl: 'https://sandbox.ethiomobilemoney.et:2121',
  prodBaseUrl: 'https://api.ethiomobilemoney.et',
  appId: process.env.EXPO_PUBLIC_TELEBIRR_APP_ID || 'LIFELINK_APP_001',
  apiKey: process.env.EXPO_PUBLIC_TELEBIRR_API_KEY || 'SANDBOX_API_KEY',
};

export interface InitiateTelebirrParams {
  phoneNumber: string;
  amount: number;
  description: string;
  orderId: string;
}

/**
 * Initiate a Telebirr STK push / payment request
 */
export async function initiateTelebirrPayment({
  phoneNumber,
  amount,
  description,
  orderId,
}: InitiateTelebirrParams): Promise<PaymentResult> {
  if (TELEBIRR_CONFIG.sandbox) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        resolve({
          success,
          transactionId: success
            ? `TELEBIRR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
            : null,
          error: success ? null : 'Payment declined. Please retry.',
          rawResponse: { sandbox: true, phone: phoneNumber, amount, orderId },
        });
      }, 2000);
    });
  }

  try {
    const baseUrl = TELEBIRR_CONFIG.prodBaseUrl;
    const response = await fetch(`${baseUrl}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': TELEBIRR_CONFIG.appId,
        'X-Api-Key': TELEBIRR_CONFIG.apiKey,
      },
      body: JSON.stringify({
        orderId,
        amount: amount.toString(),
        phone: phoneNumber,
        description,
        notifyUrl: 'https://lifelink.app/webhooks/telebirr',
      }),
    });
    const data = await response.json();
    return {
      success: data.status === 'SUCCESS',
      transactionId: data.transactionId || null,
      error: data.message || null,
      rawResponse: data,
    };
  } catch (err) {
    return {
      success: false,
      transactionId: null,
      error: (err as Error).message,
      rawResponse: null,
    };
  }
}

/**
 * Poll payment status by transactionId
 */
export async function checkTelebirrStatus(
  transactionId: string
): Promise<{ status: 'PENDING' | 'SUCCESS' | 'FAILED'; rawResponse: Record<string, unknown> | null }> {
  if (TELEBIRR_CONFIG.sandbox) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ status: 'SUCCESS', rawResponse: { sandbox: true, transactionId } }), 1000);
    });
  }

  try {
    const baseUrl = TELEBIRR_CONFIG.prodBaseUrl;
    const response = await fetch(`${baseUrl}/payment/status/${transactionId}`, {
      headers: {
        'X-App-Id': TELEBIRR_CONFIG.appId,
        'X-Api-Key': TELEBIRR_CONFIG.apiKey,
      },
    });
    const data = await response.json();
    return { status: data.status, rawResponse: data };
  } catch (err) {
    return { status: 'PENDING', rawResponse: { error: (err as Error).message } };
  }
}
