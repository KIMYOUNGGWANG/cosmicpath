'use client';

import { motion } from 'framer-motion';
import { EssentialCoordinatesSection } from './reading-input/essential-coordinates-section';
import { GuideSelectionSection } from './reading-input/guide-selection-section';
import { IntakeHeader } from './reading-input/intake-header';
import { PartnerInformationSection } from './reading-input/partner-information-section';
import { QuestionSection } from './reading-input/question-section';
import { IntakeSubmitSection } from './reading-input/intake-submit-section';
import type { ReadingInputProps } from './reading-input/types';
import { useReadingInputController } from './reading-input/use-reading-input-controller';

export type { ReadingData } from './reading-input/types';

export function ReadingInput({
    onSubmit,
    isLoading = false,
    inviteCode,
    initialLanguage = 'ko',
    onLanguageChange,
    initialContext,
    initialQuestion,
    initialData,
    isNextMoveReportEntry = false,
    isRelationshipContactEntry = false,
}: ReadingInputProps) {
    const controller = useReadingInputController({
        onSubmit,
        isLoading,
        inviteCode,
        initialLanguage,
        onLanguageChange,
        initialContext,
        initialQuestion,
        initialData,
        isNextMoveReportEntry,
        isRelationshipContactEntry,
    });

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={controller.handleSubmit}
            className="mx-auto w-full max-w-2xl space-y-6 md:space-y-8"
        >
            <IntakeHeader
                language={controller.language}
                sequenceLabel={controller.intakeCopy.sequenceLabel}
                sequenceSummary={controller.intakeCopy.sequenceSummary}
                isRelationshipContactEntry={controller.isRelationshipContactEntry}
                onLanguageSelect={controller.handleLanguageSelect}
            />

            <div className="flex flex-col gap-6 md:gap-8">
                <QuestionSection
                    language={controller.language}
                    questionLabel={controller.intakeCopy.questionLabel}
                    questionEyebrow={controller.intakeCopy.questionEyebrow}
                    context={controller.context}
                    activeContextLabel={controller.activeContextLabel}
                    routePersonaName={controller.routePersona.name}
                    intentLabel={controller.intentLabel}
                    question={controller.question}
                    questionPlaceholder={controller.questionPlaceholder}
                    questionSuggestions={controller.questionSuggestions}
                    isRelationshipContactEntry={controller.isRelationshipContactEntry}
                    questionFieldRef={controller.questionFieldRef}
                    scenarioA={controller.scenarioA}
                    scenarioB={controller.scenarioB}
                    onContextSelect={controller.handleContextSelect}
                    onQuestionChange={controller.setQuestion}
                    onSuggestionSelect={controller.applyQuestionSuggestion}
                    onScenarioAChange={controller.setScenarioA}
                    onScenarioBChange={controller.setScenarioB}
                />

                <GuideSelectionSection
                    language={controller.language}
                    selectionMode={controller.selectionMode}
                    routePersona={controller.routePersona}
                    inferredQuestionIntent={controller.inferredQuestionIntent}
                    selectedCharacterId={controller.selectedCharacterId}
                    recommendedCharacterId={controller.recommendedCharacterId}
                    isUsingRecommendedGuide={controller.isUsingRecommendedGuide}
                    guideFitCopy={controller.guideFitCopy}
                    guideStrengths={controller.guideStrengths}
                    showAllGuides={controller.showAllGuides}
                    alternativeGuides={controller.alternativeGuides}
                    onOpenGuideSelection={() => controller.setShowAllGuides(true)}
                    onCloseGuideSelection={() => controller.setShowAllGuides(false)}
                    onGuideSelect={controller.handleGuideSelect}
                />

                <EssentialCoordinatesSection
                    language={controller.language}
                    birthLabel={controller.intakeCopy.birthLabel}
                    birthEyebrow={controller.intakeCopy.birthEyebrow}
                    isNextMoveReportEntry={controller.isNextMoveReportEntry}
                    isRelationshipContactEntry={controller.isRelationshipContactEntry}
                    name={controller.name}
                    birthDate={controller.birthDate}
                    birthTime={controller.birthTime}
                    calendarType={controller.calendarType}
                    unknownTime={controller.unknownTime}
                    cityName={controller.cityName}
                    gender={controller.gender}
                    coreFieldsComplete={controller.coreFieldsComplete}
                    coreSignals={controller.coreSignals}
                    onNameChange={controller.setName}
                    onBirthDateChange={controller.setBirthDate}
                    onBirthTimeChange={controller.setBirthTime}
                    onCalendarTypeChange={controller.setCalendarType}
                    onUnknownTimeChange={controller.setUnknownTime}
                    onCityNameChange={controller.setCityName}
                    onGenderChange={controller.setGender}
                />

                {controller.context === 'love' ? (
                    <PartnerInformationSection
                        language={controller.language}
                        showPrecisionFields={controller.showPrecisionFields}
                        showPartnerInfo={controller.showPartnerInfo}
                        partnerName={controller.partnerName}
                        partnerBirthDate={controller.partnerBirthDate}
                        partnerBirthTime={controller.partnerBirthTime}
                        partnerGender={controller.partnerGender}
                        onTogglePrecisionFields={() => controller.setShowPrecisionFields((value) => !value)}
                        onTogglePartnerInfo={() => controller.setShowPartnerInfo((value) => !value)}
                        onPartnerNameChange={controller.setPartnerName}
                        onPartnerBirthDateChange={controller.setPartnerBirthDate}
                        onPartnerBirthTimeChange={controller.setPartnerBirthTime}
                        onPartnerGenderChange={controller.setPartnerGender}
                    />
                ) : null}
            </div>

            <IntakeSubmitSection
                language={controller.language}
                intakeLabel={controller.intakeCopy.tarotLabel}
                intakeSummary={controller.intakeCopy.tarotSummary}
                isLoading={controller.isLoading}
                inviteCode={controller.inviteCode}
                isSubmitDisabled={controller.isSubmitDisabled}
            />
        </motion.form>
    );
}
