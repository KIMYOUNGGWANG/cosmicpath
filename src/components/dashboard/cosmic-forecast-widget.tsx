'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDailyForecast, getStrategyDisplay, DailyForecast } from '@/lib/engines/daily-forecast';
import type { AstrologyResult } from '@/lib/engines/astrology';
import type { SajuResult } from '@/lib/engines/saju';

interface CosmicForecastWidgetProps {
    userAstro?: AstrologyResult | null;
    userSaju?: SajuResult | null;
    language?: 'ko' | 'en';
}

export function CosmicForecastWidget({
    userAstro,
    userSaju,
    language = 'ko'
}: CosmicForecastWidgetProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [forecast, setForecast] = useState<DailyForecast | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isEn = language === 'en';

    // Check localStorage for today's reveal state
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const storedKey = `cosmicpath_forecast_revealed_${today}`;
        const wasRevealed = localStorage.getItem(storedKey) === 'true';

        if (wasRevealed) {
            setIsRevealed(true);
        }

        // Generate forecast if user data is available
        if (userAstro && userSaju) {
            try {
                const todayForecast = generateDailyForecast(userAstro, userSaju, new Date());
                setForecast(todayForecast);
            } catch (error) {
                console.error('Failed to generate forecast:', error);
            }
        }
        setIsLoading(false);
    }, [userAstro, userSaju]);

    const handleReveal = () => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`cosmicpath_forecast_revealed_${today}`, 'true');
        setIsRevealed(true);
    };

    // No user data - show unlock prompt
    if (!userAstro || !userSaju) {
        return (
            <div className="cosmic-forecast-widget locked">
                <div className="widget-inner">
                    <div className="lock-icon">🔒</div>
                    <h3>{isEn ? 'Unlock Your Daily Strategy' : '오늘의 전략을 잠금해제하세요'}</h3>
                    <p>{isEn
                        ? 'Enter your birth info to receive personalized daily insights'
                        : '생년월일시를 입력하면 매일 맞춤 인사이트를 받을 수 있어요'}
                    </p>
                    <button className="unlock-btn">
                        {isEn ? 'Get Started' : '시작하기'}
                    </button>
                </div>
                <style jsx>{widgetStyles}</style>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="cosmic-forecast-widget loading">
                <div className="loading-pulse" />
                <style jsx>{widgetStyles}</style>
            </div>
        );
    }

    if (!forecast) {
        return null;
    }

    const strategyDisplay = getStrategyDisplay(forecast.strategyKeyword, language);

    return (
        <div className="cosmic-forecast-widget">
            <AnimatePresence mode="wait">
                {!isRevealed ? (
                    // SEALED STATE
                    <motion.div
                        key="sealed"
                        className="sealed-envelope"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleReveal}
                    >
                        <motion.div
                            className="envelope-icon"
                            animate={{
                                y: [0, -5, 0],
                                rotate: [0, -2, 2, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            ✉️
                        </motion.div>
                        <div className="sealed-badge">NEW</div>
                        <h3>{isEn ? 'Cosmic Message Arrived' : '우주 전보가 도착했어요'}</h3>
                        <p>{isEn
                            ? 'Your personalized strategy for today is ready'
                            : '오늘의 맞춤 전략이 준비되었습니다'}
                        </p>
                        <button className="reveal-btn">
                            {isEn ? 'Open Message' : '전보 열기'}
                        </button>
                    </motion.div>
                ) : (
                    // REVEALED STATE
                    <motion.div
                        key="revealed"
                        className="forecast-card"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="card-header">
                            <span className="date">{forecast.date}</span>
                            <span
                                className="strategy-badge"
                                style={{ backgroundColor: strategyDisplay.color }}
                            >
                                {strategyDisplay.emoji} {strategyDisplay.label}
                            </span>
                        </div>

                        <div className="card-body">
                            <h2 className="headline">
                                {isEn ? forecast.headlineEn : forecast.headline}
                            </h2>

                            <div className="insight-row">
                                <div className="insight-item">
                                    <span className="insight-label">
                                        {isEn ? 'Moon Transit' : '달의 위치'}
                                    </span>
                                    <span className="insight-value">
                                        🌙 {forecast.moonTransit.signName} ({forecast.moonTransit.house}H)
                                    </span>
                                </div>
                                <div className="insight-item">
                                    <span className="insight-label">
                                        {isEn ? "Today's Energy" : '오늘의 기운'}
                                    </span>
                                    <span className="insight-value">
                                        {forecast.dailyElement.stem}{forecast.dailyElement.branch}
                                    </span>
                                </div>
                            </div>

                            <p className="advice">
                                💡 {isEn ? forecast.adviceEn : forecast.advice}
                            </p>

                            <div className="time-row">
                                <span className="lucky-time">
                                    ✨ {isEn ? 'Lucky' : '행운'}: {forecast.luckyTime}
                                </span>
                                {forecast.cautionTime && (
                                    <span className="caution-time">
                                        ⚠️ {isEn ? 'Caution' : '주의'}: {forecast.cautionTime}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style jsx>{widgetStyles}</style>
        </div>
    );
}

const widgetStyles = `
    .cosmic-forecast-widget {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 20px;
        padding: 24px;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
    }
    
    .cosmic-forecast-widget::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #6366F1, #8B5CF6, #A855F7);
    }
    
    /* Locked State */
    .cosmic-forecast-widget.locked .widget-inner {
        text-align: center;
        padding: 20px;
    }
    
    .lock-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }
    
    .unlock-btn {
        background: linear-gradient(135deg, #6366F1, #8B5CF6);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 16px;
    }
    
    /* Loading */
    .loading-pulse {
        height: 120px;
        background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1));
        background-size: 200% 100%;
        animation: pulse 1.5s ease-in-out infinite;
        border-radius: 12px;
    }
    
    @keyframes pulse {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    /* Sealed State */
    .sealed-envelope {
        text-align: center;
        cursor: pointer;
        padding: 20px;
    }
    
    .envelope-icon {
        font-size: 64px;
        margin-bottom: 16px;
        display: inline-block;
    }
    
    .sealed-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: #EF4444;
        color: white;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        animation: pulse-badge 2s infinite;
    }
    
    @keyframes pulse-badge {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .reveal-btn {
        background: linear-gradient(135deg, #6366F1, #8B5CF6);
        color: white;
        border: none;
        padding: 14px 28px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        margin-top: 16px;
        transition: transform 0.2s;
    }
    
    .reveal-btn:hover {
        transform: scale(1.05);
    }
    
    /* Forecast Card */
    .forecast-card {
        perspective: 1000px;
    }
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    
    .date {
        color: #94A3B8;
        font-size: 14px;
    }
    
    .strategy-badge {
        color: white;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
    }
    
    .card-body h2.headline {
        font-size: 22px;
        font-weight: 700;
        color: white;
        margin-bottom: 16px;
        line-height: 1.4;
    }
    
    .insight-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
    }
    
    .insight-item {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 12px;
    }
    
    .insight-label {
        display: block;
        font-size: 12px;
        color: #94A3B8;
        margin-bottom: 4px;
    }
    
    .insight-value {
        font-size: 16px;
        font-weight: 600;
        color: white;
    }
    
    .advice {
        background: rgba(251, 191, 36, 0.1);
        border-left: 3px solid #FBBF24;
        padding: 12px 16px;
        border-radius: 0 8px 8px 0;
        color: #FCD34D;
        font-size: 15px;
        margin-bottom: 16px;
    }
    
    .time-row {
        display: flex;
        gap: 16px;
        font-size: 14px;
    }
    
    .lucky-time {
        color: #10B981;
    }
    
    .caution-time {
        color: #F59E0B;
    }
`;

export default CosmicForecastWidget;
