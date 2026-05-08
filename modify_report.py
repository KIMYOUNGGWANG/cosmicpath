import re

with open('src/components/reading/premium-report.tsx', 'r') as f:
    content = f.read()

# We want to replace everything from:
#             {/* Categorized Analysis — Premium: Verdict-First Layout */}
#             {isPremium ? (
# down to the matching:
#             </div>
#             )}
# 
# Right above {/* Ghost Detector (Viral Hook) — Personal Report */}

start_marker = "{/* Categorized Analysis — Premium: Verdict-First Layout */}"
end_marker = "{/* Ghost Detector (Viral Hook) — Personal Report */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + """{/* Categorized Analysis — Premium: Verdict-First Layout */}
            <VerdictReport
                report={report}
                metadata={metadata as Record<string, unknown>}
                language={language}
                isLoading={isLoading}
                onRetry={onRetry}
                tarotCards={tarotCards}
                onCardClick={setSelectedCardIdx}
                isFreeView={!isPremium}
                scoreGridNode={
                    <>
                        <CosmicRadarMemo report={report} metadata={metadata} language={language} />
                        {(metadata as any)?.sajuResult && (
                            <DestinyDashboardSection
                                details={{
                                    hostSaju: (metadata as any).sajuResult,
                                    hostAstrology: (metadata as any)?.astrologyResult
                                }}
                                hasGuest={false}
                                hostName={(metadata as any)?.readingData?.name || 'You'}
                                guestName={undefined}
                            />
                        )}
                    </>
                }
            />

            {!isPremium && (
                <div className="mt-8 px-4 md:px-6 mb-16">
                    <BlindSpotTeaser
                        title={language === 'en' ? "⚠️ Critical Blind Spot Warning" : "⚠️ 치명적 사각지대 (Blind Spot) 경고"}
                        previewText={language === 'en' ? "Conflicting planetary alignments suggest a high probability of severe misjudgment if you proceed without addressing the underlying root cause." : "별자리와 타로카드 배열에서 심각한 오판의 징후가 발견되었습니다."}
                        hiddenText={language === 'en' ? "Unlock to see the full detailed reading and the missing pieces of your destiny." : "자세한 전체 결론과 해결책을 보려면 잠금을 해제하세요."}
                        language={language || 'ko'}
                        isLocked={true}
                        onUnlock={handleUnlock}
                    />
                </div>
            )}

            """ + content[end_idx:]

    with open('src/components/reading/premium-report.tsx', 'w') as f:
        f.write(new_content)
    print("Successfully replaced.")
else:
    print("Markers not found.")
