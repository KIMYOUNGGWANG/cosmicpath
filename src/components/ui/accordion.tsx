'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionProps {
    title: string;
    icon?: string | ReactNode;
    defaultOpen?: boolean;
    children: ReactNode;
    variant?: 'default' | 'rainbow' | 'gold';
}

export function Accordion({
    title,
    icon,
    defaultOpen = false,
    children,
    variant = 'default'
}: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const variantClasses = {
        default: 'accordion-item',
        rainbow: 'rainbow-border',
        gold: 'accordion-item gold-border'
    };

    return (
        <div className={cn(variantClasses[variant], isOpen && 'open')}>
            <div
                className="accordion-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3>
                    {typeof icon === 'string' ? (
                        <span className="text-xl">{icon}</span>
                    ) : icon}
                    <span>{title}</span>
                </h3>
                <ChevronDown
                    size={20}
                    className={cn(
                        "accordion-icon transition-transform duration-300",
                        isOpen && "rotate-180"
                    )}
                />
            </div>
            <div className={cn(
                "accordion-content overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[2000px] pb-5" : "max-h-0"
            )}>
                {children}
            </div>
        </div>
    );
}

// 아코디언 그룹 (여러 개를 묶어서 사용)
interface AccordionGroupProps {
    children: ReactNode;
    className?: string;
}

export function AccordionGroup({ children, className }: AccordionGroupProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {children}
        </div>
    );
}
