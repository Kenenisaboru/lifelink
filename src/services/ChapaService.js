/**
 * ChapaService — Chapa Payment Gateway (Ethiopia's leading payment gateway)
 * Supports mobile money, card payments, and bank transfers
 *
 * To enable live payments: replace CHAPA_SECRET_KEY with your live key
 * Get keys from: https://dashboard.chapa.co/settings/developer
 */

const CHAPA_CONFIG = {
  sandbox: true,
  sandboxBaseUrl: 'https://api.chapa.co/v1',
  secretKey: 'CHASECK_TEST-your-test-key-here', // Replace with real key
  callbackUrl: 'https://lifelink.app/webhooks/chapa',
  returnUrl: 'lifelink://payment/success',
};

/**
 * Initialize a Chapa payment session
 * @returns {Promise<{ success, checkoutUrl, txRef, rawResponse }>}
 */
export async function initiateChapaPayment({ amount, email, phoneNumber, firstName, lastName, description, txRef }) {
  if (CHAPA_CONFIG.sandbox) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          checkoutUrl: `https://checkout.chapa.co/checkout/payment/${txRef}`,
          txRef,
          rawResponse: { sandbox: true, message: 'Payment initialized (sandbox)' },
        });
      }, 1500);
    });
  }

  try {
    const response = await fetch(`${CHAPA_CONFIG.sandboxBaseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CHAPA_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: 'ETB',
        email,
        phone_number: phoneNumber,
        first_name: firstName,
        last_name: lastName,
        tx_ref: txRef,
        callback_url: CHAPA_CONFIG.callbackUrl,
        return_url: CHAPA_CONFIG.returnUrl,
        customization: {
          title: 'LifeLink Emergency Transport',
          description,
          logo: 'https://lifelink.app/logo.png',
        },
      }),
    });
    const data = await response.json();
    return {
      success: data.status === 'success',
      checkoutUrl: data.data?.checkout_url || null,
      txRef,
      rawResponse: data,
    };
  } catch (err) {
    return { success: false, checkoutUrl: null, txRef, error: err.message };
  }
}

/**
 * Verify a Chapa transaction by tx_ref
 * @returns {Promise<{ verified, status, amount, rawResponse }>}
 */
export async function verifyChapaTransaction(txRef) {
  if (CHAPA_CONFIG.sandbox) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          verified: true,
          status: 'success',
          amount: 500,
          rawResponse: { sandbox: true, tx_ref: txRef, status: 'success' },
        });
      }, 1000);
    });
  }

  try {
    const response = await fetch(`${CHAPA_CONFIG.sandboxBaseUrl}/transaction/verify/${txRef}`, {
      headers: { Authorization: `Bearer ${CHAPA_CONFIG.secretKey}` },
    });
    const data = await response.json();
    return {
      verified: data.status === 'success',
      status: data.data?.status,
      amount: parseFloat(data.data?.amount || 0),
      rawResponse: data,
    };
  } catch (err) {
    return { verified: false, status: 'error', amount: 0, error: err.message };
  }
}
