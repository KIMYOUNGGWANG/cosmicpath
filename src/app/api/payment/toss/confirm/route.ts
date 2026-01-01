import { NextResponse } from 'next/server';

// import { NextRequest, NextResponse } from 'next/server';
// import { confirmTossPayment } from '@/lib/payment/toss';

// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//         const { paymentKey, orderId, amount } = body;

//         if (!paymentKey || !orderId || !amount) {
//             return NextResponse.json(
//                 { error: 'Missing required parameters' },
//                 { status: 400 }
//             );
//         }

//         const result = await confirmTossPayment({
//             paymentKey,
//             orderId,
//             amount: Number(amount),
//         });

//         return NextResponse.json({
//             success: true,
//             data: result,
//         });
//     } catch (error: any) {
//         console.error('Toss Payment confirmation API failed:', error);
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message || 'Internal Server Error'
//             },
//             { status: 500 }
//         );
//     }
// }

export async function POST() {
    return NextResponse.json({ message: 'Toss Payments is currently disabled.' }, { status: 403 });
}
