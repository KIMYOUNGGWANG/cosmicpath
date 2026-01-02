'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SharedPageRedirect({ id }: { id: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const paid = searchParams.get('paid');
        const canceled = searchParams.get('canceled');

        if (paid === 'true' || canceled === 'true') {
            console.log('[SharedPage] Paid/Canceled detected. Redirecting to interactive app...');
            router.replace(`/start?${searchParams.toString()}&reading_id=${id}`);
        }
    }, [id, router, searchParams]);

    return null;
}
