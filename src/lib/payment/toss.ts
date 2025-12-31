/**
 * Toss Payments Backend Integration (Disabled)
 */

// const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_...';

// export interface TossConfirmParams {
//     paymentKey: string;
//     orderId: string;
//     amount: number;
// }

// export async function confirmTossPayment({
//     paymentKey,
//     orderId,
//     amount,
// }: TossConfirmParams) {
//     const encodedKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
//     const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
//         method: 'POST',
//         headers: {
//             Authorization: `Basic ${encodedKey}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ paymentKey, orderId, amount }),
//     });
//     const result = await response.json();
//     if (!response.ok) {
//         throw new Error(result.message || 'Toss Payment confirmation failed');
//     }
//     return result;
// }

// export async function cancelTossPayment(paymentKey: string, reason: string) {
//     const encodedKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
//     const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
//         method: 'POST',
//         headers: {
//             Authorization: `Basic ${encodedKey}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ cancelReason: reason }),
//     });
//     return await response.json();
// }

export const TOSS_DISABLED = true;
