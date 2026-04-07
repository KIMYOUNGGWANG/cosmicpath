'use client';

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import Link, { type LinkProps } from 'next/link';

import {
    trackClientGrowthEvent,
    type ClientGrowthEventInput,
} from '@/lib/client-growth-events';

interface GrowthEventTrackerProps {
    trackingEvent: ClientGrowthEventInput;
}

export function GrowthEventTracker({ trackingEvent }: GrowthEventTrackerProps) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (hasTracked.current) {
            return;
        }

        hasTracked.current = true;
        void trackClientGrowthEvent(trackingEvent);
    }, [trackingEvent]);

    return null;
}

type AnchorProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

interface GrowthTrackedLinkProps extends LinkProps, AnchorProps {
    trackingEvent: ClientGrowthEventInput;
    children: ReactNode;
}

export function GrowthTrackedLink({
    trackingEvent,
    onClick,
    children,
    ...props
}: GrowthTrackedLinkProps) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        void trackClientGrowthEvent(trackingEvent);
    };

    return (
        <Link {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
