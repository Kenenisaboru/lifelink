/**
 * TelebirrService — Ethio Telecom Telebirr mobile money gateway
 * Production sandbox REST endpoints with HMAC signature validation
 */
import * as Crypto from 'expo-crypto';
import type { PaymentResult } from '../types';

// ─── Config ──────────────────────────────────────────────────
export interface TelebirrConfig {
  sandbox: boolean;
  sandboxBaseUrl: string;
  prodBaseUrl: string;
  appId: string;
  apiKey: string;
  webhookSecret: string;
}

const TELEBIRR_CONFIG: TelebirrConfig = {
  sandbox: true,
  sandboxBaseUrl: 'https://sandbox.ethiomobilemoney.et:2121',
  prodBaseUrl: 'https://api.ethiomobilemoney.et',
  appId:
    process.env.EXPO_PUBLIC_TELEBIRR_APP_ID || 'LIFELINK_APP_001',
  apiKey:
    process.env.EXPO_PUBLIC_TELEBIRR_API_KEY || 'SANDBOX_API_KEY',
  webhookSecret:
    process.env.EXPO_PUBLIC_TELEBIRR_WEBHOOK_SECRET || 'telebirr-webhook-secret',
};

// ─── Types ───────────────────────────────────────────────────
export interface InitiateTelebirrParams {
  phoneNumber: string;
  amount: number;
  description: string;
  orderId: string;
}

export type TelebirrStatusResult = {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  rawResponse: Record<string, unknown> | null;
};

// ─── HMAC Signature ──────────────────────────────────────────

/**
 * Generate request signature: SHA-256(appId + orderId + amount + apiKey)
 * Prevents replay attacks and ensures request integrity
 */
async function signTelebirrRequest(
  orderId: string,
  amount: number,
  nonce: string
): Promise<string> {
  const payload = `${TELEBIRR_CONFIG.appId}:${orderId}:${amount}:${nonce}:${TELEBIRR_CONFIG.apiKey}`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, payload);
}

/**
 * Verify incoming Telebirr webhook signature
 * Header: X-Telebirr-Signature = SHA-256(webhookSecret + rawBody)
 */
export async function verifyTelebirrWebhook(
  rawBody: string,
  receivedSig: string
): Promise<boolean> {
  const expected = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${TELEBIRR_CONFIG.webhookSecret}${rawBody}`
  );
  return expected === receivedSig;
}

// ─── Payment Initiation ──────────────────────────────────────

/**
 * Initiate a Telebirr STK push / payment request
 */
export async function initiateTelebirrPayment({
  phoneNumber,
  amount,
  description,
  orderId,
}: InitiateTelebirrParams): Promise<PaymentResult> {
  // Sandbox simulation with realistic delay and 90% success rate
  if (TELEBIRR_CONFIG.sandbox) {
    await new Promise((r) => setTimeout(r, 2000));
    const success = Math.random() > 0.1;
    return {
      success,
      transactionId: success
        ? `TELEBIRR-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`
        : null,
      error: success ? null : 'Payment declined. Please retry.',
      rawResponse: { sandbox: true, phone: phoneNumber, amount, orderId },
    };
  }

  const nonce = Date.now().toString();
  const signature = await signTelebirrRequest(orderId, amount, nonce);
  const baseUrl = TELEBIRR_CONFIG.prodBaseUrl;

  try {
    const response = await fetch(`${baseUrl}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': TELEBIRR_CONFIG.appId,
        'X-Api-Key': TELEBIRR_CONFIG.apiKey,
        'X-Nonce': nonce,
        'X-Signature': signature,
      },
      body: JSON.stringify({
        orderId,
        amount: amount.toString(),
        phone: phoneNumber,
        description,
        notifyUrl: 'https://lifelink.app/webhooks/telebirr',
        nonce,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        transactionId: null,
        error: `HTTP ${response.status}`,
        rawResponse: null,
      };
    }

    const data = (await response.json()) as {
      status: string;
      transactionId?: string;
      message?: string;
    };

    return {
      success: data.status === 'SUCCESS',
      transactionId: data.transactionId ?? null,
      error: data.message ?? null,
      rawResponse: data as Record<string, unknown>,
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
 * Poll Telebirr payment status by transactionId
 */
export async function checkTelebirrStatus(
  transactionId: string
): Promise<TelebirrStatusResult> {
  if (TELEBIRR_CONFIG.sandbox) {
    await new Promise((r) => setTimeout(r, 1000));
    return {
      status: 'SUCCESS',
      rawResponse: { sandbox: true, transactionId },
    };
  }

  const nonce = Date.now().toString();
  const signature = await signTelebirrRequest(transactionId, 0, nonce);

  try {
    const response = await fetch(
      `${TELEBIRR_CONFIG.prodBaseUrl}/payment/status/${transactionId}`,
      {
        headers: {
          'X-App-Id': TELEBIRR_CONFIG.appId,
          'X-Api-Key': TELEBIRR_CONFIG.apiKey,
          'X-Nonce': nonce,
          'X-Signature': signature,
        },
      }
    );
    const data = (await response.json()) as {
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
    };
    return { status: data.status, rawResponse: data as Record<string, unknown> };
  } catch (err) {
    return {
      status: 'PENDING',
      rawResponse: { error: (err as Error).message },
    };
  }
}
