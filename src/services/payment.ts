import { API_CONFIG } from '@/config/api';

export interface PaymentDetails {
  userName: string;
  amount: number;
  currency: string;
  planId: string;
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'upi';
  
  // Credit Card specific
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
  cardholderName?: string;

  // UPI specific
  upiId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message?: string;
}

// Legacy function (kept for reference or backward compatibility if needed)
export const createPayment = async (details: PaymentDetails): Promise<PaymentResponse> => {
  try {
    // This endpoint might not exist anymore, we are switching to Razorpay flow
    const response = await fetch(`${API_CONFIG.baseUrl}/payments/create-order`, { // Updated to use the new route if needed, but the flow is different
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ amount: details.amount, currency: details.currency }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Payment failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
    const response = await fetch(`${API_CONFIG.baseUrl}/payments/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
    }

    return await response.json();
};

export const verifyRazorpayPayment = async (paymentData: any) => {
    const response = await fetch(`${API_CONFIG.baseUrl}/payments/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
        throw new Error('Payment verification failed');
    }

    return await response.json();
};
