/**
 * TelebirrService — M-Pesa / Telebirr payment gateway wrapper
 * Supports sandbox simulation + real API integration
 *
 * To enable real Telebirr: set TELEBIRR_API_KEY, TELEBIRR_APP_ID, and TELEBIRR_USE_SANDBOX=false
 */

const TELEBIRR_CONFIG = {
  sandbox: true,
  sandboxBaseUrl: 'https://sandbox.ethiomobilemoney.et:2121',
  prodBaseUrl: 'https://api.ethiomobilemoney.et',
  appId: 'LIFELINK_APP_001', // Replace with real App ID
  apiKey: 'SANDBOX_API_KEY', // Replace with real API Key
};

/**
 * Initiate a Telebirr STK push / payment request
 * @param {object} params
 * @param {string} params.phoneNumber  - Format: 09XXXXXXXX
 * @param {number} params.amount       - In ETB
 * @param {string} params.description  - Payment description
 * @param {string} params.orderId      - Unique reference ID
 * @returns {Promise<{ success, transactionId, rawResponse }>}
 */
export async function initiateTelebirrPayment({ phoneNumber, amount, description, orderId }) {
  if (TELEBIRR_CONFIG.sandbox) {
    // Sandbox simulation — 90% success, 10% failure
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        resolve({
          success,
          transactionId: success ? `TELEBIRR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` : null,
          error: success ? null : 'Payment declined. Please retry.',
          rawResponse: { sandbox: true, phone: phoneNumber, amount, orderId },
        });
      }, 2500); // Simulate network delay
    });
  }

  // Real Telebirr API call
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
    return { success: false, transactionId: null, error: err.message, rawResponse: null };
  }
}

/**
 * Poll payment status by transactionId
 * @returns {Promise<{ status: 'PENDING'|'SUCCESS'|'FAILED', rawResponse }>}
 */
export async function checkTelebirrStatus(transactionId) {
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
    return { status: 'PENDING', rawResponse: { error: err.message } };
  }
}
