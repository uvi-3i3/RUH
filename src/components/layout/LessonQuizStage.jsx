import { useState } from 'react';
import { evaluateQuizQuestion } from '../../utils/learningPathLogic';
import {
  hapticCelebrate,
  hapticDetent,
  hapticTapLight,
} from '../../utils/haptics';
import { ArtifactVignetteThumbnail } from './AncientMapGlyphs';

const CheckCircleIcon = ({ size = 17, style, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.2 2.4 2.4 4.8-4.8" />
  </svg>
);

const CircleOutlineIcon = ({ size = 17, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
  </svg>
);

/**
 * Duolingo-style zero-scroll interactive understanding check for a Pillar group.
 * Presents one focused question at a time with Prayer-Checklist frosted cards,
 * tactile selection feedback, and instant classical explanation directly below.
 */
export const LessonQuizStage = ({
  groupTitle,
  groupArabic,
  questions = [],
  answersById = {},
  onSelectAnswer,
  onAllCorrectComplete,
  isLightMode = false,
  accentHex,
  textSub,
  textMuted,
  stageAnimClass,
}) => {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const safeIdx = Math.min(questionIdx, Math.max(0, questions.length - 1));
  const activeQuestion = questions[safeIdx];
  const selectedIdx = activeQuestion ? answersById[activeQuestion.id] : undefined;
  const evaluation = evaluateQuizQuestion(activeQuestion, selectedIdx);
  const isLastQuestion = safeIdx >= questions.length - 1;

  if (!activeQuestion) return null;

  const handleChoose = (optIdx) => {
    const res = evaluateQuizQuestion(activeQuestion, optIdx);
    onSelectAnswer?.(activeQuestion.id, optIdx);
    if (res.isCorrect) {
      hapticDetent();
    } else {
      hapticTapLight();
      setShakeKey((k) => k + 1);
    }
  };

  const handleAdvanceQuestion = () => {
    if (!evaluation.isCorrect) return;
    if (!isLastQuestion) {
      hapticTapLight();
      setQuestionIdx((prev) => prev + 1);
    } else {
      hapticCelebrate();
      onAllCorrectComplete?.();
    }
  };

  return (
    <div
      key={`quiz-${activeQuestion.id}`}
      data-testid="lesson-quiz-stage"
      className={`w-full max-w-[660px] mx-auto flex flex-col items-center gap-4 sm:gap-5 ${stageAnimClass}`}
    >
      {/* Prominent Heading + Small Context */}
      <div className="text-center px-2">
        <span
          dir="rtl"
          className="font-calligraphy text-[20px] sm:text-[24px] leading-snug block"
          style={{ color: accentHex }}
        >
          {groupArabic}
        </span>
        <h1
          id="learning-path-heading"
          className="font-serif-eng text-[26px] sm:text-[32px] font-semibold leading-tight mt-0.5 text-balance"
        >
          Check Your Understanding
        </h1>
        <p className={`font-serif-eng italic text-[13.5px] sm:text-[15px] mt-1 ${textSub}`}>
          {groupTitle} · Question {safeIdx + 1} of {questions.length}
        </p>
      </div>

      {/* Main Question Prompt + Prayer-Checklist-Style Answer Rows */}
      <div className="w-full space-y-2.5 sm:space-y-3">
        <p className="font-serif-eng text-[16px] sm:text-[18.5px] font-semibold text-center leading-snug px-1 text-balance">
          {activeQuestion.prompt}
        </p>

        <div className="flex flex-col gap-2">
          {activeQuestion.options.map((opt, idx) => {
            const isChosen = selectedIdx === idx;
            const isCorrectOpt = idx === activeQuestion.correctIndex;
            const showCorrect = isChosen && isCorrectOpt;
            const showWrong = isChosen && !isCorrectOpt;

            const surfaceClass = isLightMode
              ? showCorrect
                ? 'bg-white/94 border-[#9c7533]/65 island-light'
                : showWrong
                ? 'bg-[#fbf0ed]/92 border-[#a83a32]/55 island-light'
                : 'bg-white/76 hover:bg-white/90 border-[#9c7533]/20 island-light'
              : showCorrect
              ? 'bg-[#d4af6a]/18 border-[#d4af6a]/60 island-dark'
              : showWrong
              ? 'bg-[#361c1c]/85 border-[#e07a72]/55 island-dark'
              : 'bg-[#12100d]/78 hover:bg-[#191511]/90 border-white/[0.12] island-dark';

            return (
              <button
                key={`${activeQuestion.id}-${idx}-${showWrong ? shakeKey : 0}`}
                type="button"
                data-testid={`quiz-option-${idx}`}
                onClick={() => handleChoose(idx)}
                style={{ '--row-delay': `${idx * 45}ms` }}
                className={`group relative w-full min-h-[52px] sm:min-h-[58px] px-4 py-2.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-[0.985] overflow-hidden ${surfaceClass} ${
                  showWrong ? 'animate-lesson-shake' : 'animate-lesson-row'
                }`}
              >
                {showCorrect && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-lesson-shimmer"
                    style={{
                      background: isLightMode
                        ? 'linear-gradient(90deg, transparent, rgba(156,117,51,0.18), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(212,175,106,0.22), transparent)',
                    }}
                  />
                )}

                <div className="flex items-start gap-3 min-w-0 relative z-10">
                  <span
                    className="font-serif-eng text-[12px] font-bold uppercase tracking-[0.12em] mt-0.5 shrink-0 tabular-nums"
                    style={{ color: showWrong ? (isLightMode ? '#9f332c' : '#e88b84') : accentHex }}
                  >
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="font-serif-eng text-[13.5px] sm:text-[15px] leading-snug">
                    {opt}
                  </span>
                </div>

                <div className="shrink-0 relative z-10">
                  {showCorrect ? (
                    <CheckCircleIcon
                      size={18}
                      className="animate-[checkmarkPop_0.38s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                      style={{ color: accentHex }}
                    />
                  ) : (
                    <CircleOutlineIcon
                      size={18}
                      className={
                        showWrong
                          ? isLightMode
                            ? 'text-[#9f332c]/75'
                            : 'text-[#e88b84]/75'
                          : isLightMode
                          ? 'text-[#4a453d]/30 group-hover:text-[#9c7533]/75'
                          : 'text-[#e4dac8]/28 group-hover:text-[#d4af6a]/80'
                      }
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback & Next Step Dock Directly Below the Question */}
      <div className="w-full min-h-[96px] flex flex-col justify-center">
        {evaluation.answered ? (
          <div
            key={`feedback-${activeQuestion.id}-${selectedIdx}`}
            data-testid="quiz-feedback-card"
            className={`w-full rounded-2xl border px-4 py-3 animate-lesson-context ${
              isLightMode
                ? 'bg-[#faf4e8]/88 border-[#7c5a1e]/24'
                : 'bg-[#17130f]/86 border-[#d4af6a]/24'
            }`}
            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="font-serif-eng text-[12px] font-semibold tracking-[0.06em]"
                  style={{
                    color: evaluation.isCorrect
                      ? accentHex
                      : isLightMode
                      ? '#9f332c'
                      : '#e88b84',
                  }}
                >
                  {evaluation.isCorrect
                    ? 'Well understood'
                    : 'Not quite — try another answer'}
                </p>
                <p className={`font-serif-eng text-[13px] leading-snug mt-0.5 ${textSub}`}>
                  {evaluation.isCorrect
                    ? evaluation.explanation
                    : 'Reflect on the grouped pillars you just studied and choose the classical answer.'}
                </p>
              </div>

              {evaluation.isCorrect && (
                <button
                  type="button"
                  data-testid="quiz-next-btn"
                  onClick={handleAdvanceQuestion}
                  className={`shrink-0 min-h-[42px] px-4 sm:px-5 rounded-xl font-serif-eng text-[12px] font-semibold tracking-[0.08em] whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    isLightMode
                      ? 'bg-[#463219] text-[#faf3e4] hover:bg-[#594020]'
                      : 'bg-[#d4af6a] text-[#17120c] hover:bg-[#e1be7c]'
                  }`}
                >
                  {isLastQuestion ? 'Continue' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className={`text-center font-serif-eng italic text-[13px] ${textMuted}`}>
            Select an answer above to check your understanding
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Serene Lesson I completion seal with all 11 Pillars unified and Lesson II preview.
 */
export const LessonCompleteStage = ({
  islamItems = [],
  imanItems = [],
  nextLesson,
  isLightMode = false,
  accentHex,
  textSub,
  stageAnimClass,
  onRestart,
  onExit,
}) => {
  return (
    <div
      data-testid="lesson-complete-stage"
      className={`w-full max-w-[660px] mx-auto flex flex-col items-center gap-4 sm:gap-5 text-center ${stageAnimClass}`}
    >
      {/* Prominent Heading + Small Context */}
      <div>
        <span
          dir="rtl"
          className="font-calligraphy text-[26px] sm:text-[32px] leading-snug block"
          style={{ color: accentHex }}
        >
          أَتْمَمْتَ الدَّرْسَ الأَوَّل
        </span>
        <h1
          id="learning-path-heading"
          className="font-serif-eng text-[26px] sm:text-[34px] font-semibold leading-tight mt-0.5 text-balance"
        >
          Foundations Anchored
        </h1>
        <p className={`font-serif-eng italic text-[13.5px] sm:text-[15px] mt-1 ${textSub}`}>
          All 5 Pillars of Islam and 6 Pillars of Faith completed · Hadith of Jibril ﷺ
        </p>
      </div>

      {/* Two-Column Quiet Summary Ledger */}
      <div
        className={`w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left rounded-2xl border p-4 sm:p-5 ${
          isLightMode
            ? 'bg-white/80 border-[#9c7533]/24 island-light'
            : 'bg-[#12100d]/82 border-[#d4af6a]/22 island-dark'
        }`}
      >
        <div>
          <p
            className="font-serif-eng text-[12px] font-semibold tracking-[0.06em]"
            style={{ color: accentHex }}
          >
            Part I · The 5 Pillars of Islam
          </p>
          <p className={`font-serif-eng text-[13px] leading-relaxed mt-1 ${textSub}`}>
            {islamItems.map((i) => i.title).join(' · ')}
          </p>
        </div>

        <div className="sm:border-l sm:border-current/10 sm:pl-4">
          <p
            className="font-serif-eng text-[12px] font-semibold tracking-[0.06em]"
            style={{ color: accentHex }}
          >
            Part II · The 6 Pillars of Faith
          </p>
          <p className={`font-serif-eng text-[13px] leading-relaxed mt-1 ${textSub}`}>
            {imanItems
              .map((i) => i.title.replace(/^Belief in (His |the )?/i, ''))
              .join(' · ')}
          </p>
        </div>
      </div>

      {/* Lesson II Next Unlock Preview */}
      {nextLesson && (
        <div
          className={`w-full rounded-2xl border p-3.5 sm:p-4 flex items-center gap-3.5 text-left ${
            isLightMode
              ? 'bg-[#f6eedd]/85 border-[#7c5a1e]/22'
              : 'bg-[#191510]/85 border-[#d4af6a]/22'
          }`}
        >
          <ArtifactVignetteThumbnail
            id={nextLesson.id}
            sheet={nextLesson.artifactSheet}
            focus={nextLesson.artifactFocus}
            scale={nextLesson.artifactScale}
            alt={nextLesson.artifactName}
            isDiscovered={true}
            isSelected={false}
            isLightMode={isLightMode}
            sizeClass="w-12 h-12"
          />
          <div className="min-w-0 flex-1">
            <p
              className="font-serif-eng text-[11px] font-semibold tracking-[0.08em]"
              style={{ color: accentHex }}
            >
              Up Next · {nextLesson.lessonNumber}
            </p>
            <p className="font-serif-eng text-[15.5px] font-semibold leading-tight mt-0.5 truncate">
              {nextLesson.title} — {nextLesson.subtitle}
            </p>
          </div>
          <span
            dir="rtl"
            className="font-calligraphy text-[18px] shrink-0 hidden sm:inline"
            style={{ color: accentHex }}
          >
            {nextLesson.arabic}
          </span>
        </div>
      )}

      {/* Calm Action Row */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          type="button"
          data-testid="lesson-review-btn"
          onClick={onRestart}
          className={`min-h-[44px] px-5 rounded-2xl border font-serif-eng text-[13px] font-medium whitespace-nowrap transition cursor-pointer active:scale-95 ${
            isLightMode
              ? 'bg-white/75 hover:bg-white/95 border-[#7c5a1e]/25 text-[#2b1f11]'
              : 'bg-[#191510]/80 hover:bg-[#231d16] border-[#d4af6a]/28 text-[#efe5d4]'
          }`}
        >
          Review Lesson
        </button>

        {onExit && (
          <button
            type="button"
            data-testid="lesson-return-sanctuary-btn"
            onClick={onExit}
            className={`min-h-[44px] px-6 rounded-2xl font-serif-eng text-[13px] font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 ${
              isLightMode
                ? 'bg-[#463219] text-[#faf3e4] hover:bg-[#594020]'
                : 'bg-[#d4af6a] text-[#17120c] hover:bg-[#e1be7c]'
            }`}
          >
            Return to Sanctuary
          </button>
        )}
      </div>
    </div>
  );
};
