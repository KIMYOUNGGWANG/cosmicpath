import { motion } from 'framer-motion';
import { Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlindSpotTeaserProps {
    title: string;
    previewText: string;
    hiddenText: string;
    language: 'ko' | 'en';
    onUnlock: () => void;
}

export function BlindSpotTeaser({ title, previewText, hiddenText, language, onUnlock }: BlindSpotTeaserProps) {
    return null; // Temporarily disabled for payment removal
}
