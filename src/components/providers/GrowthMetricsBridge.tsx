'use client';

import { useEffect } from 'react';

import { trackClientGrowthEvent } from '@/lib/client-growth-events';

const INSTALL_KEY = 'cosmicpath.install_tracked';
const DAILY_ACTIVE_PREFIX = 'cosmicpath.daily_active';

export function GrowthMetricsBridge() {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            if (!localStorage.getItem(INSTALL_KEY)) {
                localStorage.setItem(INSTALL_KEY, 'true');
                void trackClientGrowthEvent({
                    event: 'install',
                    source: 'growth_bridge',
                    step: 'bootstrap',
                });
            }

            const todayKey = new Date().toISOString().slice(0, 10);
            const dailyKey = `${DAILY_ACTIVE_PREFIX}:${todayKey}`;

            if (!sessionStorage.getItem(dailyKey)) {
                sessionStorage.setItem(dailyKey, 'true');
                void trackClientGrowthEvent({
                    event: 'daily_active',
                    source: 'growth_bridge',
                    step: 'bootstrap',
                    metadata: {
                        day: todayKey,
                        referrer: document.referrer || null,
                    },
                });
            }
        } catch {
            // Analytics should never interrupt rendering.
        }
    }, []);

    return null;
}
